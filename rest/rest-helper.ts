/**
 * Different helper functions, may be used globally
 */

import { RestConstants } from './rest-constants';
import {
    Authority,
    CollectionReference,
    LocalPermissions,
    Node,
    NodePermissions,
    Permission,
    Permissions,
    User,
} from './data-object';
import { Router } from '@angular/router';
import { RestConnectorService } from './services/rest-connector.service';
import { ConfigurationService } from './services/configuration.service';
import { UIConstants, RestHelper as RestHelperBase } from 'ngx-edu-sharing-ui';
import { Helper } from './helper';
import { Observable } from 'rxjs';
import { UniversalNode } from './definitions';
import { Ace, Acl, NodeTools } from 'ngx-edu-sharing-api';

export class RestHelper extends RestHelperBase {
    public static getNodeIds(nodes: Node[] | CollectionReference[]): Array<string> {
        let data = new Array<string>(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            data[i] = nodes[i].ref.id;
        }
        return data;
    }
    static copyPermissions(permissionsIn: Ace[], inherited = true) {
        return {
            inherited: inherited,
            permissions: Helper.deepCopy(permissionsIn),
        } as Acl;
    }

    static addCoordinatorPermission(nodePermissions: Acl, authority: Authority) {
        const permission: Ace = {
            authority: {
                authorityName: authority.authorityName,
                authorityType: (authority.authorityType ||
                    RestConstants.AUTHORITY_TYPE_USER) as any,
            },
            permissions: [RestConstants.PERMISSION_COORDINATOR],
        };
        nodePermissions.permissions.push(permission);
        return RestHelper.copyAndCleanPermissions(
            nodePermissions.permissions,
            nodePermissions.inherited,
        );
    }
    static copyAndCleanPermissions(permissionsIn: Ace[], inherited = true) {
        let permissions: Acl = {
            inherited,
            permissions: [],
        };
        permissions.inherited = inherited;
        permissions.permissions = [];
        for (let perm of permissionsIn) {
            permissions.permissions.push({
                from: perm.from,
                to: perm.to,
                authority: perm.authority,
                permissions: perm.permissions,
            });
        }
        return permissions;
    }

    /**
     * Guess the mimetype for a HTML-File object
     * @param file
     * @returns {string}
     */
    public static guessMimeType(file: File): string {
        let type = file.type;
        if (type == 'application/x-zip-compressed') type = 'application/zip';
        return type;
    }

    /**
     * checks a rest error message and returns true if the string was found in the error or message text
     * @param error
     * @param needle
     */
    public static errorMatchesAny(error: any, needle: string) {
        try {
            let json = JSON.parse(error.response);
            return json.error.indexOf(needle) != -1 || json.message.indexOf(needle) != -1;
        } catch (e) {}
        return false;
    }
    public static errorMessageContains(error: any, needle: string) {
        try {
            return error.error.message.indexOf(needle) != -1;
        } catch (e) {}
        return false;
    }
    public static stringToNodes(data: string[]): Node[] {
        let nodes = new Array<Node>(data.length);
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].ref.id = data[i];
        }
        return nodes;
    }
    public static getQueryString(queryName: string, values: any[]): string {
        let query = '';
        for (var i = 0; i < values.length; i++) {
            if (i) query += '&';
            query += queryName + '=' + encodeURIComponent(values[i]);
        }
        return query;
    }

    public static getQueryStringForList(queryName: string, nodes: Node[] | string[]): string {
        if (nodes == null || !nodes?.length) return '';
        if (nodes instanceof String) {
            return nodes.toString();
        }

        // TODO both types
        let list: string[];
        if (typeof nodes[0] == 'string') {
            list = <string[]>nodes;
        } else {
            list = RestHelper.getNodeIds(<Node[]>nodes);
        }

        return this.getQueryString(queryName, list);
    }

    public static createNameProperty(name: string): any {
        let property: any = {};
        property[RestConstants.CM_NAME] = [name];
        //property[RestConstants.CCM_FILENAME]=[name];
        return property;
    }

    // checks permission if its open to see for everybody
    public static isSimplePermissionPublic(permissionObj: Permissions): boolean {
        var result: boolean = false;

        /* --> deactivated due to bug DESREPO-579
        // check inherited permissions (if active)
        if ((permissionObj.inheritedPermissions!=null) && (permissionObj.localPermissions.inherited)) {
            permissionObj.inheritedPermissions.forEach( permission => {
                if (permission.authority.authorityType == "EVERYONE") result=true;
            });
        }
        */

        // check local permissions
        if (
            permissionObj.localPermissions != null &&
            permissionObj.localPermissions.permissions != null
        ) {
            permissionObj.localPermissions.permissions.forEach((permission) => {
                if (permission.authority.authorityType == 'EVERYONE') result = true;
            });
        }

        return result;
    }

    // checks permission if its open to see by organizations
    public static isSimplePermissionOrganization(permissionObj: Permissions): boolean {
        var result: boolean = false;

        /* --> deactivated due to bug DESREPO-579
        // check inherited permissions (if active)
        if ((permissionObj.inheritedPermissions!=null) && (permissionObj.localPermissions.inherited)) {
            permissionObj.inheritedPermissions.forEach( permission => {
                if (permission.authority.authorityName.startsWith(RestConstants.GROUP_PREFIX)) result=true;
            });
        }
        */

        // check local permissions
        if (
            permissionObj.localPermissions != null &&
            permissionObj.localPermissions.permissions != null
        ) {
            permissionObj.localPermissions.permissions.forEach((permission) => {
                if (permission.authority.authorityName.startsWith(RestConstants.GROUP_PREFIX))
                    result = true;
            });
        }

        return result;
    }

    public static isUserAllowedToEdit(collection: Node, person: User = null): boolean {
        // check access permissions on collection
        if (RestHelper.hasAccessPermission(collection, 'Write')) return true;

        // if nothing else matched - default to no right to edit
        return false;
    }

    public static hasAccessPermission(node: Node, permission: string): boolean {
        return node.access && node.access.indexOf(permission) != -1;
    }

    public static isContentItem(node: Node): boolean {
        return (
            node.type != null &&
            (node.type == 'ccm:io' || node.type == '{http://www.campuscontent.de/model/1.0}io')
        );
    }

    public static isFolder(node: Node): boolean {
        return (
            node.type != null &&
            (node.type == 'ccm:map' || node.type == '{http://www.campuscontent.de/model/1.0}map')
        );
    }
    public static getCreatorName(node: Node): string {
        let result: string = '';
        if (node.createdBy != null) {
            if (node.createdBy.firstName != null) result = node.createdBy.firstName;
            if (node.createdBy.lastName != null) result += ' ' + node.createdBy.lastName;
        }
        return result.trim();
    }
    public static getPreviewUrl(node: Node): string {
        if (node.preview != null && node.preview.url != null && node.preview.url.length > 0) {
            return node.preview.url;
        }
        return null;
    }

    public static gotProperty(node: Node, name: string): boolean {
        if (node.properties == null) return false;
        return node.properties.hasOwnProperty(name);
    }

    public static getProperty(node: Node, name: string): string[] {
        if (node.properties == null) return null;
        if (!RestHelper.gotProperty(node, name)) return null;
        return node.properties[name];
    }

    /**
     * @DEPRECATED use NodeTools from edu-sharing-api!
     */
    static createSpacesStoreRef(node: Node) {
        return NodeTools.createSpacesStoreRef(node.ref.id);
    }
    /**
     * @DEPRECATED use NodeTools from edu-sharing-api!
     */
    static removeSpacesStoreRef(id: string) {
        return NodeTools.removeSpacesStoreRef(id);
    }

    static getAllAuthoritiesPermission() {
        return {
            authority: {
                authorityName: RestConstants.AUTHORITY_EVERYONE,
                authorityType: RestConstants.AUTHORITY_TYPE_EVERYONE as 'EVERYONE',
            },
            permissions: [],
        } as Ace;
    }

    public static goToLogin(
        router: Router,
        config: ConfigurationService,
        scope: string = null,
        next = window.location.href,
    ) {
        config.get('loginUrl').subscribe((url: string) => {
            if (url && !scope && !config.instant('loginAllowLocal', false)) {
                window.location.href = url;
                return;
            }
            router.navigate([UIConstants.ROUTER_PREFIX + 'login'], {
                queryParams: {
                    scope: scope,
                    next: next,
                },
            });
        });
    }

    static guessMediatypeForFile(file: File) {
        if (file.type.startsWith('image')) return 'file-image';
        if (file.type.startsWith('video')) return 'file-video';
        if (file.type.startsWith('audio')) return 'file-audio';
        if (file.type == 'text/xml') return 'file-xml';
        if (file.type == 'text/plain') return 'file-txt';
        if (file.type == 'application/zip' || file.type == 'application/x-zip-compressed')
            return 'file-zip';
        return 'file';
    }
    static guessMediatypeIconForFile(connector: RestConnectorService, file: File) {
        return connector.getThemeMimeIconSvg(this.guessMediatypeForFile(file) + '.svg');
    }

    static getRestObjectPositionInArray(search: any, haystack: any[]) {
        let i = 0;
        for (let node of haystack) {
            if (node.ref && search.ref) {
                if (node.ref.id === search.ref.id) return i;
            } else if (node.authorityName) {
                if (node.authorityName === search.authorityName) return i;
            }
            i++;
        }
        return haystack.indexOf(search);
    }

    /**
     * calls the given method and checks the result via the evaluator until the evaluator returns true
     * Then, calls onResultReady
     * This method might be useful if the result relies on async data stored in the solr index
     * Interval specifies the time to wait between the calls
     * @param call
     * @param evaluator
     * @param onResultReady
     * @param interval
     */
    static waitForResult<T>(
        call: () => Observable<T>,
        evaluator: (result: T) => boolean,
        onResultReady: () => void,
        interval = 5000,
    ) {
        call().subscribe(
            (data) => {
                if (evaluator(data)) {
                    onResultReady();
                } else {
                    setTimeout(
                        () => this.waitForResult(call, evaluator, onResultReady, interval),
                        interval,
                    );
                }
            },
            (error) => {
                setTimeout(
                    () => this.waitForResult(call, evaluator, onResultReady, interval),
                    interval,
                );
            },
        );
    }
}
export interface UrlReplace {
    search: string;
    replace: string;
}
