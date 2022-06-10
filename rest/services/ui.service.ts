import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { BridgeService } from '../../../core-bridge-module/bridge.service';
import { MessageType } from '../../ui/message-type';
import { RestConstants } from '../rest-constants';
import { RestConnectorService } from './rest-connector.service';

@Injectable({ providedIn: 'root' })
export class UIService {
    private isTouchSubject = new BehaviorSubject(false);

    constructor(
        private bridge: BridgeService,
        private ngZone: NgZone,
        private http: HttpClient,
        private connector: RestConnectorService,
    ) {
        // HostListener not working, so use window
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('keydown', (event) => {
                if (event.key == 'Shift') {
                    this.shiftCmd = true;
                }
                if (event.keyCode == 91 || event.keyCode == 93) {
                    this.appleCmd = true;
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            window.addEventListener('keyup', (event) => {
                if (event.keyCode == 91 || event.keyCode == 93) {
                    this.appleCmd = false;
                }
                if (event.key == 'Shift') {
                    this.shiftCmd = false;
                }
            });
            window.addEventListener('pointerdown', (event) => {
                const isTouch = (event as PointerEvent).pointerType === 'touch';
                if (this.isTouchSubject.value !== isTouch) {
                    this.ngZone.run(() => this.isTouchSubject.next(isTouch));
                }
            });
        });
    }
    private appleCmd: boolean;
    private shiftCmd: boolean;
    /** Returns true if the current sessions seems to be running on a mobile device
     *
     */
    public isMobile() {
        return this.isTouchSubject.value;
    }
    public isAppleCmd() {
        return this.appleCmd;
    }
    public isShiftCmd() {
        return this.shiftCmd;
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
                        observer.next(clz[componentName]);
                        observer.complete();
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
                .subscribe((config) => {
                    if (this.bridge.isRunningCordova()) {
                        this.connector.logout().subscribe(() => {
                            this.bridge.getCordova().restartCordova();
                        });
                        return;
                    }
                    if (config.logout) {
                        const sessionData = this.connector.getCurrentLogin();
                        if (config.logout.ajax) {
                            this.http.get(config.logout.url, { responseType: 'text' }).subscribe(
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
                                this.connector.logout().subscribe((response) => {
                                    if (sessionData.currentScope === RestConstants.SAFE_SCOPE) {
                                        observer.next();
                                        observer.complete();
                                    } else {
                                        window.location.href = config.logout.url;
                                    }
                                });
                            } else {
                                if (sessionData.currentScope === RestConstants.SAFE_SCOPE) {
                                    observer.next();
                                    observer.complete();
                                } else {
                                    window.location.href = config.logout.url;
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
     * smoothly scroll to the given y offset inside an element (use offsetTop on the child to determine this position)
     * @param {y} number
     * @param {smoothness} lower numbers indicate less smoothness, higher more smoothness
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
}
