import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import {RestConnectorService} from "./rest-connector.service";
import {AbstractRestService} from "./abstract-rest-service";
import {WebsiteInformation} from "../data-object";

@Injectable()
export class RestUtilitiesService extends AbstractRestService{
  constructor(connector : RestConnectorService) {
      super(connector);
  }
  public getWebsiteInformation = (url:string) => {
    let query=this.connector.createUrl("clientUtils/:version/getWebsiteInformation?url=:url",null,
      [
        [":url",url],
      ]);
    return this.connector.get<WebsiteInformation>(query,this.connector.getRequestOptions());
  }
}
