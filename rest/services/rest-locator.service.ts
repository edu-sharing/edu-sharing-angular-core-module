import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { BridgeService } from '../../../services/bridge.service';
import { OAuthResult } from '../data-object';
import { RestConstants } from '../rest-constants';

const EDU_SHARING_API_URL = (window as any).__env?.EDU_SHARING_API_URL;

@Injectable({ providedIn: 'root' })
export class RestLocatorService {
    readonly apiUrl = EDU_SHARING_API_URL ? EDU_SHARING_API_URL + '/' : 'rest/';
    private ticket: string;
    // @DEPRECATED
    get endpointUrl() {
        return this.apiUrl;
    }
    /**
     * Replaces jokers inside the url and escapes them. The default joker
     * :version and :repository is always replaced!
     *
     * @param repository the repo name
     * @param urlParams An array of params First value is the search joker,
     * second the replace value The search value may ends with |noescape. E.g.
     * :sort|noescape. This tells the method to not escape the value content
     */
    static createUrl(url: string, repository: string, urlParams: string[][] = []): string {
        for (const params of urlParams) {
            params[1] = encodeURIComponent(params[1]);
        }
        return RestLocatorService.createUrlNoEscape(url, repository, urlParams);
    }

    /**
     * Same as createUrl, but does not escape the params. Escaping needs to be
     * done when calling the method
     */
    static createUrlNoEscape(url: string, repository: string, urlParams: string[][] = []): string {
        urlParams.push([':version', RestConstants.API_VERSION]);
        urlParams.push([':repository', encodeURIComponent(repository)]);

        urlParams.sort((a, b) => {
            return url.indexOf(a[0]) > url.indexOf(b[0]) ? 1 : -1;
        });
        const urlIn = url;
        let offset = 0;
        for (const param of urlParams) {
            const pos = urlIn.indexOf(param[0]);
            if (pos === -1) continue;
            const start = url.substr(0, pos + offset);
            const end = url.substr(pos + offset + param[0].length, url.length);
            url = start + param[1] + end;
            offset += param[1].length - param[0].length;
        }
        if (url.length > 1000) console.warn('URL is ' + url.length + ' long');
        return url;
    }

    constructor(private http: HttpClient, private bridge: BridgeService) {}

    createOAuthFromSession() {
        return new Observable((observer: Observer<OAuthResult>) => {
            this.bridge
                .getCordova()
                .loginOAuth(this.apiUrl, null, null, 'client_credentials')
                .subscribe(
                    (oauthTokens) => {
                        this.bridge
                            .getCordova()
                            .setPermanentStorage(
                                RestConstants.CORDOVA_STORAGE_OAUTHTOKENS,
                                JSON.stringify(oauthTokens),
                            );
                        observer.next(oauthTokens);
                        observer.complete();
                    },
                    (error) => {
                        observer.error(error);
                        observer.complete();
                    },
                );
        });
    }

    getConfigDynamic(key: string): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            const query = RestLocatorService.createUrl('config/:version/dynamic/:key', null, [
                [':key', key],
            ]);
            this.http.get<any>(this.apiUrl + query, this.getRequestOptions()).subscribe(
                (response) => {
                    // Unmarshall encapuslated json response
                    observer.next(JSON.parse(response.body.value));
                    observer.complete();
                },
                (error: any) => {
                    observer.error(error);
                    observer.complete();
                },
            );
        });
    }

    getRequestOptions(
        contentType = 'application/json',
        username: string = null,
        password: string = null,
        locale = this.bridge.getISOLanguage(),
    ): {
        headers?: HttpHeaders;
        withCredentials: true;
        responseType: 'json';
        observe: 'response';
    } {
        const headers: any = {};
        if (contentType) headers['Content-Type'] = contentType;
        headers.Accept = 'application/json';
        if (locale) headers.locale = locale;
        if (username != null) {
            headers.Authorization = 'Basic ' + btoa(username + ':' + password);
        } else if (this.ticket != null) {
            headers.Authorization = 'EDU-TICKET ' + this.ticket;
            this.ticket = null;
        } else {
            headers.Authorization = '';
        }
        if (this.bridge.isRunningCordova()) {
            headers.DisableGuest = 'true';
        }
        return {
            headers,
            responseType: 'json',
            observe: 'response',
            withCredentials: true,
        }; // Warn: withCredentials true will ignore a Bearer from OAuth!
    }

    setRoute(route: ActivatedRoute, router: Router): Observable<void> {
        return new Observable<void>((observer: Observer<void>) => {
            route.queryParams.subscribe(async (params: any) => {
                this.ticket = null;
                if (params.ticket) {
                    this.ticket = params.ticket;
                    // clean up ticket
                    await router.navigate([], {
                        relativeTo: route,
                        skipLocationChange: false,
                        replaceUrl: true,
                        queryParamsHandling: 'merge',
                        queryParams: {
                            ticket: null,
                        },
                    });
                }
                observer.next(null);
                observer.complete();
            });
        });
    }

    getBridge() {
        return this.bridge;
    }
}
