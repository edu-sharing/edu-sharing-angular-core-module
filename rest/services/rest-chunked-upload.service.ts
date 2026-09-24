import { Injectable } from '@angular/core';
import { Node, NodeServiceUnwrapped } from 'ngx-edu-sharing-api';
import { firstValueFrom, Observable } from 'rxjs';
import { RestConstants } from '../rest-constants';
import { UploadProgress } from './rest-connector.service';

export type UploadSessionState = 'UPLOADING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface UploadSession {
    id: string;
    nodeId: string;
    size: number;
    chunkSize: number;
    offset: number;
    state: UploadSessionState;
    errorCode?: string;
    errorMessage?: string;
    errorDetails?: { [key: string]: any };
}

/**
 * Chunked upload of node content: splits a file into several small PUT requests instead of a
 * single long-lived one, so no individual request risks hitting a reverse-proxy timeout on large
 * files. Used transparently by `RestNodeService.uploadNodeContent` for files at or above
 * `THRESHOLD_BYTES`. See the backend `NodeApi`'s `.../content/uploads` endpoints.
 *
 * Calls the generated `NodeServiceUnwrapped` (`NodeV1Service`) directly rather than going through
 * `RestConnectorService` - these endpoints have no wrapper-level caching/state to keep in sync
 * with (see the "Unwrapped API services" note in ngx-edu-sharing-api's public-api.ts), and using
 * the generated client still gets auth headers/credentials/trace-id via `ApiInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class RestChunkedUploadService {
    /** files at or above this size use the chunked endpoints; smaller files keep the single-request upload */
    static readonly THRESHOLD_BYTES = 20 * 1024 * 1024;
    static readonly CHUNK_SIZE_BYTES = 16 * 1024 * 1024;
    private static readonly MAX_CHUNK_ATTEMPTS = 3;
    private static readonly POLL_INTERVAL_MS = 1500;

    constructor(private nodeV1: NodeServiceUnwrapped) {}

    static shouldUseChunkedUpload(file: File): boolean {
        return file.size >= RestChunkedUploadService.THRESHOLD_BYTES;
    }

    upload(
        node: string,
        file: File,
        versionComment: string,
        onProgress: (progress: UploadProgress) => void = null,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<{ node: Node }> {
        let cancelled = false;
        let sessionId: string = null;

        const run = async (): Promise<{ node: Node }> => {
            const start = new Date().getTime();
            const reportProgress = (loaded: number) => {
                if (!onProgress) {
                    return;
                }
                const elapsed = (new Date().getTime() - start) / 1000;
                onProgress({
                    start,
                    loaded,
                    total: file.size,
                    progress: file.size === 0 ? 1 : loaded / file.size,
                    elapsed,
                    remaining: loaded > 0 ? ((file.size - loaded) * elapsed) / loaded : undefined,
                });
            };

            let session: UploadSession = await firstValueFrom(
                this.nodeV1.initUpload({
                    repository,
                    node,
                    body: { size: file.size, versionComment },
                }),
            );
            sessionId = session.id;

            let offset = session.offset ?? 0;
            reportProgress(offset);
            while (offset < file.size) {
                if (cancelled) {
                    return null;
                }
                offset = await this.appendChunkWithRetry(node, repository, sessionId, offset, file);
                reportProgress(offset);
            }
            if (cancelled) {
                return null;
            }

            await firstValueFrom(this.nodeV1.completeUpload({ repository, node, id: sessionId }));
            session = await this.pollUntilDone(node, repository, sessionId, () => cancelled);
            if (cancelled || !session) {
                return null;
            }
            if (session.state === 'FAILED') {
                // shaped like a raw-XHR error so RestHelper.errorMatchesAny / _mapError can be reused as-is
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw {
                    response: JSON.stringify({
                        error: session.errorCode,
                        message: session.errorMessage,
                        details: session.errorDetails,
                    }),
                };
            }
            reportProgress(file.size);
            const entry = await firstValueFrom(
                this.nodeV1.getMetadata({ repository, node: session.nodeId }),
            );
            return { node: entry.node };
        };

        return new Observable<{ node: Node }>((observer) => {
            run().then(
                (result) => {
                    if (result) {
                        observer.next(result);
                        observer.complete();
                    }
                },
                (error) => observer.error(error),
            );
            return () => {
                cancelled = true;
                if (sessionId) {
                    firstValueFrom(
                        this.nodeV1.abortUpload({ repository, node, id: sessionId }),
                    ).catch(() => {});
                }
            };
        });
    }

    private async appendChunkWithRetry(
        node: string,
        repository: string,
        sessionId: string,
        offset: number,
        file: File,
    ): Promise<number> {
        let currentOffset = offset;
        let lastError: any;
        for (let attempt = 0; attempt < RestChunkedUploadService.MAX_CHUNK_ATTEMPTS; attempt++) {
            const chunk = file.slice(
                currentOffset,
                currentOffset + RestChunkedUploadService.CHUNK_SIZE_BYTES,
            );
            try {
                const session: UploadSession = await firstValueFrom(
                    this.nodeV1.appendUploadChunk({
                        repository,
                        node,
                        id: sessionId,
                        offset: currentOffset,
                        body: chunk,
                    }),
                );
                return session.offset;
            } catch (error: any) {
                lastError = error;
                if (error?.status === 409 && typeof error?.error?.details?.offset === 'number') {
                    // a previous attempt of this chunk already landed server-side - resync and retry from there
                    currentOffset = error.error.details.offset;
                    continue;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
        throw lastError;
    }

    private async pollUntilDone(
        node: string,
        repository: string,
        sessionId: string,
        isCancelled: () => boolean,
    ): Promise<UploadSession> {
        while (!isCancelled()) {
            const session: UploadSession = await firstValueFrom(
                this.nodeV1.getUploadSession({ repository, node, id: sessionId }),
            );
            if (session.state === 'DONE' || session.state === 'FAILED') {
                return session;
            }
            await new Promise((resolve) =>
                setTimeout(resolve, RestChunkedUploadService.POLL_INTERVAL_MS),
            );
        }
        return null;
    }
}
