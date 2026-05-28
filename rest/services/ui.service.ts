import { ComponentFactoryResolver, Injectable, Injector, NgZone } from '@angular/core';
import { concatMap, firstValueFrom, from, Observable, Observer, of, Subject } from 'rxjs';
import { MessageType } from '../../../util/message-type';
import { RestConstants } from '../rest-constants';
import {
    LocalEventsService,
    OPEN_URL_MODE,
    UIConstants,
    UIService as UIServiceBase,
} from 'ngx-edu-sharing-ui';
import { BridgeService } from '../../../services/bridge.service';
import { RestConnectorService } from './rest-connector.service';
import { HttpClient } from '@angular/common/http';
import {
    Assignment,
    AuthenticationService,
    ConfigValues,
    Connector,
    LtiPlatformService,
    Node,
    NodeServiceUnwrapped,
    ROOT,
    UserService,
} from 'ngx-edu-sharing-api';
import { catchError, take, toArray } from 'rxjs/operators';
import { RestConnectorsService } from './rest-connectors.service';
import { RestIamService } from './rest-iam.service';
import { FrameEventsService } from './frame-events.service';
import { Toast, ToastType } from '../../../services/toast';
import { CollectionReference, Filetype, NodeLock } from '../data-object';
import {
    OK,
    YES_OR_NO,
} from '../../../features/dialogs/dialog-modules/generic-dialog/generic-dialog-data';
import { UIHelper } from 'src/app/core-ui-module/ui-helper';
import { PlatformLocation } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { RestHelper } from '../rest-helper';
import { RestCollectionService } from './rest-collection.service';
import { NodeHelperService } from '../../../services/node-helper.service';
import { RestToolService } from './rest-tool.service';

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
        private ltiPlatformService: LtiPlatformService,
        private router: Router,
        private bridge: BridgeService,
        private connector: RestConnectorService,
        private nodeServiceUnwrapped: NodeServiceUnwrapped,
        private collectionService: RestCollectionService,
        private userService: UserService,
        private http: HttpClient,
        private localEventsService: LocalEventsService,
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

    async hasAvailableConnector(n: Node) {
        if (n?.aspects?.includes(RestConstants.CCM_ASPECT_LTITOOL_NODE)) {
            return true;
        }
        // simple connector node;
        if (n?.properties?.[RestConstants.CCM_PROP_CCRESSOURCETYPE]?.[0] === 'connector') {
            return true;
        }
        return (
            this.injector.get(RestConnectorsService).connectorSupportsEdit(n) != null ||
            (await this.ltiPlatformService.toolForNode(n)) != null
        );
    }
    async editConnector(
        node: Node,
        options: {
            type?: Filetype;
            win?: Window;
            connectorType?: Connector;
            preferEdit?: boolean;
        } = {},
    ): Promise<Window> {
        const {
            type = null,
            win: winIn = null,
            connectorType = null,
            preferEdit = false,
        } = options;
        let win = winIn;
        const ltiTool = await this.ltiPlatformService.toolForNode(node);
        if (node.properties[RestConstants.CCM_PROP_CCRESSOURCETYPE]?.[0] === 'connector') {
            UIHelper.openWindow(win, node.properties[RestConstants.CCM_PROP_IO_WWWURL]?.[0]);
        } else if (node.aspects?.includes(RestConstants.CCM_ASPECT_LTITOOL_NODE) || ltiTool) {
            UIHelper.openLTIResourceLink(win, node);
        } else {
            const parameters = preferEdit ? { preferEdit: ['true'] } : {};
            win = this.openConnector(node, type, win, connectorType, true, parameters);
        }
        return win;
    }

    private openConnector(
        node: Node,
        type: Filetype = null,
        win: Window = null,
        connectorType: Connector = null,
        newWindow = true,
        parameters: { [key in string]: string[] } = {},
    ): Window {
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
                if (win) {
                    win.close();
                }
            },
        );
        return win;
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

    async copyOrMoveNodes(source: Node[], target: Node, mode: 'copy' | 'move' = 'copy') {
        for (const node of source) {
            if (mode === 'move') {
                await firstValueFrom(
                    this.nodeServiceUnwrapped.createChildByMoving({
                        source: node.ref.id,
                        repository: target.ref.repo,
                        node: target.ref.id,
                    }),
                );
            } else {
                await firstValueFrom(
                    this.nodeServiceUnwrapped.createChildByCopying({
                        source: node.ref.id,
                        repository: target.ref.repo,
                        node: target.ref.id,
                        withChildren: true,
                    }),
                );
            }
        }
        this.toast.show({
            action: {
                label: 'WORKSPACE.TOAST.VIEW_FOLDER',
                callback: () => this.goToWorkspace(target),
            },
            type: 'info',
            subtype: ToastType.InfoAction,
            message:
                mode === 'move' ? 'WORKSPACE.TOAST.MOVED_NODES' : 'WORKSPACE.TOAST.COPIED_NODES',
            messageParameters: { count: source.length, target: RestHelper.getTitle(target) },
        });
    }

    /**
     * handles adding nodes to a collection
     * @param nodeHelper
     * @param collectionService
     * @param router
     * @param bridge
     * @param collection
     * @param nodes
     * @param callback
     * @param allowDuplicate false (default) will trigger a confirmation if duplicate was detected, true will always create a duplicate and 'ignore' works as false but will not trigger a confirmation but silently abort
     */

    addToCollection(
        collection: Node,
        nodes: Node[],
        asProposal = false,
        callback: (nodes: CollectionReference[]) => void = null,
        allowDuplicate: boolean | 'ignore' = false,
    ) {
        from(
            nodes.map((node) =>
                this.collectionService
                    .addNodeToCollection(
                        collection.ref.id,
                        node.ref.id,
                        node.ref.repo,
                        allowDuplicate === true,
                        asProposal,
                    )
                    .pipe(catchError((error: any) => of({ error, node }))),
            ),
        )
            .pipe(
                concatMap((req) => req),
                toArray(),
            )
            .subscribe(async (results) => {
                const success: { node: Node }[] = results.filter((r) => !(r as any).error);
                const failed: { node: Node; error: any }[] = results.filter(
                    (r) => !!(r as any).error,
                ) as { node: Node; error: any }[];
                if (success.length > 0) {
                    this.showAddedToCollectionInfo(collection, success.length, asProposal);
                    this.localEventsService.nodesCreated.emit(success.map((s) => s.node));
                    this.localEventsService.nodesChanged.emit([collection]);
                }
                if (failed.length > 0) {
                    const duplicated = failed.filter(
                        ({ error }) => error.status === RestConstants.DUPLICATE_NODE_RESPONSE,
                    );
                    if (duplicated.length > 0 && !asProposal) {
                        if (allowDuplicate !== 'ignore') {
                            const dialogRef = await this.bridge.openGenericDialog({
                                title: 'COLLECTIONS.ADD_TO.DUPLICATE_TITLE',
                                message: 'COLLECTIONS.ADD_TO.DUPLICATE_MESSAGE',
                                messageParameters: { count: duplicated.length.toString() },
                                buttons: YES_OR_NO,
                            });
                            dialogRef.afterClosed().subscribe((response) => {
                                if (response === 'YES') {
                                    this.addToCollection(
                                        collection,
                                        duplicated.map((d) => d.node),
                                        false,
                                        (nodes) =>
                                            // Invoke `callback` with both, the nodes successfully added
                                            // before and the duplicate nodes added now.
                                            callback?.([
                                                ...success.map(
                                                    (n) => n.node as CollectionReference,
                                                ),
                                                ...nodes,
                                            ]),
                                        true,
                                    );
                                } else if (response === 'NO') {
                                    // Invoke `callback` only with the nodes successfully added
                                    // before.
                                    callback?.(success.map((n) => n.node as CollectionReference));
                                } else {
                                    // Dialog was canceled by the user.
                                    //
                                    // TODO: should we invoke `callback` here?
                                    this.bridge.closeModalDialog();
                                }
                            });
                            return;
                        }
                    } else {
                        this.injector
                            .get(NodeHelperService)
                            .handleNodeError(RestHelper.getTitle(failed[0].node), failed[0].error);
                    }
                }

                if (callback) {
                    callback(success.map((n) => n.node as CollectionReference));
                }
            });
    }
    showAddedToCollectionInfo(node: Node | any, count: number, asProposal = false) {
        let scope = node.collection ? node.collection.scope : node.scope;
        let type = node.collection ? node.collection.type : node.type;
        if (scope == RestConstants.COLLECTIONSCOPE_MY) {
            scope = 'MY';
        } else if (
            scope == RestConstants.COLLECTIONSCOPE_ORGA ||
            scope == RestConstants.COLLECTIONSCOPE_CUSTOM
        ) {
            scope = 'SHARED';
        } else if (
            scope == RestConstants.COLLECTIONSCOPE_ALL ||
            scope == RestConstants.COLLECTIONSCOPE_CUSTOM_PUBLIC
        ) {
            scope = 'PUBLIC';
        } else if (type == RestConstants.COLLECTIONTYPE_EDITORIAL) {
            scope = 'PUBLIC';
        } else if (type == RestConstants.COLLECTIONTYPE_MEDIA_CENTER) {
            scope = 'MEDIA_CENTER';
        }
        if (asProposal) {
            this.bridge.showTemporaryMessage(
                MessageType.info,
                'WORKSPACE.TOAST.PROPOSED_FOR_COLLECTION',
                { count: count, collection: RestHelper.getTitle(node) },
            );
        } else {
            this.bridge.showTemporaryMessage(
                MessageType.info,
                'WORKSPACE.TOAST.ADDED_TO_COLLECTION_' + scope,
                { count: count, collection: RestHelper.getTitle(node) },
                {
                    link: {
                        caption: 'WORKSPACE.TOAST.VIEW_COLLECTION',
                        callback: () => this.goToCollection(node),
                    },
                },
            );
        }
    }
    goToCollection(node: Node, mode: null | 'new' | 'edit' = null, extras: NavigationExtras = {}) {
        if (mode === 'new' || mode === 'edit') {
            void this.router.navigate(
                [
                    UIConstants.ROUTER_PREFIX,
                    'collections',
                    'collection',
                    mode,
                    node?.ref?.id || ROOT,
                ],
                extras,
            );
        } else {
            extras.queryParams = { id: node?.ref?.id || ROOT };
            void this.router.navigate([UIConstants.ROUTER_PREFIX, 'collections'], extras);
        }
    }

    goToAssignment(assignment: Assignment, mode: 'edit' | 'submissions' | 'submit') {
        if (mode === 'edit') {
            void this.router.navigate([UIConstants.ROUTER_PREFIX, 'editorial', 'assignment'], {
                queryParams: {
                    mainComponent: 'manageAssignment',
                    assignment: assignment.ref.id,
                },
            });
        } else if (mode === 'submissions') {
            void this.router.navigate([UIConstants.ROUTER_PREFIX, 'editorial', 'assignment'], {
                queryParams: {
                    mainComponent: 'assignmentSubmission',
                    assignment: assignment.ref.id,
                },
            });
        } else if (mode === 'submit') {
            void this.router.navigate([UIConstants.ROUTER_PREFIX, 'editorial', 'assignment'], {
                queryParams: {
                    mainComponent: 'submitAssignment',
                    assignment: assignment.ref.id,
                },
            });
        }
    }

    goToWorkspace(target: Node) {
        void this.router.navigate([UIConstants.ROUTER_PREFIX, 'workspace'], {
            queryParams: {
                id: target.ref.id,
            },
        });
    }

    /**
     * @Deprecated use NodeHelperService.navigateToNode
     * opens a given node in the preferred env (collection, workspace, render)
     */
    async openNode(node: Node, useConnector = true) {
        if (!node.aspects) {
            // unsuoported element
            return;
        }
        if (this.injector.get(NodeHelperService).isNodeCollection(node)) {
            UIHelper.goToCollection(this.router, node);
        } else if (this.injector.get(NodeHelperService).isSavedSearchObject(node)) {
            UIHelper.routeToSearchNode(this.router, null, node);
        } else if (RestToolService.isLtiObject(node)) {
            this.injector.get(RestToolService).openLtiObject(node);
        } else if (
            useConnector &&
            this.injector.get(RestConnectorsService).connectorSupportsEdit(node)
        ) {
            await this.editConnector(node);
        } else if (node.isDirectory) {
            UIHelper.goToWorkspaceFolder(
                this.router,
                await firstValueFrom(this.injector.get(AuthenticationService).observeLoginInfo()),
                node.ref.id,
            );
        } else {
            UIHelper.goToNode(this.router, node);
        }
    }
}
