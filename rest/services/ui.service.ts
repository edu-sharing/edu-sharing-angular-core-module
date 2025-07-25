import { ComponentFactoryResolver, Injectable, Injector, NgZone } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { MessageType } from '../../../util/message-type';
import { RestConstants } from '../rest-constants';
import { OPEN_URL_MODE, UIConstants, UIService as UIServiceBase } from 'ngx-edu-sharing-ui';
import { BridgeService } from '../../../services/bridge.service';
import { RestConnectorService } from './rest-connector.service';
import { HttpClient } from '@angular/common/http';
import { ConfigValues, Connector, UserService } from 'ngx-edu-sharing-api';
import { take } from 'rxjs/operators';
import { RestConnectorsService } from './rest-connectors.service';
import { RestIamService } from './rest-iam.service';
import { FrameEventsService } from './frame-events.service';
import { Toast } from '../../../services/toast';
import { Filetype, Node, NodeLock } from '../data-object';
import { OK } from '../../../features/dialogs/dialog-modules/generic-dialog/generic-dialog-data';
import { UIHelper } from 'src/app/core-ui-module/ui-helper';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UIService extends UIServiceBase {
    /**
     * triggered when a user logout is requested/processed
     */
    logoutSubject = new Subject<ConfigValues>();
    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        injector: Injector,
        ngZone: NgZone,
        private iamService: RestIamService,
        private events: FrameEventsService,
        private toast: Toast,
        private platformLocation: PlatformLocation,
        private router: Router,
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
    /**
     * Smoothly scrolls to the given y offset inside an element (use offsetTop on the child to
     * determine this position).
     *
     * @param smoothness lower numbers indicate less smoothness, higher more smoothness
     */
    scrollSmoothElement(pos: number = 0, element: Element, smoothness = 1, axis = 'y') {
        return new Promise<void>((resolve) => {
            this.ngZone.runOutsideAngular(() => {
                const currentPos = axis == 'x' ? element.scrollLeft : element.scrollTop;
                if (element.getAttribute('data-is-scrolling') == 'true') {
                    return;
                }
                const mode = currentPos > pos;
                let lastPos = pos;
                const maxPos =
                    axis == 'x'
                        ? element.scrollWidth - element.clientWidth
                        : element.scrollHeight - element.clientHeight;
                let limitReached = false;
                if (mode && pos <= 0) {
                    pos = 0;
                    limitReached = true;
                }
                if (!mode && pos >= maxPos) {
                    pos = maxPos;
                    limitReached = true;
                }
                let speed = 16;
                let last = new Date().getTime();
                const callback = () => {
                    let currentPos = axis == 'x' ? element.scrollLeft : element.scrollTop;
                    const posDiff = currentPos - lastPos;
                    const speedFactor = speed / 16;
                    const divider = (3 / speedFactor) * smoothness;
                    const minSpeed = (5 * speedFactor) / smoothness;
                    const maxSpeed = (50 * speedFactor) / smoothness;
                    lastPos = currentPos;
                    let finished = true;
                    if (currentPos > pos) {
                        currentPos -= Math.min(
                            maxSpeed,
                            Math.max((currentPos - pos) / divider, minSpeed),
                        );
                        finished = currentPos <= pos;
                    } else if (currentPos < pos && !mode) {
                        currentPos += Math.min(
                            maxSpeed,
                            Math.max((pos - currentPos) / divider, minSpeed),
                        );
                        finished = currentPos >= pos;
                    }
                    if (finished) {
                        currentPos = pos;
                    }

                    if (axis == 'x') {
                        element.scrollLeft = currentPos;
                    } else {
                        element.scrollTop = currentPos;
                    }
                    if (finished) {
                        element.removeAttribute('data-is-scrolling');
                        resolve();
                    } else {
                        speed = new Date().getTime() - last;
                        last = new Date().getTime();
                        window.requestAnimationFrame(callback);
                    }
                };
                window.requestAnimationFrame(callback);

                element.setAttribute('data-is-scrolling', 'true');
            });
        });
    }

    /**
     * smoothly scroll to the given child inside an element (The child will be placed around the first 1/3 of the parent's top)
     * @param child
     * @param element
     * @param smoothness
     */
    scrollSmoothElementToChild(child: Element, element: Element | 'auto' = 'auto', smoothness = 1) {
        let target: Element;
        if (element === 'auto') {
            let parent = child.parentElement;
            while (parent) {
                if (['scroll', 'auto'].includes(window.getComputedStyle(parent).overflowY)) {
                    target = parent;
                    break;
                }
                parent = parent.parentElement;
            }
        } else {
            target = element;
        }
        // y equals to the top of the child + any scrolling of the parent - the top of the parent
        let y =
            child.getBoundingClientRect().top +
            target.scrollTop -
            target.getBoundingClientRect().top;
        // move the focused element to 1/3 at the top of the container
        y += child.getBoundingClientRect().height / 2 - target.getBoundingClientRect().height / 3;
        return this.scrollSmoothElement(y, target, smoothness);
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

    openConnector(
        node: Node,
        type: Filetype = null,
        win: Window = null,
        connectorType: Connector = null,
        newWindow = true,
        parameters: { [key in string]: string[] } = {},
    ) {
        const connectors = this.injector.get(RestConnectorsService);
        if (connectorType == null) {
            connectorType = connectors.connectorSupportsEdit(node);
        }
        let isCordova = this.connector.getBridgeService().isRunningCordova();
        if (win == null && newWindow) {
            win = UIHelper.getNewWindow(connectors.getRestConnector());
        }
        if (win) {
            win.location.replace(this.getLoadingSpinnerUrl());
        }

        connectors.nodeApi.isLocked(node.ref.id).subscribe(
            (result: NodeLock) => {
                if (result.isLocked) {
                    this.toast.error(null, 'TOAST.NODE_LOCKED');
                    if (win) win.close();
                    return;
                }
                this.iamService.getCurrentUserAsync().then(
                    (user) => {
                        if (
                            user.person.quota.enabled &&
                            user.person.quota.sizeCurrent >= user.person.quota.sizeQuota
                        ) {
                            void this.toast.openGenericDialog({
                                title: 'CONNECTOR_QUOTA_REACHED_TITLE',
                                message: 'CONNECTOR_QUOTA_REACHED_MESSAGE',
                                buttons: OK,
                            });
                            if (win) win.close();
                            return;
                        }
                        connectors.generateToolUrl(connectorType, type, node, parameters).subscribe(
                            (url: string) => {
                                if (win) {
                                    win.location.href = url;
                                } else if (isCordova) {
                                    UIHelper.openUrl(
                                        url,
                                        connectors.getRestConnector().getBridgeService(),
                                        OPEN_URL_MODE.Blank,
                                    );
                                } else {
                                    window.location.replace(url);
                                }
                                if (win) {
                                    this.events.addWindow(win);
                                }
                            },
                            (error) => {
                                this.toast.error(null, error);
                                if (win) win.close();
                            },
                        );
                    },
                    (error) => {
                        this.toast.error(null, error);
                        if (win) win.close();
                    },
                );
            },
            (error: any) => {
                this.toast.error(error);
                if (win) win.close();
            },
        );
    }

    getLoadingSpinnerUrl() {
        return (
            this.platformLocation.getBaseHrefFromDOM() +
            this.router
                .createUrlTree([UIConstants.ROUTER_PREFIX + 'loading'])
                .toString()
                .substring(1)
        );
    }
}
