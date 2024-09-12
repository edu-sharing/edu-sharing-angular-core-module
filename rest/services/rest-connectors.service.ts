import { Injectable } from '@angular/core';
import { Connector, ConnectorList, ConnectorService } from 'ngx-edu-sharing-api';
import { Observable, Observer } from 'rxjs';
import { take } from 'rxjs/operators';
import { NodeHelperService } from '../../../services/node-helper.service';
import { CollectionReference, Filetype, Node } from '../data-object';
import { NodesRightMode } from 'ngx-edu-sharing-ui';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';
import { RestNodeService } from './rest-node.service';
import { UIService } from './ui.service';

@Injectable({ providedIn: 'root' })
export class RestConnectorsService extends AbstractRestService {
    private static MODE_NONE = 0;
    private static MODE_CREATE = 1;
    private static MODE_EDIT = 2;

    private currentList: ConnectorList;
    constructor(
        connector: RestConnectorService,
        public nodeApi: RestNodeService,
        private nodeHelper: NodeHelperService,
        public ui: UIService,
        private connectorApi: ConnectorService,
    ) {
        super(connector);
        // FIXME: This causes the connectors list to always be fetched, even if no one needs it. In
        // order to change that, all functions depending on `currentList` need to be asynchronous.
        this.connectorApi.observeConnectorList().subscribe((list) => (this.currentList = list));
    }

    public list(repository = RestConstants.HOME_REPOSITORY): Observable<ConnectorList> {
        return this.connectorApi.observeConnectorList({ repository }).pipe(take(1));
    }

    public connectorSupportsEdit(node: Node) {
        const connectors = this.getConnectors();
        if (connectors == null) return null;
        for (const connector of connectors) {
            const access = (node as CollectionReference).accessOriginal || node.access;
            // do not allow opening on a desktop-only connector on mobile
            if (connector.onlyDesktop && this.ui.isMobile()) continue;
            if (
                !connector.hasViewMode &&
                !this.nodeHelper.getNodesRight(
                    [node],
                    RestConstants.ACCESS_WRITE,
                    NodesRightMode.Effective,
                )
            ) {
                continue;
            }
            if (RestConnectorsService.getFiletype(node, connector)) return connector;
        }
        return null;
    }

    public static getFiletype(node: Node, connector: Connector, mode = this.MODE_NONE) {
        for (let filetype of connector.filetypes) {
            if (
                filetype.mimetype == node.mimetype &&
                (mode == this.MODE_NONE ||
                    (mode == this.MODE_EDIT && filetype.editable) ||
                    (mode == this.MODE_CREATE && filetype.creatable))
            ) {
                if (filetype.mimetype == 'application/zip') {
                    if (
                        (!filetype.ccressourceversion ||
                            filetype.ccressourceversion ==
                                node.properties[RestConstants.CCM_PROP_CCRESSOURCEVERSION]) &&
                        filetype.ccressourcetype ==
                            node.properties[RestConstants.CCM_PROP_CCRESSOURCETYPE] &&
                        (!filetype.ccresourcesubtype ||
                            filetype.ccresourcesubtype ==
                                node.properties[RestConstants.CCM_PROP_CCRESSOURCESUBTYPE])
                    )
                        return filetype;
                    continue;
                }
                if (
                    filetype.editorType &&
                    filetype.editorType != node.properties[RestConstants.CCM_PROP_EDITOR_TYPE]
                ) {
                    continue;
                }
                return filetype;
            }
        }
        return null;
    }

    public generateToolUrl(
        connectorType: Connector,
        type: Filetype,
        node: Node,
        parameters: { [key in string]: string[] } = {},
    ): Observable<string> {
        return new Observable<string>((observer: Observer<string>) => {
            let send: { [key in string]: string[] } = parameters || {};
            send['connectorId'] = [connectorType.id];
            send['nodeId'] = [node.ref.id];
            let req = this.connector.getAbsoluteEndpointUrl() + '../eduservlet/connector?';
            let i = 0;
            for (let param in send) {
                if (!send[param]) {
                    continue;
                }
                for (const value of send[param]) {
                    if (i > 0) {
                        req += '&';
                    }
                    req += param + '=' + encodeURIComponent(value);
                    i++;
                }
            }
            observer.next(req);
            observer.complete();
        });
    }

    getConnectors() {
        return this.filterConnectors(this.currentList?.connectors);
    }

    /** Filters connectors which are only available on desktop. */
    filterConnectors(connectors?: Connector[]): Connector[] | null {
        return (
            connectors?.filter((connector) => !connector.onlyDesktop || !this.ui.isMobile()) ?? []
        );
    }
}
