import {Injectable} from "@angular/core";
import {RestConstants} from "../rest-constants";
import {RestConnectorService} from "./rest-connector.service";
import {AbstractRestService} from "./abstract-rest-service";
import {IamGroup} from "../data-object";

@Injectable()
export class RestMediacenterService extends AbstractRestService{
  // @TODO: declare the mediacenter type when it is finalized in backend
  constructor(connector : RestConnectorService) {
      super(connector);
  }
  public getMediacenters(repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository", repository);
    return this.connector.get<any[]>(query, this.connector.getRequestOptions());
  }
  public addMediacenter(mediacenter:string,profile:any,repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter", repository,[
      [":mediacenter",mediacenter]
    ]);
    return this.connector.post(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public editMediacenter(mediacenter:string,profile:any,repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter", repository,[
        [":mediacenter",mediacenter]
    ]);
    return this.connector.put(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public addManagedGroup(mediacenter:string,group:string,repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter/manages/:group", repository,[
      [":mediacenter",mediacenter],
      [":group",group]
    ]);
    return this.connector.put<IamGroup[]>(query,null,this.connector.getRequestOptions());
  }
  public removeManagedGroup(mediacenter:string,group:string,repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter/manages/:group", repository,[
      [":mediacenter",mediacenter],
      [":group",group]
    ]);
    return this.connector.delete<IamGroup[]>(query,this.connector.getRequestOptions());
  }
  public getManagedGroups(mediacenter:string,repository = RestConstants.HOME_REPOSITORY){
    let query = this.connector.createUrl("mediacenter/:version/mediacenter/:repository/:mediacenter/manages", repository,[
      [":mediacenter",mediacenter]
    ]);
    return this.connector.get<IamGroup[]>(query,this.connector.getRequestOptions());
  }

    public importMediacenters(file : File){
        let query=this.connector.createUrl("mediacenter/:version/import/mediacenters",null);
        let options=this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query,file,"POST","mediacenters")
            .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
    }

    public importOrganisations(file : File){
        let query=this.connector.createUrl("mediacenter/:version/import/organisations",null);
        let options=this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query,file,"POST","organisations")
            .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
    }

    public importMcOrgConnections(file : File, removeSchoolsFromMC : boolean){
        let query=this.connector.createUrl("mediacenter/:version/import/mc_org?removeSchoolsFromMC=" + removeSchoolsFromMC,null);
        let options=this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query,file,"POST","mcOrgs")
            .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
    }
}
