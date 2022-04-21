import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MdsMetadataset, MdsMetadatasets, MdsValueList, MdsValues } from '../data-object';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';

@Injectable({providedIn: 'root'})
export class RestMdsService extends AbstractRestService {
    constructor(connector: RestConnectorService) {
        super(connector);
    }

    getSets = (repository = RestConstants.HOME_REPOSITORY): Observable<any> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasets/:repository',
            repository,
        );
        return this.connector.get<MdsMetadatasets>(query, this.connector.getRequestOptions());
    };

    getSet = (
        metadataset = RestConstants.DEFAULT,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<any> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasets/:repository/:metadataset',
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
            'mds/:version/metadatasets/:repository/:metadataset/values',
            repository,
            [[':metadataset', metadataset]],
        );
        return this.connector.post<MdsValueList>(
            query,
            JSON.stringify(values),
            this.connector.getRequestOptions(),
        );
    };

    getValuesForKeys = (keys:string[], metadataset = RestConstants.DEFAULT, mdsQuery: string, property: string,
        repository = RestConstants.HOME_REPOSITORY): Observable<MdsValueList> => {
        const query = this.connector.createUrl(
            'mds/:version/metadatasets/:repository/:metadataset/values_for_keys?query=:query&property=:property',
            repository,
            [[':metadataset', metadataset],[':query',mdsQuery],[':property',property]],
        );
        return  this.connector.post<MdsValueList>(
            query,
            JSON.stringify(keys),
            this.connector.getRequestOptions(),
        );
    };
}
