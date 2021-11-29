import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import {RestConnectorService} from "./rest-connector.service";
import {RestHelper} from "../rest-helper";
import {RestConstants} from "../rest-constants";
import {
    ArchiveRestore,
    ArchiveSearch,
    Node,
    NodeList,
    IamGroup,
    IamGroups,
    IamAuthorities,
    GroupProfile,
    IamUsers,
    IamUser,
    UserProfile,
    UserCredentials,
    ServerUpdate,
    CacheInfo,
    NetworkRepositories,
    Application,
    NodeStatistics,
    Statistics,
    NodeStatisticsSimple
} from '../data-object';
import {Observer} from "rxjs";
import {AbstractRestService} from "./abstract-rest-service";

@Injectable()
export class RestStatisticsService extends AbstractRestService{
  constructor(connector : RestConnectorService) {
    super(connector);
  }
    public getStatisticsNode(from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
      return this.getStatistics<NodeStatistics[]>("nodes",from,to,grouping,mediacenter,additionalFields,groupField);
    }
    public getStatisticsNodeAll(from:Date,to:Date,mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
        const query=this.connector.createUrlNoEscape("statistic/:version/statistics/nodes/all?dateFrom=:from&dateTo=:to&grouping=:grouping&mediacenter=:mediacenter&:additionalFields&:groupField",null,[
            [":from",encodeURIComponent(""+from.getTime())],
            [":to",encodeURIComponent(""+to.getTime())],
            [":mediacenter",encodeURIComponent(mediacenter)],
            [":additionalFields",RestHelper.getQueryStringForList("additionalFields",additionalFields)],
            [":groupField",RestHelper.getQueryStringForList("groupField",groupField)]
        ]);
        return this.connector.post<NodeStatistics[]>(query,null,this.connector.getRequestOptions());
    }
    public getStatisticsUser(from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
        return this.getStatistics<NodeStatistics[]>("users",from,to,grouping,mediacenter,additionalFields,groupField);
    }
    private getStatistics<T extends Statistics[]>(type:string,from:Date,to:Date,grouping='None',mediacenter='',additionalFields:string[]=null,groupField:string[]=null){
        const query=this.connector.createUrlNoEscape("statistic/:version/statistics/:type?dateFrom=:from&dateTo=:to&grouping=:grouping&mediacenter=:mediacenter&:additionalFields&:groupField",null,[
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

