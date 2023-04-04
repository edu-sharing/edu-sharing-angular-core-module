import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestConnectorService } from './rest-connector.service';
import { RestHelper } from '../rest-helper';
import { RestConstants } from '../rest-constants';
import {
    NodeRef,
    Node,
    NodeWrapper,
    NodePermissions,
    LocalPermissions,
    NodeVersions,
    NodeVersion,
    NodeList,
    VCardResult,
    SearchRequestBody,
} from '../data-object';
import { AbstractRestService } from './abstract-rest-service';
import { Helper } from '../helper';
import { MdsHelper } from '../mds-helper';
import { map } from 'rxjs/operators';
import { VCard } from 'ngx-edu-sharing-ui';
import { MdsWidget, Values } from '../../../features/mds/types/types';

@Injectable({ providedIn: 'root' })
export class RestSearchService extends AbstractRestService {
    static readonly MAX_QUERY_CONCAT_PARAMS = 100;
    static convertCritierias(properties: Values, mdsWidgets: MdsWidget[]) {
        const criterias = [];
        properties = Helper.deepCopy(properties);
        for (const property in properties) {
            let widget = MdsHelper.getWidget(property, undefined, mdsWidgets);
            if (widget && widget.type == 'multivalueTree') {
                let attach = RestSearchService.unfoldTreeChilds(properties[property], widget);
                if (attach) {
                    if (attach.length > RestSearchService.MAX_QUERY_CONCAT_PARAMS) {
                        console.info(
                            'param ' +
                                property +
                                ' has too many unfold childs (' +
                                attach.length +
                                '), falling back to basic prefix-based search',
                        );
                    } else {
                        properties[property] = properties[property].concat(attach);
                    }
                }
            }
            if (properties[property]?.length && properties[property].every((p) => p != null && !!p))
                criterias.push({
                    property: property,
                    values: properties[property],
                });
        }
        return criterias;
    }
    static unfoldTreeChilds(props: string[], widget: any) {
        let attach: string[] = [];
        if (props) {
            for (let prop of props) {
                for (let child of widget.values) {
                    let copy = child;
                    for (let i = 0; i <= 100 && copy.parent; i++) {
                        if (copy.parent == prop && attach.indexOf(child.id) == -1) {
                            attach.push(child.id);
                        }
                        if (copy.parent) {
                            copy = widget.values.find((v: any) => v.id == copy.parent);
                        } else break;
                        if (i == 100) {
                            console.warn(
                                'possible tree recursion detected in valuespace for widget ' +
                                    widget.id,
                            );
                        }
                    }
                }
            }
            return attach;
        }
        return null;
    }
    constructor(connector: RestConnectorService) {
        super(connector);
    }

    searchByProperties(
        properties: string[],
        values: string[],
        comparators: string[],
        combineMode = RestConstants.COMBINE_MODE_AND,
        contentType = RestConstants.CONTENT_TYPE_FILES,
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        let url = this.connector.createUrlNoEscape(
            'search/:version/custom/:repository?contentType=:contentType&combineMode=:combineMode&:properties&:values&:comparators&:request',
            repository,
            [
                [':contentType', contentType],
                [':combineMode', combineMode],
                [':properties', RestHelper.getQueryString('property', properties)],
                [':values', RestHelper.getQueryString('value', values)],
                [':comparators', RestHelper.getQueryString('comparator', comparators)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<NodeList>(url, this.connector.getRequestOptions());
    }
    saveSearch(
        name: string,
        query: string,
        criterias: any[],
        repository = RestConstants.HOME_REPOSITORY,
        metadataset = RestConstants.DEFAULT,
        replace = false,
    ) {
        let url = this.connector.createUrl(
            'search/:version/queries/:repository/:metadataset/:query/save?name=:name&replace=:replace',
            repository,
            [
                [':name', name],
                [':query', query],
                [':metadataset', metadataset],
                [':replace', '' + replace],
            ],
        );
        return this.connector.post<NodeWrapper>(
            url,
            JSON.stringify(criterias),
            this.connector.getRequestOptions(),
        );
    }
    searchSimple(
        queryId = 'ngsearch',
        criterias: any[] = [],
        query: string = null,
        request: any = null,
        type = RestConstants.CONTENT_TYPE_FILES,
    ) {
        if (query) {
            criterias.push({ property: RestConstants.PRIMARY_SEARCH_CRITERIA, values: [query] });
        }
        return this.search(
            criterias,
            null,
            request,
            type,
            RestConstants.HOME_REPOSITORY,
            RestConstants.DEFAULT,
            [],
            queryId,
        );
    }
    searchWithBody(
        body: SearchRequestBody,
        request: any = null,
        contentType = RestConstants.CONTENT_TYPE_FILES,
        repository = RestConstants.HOME_REPOSITORY,
        metadataset = RestConstants.DEFAULT,
        propertyFilter: string[] = [],
        query = RestConstants.DEFAULT_QUERY_NAME,
    ) {
        let q = this.connector.createUrlNoEscape(
            'search/:version/queries/:repository/:metadataset/:query/?contentType=:contentType&:request&:propertyFilter',
            repository,
            [
                [':metadataset', encodeURIComponent(metadataset)],
                [':query', encodeURIComponent(query)],
                [':contentType', contentType],
                [':propertyFilter', RestHelper.getQueryString('propertyFilter', propertyFilter)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.post<NodeList>(q, body, this.connector.getRequestOptions());
    }

    /**
     * @Deprecated
     * use searchWithBody instead
     */
    search(
        criterias: any[],
        facettes: string[] = [],
        request: any = null,
        contentType = RestConstants.CONTENT_TYPE_FILES,
        repository = RestConstants.HOME_REPOSITORY,
        metadataset = RestConstants.DEFAULT,
        propertyFilter: string[] = [],
        query = RestConstants.DEFAULT_QUERY_NAME,
        permissions: string[] = [],
    ) {
        let body = {
            criteria: criterias,
            facets: facettes,
        };
        return this.searchWithBody(
            body,
            request,
            contentType,
            repository,
            metadataset,
            propertyFilter,
            query,
        );
    }

    searchFingerprint(
        nodeid: string,
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        let q = this.connector.createUrlNoEscape(
            'search/:version/queries/:repository/fingerprint/:nodeid/?:request',
            repository,
            [
                [':nodeid', encodeURIComponent(nodeid)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.post<NodeList>(q, null, this.connector.getRequestOptions());
    }

    searchContributors(
        searchWord: string,
        contributorKind: 'PERSON' | 'ORGANIZATION',
        fields: string[] = [],
        contributorProperties: string[] = [],
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<VCardResult[]> {
        let q = this.connector.createUrlNoEscape(
            'search/:version/queries/:repository/contributor?searchWord=:searchWord&contributorKind=:contributorKind&:fields&:contributorProperties',
            repository,
            [
                [':searchWord', encodeURIComponent(searchWord)],
                [':contributorKind', encodeURIComponent(contributorKind)],
                [':fields', RestHelper.getQueryString('fields', fields)],
                [
                    ':contributorProperties',
                    RestHelper.getQueryString('contributorProperties', fields),
                ],
            ],
        );
        return this.connector.get<any>(q, this.connector.getRequestOptions()).pipe(
            map((result) =>
                result.map((r: any) => {
                    r.vcard = new VCard(r.vcard);
                    return r;
                }),
            ),
        );
    }

    getRelevant(request: any = null, repository = RestConstants.HOME_REPOSITORY) {
        let q = this.connector.createUrlNoEscape(
            'search/:version/relevant/:repository/?:request',
            repository,
            [[':request', this.connector.createRequestString(request)]],
        );
        return this.connector.get<NodeList>(q, this.connector.getRequestOptions());
    }
}
