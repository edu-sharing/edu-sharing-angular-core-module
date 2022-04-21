import { Injectable } from '@angular/core';
import {RestConnectorService} from "./rest-connector.service";
import {RestHelper} from "../rest-helper";
import {RestConstants} from "../rest-constants";
import {
    ArchiveRestore, ArchiveSearch, Node, NodeList, IamGroup, IamGroups, IamAuthorities, GroupProfile,
    IamUsers, IamUser, UserProfile, UserCredentials, ServerUpdate, CacheInfo, NetworkRepositories, Application, NodeStatistics, Statistics
} from "../data-object";
import {Observer} from "rxjs";
import {AbstractRestService} from "./abstract-rest-service";

@Injectable({providedIn: 'root'})
export class RestStatisticsService extends AbstractRestService{
  constructor(connector : RestConnectorService) {
    super(connector);
  }
    public getStatisticsNode(from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
      return this.getStatistics<NodeStatistics[]>("nodes",from,to,grouping,mediacenter,additionalFields,groupField);
    }
    public getStatisticsUser(from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
        return this.getStatistics<NodeStatistics[]>("users",from,to,grouping,mediacenter,additionalFields,groupField);
    }
    private getStatistics<T extends Statistics[]>(type:string,from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
        let query=this.connector.createUrlNoEscape("statistic/:version/statistics/:type?dateFrom=:from&dateTo=:to&grouping=:grouping&mediacenter=:mediacenter&:additionalFields&:groupField",null,[
            [":type",type],
            [":from",encodeURIComponent(""+from.getTime())],
            [":to",encodeURIComponent(""+to.getTime())],
            [":grouping",encodeURIComponent(grouping)],
            [":mediacenter",encodeURIComponent(mediacenter)],
            [":additionalFields",RestHelper.getQueryStringForList("additionalFields",additionalFields)],
            [":groupField",RestHelper.getQueryStringForList("groupField",groupField)]
        ]);
        return this.connector.post<T>(query,null,this.connector.getRequestOptions());
    }
}

