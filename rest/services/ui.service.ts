import { ComponentFactoryResolver, Injectable, Injector, NgZone } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { MessageType } from '../../../util/message-type';
import { RestConstants } from '../rest-constants';
import { UIService as UIServiceBase } from 'ngx-edu-sharing-ui';
import { BridgeService } from '../../../services/bridge.service';
import { RestConnectorService } from './rest-connector.service';
import { HttpClient } from '@angular/common/http';
import { UserService, ConfigValues } from 'ngx-edu-sharing-api';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UIService extends UIServiceBase {
    /**
     * triggered when a user logout is requested/processed
     */
    logoutSubject = new Subject<ConfigValues>();
    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        injector: Injector,
        private ngZone: NgZone,
        private bridge: BridgeService,
        private connector: RestConnectorService,
        private userService: UserService,
        private http: HttpClient,
    ) {
        super(componentFactoryResolver, injector, ngZone);
    }

    /**
     * waits until the given component/object is not null and available
     * @param clz the class where the component is attached (usually "this")
     * @param componentName The name of the property
     */
    waitForComponent(clz: any, componentName: string) {
        return new Observable((observer: Observer<any>) => {
            this.ngZone.runOutsideAngular(() => {
                const interval = setInterval(() => {
                    if (clz[componentName]) {
                        this.ngZone.run(() => {
                            observer.next(clz[componentName]);
                            observer.complete();
                        });
                        clearInterval(interval);
                    } else if (!clz) {
                        clearInterval(interval);
                    }
                }, 1000 / 60);
            });
        });
    }

    hideKeyboardIfMobile() {
        if (this.isMobile()) {
            try {
                (document.activeElement as any).blur();
            } catch (e) {
                console.warn(e);
            }
        }
    }
    public handleLogout() {
        return new Observable<void>((observer: Observer<void>) => {
            this.connector
                .getConfigurationService()
                .getAll()
                .subscribe(async (config: ConfigValues) => {
                    this.logoutSubject.next(config);
                    if (this.bridge.isRunningCordova()) {
                        this.connector.logout().subscribe(() => {
                            this.bridge.getCordova().restartCordova();
                        });
                        return;
                    }
                    if (config.logout) {
                        const sessionData = this.connector.getCurrentLogin();
                        if (config.logout.ajax) {
                            this.http
                                .get(await this.getLogoutUrl(config), { responseType: 'text' })
                                .subscribe(
                                    () => {
                                        if (config.logout.destroySession) {
                                            this.connector.logout().subscribe((response) => {
                                                observer.next();
                                                observer.complete();
                                            });
                                            return;
                                        }
                                        observer.next();
                                        observer.complete();
                                    },
                                    (error: any) => {
                                        this.bridge.showTemporaryMessage(
                                            MessageType.error,
                                            null,
                                            null,
                                            null,
                                            error,
                                        );
                                    },
                                );
                        } else {
                            if (config.logout.destroySession) {
                                this.connector.logout().subscribe(async (response) => {
                                    if (sessionData.currentScope === RestConstants.SAFE_SCOPE) {
                                        observer.next();
                                        observer.complete();
                                    } else {
                                        window.location.href = await this.getLogoutUrl(config);
                                    }
                                });
                            } else {
                                if (sessionData.currentScope === RestConstants.SAFE_SCOPE) {
                                    observer.next();
                                    observer.complete();
                                } else {
                                    window.location.href = await this.getLogoutUrl(config);
                                }
                            }
                        }
                    } else {
                        this.connector.logout().subscribe((response) => {
                            observer.next();
                            observer.complete();
                        });
                    }
                });
        });
    }

    /**
     * smoothly scroll to the given y offset
     * @param {y} number
     * @param {smoothness} lower numbers indicate less smoothness, higher more smoothness
     */
    scrollSmooth(y: number = 0, smoothness = 1) {
        this.ngZone.runOutsideAngular(() => {
            const mode = window.scrollY >= y;
            const divider = 3 * smoothness;
            const minSpeed = 7 / smoothness;
            let lastY = y;
            const interval = setInterval(() => {
                const yDiff = window.scrollY - lastY;
                lastY = window.scrollY;
                if (window.scrollY > y && mode && yDiff) {
                    window.scrollBy(0, -Math.max((window.scrollY - y) / divider, minSpeed));
                } else if (window.scrollY < y && !mode && yDiff) {
                    window.scrollBy(0, Math.max((y - window.scrollY) / divider, minSpeed));
                } else {
                    clearInterval(interval);
                }
            }, 16);
        });
    }

    private async getLogoutUrl(config: ConfigValues) {
        const user = await this.userService.observeCurrentUserInfo().pipe(take(1)).toPromise();
        const sso = user?.user?.person?.properties?.[RestConstants.CM_PROP_ESSSOTYPE]?.[0];
        if (sso === RestConstants.SSO_TYPE_Shibboleth) {
            const url = config.logout.ssoUrl || config.logout.url;
            console.info('Logging out via sso url', url);
            return url;
        }
        return config.logout.localUrl || config.logout.url;
    }
}
