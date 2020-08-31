import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MdsMetadataset, MdsMetadatasets, MdsValueList, MdsValues } from '../data-object';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';

@Injectable()
export class RestMdsService extends AbstractRestService {
    constructor(connector: RestConnectorService) {
        super(connector);
    }

    getSets = (repository = RestConstants.HOME_REPOSITORY): Observable<any> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasetsV2/:repository',
            repository,
        );
        return this.connector.get<MdsMetadatasets>(query, this.connector.getRequestOptions());
    };

    getSet = (
        metadataset = RestConstants.DEFAULT,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<any> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasetsV2/:repository/:metadataset',
            repository,
            [[':metadataset', metadataset]],
        );
        return this.connector.get<MdsMetadataset>(query, this.connector.getRequestOptions());
    };

    getValues = (
        values: MdsValues,
        metadataset = RestConstants.DEFAULT,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<MdsValueList> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasetsV2/:repository/:metadataset/values',
            repository,
            [[':metadataset', metadataset]],
        );
        return this.connector.post<MdsValueList>(
            query,
            JSON.stringify(values),
            this.connector.getRequestOptions(),
        );
    };
}
