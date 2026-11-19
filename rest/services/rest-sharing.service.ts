import { Injectable, inject } from '@angular/core';
import { RestConnectorService } from './rest-connector.service';
import { RestHelper } from '../rest-helper';
import { RestConstants } from '../rest-constants';
import {
    NodeRef,
    NodeWrapper,
    NodePermissions,
    LocalPermissions,
    NodeVersions,
    NodeVersion,
    NodeList,
    SharingInfo,
    SecuredNode,
} from '../data-object';
import { RequestObject } from '../request-object';
import { AbstractRestService } from './abstract-rest-service';

@Injectable({ providedIn: 'root' })
export class RestSharingService extends AbstractRestService {
    constructor() {
        const connector = inject(RestConnectorService);

        super(connector);
    }

    getInfo(
        node: string,
        token: string,
        password = '',
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        let query = this.connector.createUrl(
            'sharing/:version/sharing/:repository/:node/:token?password=:password',
            repository,
            [
                [':node', node],
                [':token', token],
                [':password', password],
            ],
        );
        return this.connector.get<SharingInfo>(query, this.connector.getRequestOptions());
    }
    getChildren(
        node: string,
        token: string,
        password = '',
        request: any = {},
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        let query = this.connector.createUrlNoEscape(
            'sharing/:version/sharing/:repository/:node/:token/children?password=:password&:request',
            repository,
            [
                [':node', encodeURIComponent(node)],
                [':token', encodeURIComponent(token)],
                [':password', encodeURIComponent(password)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<NodeList>(query, this.connector.getRequestOptions());
    }
    /**
     * Signed data to render a shared node (or an element of a shared folder), authorized by the share.
     * Only valid if the share allows viewing.
     */
    getSecuredNode(
        node: string,
        token: string,
        password = '',
        child: string = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        let query = this.connector.createUrlNoEscape(
            'sharing/:version/sharing/:repository/:node/:token/metadata/secured?password=:password:child',
            repository,
            [
                [':node', encodeURIComponent(node)],
                [':token', encodeURIComponent(token)],
                [':password', encodeURIComponent(password)],
                [':child', child ? '&child=' + encodeURIComponent(child) : ''],
            ],
        );
        return this.connector.get<SecuredNode>(query, this.connector.getRequestOptions());
    }
}
