import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RestConnectorService } from './rest-connector.service';
import { RestConstants } from '../rest-constants';
import { EventType } from '../data-object';
import { RequestObject } from '../request-object';

@Injectable({ providedIn: 'root' })
export class RestTrackingService {
    private connector = inject(RestConnectorService);

    trackEvent(
        event: EventType,
        node: string = null,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<void> {
        let query = this.connector.createUrl(
            'tracking/:version/tracking/:repository/:event?node=:node',
            repository,
            [
                [':event', event],
                [':node', node],
            ],
        );
        return this.connector.put(query, null, this.connector.getRequestOptions());
    }
}
