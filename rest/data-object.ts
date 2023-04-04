/**
 * All Object types returned by the rest service
 *
 * Objects from this module should be replaced by their corresponding types of `ngx-edu-sharing-api`
 * once API calls are migrated.
 */

import {
    LoginInfo,
    Node as NodeModel,
    NodeRef,
    Organization,
    Person,
    UserProfile as ApiUserProfile,
    UserQuota,
    UserStatus,
} from 'ngx-edu-sharing-api';
import { ListItem, VCard } from 'ngx-edu-sharing-ui';

export { Connector, ConnectorList } from 'ngx-edu-sharing-api';
export { Organization, NodeRef, UserQuota, Person };

export type Collection = NodeModel['collection'];
export type Preview = NodeModel['preview'];

export enum STREAM_STATUS {
    OPEN = 'OPEN',
    READ = 'READ',
    PROGRESS = 'PROGRESS',
    DONE = 'DONE',
}

export interface RestoreResult {
    archiveNodeId: string;
    nodeId: string;
    parent: string;
    path: string;
    name: string;
    restoreStatus: string;
}

export class ArchiveRestore {
    public results: RestoreResult[];
}
export interface Comments {
    comments: Comment[];
}
export interface Comment {
    ref: Ref;
    creator: UserSimple;
    created: number;
    comment: string;
}
export interface Mediacenter extends Group {
    profile: MediacenterProfile;
}
export interface MediacenterProfile extends GroupProfile {
    mediacenter: MediacenterGroupExtension;
}
export interface MediacenterGroupExtension {
    id: string;
    location: string;
    districtAbbreviation: string;
    mainUrl: string;
    catalogs: MediacenterCatalog[];
    contentStatus: string;
}
export interface MediacenterCatalog {
    name: string;
    url: string;
}
export interface Parent {
    repo: string;
    id: string;
    archived: boolean;
}
export interface NodeTextContent {
    text: string;
    html: string;
    raw: string;
}
export interface ServerUpdate {
    id: string;
    description: string;
    executedAt: number;
}
export interface CacheInfo {
    size: number;
    statisticHits: number;
}

export class WorkflowEntry {
    time?: number;
    editor?: UserSimple;
    receiver: UserSimple[];
    status: string;
    comment: string;
}

export class Repository {
    id: string;
    title: string;
    icon: string;
    logo: string;
    isHomeRepo: boolean;
    repositoryType: string;
    renderingSupported: boolean;
}

export interface NetworkRepositories {
    repositories: Repository[];
}

export interface Access {
    permission: string;
    hasRight: boolean;
}
export interface Application {
    id: string;
    title: string;
    webserverUrl: string;
    clientBaseUrl: string;
    configUrl: string;
    contentUrl: string;
    type: string;
    subtype: string;
    repositoryType: string;
    file: string;
    xml: string;
}

export interface Service {
    active: boolean;
    id: string;
    name: string;
    url: string;
    logo: string;
    interfaces: any[];
    statisticsInterface: string;
}
export type PreviewType = 'TYPE_EXTERNAL' | 'TYPE_USERDEFINED' | 'TYPE_GENERATED' | 'TYPE_DEFAULT';

export type License = NodeModel['license'];

export class Node implements NodeModel {
    access: string[];
    aspects?: string[];
    collection: Collection;
    commentCount?: number;
    content?: NodeContent;
    createdAt: string;
    createdBy: Person;
    downloadUrl: string;
    iconURL?: string;
    isDirectory?: boolean;
    license?: License;
    mediatype?: string;
    metadataset?: string;
    mimetype?: string;
    modifiedAt?: string;
    modifiedBy?: Person;
    name: string;
    owner: Person;
    parent?: Parent;
    preview?: Preview;
    properties?: any;
    rating?: NodeRating;
    ref: NodeRef;
    relations?: { [key in 'Original']?: NodeModel };
    repositoryType?: string;
    size?: string;
    title?: string;
    type?: string;
    usedInCollections?: NodeModel[];
    version?: string;
    virtual?: boolean; // flag if this node is manually added later and didn't came from the repo
    public constructor(id: string = null) {
        this.ref = { id } as NodeRef;
    }
}

export interface DeepLinkResponse {
    jwtDeepLinkResponse: string;
    ltiDeepLinkReturnUrl: string;
}

export type NodeContent = NodeModel['content'];

export interface NodeRatingDetail {
    sum: number;
    count: number;
    rating: number;
}
export type NodeRating = NodeModel['rating'];
export class SortItem extends ListItem {
    mode: string;
}
export interface NodePermissionsHistory {
    date: number;
    permissions: LocalPermissions;
    user: User;
    action: string;
}
export interface Pagination {
    total: number;
    from: number;
    count: number;
}
export interface SharingInfo {
    password: boolean;
    expired: boolean;
    passwordMatches: boolean;
    invitedBy: Person;
    node: Node;
}
export interface NodeShare {
    token: string;
    email: string;
    expiryDate: number;
    password: boolean;
    invitedAt: number;
    downloadCount: number;
    url: string;
    shareId: string;
}
export interface Value {
    value: string;
    count: number;
}

export interface Facette {
    property: string;
    values: Value[];
}

export interface ArchiveSearch {
    nodes: Node[];
    pagination: Pagination;
    facets: Facette[];
}

export interface RestError {
    error: string;
    message: string;
    stacktraceString: string;
    stacktraceArray: string[];
}

export interface GroupProfile {
    displayName: string;
    groupEmail: string;
    groupType: string;
    scopeType: string;
}
export type GroupSignupResult = 'InvalidPassword' | 'AlreadyInList' | 'AlreadyMember' | 'Ok';

export type ConfigFilePrefix =
    | 'NODE'
    | 'NODE_APPLICATION'
    | 'CLUSTER'
    | 'DEFAULTS'
    | 'DEFAULTS_METADATASETS'
    | 'DEFAULTS_MAULTEMPLATES';
export interface Group {
    authorityName: string;
    authorityType: string;
    groupName: string;
    groupType: string;
    profile: GroupProfile;
    properties: { [key in string]: string[] };
    organizations: Organization[];
    administrationAccess: boolean;
    signupMethod: string;
}

export interface IamGroups {
    groups: Group[];
    pagination: Pagination;
}
export interface OrganizationOrganizations {
    canCreate: boolean;
    organizations: Organization[];
    pagination: Pagination;
}
export interface IamGroup {
    group: Group;
}
export interface Authority {
    authorityName: string;
    authorityType: string;
}
export interface AuthorityProfile {
    authorityName: string;
    authorityType: string;
    profile: Profile;
}

export interface IamAuthorities {
    authorities: AuthorityProfile[];
    pagination: Pagination;
}

export interface UserProfile extends Omit<ApiUserProfile, 'vcard'> {
    vcard: VCard;
}
export interface UserStats {
    nodeCount: number;
    nodeCountCC: number;
    collectionCount: number;
}
export interface UserCredentials {
    oldPassword: string;
    newPassword: string;
}

export interface User extends UserSimple {
    properties?: any;
    homeFolder?: NodeRef;
    sharedFolders?: NodeRef[];
    quota?: UserQuota;
    profile: UserProfile;
}
export interface UserSimple {
    authorityName: string;
    authorityType?: string;
    userName?: string;
    status?: UserStatus;
    profile: UserProfile;
    organizations?: Organization[];
}
export interface IamUser {
    person: User;
    editProfile?: boolean;
}
export interface IamPreferences {
    preferences: string;
}

export interface IamUsers {
    users: User[];
    pagination: Pagination;
}

export interface Access {
    permission: string;
    hasRight: boolean;
}

export interface Profile {
    firstName: string;
    lastName: string;
    email: string;
}

export interface HomeFolder {
    repo: string;
    id: string;
    archived: boolean;
}

export interface SharedFolder {
    repo: string;
    id: string;
    archived: boolean;
}

export interface Owner {
    authorityName: string;
    authorityType: string;
    userName: string;
    profile: Profile;
    homeFolder: HomeFolder;
    sharedFolders: SharedFolder[];
}

export interface CollectionWrapper {
    collection: Node;
}

export interface Access {
    permission: string;
    hasRight: boolean;
}

export interface Profile {
    firstName: string;
    lastName: string;
    email: string;
}

export interface HomeFolder {
    repo: string;
    id: string;
    archived: boolean;
}

export interface SharedFolder {
    repo: string;
    id: string;
    archived: boolean;
}

export interface Owner {
    authorityName: string;
    authorityType: string;
    userName: string;
    profile: Profile;
    homeFolder: HomeFolder;
    sharedFolders: SharedFolder[];
}

export interface CollectionData {
    title: string;
    description: string;
    type: string;

    color: string;
}
export interface MetadataRef {
    repo: string;
    id: string;
}

export interface Metadataset {
    ref: MetadataRef;
    isDefaultMds: boolean;
}

export interface MdsInfo {
    id: string;
    name: string;
}
export interface MdsMetadatasets {
    metadatasets: MdsInfo[];
}

export interface Property {
    name: string;
    type: string;
    defaultValue: string;
    processtype: string;
    keyContenturl: string;
    concatewithtype: boolean;
    multiple: boolean;
    copyFrom: string;
}

export interface Type {
    type: string;
    properties: Property[];
}

export interface Ref {
    repo: string;
    id: string;
}

export interface Parameter {
    name: string;
    value: string;
}

export interface Value {
    key: string;
    value: string;
}

export interface Property2 {
    name: string;
    label: string;
    labelHint: string;
    formHeight: string;
    formLength: string;
    widget: string;
    widgetTitle: string;
    copyFrom: string[];
    validators: string[];
    parameters: Parameter[];
    values: Value[];
    defaultValues: string[];
    multiple: boolean;
    placeHolder: string;
    styleName: string;
    styleNameLabel: string;
    type: string;
}

export interface Panel {
    name: string;
    styleName: string;
    label: string;
    layout: string;
    onCreate: boolean;
    onUpdate: boolean;
    multiUpload: boolean;
    order: string;
    properties: Property2[];
}

export interface Form {
    id: string;
    panels: Panel[];
}

export interface Parameter2 {
    name: string;
    value: string;
}

export interface Value2 {
    key: string;
    value: string;
}

export interface Property3 {
    name: string;
    label: string;
    labelHint: string;
    formHeight: string;
    formLength: string;
    widget: string;
    widgetTitle: string;
    copyFrom: string[];
    parameters: Parameter2[];
    values: Value2[];
    defaultValues: string[];
    multiple: boolean;
    placeHolder: string;
    styleName: string;
    styleNameLabel: string;
    type: string;
}

export interface List {
    id: string;
    label: string;
    properties: Property3[];
    columns: any[];
}

export interface Parameter3 {
    name: string;
    value: string;
}

export interface Value3 {
    key: string;
    value: string;
}

export interface Property4 {
    name: string;
    label: string;
    labelHint: string;
    formHeight: string;
    formLength: string;
    widget: string;
    widgetTitle: string;
    copyFrom: string[];
    parameters: Parameter3[];
    values: Value3[];
    defaultValues: string[];
    multiple: boolean;
    placeHolder: string;
    styleName: string;
    styleNameLabel: string;
    type: string;
}

export interface View {
    id: string;
    caption: string;
    html: string;
    icon: string;
    rel: string;
    hideIfEmpty: boolean;
}

export interface Parameter4 {
    name: string;
    value: string;
}

export interface Value4 {
    key: string;
    value: string;
}

export interface Property5 {
    name: string;
    label: string;
    labelHint: string;
    formHeight: string;
    formLength: string;
    widget: string;
    widgetTitle: string;
    copyFrom: string[];
    parameters: Parameter4[];
    values: Value4[];
    defaultValues: string[];
    multiple: boolean;
    placeHolder: string;
    styleName: string;
    styleNameLabel: string;
    type: string;
    validators: string[];
    statement: string;
    multipleJoin: string;
    toogle: boolean;
    initByGetParam: string;
}

export interface Query {
    criteriaboxid: string;
    handlerclass: string;
    join: string;
    label: string;
    layout: string;
    properties: Property5[];
    statement: string;
    stylename: string;
    widget: string;
}

export interface Queries {
    baseQuery: string;
    queries: Query[];
}
export interface MdsGroup {
    id: string;
    views: string[];
}
export interface SortColumn {
    id: string;
    mode: string;
}
export interface SortDefault {
    sortBy: string;
    sortAscending: boolean;
}
export interface Sort {
    id: string;
    default: SortDefault;
    columns: SortColumn[];
}
export interface Mds {
    types: Type[];
    ref: Ref;
    forms: Form[];
    groups: MdsGroup[];
    lists: List[];
    views: View[];
    queries: Queries;
    widgets: any;
    sorts: Sort[];
}

export interface MdsMetadataset {
    mds: Mds;
}
export interface MdsValue {
    replacementString: string;
    displayString: string;
    key: string;
}

export interface MdsValueList {
    values: MdsValue[];
}

export interface MdsValuesParameters {
    query: string;
    property: string;
    pattern: string;
}
export interface MdsValues {
    valueParameters: MdsValuesParameters;
    criteria: any;
}

export interface Parent {
    repo: string;
    id: string;
    archived: boolean;
}

export interface Access {
    permission: string;
    hasRight: boolean;
}

export interface Property {
    name: string;
    values: string[];
}

export interface Pagination {
    total: number;
    from: number;
    count: number;
}

export interface Value {
    value: string;
    count: number;
}

export interface Facette {
    property: string;
    values: Value[];
}
export interface NodeWrapper {
    node: Node;
}
export interface NodeTemplate extends NodeWrapper {
    enabled: boolean;
}
export interface NodeRemoteWrapper extends NodeWrapper {
    remote: Node;
}
export interface AbstractList<T extends Node> {
    nodes: T[];
    pagination: Pagination;
    facets?: Facette[];
}
export interface NodeList extends AbstractList<Node> {
    nodes: Node[];
    pagination: Pagination;
    facets?: Facette[];
}
export interface NodeListElastic extends NodeList {
    elasticResponse: string;
}
export interface SearchList extends NodeList {
    ignored: string[];
}
export interface ParentList extends NodeList {
    scope?: 'MY_FILES' | 'SHARED_FILES' | 'COLLECTION' | 'UNKNOWN';
}
export interface NodeProperties {
    name: string;
    values: string[];
}
export interface Authority {
    authorityName: string;
    authorityType: string;
}

export class Permission {
    authority: Authority;
    permissions: string[];
    user: UserProfile;
    group: GroupProfile;
    editable: boolean;
}
export interface ToolPermission {
    effective: string;
    effectiveSource: Group[];
    explicit: string;
}
export class LocalPermissions {
    inherited: boolean;
    permissions: Permission[];
}
export class LocalPermissionsResult {
    inherited: boolean;
    permissions: Permission[];
}
export interface OAuthResult {
    // set by server
    access_token: string;
    refresh_token: string;
    expires_in: number;

    // for local use
    expires_ts?: number;
}
export interface RegisterExists {
    exists: boolean;
}
export interface RegisterInformation {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    allowNotifications: boolean;
}
export interface Permissions {
    localPermissions: LocalPermissionsResult;
    inheritedPermissions: Permission[];
}

export interface NodePermissions {
    permissions: Permissions;
}
export interface NodeVersion {
    repo: string;
    id: string;
}

export interface VersionInfo {
    node: NodeVersion;
    major: number;
    minor: number;
}
export interface Version {
    properties: Properties;
    version: VersionInfo;
    comment: string;
    modifiedAt: Date;
    modifiedBy: ModifiedBy;
    contentUrl: string;
}
export interface NodeVersions {
    versions: Version[];
}
export interface RenderDetails {
    detailsSnippet: string;
    node: Node;
}

export interface Properties {}

export interface ModifiedBy {
    firstName: string;
    lastName: string;
    mailbox: string;
}

export interface Version {
    properties: Properties;
    version: VersionInfo;
    comment: string;
    modifiedAt: Date;
    modifiedBy: ModifiedBy;
    contentUrl: string;
}

export interface NodeVersion {
    version: Version;
}

export type LoginResult = LoginInfo;

export interface AccessScope {
    hasAccess: boolean;
}
export interface Usage {
    fromUsed: Date;
    toUsed: Date;
    usageCounter: number;
    appUser: string;
    appUserMail: string;
    courseId: string;
    distinctPersons: number;
    appId: string;
    appType: string;
    appSubtype: string;
    nodeId: string;
    parentNodeId: string;
    usageVersion: string;
    usageXmlParams: UsageXmlParams;
    resourceId: string;
    guid: string;
}
export interface UsageXmlParams {
    general: UsageXmlParamsGeneral;
}
export interface UsageXmlParamsGeneral {
    referencedInName: string;
    referencedInType: string;
    referencedInInstance: string;
}

export interface UsageList {
    usages: Usage[];
}
export interface CollectionUsage extends Usage {
    collection: Node;
    collectionUsageType: 'ACTIVE' | 'PROPOSAL_PENDING' | 'PROPOSAL_DECLINED';
}
export interface Filetype {
    mimetype: string;
    filetype: string;
    ccressourceversion: string;
    ccressourcetype: string;
    ccresourcesubtype: string;
    editorType: string;
    creatable: boolean;
    editable: boolean;
}
export interface NodeLock {
    isLocked: boolean;
}

/*
 *  Collections Stuff
 */

export enum GETCOLLECTIONS_SCOPE {
    UNKOWN,
    MY,
    GROUPS,
    ALL,
}

export class Reference {
    repo: string;
    id: string;

    constructor(repo: string = '-home-', id: string = '-root-') {
        this.id = id;
        this.repo = repo;
    }
}

export class Property {
    name: string;
    values: string[];
}

export class CollectionReference extends Node {
    originalId: string;
    accessOriginal: string[];
}

export interface CollectionReferences {
    references: Array<CollectionReference>;
    pagination: Pagination;
}
export interface CollectionSubcollections {
    collections: Node[];
    pagination: Pagination;
}

export class Permissions {
    localPermissions: LocalPermissions;
    inheritedPermissions: Array<Permission>;

    // checks permission if its open to see for everybody
    isSimplePermissionPublic(): boolean {
        var result: boolean = false;

        // check inherited permissions (if active)
        if (this.inheritedPermissions != null && this.localPermissions.inherited) {
            this.inheritedPermissions.forEach((permission) => {
                if (permission.authority.authorityType == 'EVERYONE') result = true;
            });
        }

        // check local permissions
        if (this.localPermissions != null && this.localPermissions.permissions != null) {
            this.localPermissions.permissions.forEach((permission) => {
                if (permission.authority.authorityType == 'EVERYONE') result = true;
            });
        }

        return result;
    }

    // checks permission if its open to see by organizations
    isSimplePermissionOrganization(): boolean {
        var result: boolean = false;

        // check inherited permissions (if active)
        if (this.inheritedPermissions != null && this.localPermissions.inherited) {
            this.inheritedPermissions.forEach((permission) => {
                if (permission.authority.authorityName.startsWith('GROUP_')) result = true;
            });
        }

        // check local permissions
        if (this.localPermissions != null && this.localPermissions.permissions != null) {
            this.localPermissions.permissions.forEach((permission) => {
                if (permission.authority.authorityName.startsWith('GROUP_')) result = true;
            });
        }

        return result;
    }
}

export class InheritedPermissions {
    authority: Authority;
    permission: string;
}

export class Authority {
    authorityName: string;
    authorityType: string;
}

export class AccessPermission {
    permission: string; // 'Write' ord 'Delete'
    hasRight: boolean; // signaling if the user has the right above
}

export interface GroupSignupDetails {
    signupMethod: string;
    signupPassword: string;
}

export class Organizations {
    organizations: Array<Organization>;
}

export class Profile {
    displayName: string;
    groupType: string;
    scopeType: string;
}

export class PersonalProfile {
    authorityName: string;
    authorityType: string;
    userName: string;
    profile: Person;
    homeFolder: Reference;
    sharedFolders: Array<Reference>;
}
export interface SearchRequestCriteria {
    property: string;
    values: string[];
}
export interface SearchRequestBody {
    facets?: string[];
    criteria: SearchRequestCriteria[];
    resolveCollections?: boolean;
    permissions?: string[];
}
export interface WebsiteInformation {
    title: string;
    page: string;
    description: string;
    license: string;
    keywords: string[];
}
export interface Version {
    repository: string;
    renderservice: string;
    major: number;
    minor: number;
}
export interface About {
    themesUrl: string;
    version: Version;
    services: any;
}

export interface Licenses {
    repository: { [key in string]: string };
    services: { [key in string]: { [key in string]: string } };
}

export class Statistics {
    counts: any;
    fields: any;
    groups: any;
    authority: StatisticsAuthority;
    date: string;
}
export class StatisticsAuthority {
    hash: string;
    organization: Organization[];
    mediacenter: Group[];
}
export class NodeStatistics extends Statistics {
    node: Node;
}
export enum DeleteMode {
    none = 'none',
    assign = 'assign',
    delete = 'delete',
}
export enum EventType {
    VIEW_MATERIAL_PLAY_MEDIA = 'VIEW_MATERIAL_PLAY_MEDIA',
}

/**
 * Object for Profile settings
 */
export class ProfileSettings {
    showEmail: boolean;
}

export interface JobFieldDescription {
    name: string;
    type?: string;
    file: boolean;
    array: boolean;
    description?: string;
    sampleValue?: string;
    values?: JobFieldDescription[];
}
export type JobTag = 'DeletePersonJob';

export interface PluginStatus {
    name: string;
    version: string;
    enabled: boolean;
}
export interface JobDescription {
    name: string;
    description: string;
    tags: JobTag[];
    params: JobFieldDescription[];
}
export class VCardResult {
    property: string;
    vcard: VCard;
}
export class LTIRegistrationToken {
    token: string;
    url: string;
    tsCreated: number;
    tsExpiry: number;
    registeredAppId: string;
    valid: boolean;
}
export class LTIRegistrationTokens {
    registrationLinks: LTIRegistrationToken[];
}
