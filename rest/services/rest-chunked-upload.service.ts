import { Injectable } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';
import { firstValueFrom, Observable } from 'rxjs';
import { NodeWrapper } from '../data-object';
import { RestConstants } from '../rest-constants';
import { RestConnectorService, UploadProgress } from './rest-connector.service';

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
 */
@Injectable({ providedIn: 'root' })
export class RestChunkedUploadService {
    /** files at or above this size use the chunked endpoints; smaller files keep the single-request upload */
    static readonly THRESHOLD_BYTES = 20 * 1024 * 1024;
    static readonly CHUNK_SIZE_BYTES = 16 * 1024 * 1024;
    private static readonly MAX_CHUNK_ATTEMPTS = 3;
    private static readonly POLL_INTERVAL_MS = 1500;

    constructor(private connector: RestConnectorService) {}

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

            let session = await firstValueFrom(
                this.connector.post<UploadSession>(
                    this.url(node, repository),
                    JSON.stringify({ size: file.size, versionComment }),
                    this.connector.getRequestOptions(),
                ),
            );
            sessionId = session.id;

            let offset = session.offset ?? 0;
            reportProgress(offset);
            while (offset < file.size) {
                if (cancelled) {
                    return null;
                }
                offset = await this.appendChunkWithRetry(node, sessionId, offset, file, repository);
                reportProgress(offset);
            }
            if (cancelled) {
                return null;
            }

            await firstValueFrom(
                this.connector.post<UploadSession>(
                    this.url(node, repository, sessionId, 'complete'),
                    null,
                    this.connector.getRequestOptions(),
                ),
            );
            session = await this.pollUntilDone(node, sessionId, repository, () => cancelled);
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
            const wrapper = await firstValueFrom(
                this.connector.get<NodeWrapper>(
                    this.connector.createUrlNoEscape(
                        'node/:version/nodes/:repository/:node/metadata/?:propertyFilter',
                        repository,
                        [
                            [':node', encodeURIComponent(session.nodeId)],
                            [':propertyFilter', ''],
                        ],
                    ),
                    this.connector.getRequestOptions(),
                ),
            );
            return { node: wrapper.node };
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
                        this.connector.delete<void>(
                            this.url(node, repository, sessionId),
                            this.connector.getRequestOptions(),
                        ),
                    ).catch(() => {});
                }
            };
        });
    }

    private async appendChunkWithRetry(
        node: string,
        sessionId: string,
        offset: number,
        file: File,
        repository: string,
    ): Promise<number> {
        let currentOffset = offset;
        let lastError: any;
        for (let attempt = 0; attempt < RestChunkedUploadService.MAX_CHUNK_ATTEMPTS; attempt++) {
            const chunk = file.slice(
                currentOffset,
                currentOffset + RestChunkedUploadService.CHUNK_SIZE_BYTES,
            );
            try {
                const session = await firstValueFrom(
                    this.connector.put<UploadSession>(
                        this.url(node, repository, sessionId) + '?offset=' + currentOffset,
                        chunk,
                        this.connector.getRequestOptions('application/octet-stream'),
                    ),
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
        sessionId: string,
        repository: string,
        isCancelled: () => boolean,
    ): Promise<UploadSession> {
        while (!isCancelled()) {
            const session = await firstValueFrom(
                this.connector.get<UploadSession>(
                    this.url(node, repository, sessionId),
                    this.connector.getRequestOptions(),
                ),
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

    private url(node: string, repository: string, sessionId?: string, suffix?: string): string {
        let path = 'node/:version/nodes/:repository/:node/content/uploads';
        if (sessionId) {
            path += '/:id';
        }
        if (suffix) {
            path += '/' + suffix;
        }
        return this.connector.createUrl(path, repository, [
            [':node', node],
            [':id', sessionId],
        ]);
    }
}
