import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';
import { TemporaryStorageService } from './temporary-storage.service';
import { LTIRegistrationTokens } from '../data-object';
import { RestConstants } from '../rest-constants';

@Injectable({ providedIn: 'root' })
export class RestLtiService extends AbstractRestService {
    constructor(connector: RestConnectorService, private storage: TemporaryStorageService) {
        super(connector);
    }

    public getTokensCall = (generate: boolean) => {
        const query = this.connector.createUrl(
            'lti/v13/registration/url?generate=:generate',
            null,
            [[':generate', String(generate)]],
        );
        return this.connector.get<LTIRegistrationTokens>(query, this.connector.getRequestOptions());
    };

    public removeToken = (token: string) => {
        const query = this.connector.createUrl('lti/v13/registration/url/:token', null, [
            [':token', token],
        ]);
        return this.connector.delete<any>(query, this.connector.getRequestOptions());
    };

    public registrationAdvanced = (
        platformId: string,
        clientId: string,
        deploymentId: string,
        authenticationRequestUrl: string,
        keysetUrl: string,
        keyId: string,
        authTokenUrl: string,
    ) => {
        //http://localhost:4200/edu-sharing/rest//lti/v13/registration/static?platformId=fgfgh&fghfhg=:client_id&fghfg=:deployment_id&https%3A%2F%2Flocalhost.localdomain%2Fmoodle%2Fmod%2Flti%2Fauth.php=:authentication_request_url&https%3A%2F%2Flocalhost.localdomain%2Fmoodle%2Fmod%2Flti%2Fcerts.php=:keyset_url&e079a4884780ac1dfd16=:key_id&https%3A%2F%2Flocalhost.localdomain%2Fmoodle%2Fmod%2Flti%2Ftoken.php=:auth_token_url
        const query = this.connector.createUrl(
            'lti/v13/registration/static?platformId=:platformId&client_id=:client_id&deployment_id=:deployment_id&authentication_request_url=:authentication_request_url&keyset_url=:keyset_url&key_id=:key_id&auth_token_url=:auth_token_url',
            null,
            [
                [':platformId', platformId],
                [':client_id', clientId],
                [':deployment_id', deploymentId],
                [':authentication_request_url', authenticationRequestUrl],
                [':keyset_url', keysetUrl],
                [':key_id', keyId],
                [':auth_token_url', authTokenUrl],
            ],
        );
        return this.connector.post<any>(query, null, this.connector.getRequestOptions());
    };
}
