import { Injectable } from '@angular/core';
import { Connector, ConnectorList, ConnectorService, Node } from 'ngx-edu-sharing-api';
import { NodeHelperService } from '../../../services/node-helper.service';
import { CollectionReference } from '../data-object';
import { NodesRightMode } from 'ngx-edu-sharing-ui';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';
import { RestNodeService } from './rest-node.service';
import { UIService } from './ui.service';

/**
 * @Deprecated use ConnectorService from ngx-edu-sharing-api instead
 */
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

    public connectorSupportsEdit(node: Node) {
        const connectors = this.getConnectors();
        if (connectors == null) return null;
        for (const connector of connectors) {
            let access = (node as CollectionReference).accessOriginal || node.access;
            if (this.nodeHelper.isNodePublishedCopy(node)) {
                // no edit allowed for published copies
                access = [];
            }
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
                                node.properties[RestConstants.CCM_PROP_CCRESSOURCEVERSION]?.[0]) &&
                        filetype.ccressourcetype ==
                            node.properties[RestConstants.CCM_PROP_CCRESSOURCETYPE]?.[0] &&
                        (!filetype.ccresourcesubtype ||
                            filetype.ccresourcesubtype ==
                                node.properties[RestConstants.CCM_PROP_CCRESSOURCESUBTYPE]?.[0])
                    )
                        return filetype;
                    continue;
                }
                if (
                    filetype.editorType &&
                    filetype.editorType != node.properties[RestConstants.CCM_PROP_EDITOR_TYPE]?.[0]
                ) {
                    continue;
                }
                return filetype;
            }
        }
        return null;
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
