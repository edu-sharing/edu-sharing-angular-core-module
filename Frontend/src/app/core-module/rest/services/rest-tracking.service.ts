import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import {RestConnectorService} from "./rest-connector.service";
import {RestConstants} from "../rest-constants";
import {
  EventType
} from "../data-object";
import {RequestObject} from "../request-object";

@Injectable()
export class RestTrackingService {

  constructor(private connector : RestConnectorService) {}

  trackEvent(event: EventType, node:string = null,repository = RestConstants.HOME_REPOSITORY): Observable<void> {
      let query=this.connector.createUrl('tracking/:version/tracking/:repository/:event?node=:node', repository, [
        [':event',event],
        [':node',node]
      ]);
      console.log(query);
      return this.connector.put(query, null, this.connector.getRequestOptions());
  }
}
