import { Injectable } from '@angular/core';
import {RestConnectorService} from "./rest-connector.service";
import {RestHelper} from "../rest-helper";
import {RestConstants} from "../rest-constants";
import {RequestObject} from "../request-object";
import {ArchiveRestore, ArchiveSearch, Node, Collection, UsageList, CollectionUsage} from '../data-object';
import {AbstractRestService} from "./abstract-rest-service";

@Injectable({providedIn: 'root'})
export class RestRatingService extends AbstractRestService{
    constructor(connector : RestConnectorService) {
        super(connector);
    }

    updateNodeRating(node : string,rating: number,text = '',repository=RestConstants.HOME_REPOSITORY){
    let query=this.connector.createUrl("rating/:version/ratings/:repository/:node?rating=:rating",repository, [
        [":node",node],
        [":rating",""+rating]
      ]);
    return this.connector.put<void>(query,text,this.connector.getRequestOptions());
    }
    deleteNodeRating(node : string,repository=RestConstants.HOME_REPOSITORY){
        let query=this.connector.createUrl("rating/:version/ratings/:repository/:node?rating=:rating",repository, [
            [":node",node]
        ]);
        return this.connector.delete<void>(query,this.connector.getRequestOptions());
    }
}
