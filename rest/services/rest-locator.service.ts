import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BridgeService } from '../../../core-bridge-module/bridge.service';
import { OAuthResult } from '../data-object';
import { RestConstants } from '../rest-constants';

@Injectable()
export class RestLocatorService {
    private static DEFAULT_NUMBER_PER_REQUEST = 25;

    numberPerRequest = RestLocatorService.DEFAULT_NUMBER_PER_REQUEST;

    get apiVersion(): number {
        return this._apiVersion;
    }

    private _apiVersion = -1;
    private ticket: string;
    private themesUrl: any;
    private apiUrl = new BehaviorSubject<string>(null);
    // @DEPRECATED
    get endpointUrl(){
        return this.apiUrl.value;
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
    static createUrl(
        url: string,
        repository: string,
        urlParams: string[][] = [],
    ): string {
        for (const params of urlParams) {
            params[1] = encodeURIComponent(params[1]);
        }
        return RestLocatorService.createUrlNoEscape(url, repository, urlParams);
    }

    /**
     * Same as createUrl, but does not escape the params. Escaping needs to be
     * done when calling the method
     */
    static createUrlNoEscape(
        url: string,
        repository: string,
        urlParams: string[][] = [],
    ): string {
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
                .loginOAuth(this.apiUrl.value, null, null, 'client_credentials')
                .subscribe(
                    oauthTokens => {
                        this.bridge
                            .getCordova()
                            .setPermanentStorage(
                                RestConstants.CORDOVA_STORAGE_OAUTHTOKENS,
                                JSON.stringify(oauthTokens),
                            );
                        observer.next(oauthTokens);
                        observer.complete();
                    },
                    error => {
                        observer.error(error);
                        observer.complete();
                    },
                );
        });
    }

    getConfigDynamic(key: string): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            this.locateApi().subscribe(data => {
                const query = RestLocatorService.createUrl(
                    'config/:version/dynamic/:key',
                    null,
                    [[':key', key]],
                );
                this.http
                    .get<any>(
                        this.apiUrl.value + query,
                        this.getRequestOptions(),
                    )
                    .subscribe(
                        response => {
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
        });
    }

    getConfig(): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            this.locateApi().subscribe(data => {
                const query = RestLocatorService.createUrl(
                    'config/:version/values',
                    null,
                );
                this.http
                    .get<any>(
                        this.apiUrl.value + query,
                        this.getRequestOptions(),
                    )
                    .subscribe(
                        response => {
                            this.setConfigValues(response.body.current);
                            observer.next(response.body);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                            observer.complete();
                        },
                    );
            });
        });
    }

    getConfigVariables(): Observable<string[]> {
        return new Observable<string[]>((observer: Observer<string[]>) => {
            this.locateApi().subscribe(data => {
                const query = RestLocatorService.createUrl(
                    'config/:version/variables',
                    null,
                );
                this.http
                    .get<any>(
                        this.apiUrl.value + query,
                        this.getRequestOptions('application/json'),
                    )
                    .subscribe(
                        response => {
                            observer.next(response.body.current);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                            observer.complete();
                        },
                    );
            });
        });
    }

    getConfigLanguage(lang: string): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            this.locateApi().subscribe(data => {
                const query = RestLocatorService.createUrl(
                    'config/:version/language',
                    null,
                );
                this.http
                    .get(
                        this.apiUrl.value + query,
                        this.getRequestOptions(
                            'application/json',
                            null,
                            null,
                            lang,
                        ),
                    )
                    .subscribe(
                        (response: any) => {
                            observer.next(response.body.current);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                            observer.complete();
                        },
                    );
            });
        });
    }

    getLanguageDefaults(lang: string): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            this.locateApi().subscribe(data => {
                const query = RestLocatorService.createUrl(
                    'config/:version/language/defaults',
                    null,
                );
                this.http
                    .get(
                        this.apiUrl.value + query,
                        this.getRequestOptions(
                            'application/json',
                            null,
                            null,
                            lang,
                        ),
                    )
                    .subscribe(
                        response => {
                            observer.next(response.body);
                            observer.complete();
                        },
                        (error: any) => {
                            observer.error(error);
                            observer.complete();
                        },
                    );
            });
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
            headers.Authorization =
                'Basic ' + btoa(username + ':' + password);
        } else if (this.ticket != null) {
            headers.Authorization = 'EDU-TICKET ' + this.ticket;
            this.ticket = null;
        } else if (
            this.bridge.isRunningCordova() &&
            this.bridge.getCordova().oauth != null
        ) {
            headers.Authorization =
                'Bearer ' + this.bridge.getCordova().oauth.access_token;
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

    locateApi(): Observable<string> {
        if (this.apiUrl.value === null) {
            this.apiUrl.next('');
            this.testApi(true);
        }
        return this.apiUrl.pipe(filter((a) => a !== null && a !== ''));
    }

    setRoute(route: ActivatedRoute): Observable<void> {
        return new Observable<void>((observer: Observer<void>) => {
            route.queryParams.subscribe((params: any) => {
                this.ticket = null;
                if (params.ticket) this.ticket = params.ticket;
                observer.next(null);
                observer.complete();
            });
        });
    }

    getBridge() {
        return this.bridge;
    }

    private testEndpoint(url: string, local = true) {
        this.http.get<any>(url + '_about', this.getRequestOptions()).subscribe(
            data => {
                this._apiVersion =
                    data.body.version.major + data.body.version.minor / 10;
                this.apiUrl.next(url);
                this.themesUrl = data.body.themesUrl;
                return;
            },
            error => {
                if (error.status === RestConstants.HTTP_UNAUTHORIZED) {
                    this.apiUrl.next(url);
                    return;
                }
                if (local === true) {
                    this.testApi(false);
                } else {
                    console.error(
                        'Could not contact rest api at location ' + url,
                    );
                }
            },
        );
    }

    private testApi(local = true): void {
        if (local) {
            const url = 'rest/';
            this.testEndpoint(url, true);
        } else {
            if (environment.production) {
                console.error(
                    'Could not contact rest api. There is probably an issue with the backend',
                );
                return;
            } else {
                this.http
                    .get('assets/endpoint.txt', { responseType: 'text' })
                    .subscribe(
                        (data: any) => {
                            this.testEndpoint(data, false);
                        },
                        (error: any) => {
                            console.error(
                                'Could not contact locale rest endpoint and no url was found. Please create a file at assets/endpoint.txt and enter the url to your rest api',
                                error,
                            );
                        },
                    );
            }
        }
    }

    private setConfigValues(config: any) {
        if (config.itemsPerRequest)
            this.numberPerRequest = config.itemsPerRequest;
    }

}
