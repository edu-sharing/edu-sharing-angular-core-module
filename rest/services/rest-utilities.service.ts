import { Injectable, inject } from '@angular/core';
import { RestConnectorService } from './rest-connector.service';
import { AbstractRestService } from './abstract-rest-service';
import { WebsiteInformation } from '../data-object';

@Injectable({ providedIn: 'root' })
export class RestUtilitiesService extends AbstractRestService {
    constructor() {
        const connector = inject(RestConnectorService);

        super(connector);
    }
    public getWebsiteInformation = (url: string) => {
        let query = this.connector.createUrl(
            'clientUtils/:version/getWebsiteInformation?url=:url',
            null,
            [[':url', url]],
        );
        return this.connector.get<WebsiteInformation>(query, this.connector.getRequestOptions());
    };
}
