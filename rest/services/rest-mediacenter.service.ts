import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { RestConstants } from '../rest-constants';
import { RestConnectorService } from './rest-connector.service';
import { AbstractRestService } from './abstract-rest-service';
import { IamGroup, Mediacenter, MediacenterProfile, Node, NodeList } from '../data-object';
import { RestHelper } from '../rest-helper';

@Injectable({ providedIn: 'root' })
export class RestMediacenterService extends AbstractRestService {
    // @TODO: declare the mediacenter type when it is finalized in backend
    constructor(connector: RestConnectorService) {
        super(connector);
    }
    public getMediacenters(repository = RestConstants.HOME_REPOSITORY) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository',
            repository,
        );
        return this.connector.get<Mediacenter[]>(query, this.connector.getRequestOptions());
    }
    public addMediacenter(
        mediacenter: string,
        profile: any,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter',
            repository,
            [[':mediacenter', mediacenter]],
        );
        return this.connector.post<Mediacenter>(
            query,
            JSON.stringify(profile),
            this.connector.getRequestOptions(),
        );
    }
    public editMediacenter(
        mediacenter: string,
        profile: MediacenterProfile,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter',
            repository,
            [[':mediacenter', mediacenter]],
        );
        return this.connector.put<Mediacenter>(
            query,
            JSON.stringify(profile),
            this.connector.getRequestOptions(),
        );
    }
    public deleteMediacenter(mediacenter: string, repository = RestConstants.HOME_REPOSITORY) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter',
            repository,
            [[':mediacenter', mediacenter]],
        );
        return this.connector.delete<void>(query, this.connector.getRequestOptions());
    }
    public addManagedGroup(
        mediacenter: string,
        group: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter/manages/:group',
            repository,
            [
                [':mediacenter', mediacenter],
                [':group', group],
            ],
        );
        return this.connector.put<IamGroup[]>(query, null, this.connector.getRequestOptions());
    }
    public removeManagedGroup(
        mediacenter: string,
        group: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter/manages/:group',
            repository,
            [
                [':mediacenter', mediacenter],
                [':group', group],
            ],
        );
        return this.connector.delete<IamGroup[]>(query, this.connector.getRequestOptions());
    }
    public getManagedGroups(mediacenter: string, repository = RestConstants.HOME_REPOSITORY) {
        const query = this.connector.createUrl(
            'mediacenter/:version/mediacenter/:repository/:mediacenter/manages',
            repository,
            [[':mediacenter', mediacenter]],
        );
        return this.connector.get<IamGroup[]>(query, this.connector.getRequestOptions());
    }

    /*public getLicensedNodes(mediacenter:string,repository = RestConstants.HOME_REPOSITORY){
      let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter/licenses", repository,[
          [":mediacenter",mediacenter]
      ]);
      return this.connector.get<Node[]>(query,this.connector.getRequestOptions());
  }*/

    public getLicensedNodes(
        mediacenter: string,
        criterias: any[],
        repository = RestConstants.HOME_REPOSITORY,
        request: any = null,
    ) {
        const query = this.connector.createUrlNoEscape(
            'mediacenter/:version/mediacenter/:repository/:mediacenter/licenses?:request',
            repository,
            [
                [':mediacenter', encodeURIComponent(mediacenter)],
                //[':facettes',RestHelper.getQueryStringForList('facettes',facettes)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.post<NodeList>(
            query,
            JSON.stringify({
                criterias,
            }),
            this.connector.getRequestOptions(),
        );
    }

    public importMediacenters(file: File) {
        const query = this.connector.createUrl('mediacenter/:version/import/mediacenters', null);
        const options = this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query, file, 'POST', 'mediacenters').pipe(
            map((response: XMLHttpRequest) => {
                return JSON.parse(response.response);
            }),
        );
    }

    public importOrganisations(file: File) {
        const query = this.connector.createUrl('mediacenter/:version/import/organisations', null);
        const options = this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query, file, 'POST', 'organisations').pipe(
            map((response: XMLHttpRequest) => {
                return JSON.parse(response.response);
            }),
        );
    }

    public importMcOrgConnections(file: File, removeSchoolsFromMC: boolean) {
        const query = this.connector.createUrl(
            'mediacenter/:version/import/mc_org?removeSchoolsFromMC=' + removeSchoolsFromMC,
            null,
        );
        const options = this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query, file, 'POST', 'mcOrgs').pipe(
            map((response: XMLHttpRequest) => {
                return JSON.parse(response.response);
            }),
        );
    }
}
