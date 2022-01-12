
/**
 * All Object types returned by the rest service
 */

import {ListItem} from "../ui/list-item";
import {VCard} from '../ui/VCard';

export enum STREAM_STATUS {
  OPEN = "OPEN",
  READ = "READ",
  PROGRESS = "PROGRESS",
  DONE = "DONE"
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
export interface CollectionFeedback {
  createdAt: Date;
  creator: string;
  feedback: any;
}
export interface Parent {
  repo: string;
  id: string;
  archived: boolean;
}
export interface NodeTextContent{
  text:string;
  html:string;
  raw:string;
}
export interface ServerUpdate {
  id:string;
  description:string;
  executedAt:number;
}
export interface CacheInfo{
  size:number;
  statisticHits:number;
}

export interface WorkflowDefinition{
  id:string;
  color:string;
  hasReceiver:boolean;
  next:string[];
}
export class WorkflowEntry {
  time: number;
  editor: string;
  receiver: UserSimple[];
  status: string;
  comment: string;
}

export class Repository {
  id: string;
  title: string;
  icon:string;
  logo:string;
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
  file:string;
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
export interface Preview {
  data?: Blob; // image, may null, see @this.nodeHelper.appendImageData
  mimetype? : string;
  url: string;
  isGenerated: boolean;
  type: PreviewType;
  isIcon: boolean;
  width: number;
  height: number;
}

export interface License {
  icon: string;
  url: string;
}

export class Node {
  ref: NodeRef;
  parent: Parent;
  type: string;
  aspects: string[];
  name: string;
  title: string;
  createdAt: Date;
  createdBy: Person;
  modifiedAt: Date;
  modifiedBy: Person;
  access: string[];
  repositoryType: string;
  content: NodeContent;
  downloadUrl: string;
  properties: any;
  mediatype: string;
  mimetype: string;
  iconURL: string;
  license: License;
  size: number;
  commentCount: number;
  preview: Preview;
  owner: Person;
  metadataset: string;
  isDirectory: boolean;
  version : string;
  collection : Collection;
  rating: NodeRating;
  virtual: boolean; // flag if this node is manually added later and didn't came from the repo
  public constructor(id:string=null){
    this.ref=new NodeRef(id);
  }
}
export interface NodeContent {
  version: string;
  url: string;
  hash: string;

}

export interface NodeRatingDetail{
  sum:number;
  count:number;
  rating:number;
}
export interface NodeRating{
  overall: NodeRatingDetail;
  user: number;
  affiliation: any|NodeRatingDetail;
}
export class SortItem extends ListItem{
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
export interface SharingInfo{
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
  facettes: Facette[];
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

export type ConfigFilePrefix =  'NODE' | 'NODE_APPLICATION' | 'CLUSTER' | 'DEFAULTS' |
    'DEFAULTS_METADATASETS' | 'DEFAULTS_MAULTEMPLATES';
export interface Group {
  authorityName: string;
  authorityType: string;
  groupName: string;
  groupType: string;
  profile: GroupProfile;
  organizations: Organization[];
  administrationAccess: boolean;
  signupMethod:string;
}

export interface IamGroups {
  groups: Group[];
  pagination: Pagination;
}
export interface OrganizationOrganizations {
  canCreate: boolean;
  organizations: Group[];
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
  profile:Profile;
}

export interface IamAuthorities {
  authorities: AuthorityProfile[];
  pagination: Pagination;
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  primaryAffiliation: string;
  avatar: string;
  about: string;
  skills: string[];
  types: string[];
  vcard: VCard;
}
export interface UserStatus {
  status: string;
  date: Date;
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
export interface NodeRef {
  repo: string;
  id: string;
  archived: boolean;
}

export interface User extends UserSimple {
  organizations: Organization[];
  properties: any;
  homeFolder: NodeRef;
  sharedFolders: NodeRef[];
  quota: UserQuota;
  profile: UserProfile;
}
export interface UserSimple {
  authorityName: string;
  authorityType: string;
  userName: string;
  status: UserStatus;
  profile: UserProfile;
  organizations: Organization[];
}
export interface UserQuota {
    enabled:boolean;
    sizeCurrent:number;
    sizeQuota:number;
}
export interface IamUser {
  person : User;
  editProfile : boolean;
}
export interface IamPreferences {
  preferences : string;
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

export class Collection{
  level0: boolean;
  description: string;
  type: string;
  viewtype: string;
  x: number;
  y: number;
  z: number;
  color: string;
  childCollectionsCount: number;
  childReferencesCount: number;
  preview: Preview;
  scope : string;
  pinned : boolean;
  orderMode: string;
  authorFreetext: string;
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

export interface MdsInfo{
  id: string;
  name: string;
}
export interface MdsMetadatasets{
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
  id:string;
  views:string[];
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
  columns:SortColumn[];
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

export interface  MdsValuesParameters {
    query : string;
    property : string;
    pattern : string;
}
export interface MdsValues{
  valueParameters:MdsValuesParameters;
  criterias : any;
}

export interface Parent {
  repo: string;
  id: string;
  archived: boolean;
}


export interface Person {
  firstName: string;
  lastName: string;
  mailbox: string;
  avatar: string;
}

export interface Access {
  permission: string;
  hasRight: boolean;
}

export interface Property {
  name: string;
  values: string[];
}

export interface Preview {
  url: string;
  width: number;
  height: number;
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
  node : Node;
}
export interface NodeTemplate extends NodeWrapper{
  enabled : boolean;
}
export interface NodeRemoteWrapper extends NodeWrapper{
  remote : Node;
}
export interface AbstractList<T extends Node> {
    nodes: T[];
    pagination: Pagination;
    facettes?: Facette[];
}
export interface NodeList extends AbstractList<Node> {
  nodes: Node[];
  pagination: Pagination;
  facettes?: Facette[];
}
export interface NodeListElastic extends NodeList{
    elasticResponse: string;
}
export interface SearchList extends NodeList {
  ignored : string[];
}
export interface ParentList extends NodeList{
  scope?: 'MY_FILES' | 'SHARED_FILES' | 'COLLECTION';
}
export interface NodeProperties{
  name:string;
  values:string[];
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
  editable:boolean;
}
export interface ToolPermission{
    effective:string;
    effectiveSource:Group[];
    explicit:string;
}
export class LocalPermissions {
  inherited: boolean;
  permissions: Permission[];
}
export class LocalPermissionsResult {
  inherited: boolean;
  permissions: Permission[];
}
export interface  OAuthResult{

  // set by server
  access_token:string;
  refresh_token:string;
  expires_in:number;

  // for local use
  expires_ts?:number;
}
export interface RegisterExists{
    exists:boolean;
}
export interface RegisterInformation{
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
export interface RenderDetails{
  snippet : string;
  node : Node;
}

export interface Properties {
}



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
export interface LoginResult{
  isAdmin: boolean;
  statusCode: string;
  isValidLogin : boolean;
  currentScope : string;
  authorityName : string;
  sessionTimeout : number;
  isGuest : boolean;
  toolPermissions : string[];
  remoteAuthentications : any;
}
export interface AccessScope{
  hasAccess : boolean;
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
export interface UsageXmlParams{
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
export interface CollectionUsage extends Usage{
    collection: Node;
}
export interface Filetype {
  mimetype: string;
  filetype: string;
  ccressourceversion: string,
  ccressourcetype: string;
  ccresourcesubtype: string,
  editorType: string,
  creatable: boolean;
  editable: boolean;
}
export interface NodeLock{
  isLocked: boolean;
}
export class Connector {
  id: string;
  icon: string;
  showNew: boolean;
  onlyDesktop: boolean;
  hasViewMode: boolean;
  parameters: string[];
  filetypes: Filetype[];
}
export class ConnectorList{
  url: string;
  connectors:Connector[];
}

/*
 *  Collections Stuff
 */

export enum GETCOLLECTIONS_SCOPE {
  UNKOWN,
  MY,
  GROUPS,
  ALL
}

export enum NodesRightMode {
  Local,
  Original,
  Both
}


export class Reference {

  repo:string;
  id:string;

  constructor(repo:string="-home-",id:string="-root-") {
    this.id = id;
    this.repo = repo;
  };

}

export class Property {
    name:string;
    values:string[];
}

export class Preview {
  url:string;
  width:number;
  height:number;
}

export class Person {
  firstName:string;
  lastName:string;
  mailbox:string;
}

export class CollectionReference extends Node{
  originalId:string;
  accessOriginal: string[];
}

export class NodeRef {
  repo:string;
  id:string;
  archived:boolean;
  isHomeRepo:boolean;
  public constructor(id:string=null){
    this.id=id;
  }
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

  localPermissions:LocalPermissions;
  inheritedPermissions:Array<Permission>;

  // checks permission if its open to see for everybody
  isSimplePermissionPublic():boolean {

    var result:boolean = false;

    // check inherited permissions (if active)
    if ((this.inheritedPermissions!=null) && (this.localPermissions.inherited)) {
      this.inheritedPermissions.forEach( permission => {
        if (permission.authority.authorityType == "EVERYONE") result=true;
      });
    }

    // check local permissions
    if ((this.localPermissions!=null) && (this.localPermissions.permissions!=null)) {
      this.localPermissions.permissions.forEach( permission => {
        if (permission.authority.authorityType == "EVERYONE") result=true;
      });
    }

    return result;
  }

  // checks permission if its open to see by organizations
  isSimplePermissionOrganization():boolean {

    var result:boolean = false;

    // check inherited permissions (if active)
    if ((this.inheritedPermissions!=null) && (this.localPermissions.inherited)) {
      this.inheritedPermissions.forEach( permission => {
        if (permission.authority.authorityName.startsWith("GROUP_")) result=true;
      });
    }

    // check local permissions
    if ((this.localPermissions!=null) && (this.localPermissions.permissions!=null)) {
      this.localPermissions.permissions.forEach( permission => {
        if (permission.authority.authorityName.startsWith("GROUP_")) result=true;
      } );
    }

    return result;
  }

}

export class InheritedPermissions {
  authority:Authority;
  permission:string;
}

export class Authority {
  authorityName:string;
  authorityType:string;
}

export class AccessPermission {
  permission:string;  // 'Write' ord 'Delete'
  hasRight:boolean;   // signaling if the user has the right above
}

export interface Organization extends Group {
  sharedFolder:Reference;
}
export interface GroupSignupDetails {
  signupMethod:string;
  signupPassword:string;
}

export class Organizations {
  organizations:Array<Organization>;
}

export class Profile {
  displayName:string;
  groupType:string;
  scopeType:string;
}

export class PersonalProfile {
  authorityName:string;
  authorityType:string;
  userName:string;
  profile:Person;
  homeFolder:Reference;
  sharedFolders:Array<Reference>;
}
export interface SearchRequestCriteria {
    property: string;
    values: string[];
}
export interface SearchRequestBody {
    facettes?: string[];
    criterias: SearchRequestCriteria[];
    permissions?: string[];
}
export interface WebsiteInformation{
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
}export interface About{
    themesUrl: string;
    version: Version;
    services: any;
}

export class Statistics {
  counts: any;
  fields: any;
  groups: any;
  authority: StatisticsAuthority;
  date: string;
}
export class StatisticsAuthority{
  hash: string;
  organization: Organization[];
  mediacenter: Group[];
}
export class NodeStatistics extends Statistics{
  node: Node;
}
export enum DeleteMode{
  none='none',
  assign='assign',
  delete='delete',
}
export enum EventType {
  VIEW_MATERIAL_PLAY_MEDIA = 'VIEW_MATERIAL_PLAY_MEDIA'
}

/**
 * Object for Profile settings
 */
export class ProfileSettings {
  showEmail:boolean;
}

export interface JobFieldDescription {
  name: string;
  type?: string;
  file: boolean;
  description?: string;
  sampleValue?: string;
  values?: JobFieldDescription[];
}

export interface JobDescription {
  name: string;
  description: string;
  params: JobFieldDescription[];
}
export class VCardResult {
  property: string;
  vcard: VCard;
}
export type CollectionProposalStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export class ProposalNode extends Node {
    proposal: Node;
    status: CollectionProposalStatus;
    // collection this proposal is for
    proposalCollection?: Node;
    accessible: boolean;
}
