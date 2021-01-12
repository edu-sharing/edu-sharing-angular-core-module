import { Injectable } from '@angular/core';
import { Node } from '../data-object';

/**
 * Service to store any data temporary (lost after reloading page).
 *
 * Note that all components share the same data source. So uses prefixes for your name if
 * applicable!
 */
@Injectable()
export class TemporaryStorageService {
    static APPLY_TO_LMS_PARAMETER_NODE = 'apply_to_lms_node';
    static COLLECTION_ADD_NODES = 'collection_add_nodes';
    static WORKSPACE_LAST_LOCATION = 'WORKSPACE_LAST_LOCATION';
    static USER_INFO = 'USER_INFO';
    static SESSION_INFO = 'SESSION_INFO';
    // default: false
    static OPTION_HIDE_MAINNAV: 'option_hide_mainnav';
    // default: false
    static OPTION_DISABLE_SCROLL_LAYOUT: 'option_disable_scroll_layout';
    static CUSTOM_NODE_LIST_COMPONENT = 'custom_node_list_component';

    private data: any = {};

    constructor() {}

    get(name: string, defaultValue: any = null) {
        if (this.data[name] != null) {
            return this.data[name];
        }
        return defaultValue;
    }

    set(name: string, value: any) {
        this.data[name] = value;
    }

    /**
     * Same as get, but will remove the value after fetching it.
     */
    pop(name: string, defaultValue: any = null): any {
        const value = this.get(name, defaultValue);
        this.remove(name);
        return value;
    }

    remove(name: string) {
        this.data[name] = null;
    }
}

export interface ClipboardObject {
    nodes: Node[];
    sourceNode: Node;
    copy: boolean;
}
