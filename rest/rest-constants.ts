import { RestConstants as RestConstantsBase } from 'ngx-edu-sharing-api';
import { ListItemSort } from 'ngx-edu-sharing-ui';

export class RestConstants extends RestConstantsBase {
    public static DOCUMENT_EDITOR_URL = 'http://appserver9.metaventis.com/eduConDev/';
    public static HOME_REPOSITORY = '-home-';
    public static ME = '-me-';
    public static ROOT = '-root-';
    public static DEFAULT = '-default-';
    static NODE_STORE_LIST = 'BASKET';
    public static DUPLICATE_NODE_RESPONSE = 409;

    public static DEFAULT_SORT_CRITERIA: string[] = ['cm:name'];
    public static DEFAULT_SORT_ASCENDING = true;
    public static API_VERSION = 'v1';
    public static API_VERSION_3_2 = 1.0;
    public static API_VERSION_4_0 = 1.1;

    public static CM_DESCRIPTION = 'cm:description';
    public static SORT_BY_FIELDS = [RestConstants.CM_NAME];

    public static BASIC_PERMISSIONS = ['Consumer', 'Collaborator', 'Coordinator'];

    /**
     * cordova oauth storage
     */
    public static CORDOVA_STORAGE_OAUTHTOKENS: string = 'oauth';
    public static CORDOVA_STORAGE_SERVER_ENDPOINT: string = 'server_endpoint';
    public static CORDOVA_STORAGE_SERVER_OWN: string = 'server_own';

    public static AUTHORITY_ROLE_OWNER = 'ROLE_OWNER';
    public static AUTHORITY_TYPE_USER = 'USER';
    public static AUTHORITY_TYPE_GROUP = 'GROUP';
    public static AUTHORITY_TYPE_OWNER = 'OWNER';
    public static AUTHORITY_TYPE_EVERYONE = 'EVERYONE';
    public static AUTHORITY_TYPE_UNKNOWN = 'UNKNOWN';
    public static AUTHORITY_EVERYONE = 'GROUP_EVERYONE';

    public static getAuthorityEveryone() {
        return {
            authorityName: RestConstants.AUTHORITY_EVERYONE,
            authorityType: RestConstants.AUTHORITY_TYPE_EVERYONE,
        };
    }
    public static PERMISSION_OWNER = 'Owner';
    public static PERMISSION_COLLABORATOR = 'Collaborator';
    public static PERMISSION_COORDINATOR = 'Coordinator';
    public static PERMISSION_ALL = 'All';
    public static PERMISSION_WRITE = 'Write';
    public static PERMISSION_DELETE = 'Delete';
    public static PERMISSION_FEEDBACK = 'Feedback'; // Giving feedback for collections
    public static PERMISSION_RATE = 'Rate';

    public static CCM_ASPECT_TOOL_DEFINITION = 'ccm:tool_definition';
    public static CCM_ASPECT_TOOL_OBJECT = 'ccm:tool_object';
    public static CCM_ASPECT_TOOL_INSTANCE_LINK = 'ccm:tool_instance_link';
    public static CCM_ASPECT_IO_REFERENCE = 'ccm:collection_io_reference';
    public static CCM_ASPECT_METADATA_PRESETTING = 'ccm:metadataPresetting';
    public static CCM_ASPECT_PUBLISHED = 'ccm:published';
    public static CCM_ASPECT_MAP_REF = 'ccm:map_ref';
    public static CCM_ASPECT_LOMREPLICATION = 'ccm:lomreplication';
    public static CCM_ASPECT_CCLOM_GENERAL = 'cclom:general';
    public static CCM_ASPECT_IO_CHILDOBJECT = 'ccm:io_childobject';
    public static CCM_ASPECT_REMOTEREPOSITORY = 'ccm:remoterepository';

    public static CCM_ASSOC_CHILDIO = 'ccm:childio';

    public static CM_TYPE_FOLDER = 'cm:folder';
    public static CM_TYPE_PERSON = 'cm:person';
    public static SIZE = 'size';
    public static MEDIATYPE = 'mediatype';
    public static DIMENSIONS = 'dimensions';
    public static CM_CREATOR = 'cm:creator';
    public static CM_OWNER = 'cm:owner';
    public static CM_PROP_ESUID = 'cm:esuid';
    public static CM_TYPE_CONTENT = 'cm:content';
    public static CM_TYPE_OBJECT = 'cm:cmobject';
    public static CM_TYPE_CONTAINER = 'cm:container';
    public static CM_TYPE_AUTHORITY_CONTAINER = 'cm:authorityContainer';
    public static CCM_TYPE_IO = 'ccm:io';
    public static CCM_TYPE_MAP = 'ccm:map';
    public static SYS_TYPE_CONTAINER = 'sys:container';
    public static SYS_NODE_UUID = 'sys:node-uuid';
    public static CCM_TYPE_TOOLPERMISSION = 'ccm:toolpermission';
    public static CCM_TYPE_REMOTEOBJECT = 'ccm:remoteobject';
    public static CCM_TYPE_TOOL_INSTANCE = 'ccm:tool_instance';
    public static CCM_TYPE_SAVED_SEARCH = 'ccm:saved_search';
    public static CCM_FILENAME = 'ccm:filename';
    public static CCM_OBJECTTYPE = 'ccm:objecttype';
    public static LOM_PROP_GENERAL_KEYWORD = 'cclom:general_keyword';
    public static LOM_PROP_TECHNICAL_DURATION = 'cclom:duration';
    public static LOM_PROP_GENERAL_DESCRIPTION = 'cclom:general_description';
    public static LOM_PROP_LIFECYCLE_VERSION = 'cclom:version';
    public static CCM_PROP_LIFECYCLE_VERSION_COMMENT = 'ccm:version_comment';
    public static LOM_PROP_TECHNICAL_FORMAT = 'cclom:format';
    public static LOM_PROP_DESCRIPTION = 'cclom:general_description';
    public static CCM_PROP_RESTRICTED_ACCESS = 'ccm:restricted_access';
    public static CCM_PROP_METADATACONTRIBUTER_CREATOR = 'ccm:metadatacontributer_creator';
    public static CCM_PROP_METADATACONTRIBUTER_CREATOR_FN = 'ccm:metadatacontributer_creatorFN';
    public static CCM_PROP_LIFECYCLECONTRIBUTER_AUTHOR = 'ccm:lifecyclecontributer_author';
    public static CCM_PROP_AUTHOR_FREETEXT = 'ccm:author_freetext';
    public static CCM_PROP_PUBLISHED_MODE = 'ccm:published_mode';
    public static CCM_PROP_LIFECYCLECONTRIBUTER_AUTHOR_FN = 'ccm:lifecyclecontributer_authorFN';
    public static CCM_PROP_LIFECYCLECONTRIBUTER_PUBLISHER_FN =
        'ccm:lifecyclecontributer_publisherFN';
    public static CCM_PROP_EDUCATIONALTYPICALAGERANGE = 'ccm:educationaltypicalagerange';
    public static CCM_PROP_COLLECTION_PINNED_STATUS = 'ccm:collection_pinned_status';
    public static CCM_PROP_COLLECTION_PINNED_ORDER = 'ccm:collection_pinned_order';
    public static CCM_PROP_IO_WWWURL = 'ccm:wwwurl';
    public static CCM_PROP_LINKTYPE = 'ccm:linktype';
    public static CCM_PROP_IO_ORIGINAL = 'ccm:original';
    public static CCM_PROP_MAP_REF_TARGET = 'ccm:map_ref_target';
    public static CM_PROP_AUTHORITY_DISPLAYNAME = 'cm:authorityDisplayName';
    public static CCM_PROP_AUTHORITY_GROUPTYPE = 'ccm:groupType';
    public static CCM_PROP_TRACKING_VIEWS = 'ccm:tracking_views';
    public static CCM_PROP_TRACKING_DOWNLOADS = 'ccm:tracking_downloads';
    public static CCM_PROP_CHILDOBJECT_ORDER = 'ccm:childobject_order';
    public static CCM_PROP_COLLECTION_SUBCOLLECTION_ORDER_MODE =
        'ccm:collectionsubcollectionordermode';
    public static CCM_PROP_COLLECTION_ORDER_MODE = 'ccm:collectionordermode';
    public static CCM_PROP_PUBLISHED_HANDLE_ID = 'ccm:published_handle_id';
    public static CCM_PROP_PUBLISHED_DATE = 'ccm:published_date';
    public static CCM_PROP_PUBLISHED_ORIGINAL = 'ccm:published_original';
    public static CCM_PROP_TOOL_INSTANCE_KEY = 'ccm:tool_instance_key';
    public static CCM_PROP_TOOL_INSTANCE_SECRET = 'ccm:tool_instance_secret';
    public static CCM_PROP_FORKED_ORIGIN = 'ccm:forked_origin';
    public static CCM_PROP_REMOTEREPOSITORYID = 'ccm:remoterepositoryid';
    public static CCM_PROP_REMOTENODEID = 'ccm:remotenodeid';
    public static CM_PROP_PERSON_EDU_SCHOOL_PRIMARY_AFFILIATION = 'cm:eduSchoolPrimaryAffiliation';

    public static LINKTYPE_USER_GENERATED = 'USER_GENERATED';
    public static CM_PROP_AUTHORITY_AUTHORITYNAME = 'cm:authorityName';
    public static VIRTUAL_PROP_USAGECOUNT = 'virtual:usagecount';
    public static VIRTUAL_PROP_CHILDOBJECTCOUNT = 'virtual:childobjectcount';
    public static GROUP_PREFIX = 'GROUP_';

    public static CONTENT_QUOTA_EXCEPTION = 'DAOQuotaException';
    public static CONTENT_VIRUS_EXCEPTION = 'DAOVirusDetectedException';
    public static USER_PRIMARY_AFFILIATIONS = [
        'teacher',
        'student',
        'employee',
        'extern',
        'system',
        'function',
    ];

    public static FILTER_FILES = 'files';
    public static FILTER_SPECIAL = 'special';
    public static FILTER_FOLDERS = 'folders';
    // use not the maximum int value to prevent overflows in repository
    public static COUNT_UNLIMITED = 1247483647;
    public static USERHOME = '-userhome-';
    public static COLLECTIONHOME = '-collectionhome-';
    public static SHARED_FILES = '-shared_files-';
    public static MY_SHARED_FILES = '-my_shared_files-';
    public static TO_ME_SHARED_FILES = '-to_me_shared_files-';
    public static TO_ME_SHARED_FILES_PERSONAL = '-to_me_shared_files_personal-';
    public static INBOX = '-inbox-';
    public static WORKFLOW_RECEIVE = '-workflow_receive-';
    public static NODES_FRONTPAGE = '-frontpage-';

    public static CCM_PROP_LICENSE_TITLE_OF_WORK = 'ccm:license_title_of_work';
    public static CCM_PROP_LICENSE_SOURCE_URL = 'ccm:license_source_url';
    public static CCM_PROP_LICENSE_PROFILE_URL = 'ccm:license_profile_url';
    public static CCM_PROP_LICENSE_CC_VERSION = 'ccm:commonlicense_cc_version';
    public static CCM_PROP_LICENSE_CC_LOCALE = 'ccm:commonlicense_cc_locale';
    public static CCM_PROP_IMPORT_BLOCKED = 'ccm:importblocked';
    public static LOM_PROP_RIGHTS_DESCRIPTION = 'cclom:rights_description';
    public static CCM_PROP_QUESTIONSALLOWED = 'ccm:questionsallowed';
    public static CM_PROP_METADATASET_EDU_METADATASET = 'cm:edu_metadataset';
    public static CM_PROP_METADATASET_EDU_FORCEMETADATASET = 'cm:edu_forcemetadataset';
    public static CCM_PROP_TOOL_CATEGORY = 'ccm:tool_category';
    public static CCM_PROP_TOOL_PRODUCER = 'ccm:tool_producer';
    public static CCM_PROP_TOOL_INSTANCE_REF = 'ccm:tool_instance_ref';
    public static CCM_PROP_IO_EDITORIAL_STATE = 'ccm:editorial_state';
    public static CCM_PROP_IO_TECHNICAL_STATE = 'ccm:technical_state';
    public static CCM_PROP_IO_MEDIACENTER = 'ccm:mediacenter';
    public static CCM_PROP_COLLECTION_PROPOSAL_STATUS = 'ccm:collection_proposal_status';
    public static CCM_PROP_COLLECTION_PROPOSAL_TARGET = 'ccm:collection_proposal_target';

    public static CCM_PROP_IO_REF_TITLE = 'ccm:ref_title';
    public static CCM_PROP_IO_REF_DESCRIPTION = 'ccm:ref_description';
    public static CCM_PROP_IO_REF_VERSION = 'ccm:ref_version';
    public static CCM_PROP_IO_REF_VIDEO_VTT = 'ccm:ref_video_vtt';

    public static NODE_ID = 'sys:node-uuid';
    public static LUCENE_SCORE = 'score';

    public static COMMENT_MAIN_FILE_UPLOAD = 'MAIN_FILE_UPLOAD';
    public static COMMENT_METADATA_UPDATE = 'METADATA_UPDATE';
    public static COMMENT_CONTENT_UPDATE = 'CONTENT_UPDATE';
    public static COMMENT_CONTRIBUTOR_UPDATE = 'CONTRIBUTOR_UPDATE';
    public static COMMENT_LICENSE_UPDATE = 'LICENSE_UPDATE';
    public static COMMENT_EDITOR_UPLOAD = 'EDITOR_UPLOAD';
    public static COMMENT_NODE_PUBLISHED = 'NODE_PUBLISHED';
    public static COMMENT_PREVIEW_CHANGED = 'PREVIEW_CHANGED';
    public static COMMENT_BULK_CREATE = 'BULK_CREATE';
    public static COMMENT_BULK_UPDATE = 'BULK_UPDATE';
    public static COMMENT_BULK_UPDATE_RESYNC = 'BULK_UPDATE_RESYNC';
    public static COMMENT_MIGRATION = 'BULK_MIGRATION';
    public static COMMENT_REMOTE_OBJECT_INIT = 'REMOTE_OBJECT_INIT';
    public static COMMENT_BLOCKED_IMPORT = 'IMPORT_BLOCKED';
    public static ACCESS_ADD_CHILDREN = 'AddChildren';
    public static ACCESS_WRITE = 'Write';
    public static ACCESS_DELETE = 'Delete';
    public static ACCESS_CHANGE_PERMISSIONS = 'ChangePermissions';
    public static ACCESS_CONSUMER = 'Consumer';
    public static ACCESS_CC_PUBLISH = 'CCPublish';
    public static ACCESS_COMMENT = 'Comment';
    public static CONTENT_TYPE_FILES = 'FILES';
    public static CONTENT_TYPE_FILES_AND_FOLDERS = 'FILES_AND_FOLDERS';
    public static CONTENT_TYPE_ALL = 'ALL';
    public static CONTENT_TYPE_COLLECTIONS = 'COLLECTIONS';

    // @Deprecated
    public static PERMISSION_CONSUMER = RestConstants.ACCESS_CONSUMER;

    public static IMPLICIT_COLLECTION_PERMISSIONS = [RestConstants.ACCESS_CONSUMER];

    public static COMBINE_MODE_AND = 'AND';
    public static COMBINE_MODE_OR = 'OR';

    public static CM_ESPERSONSTATUS = 'espersonstatus';
    public static AUTHORITY_GROUPTYPE = 'groupType';

    public static SHARE_LINK = 'LINK';
    public static SHARE_EXPIRY_UNLIMITED = -1;

    public static POSSIBLE_SORT_BY_FIELDS_SOLR = [
        new ListItemSort('NODE', RestConstants.CM_NAME),
        // new ListItemSort('NODE', RestConstants.LOM_PROP_TITLE),
        new ListItemSort('NODE', RestConstants.CM_MODIFIED_DATE),
        new ListItemSort('NODE', RestConstants.CM_PROP_C_CREATED),
        // new ListItemSort('NODE', RestConstants.CM_CREATOR),
    ];

    public static POSSIBLE_SORT_BY_FIELDS = [
        new ListItemSort('NODE', RestConstants.CM_NAME),
        new ListItemSort('NODE', RestConstants.LOM_PROP_TITLE),
        new ListItemSort('NODE', RestConstants.CM_MODIFIED_DATE),
        new ListItemSort('NODE', RestConstants.CM_PROP_C_CREATED),
        // new ListItemSort('NODE', RestConstants.CM_CREATOR),
        new ListItemSort('NODE', RestConstants.NODE_ID),
        new ListItemSort('NODE', RestConstants.CCM_PROP_WF_STATUS),
        new ListItemSort('NODE', RestConstants.CM_ARCHIVED_DATE),
        new ListItemSort('NODE', RestConstants.LOM_PROP_GENERAL_KEYWORD),
        new ListItemSort('NODE', RestConstants.CCM_PROP_LICENSE),
        new ListItemSort('NODE', RestConstants.CCM_PROP_IO_EDITORIAL_STATE),
        new ListItemSort('NODE', RestConstants.CCM_PROP_IO_TECHNICAL_STATE),
        new ListItemSort('NODE', RestConstants.CCM_PROP_IO_MEDIACENTER),
        // not supported by alfresco/solr atm
        //new SortItem("USER",RestConstants.AUTHORITY_NAME),
        new ListItemSort('USER', RestConstants.AUTHORITY_FIRSTNAME),
        new ListItemSort('USER', RestConstants.AUTHORITY_LASTNAME),
        new ListItemSort('USER', RestConstants.AUTHORITY_EMAIL),
        new ListItemSort('USER', RestConstants.AUTHORITY_STATUS),
        new ListItemSort('GROUP', RestConstants.AUTHORITY_DISPLAYNAME),
        new ListItemSort('GROUP', RestConstants.AUTHORITY_GROUPTYPE),
    ];

    public static DEFAULT_QUERY_NAME = 'ngsearch';
    public static QUERY_NAME_COLLECTIONS = 'collections';

    public static HTTP_UNAUTHORIZED = 401;
    public static HTTP_FORBIDDEN = 403;
    public static HTTP_NOT_FOUND = 404;
    public static HOME_APPLICATION_XML = 'homeApplication.properties.xml';
    public static NODE_VERSION_CURRENT = '-1';
    public static PRIMARY_SEARCH_CRITERIA = 'ngsearchword';
    public static DISPLAYNAME_SUFFIX = '_DISPLAYNAME';
    public static SAVED_SEARCH = '-saved_search-';
    public static CCM_PROP_SAVED_SEARCH_MDS = 'ccm:saved_search_mds';
    public static CCM_PROP_SAVED_SEARCH_REPOSITORY = 'ccm:saved_search_repository';
    public static CCM_PROP_SAVED_SEARCH_PARAMETERS = 'ccm:saved_search_parameters';
    public static GROUP_TYPE_ADMINISTRATORS = 'ORG_ADMINISTRATORS';
    public static GROUP_TYPE_EDITORIAL = 'EDITORIAL';
    public static GROUP_TYPE_TEACHER = 'TEACHER';
    public static GROUP_TYPE_MEDIA_CENTER = 'MEDIA_CENTER';
    public static GROUP_TYPE_MEDIACENTER_PROXY = 'MEDIA_CENTER_PROXY';
    public static GROUP_TYPE_MEDIACENTER_ADMINISTRATORS = 'MEDIACENTER_ADMINISTRATORS';
    public static GROUP_SCOPETYPE_GLOBAL = 'global';
    public static VALID_GROUP_TYPES = [
        null,
        RestConstants.GROUP_TYPE_ADMINISTRATORS,
        RestConstants.GROUP_TYPE_MEDIA_CENTER,
        RestConstants.GROUP_TYPE_MEDIACENTER_PROXY,
        RestConstants.GROUP_TYPE_MEDIACENTER_ADMINISTRATORS,
        RestConstants.GROUP_TYPE_EDITORIAL,
        RestConstants.GROUP_TYPE_TEACHER,
    ];
    public static VALID_PERSON_STATUS_TYPES = ['active', 'blocked', 'todelete'];
    public static VALID_GROUP_TYPES_ORG = [null, RestConstants.GROUP_TYPE_EDITORIAL];
    public static VALID_SCOPE_TYPES = [null, RestConstants.GROUP_SCOPETYPE_GLOBAL];
    public static TYPE_ROCKETCHAT = 'ROCKETCHAT';
    static COLLECTION_ORDER_MODE_CUSTOM = 'custom';
    public static AUTHORITY_DELETED_USER = 'DELETED_USER';
}
