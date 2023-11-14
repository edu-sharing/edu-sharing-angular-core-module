import { NgModule } from '@angular/core';
import { DebugResultPipe } from './rest/pipes/debug-result.pipe';

@NgModule({
    imports: [],
    declarations: [DebugResultPipe],
})
export class CoreModule {}

export { TemporaryStorageService, UIConstants } from 'ngx-edu-sharing-ui';
export * from './rest/configuration-helper';
export * from './rest/data-object';
export { DeleteMode, EventType } from './rest/data-object';
export { DebugResultPipe } from './rest/pipes/debug-result.pipe';
export * from './rest/request-object';
export * from './rest/rest-constants';
export * from './rest/rest-helper';
export * from './rest/services/configuration.service';
export * from './rest/services/frame-events.service';
export { RestAdminService } from './rest/services/rest-admin.service';
export { RestArchiveService } from './rest/services/rest-archive.service';
export { RestCollectionService } from './rest/services/rest-collection.service';
export { RestCommentsService } from './rest/services/rest-comments.service';
export { RestConnectorService } from './rest/services/rest-connector.service';
export { RestConnectorsService } from './rest/services/rest-connectors.service';
export { RestIamService } from './rest/services/rest-iam.service';
export * from './rest/services/rest-locator.service';
export { RestMdsService } from './rest/services/rest-mds.service';
export { RestMediacenterService } from './rest/services/rest-mediacenter.service';
export { RestNetworkService } from './rest/services/rest-network.service';
export { RestNodeService } from './rest/services/rest-node.service';
export { RestOrganizationService } from './rest/services/rest-organization.service';
export { RestRatingService } from './rest/services/rest-rating.service';
export { RestRegisterService } from './rest/services/rest-register.service';
export { RestSearchService } from './rest/services/rest-search.service';
export { RestSharingService } from './rest/services/rest-sharing.service';
export { RestStatisticsService } from './rest/services/rest-statistics.service';
export { RestStreamService } from './rest/services/rest-stream.service';
export { RestToolService } from './rest/services/rest-tool.service';
export { RestUsageService } from './rest/services/rest-usage.service';
export { RestUtilitiesService } from './rest/services/rest-utilities.service';
export * from './rest/services/session-storage.service';
export { UIService } from './rest/services/ui.service';
export { DialogButton } from './ui/dialog-button';
