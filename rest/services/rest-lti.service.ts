import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';
import { TemporaryStorageService } from './temporary-storage.service';
import { LTIRegistrationTokens } from '../data-object';
import { RestConstants } from '../rest-constants';

@Injectable()
export class RestLtiService extends AbstractRestService {
    constructor(connector: RestConnectorService, private storage: TemporaryStorageService) {
        super(connector);
    }

    public getTokensCall = (generate: boolean) => {
        const query = this.connector.createUrl('lti/v13/registration/url', null, [[':generate', String(generate)]]);
        return this.connector.get<LTIRegistrationTokens>(query, this.connector.getRequestOptions());
    }

    public removeToken = (token: string) => {
        const query = this.connector.createUrl('lti/v13/registration/url/:token', null, [[':token', token]]);
        return this.connector.delete<any>(query, this.connector.getRequestOptions());
    }


}
