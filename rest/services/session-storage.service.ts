import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { RestIamService } from '../../rest/services/rest-iam.service';
import { LoginResult } from '../data-object';
import { RestConstants } from '../rest-constants';
import { RestConnectorService } from './rest-connector.service';
/**
 Service to store any data in session (NEW: Now stored in repository) OLD: (stored as cookie)
 This is not the cleanest solution, but the current available modules for ng are not that great either
 Note that it currently only supports strings
 If a user is logged in, it will be stored inside the user profile. otherwise, a cookie will be set
 */
@Injectable()
export class SessionStorageService {
    static KEY_WORKSPACE_SORT = 'workspace_sort';
    // default we store session cookies about 24 hours
    private static EXPIRE_TIME_SESSION = 24 * 60 * 60;
    private preferences: any;
    private authorityName: string;
    constructor(
        private iam: RestIamService,
        private connector: RestConnectorService,
    ) {
        this.get('').subscribe(() => {});
    }

    refresh() {
        this.preferences = null;
    }

    get(name: string, fallback: any = null, store = Store.UserProfile): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            if (
                !this.connector.getCurrentLogin() ||
                this.connector.getCurrentLogin().authorityName !==
                    this.authorityName
            ) {
                this.connector.isLoggedIn().subscribe((data: LoginResult) => {
                    if (
                        store === Store.Session ||
                        data.statusCode !== RestConstants.STATUS_CODE_OK ||
                        data.isGuest
                    ) {
                        observer.next(this.getCookie(name, fallback));
                        observer.complete();
                        return;
                    }
                    this.iam.getUserPreferences().subscribe(
                        (pref: any) => {
                            this.preferences = pref;
                            this.authorityName = data.authorityName;
                            if (!this.preferences) this.preferences = {};
                            observer.next(
                                this.preferences[name]
                                    ? this.preferences[name]
                                    : fallback,
                            );
                            observer.complete();
                        },
                        (error: any) => {
                            this.preferences = {};
                            console.error('preferences error', error);
                            observer.next(fallback);
                            observer.complete();
                        },
                    );
                });
                return;
            } else if (
                store !== Store.Session && (
                this.connector.getCurrentLogin().statusCode === RestConstants.STATUS_CODE_OK &&
                !this.connector.getCurrentLogin().isGuest)
            ) {
                observer.next(
                    this.preferences?.[name] ? this.preferences[name] : fallback,
                );
            } else {
                observer.next(this.getCookie(name, fallback));
            }
            observer.complete();
        });
    }

    set(name: string, value: any, store = Store.UserProfile) {
        return new Observable(subscriber => {
            if (!this.connector.getCurrentLogin() ||
                (!this.connector.getCurrentLogin()?.isGuest && !this.preferences)) {
                setTimeout(() => this.set(name, value), 50);
                return;
            }
            if (store === Store.Session) {
                this.setCookie(name, value, SessionStorageService.EXPIRE_TIME_SESSION);
                subscriber.next();
                subscriber.complete();
                return;
            }
            if (
                this.connector.getCurrentLogin().statusCode ==
                RestConstants.STATUS_CODE_OK &&
                !this.connector.getCurrentLogin().isGuest
            ) {
                this.preferences[name] = value;
                this.connector.isLoggedIn().subscribe((data: LoginResult) => {
                    if (data.statusCode != RestConstants.STATUS_CODE_OK) {
                        return;
                    }
                    this.iam
                        .setUserPreferences(this.preferences)
                        .subscribe(() => {
                            subscriber.next();
                            subscriber.complete();
                        }, error => {
                            subscriber.error(error);
                            subscriber.complete();
                        });
                });
            } else {
                this.setCookie(name, value);
                subscriber.next();
                subscriber.complete();
            }
        });
    }

    delete(name: string) {
        this.set(name, null);
    }

    // http://stackoverflow.com/questions/34298133/angular-2-cookies
    getCookie(name: string, fallback: any = null): string {
        let ca: Array<string> = document.cookie.split(';');
        let caLen: number = ca.length;
        let cookieName = name + '=';
        let c: string;
        for (let i = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s\+/g, '').trim();
            if (c.indexOf(cookieName) === 0) {
                const value = c.substring(cookieName.length, c.length);
                try {
                    return JSON.parse(value);
                } catch(e) {
                    return value;
                }
            }
        }
        return fallback;
    }

    deleteCookie(name: string) {
        this.setCookie(name, '', -1);
    }

    setCookie(name: string, value: string, expireSeconds = 60 * 24 * 60 * 60, path = '/') {
        let d: Date = new Date();
        d.setTime(d.getTime() + expireSeconds * 1000);
        let expires: string = 'expires=' + d.toUTCString();
        document.cookie =
            name +
            '=' +
            JSON.stringify(value) +
            '; ' +
            expires +
            (path.length > 0 ? '; path=' + path : '');
    }
}
export enum Store {
    // the user profile, if available, otherwise as a cookie
    UserProfile,
    // Only the current running session (via cookie with timeout
    Session,
}
