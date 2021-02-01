import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import {RestConnectorService} from "./rest-connector.service";
import {RestHelper} from "../rest-helper";
import {RestConstants} from "../rest-constants";
import {
    ArchiveRestore, ArchiveSearch, Node, NodeList, IamGroup, IamGroups, IamAuthorities, GroupProfile,
    IamUsers, IamUser, UserProfile, UserCredentials, ServerUpdate, CacheInfo, NetworkRepositories, Application, NodeStatistics, Statistics, JobDescription
} from "../data-object";
import {Observer} from "rxjs";
import {AbstractRestService} from "./abstract-rest-service";

@Injectable()
export class RestAdminService extends AbstractRestService{
  constructor(connector : RestConnectorService) {
    super(connector);
  }
    public getJobs(){
        let query=this.connector.createUrl("admin/:version/jobs",null);
        return this.connector.get<any>(query,this.connector.getRequestOptions())
    }
    public getAllJobs(){
        let query=this.connector.createUrl("admin/:version/jobs/all",null);
        return this.connector.get<JobDescription[]>(query,this.connector.getRequestOptions())
    }
    public cancelJob(job:string){
        let query=this.connector.createUrl("admin/:version/jobs/:job",null,[[":job",job]]);
        return this.connector.delete<any>(query,this.connector.getRequestOptions());
    }
    public addToolpermission(name:string){
        let query=this.connector.createUrl("admin/:version/toolpermissions/add/:name",null,[
            [":name",name]
        ]);
        let options=this.connector.getRequestOptions();
        return this.connector.post<Node>(query,null,options);
    }
  public getToolpermissions(authority = RestConstants.AUTHORITY_EVERYONE){
      let query=this.connector.createUrl("admin/:version/toolpermissions/:authority",null,[
          [":authority",authority]
      ]);
      let options=this.connector.getRequestOptions();

      return this.connector.get<any>(query,options);
  }
  public setToolpermissions(authority:string,permissions:any){
        let query=this.connector.createUrl("admin/:version/toolpermissions/:authority",null,[
            [":authority",authority]
        ]);
        let options=this.connector.getRequestOptions();

        return this.connector.put(query,JSON.stringify(permissions),options);
    }
  public addApplication(url:string){
    let query=this.connector.createUrl("admin/:version/applications?url=:url",null,[
      [":url",url],
    ]);
    return this.connector.put<any>(query,null,this.connector.getRequestOptions())
  }
  public uploadTempFile(file : File,filename=file.name){
    let query=this.connector.createUrl("admin/:version/upload/temp/:name",null,[
      [":name",filename]
    ]);
    let options=this.connector.getRequestOptions();

    return this.connector.sendDataViaXHR(query,file,"PUT")
      .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
  }
  public importExcel(file : File,parent:string){
    let query=this.connector.createUrl("admin/:version/import/excel?parent=:parent",null,[
      [":parent",parent]
    ]);
    let options=this.connector.getRequestOptions();

    return this.connector.sendDataViaXHR(query,file,"POST","excel")
      .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
  }
  public importCollections(file : File,parent:string){
    let query=this.connector.createUrl("admin/:version/import/collections?parent=:parent",null,[
      [":parent",parent]
    ]);
    let options=this.connector.getRequestOptions();

    return this.connector.sendDataViaXHR(query,file,"POST","xml")
      .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
  }
  public addApplicationXml(file : File) : Observable<any>{
    let query=this.connector.createUrl("admin/:version/applications/xml",null);
    let options=this.connector.getRequestOptions();

    return this.connector.sendDataViaXHR(query,file,"PUT","xml")
      .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
  }
  public getApplications(): Observable<Application[]>{
    let query=this.connector.createUrl("admin/:version/applications",null);
    return this.connector.get(query,this.connector.getRequestOptions());
  }
  public removeApplication(id:string){
    let query=this.connector.createUrl("admin/:version/applications/:id",null,[
      [":id",id]
    ]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }
  public getServerUpdates(){
    let query=this.connector.createUrl("admin/:version/serverUpdate/list",null);
    return this.connector.get<ServerUpdate[]>(query,this.connector.getRequestOptions())
  }
  public getNgVersion(){
    let query=this.connector.createUrl("../version.txt", null);
    let options:any=this.connector.getRequestOptions();
    options.responseType='text';
    return this.connector.get(query, options)
  }
  public getRepositoryVersion(){
    let query=this.connector.createUrl("../version.html",null);
    let options:any=this.connector.getRequestOptions();
    options.responseType='text';
    return this.connector.get(query,options)
      .map((response:string) => this.readRepositoryVersion(response));
  }

  public getOAIClasses(){
    let query=this.connector.createUrl("admin/:version/import/oai/classes",null);
    return this.connector.get<string[]>(query,this.connector.getRequestOptions());
  }
  public getCatalina(){
    let query=this.connector.createUrl("admin/:version/catalina",null);
    return this.connector.get<string[]>(query,this.connector.getRequestOptions());
  }
  public importOAI(baseUrl:string,set:string,metadataPrefix:string,className:string,importerClassName:string,recordHandlerClassName:string,binaryHandlerClassName="",metadataset="",fileUrl="",ids="",forceUpdate="false",from="",until=""){
    let query=this.connector.createUrl("admin/:version/import/oai?baseUrl=:baseUrl&set=:set&metadataPrefix=:metadataPrefix&className=:className&importerClassName=:importerClassName" +
        "&recordHandlerClassName=:recordHandlerClassName&binaryHandlerClassName=:binaryHandlerClassName&metadataset=:metadataset&fileUrl=:fileUrl&oaiIds=:ids&forceUpdate=:forceUpdate&from=:from&until=:until",null,[
      [":baseUrl",baseUrl],
      [":set",set],
      [":metadataPrefix",metadataPrefix],
      [":className",className],
      [":importerClassName",importerClassName],
      [":recordHandlerClassName",recordHandlerClassName],
      [":binaryHandlerClassName",binaryHandlerClassName],
      [":metadataset",metadataset],
      [":fileUrl",fileUrl],
      [":ids",ids],
      [":forceUpdate",forceUpdate],
      [":from",from],
      [":until",until]
    ]);
    return this.connector.post(query,null,this.connector.getRequestOptions());
  }
    public importOAIXML(xml:File,recordHandlerClassName:string,binaryHandlerClassName=""){
        let query=this.connector.createUrl("admin/:version/import/oai/xml?recordHandlerClassName=:recordHandlerClassName&binaryHandlerClassName=:binaryHandlerClassName",null,[
            [":recordHandlerClassName",recordHandlerClassName],
            [":binaryHandlerClassName",binaryHandlerClassName],
        ]);
        return this.connector.sendDataViaXHR(query,xml,'POST','xml')
            .map((response:XMLHttpRequest) => {return JSON.parse(response.response)});
    }
  public refreshCache(rootFolder:string,sticky=false){
    let query=this.connector.createUrl("admin/:version/import/refreshCache/:rootFolder?sticky=:sticky",null,[
      [":rootFolder",rootFolder],
      [":sticky",""+sticky],
    ]);
    return this.connector.post(query,null,this.connector.getRequestOptions());
  }
  public getCacheInfo(id : string){
    let query=this.connector.createUrl("admin/:version/cache/cacheInfo/:id",null,[[":id",id]]);
    return this.connector.get<CacheInfo>(query,this.connector.getRequestOptions());
  }
  public refreshAppInfo(){
    let query=this.connector.createUrl("admin/:version/refreshAppInfo",null);
    return this.connector.post(query,null,this.connector.getRequestOptions());
  }
  public refreshEduGroupCache(){
      let query=this.connector.createUrl("admin/:version/refreshEduGroupCache",null);
      return this.connector.post(query,null,this.connector.getRequestOptions());
  }
  public getPropertyValuespace(property:string){
    let query=this.connector.createUrl("admin/:version/propertyToMds?properties=:property",null,[
      [":property",property],
    ]);
    return this.connector.get<any>(query,this.connector.getRequestOptions());
  }
  public runServerUpdate(id:string,execute=false){
    let query=this.connector.createUrl("admin/:version/serverUpdate/run/:id?execute=:execute",null,[
      [":id",id],
      [":execute",""+execute]
    ]);
    return this.connector.post<any>(query,null,this.connector.getRequestOptions());
  }
  public searchLucene(lucene:string,authorities:string[],request:any=null){
      let query=this.connector.createUrlNoEscape("admin/:version/lucene/?query=:lucene&:authorities&:request",null,[
          [":lucene",encodeURIComponent(lucene)],
          [":authorities",RestHelper.getQueryStringForList("authorityScope",authorities)],
          [":request",this.connector.createRequestString(request)]
      ]);
      return this.connector.get<NodeList>(query,this.connector.getRequestOptions());
  }
  public exportLucene(lucene:string,properties:string[]){
    let query=this.connector.createUrlNoEscape("admin/:version/lucene/export/?query=:lucene&:properties",null,[
        [":lucene",encodeURIComponent(lucene)],
        [":properties",RestHelper.getQueryStringForList("properties",properties)],
    ]);
    return this.connector.get<any>(query,this.connector.getRequestOptions());
  }
  public startJob(job:string,params:any, file: File = null){
      let query=this.connector.createUrl("admin/:version/job/:job",null,[
          [":job",job],
      ]);
      if(!params) {
        params = {};
      }
      if(file) {
          return new Observable((observer) => {
              const reader = new FileReader();
              console.log(reader);
              reader.addEventListener('load', (event) => {
                  const result = event.target.result;
                  console.log(result);
                  params.FILE_DATA = result;
                  this.startJob(job, params).subscribe(() => {
                      observer.next();
                      observer.complete();
                  }, error => {
                      observer.error(error);
                      observer.complete();
                  } );
              });
              reader.readAsText(file);
          });
      } else {
          return this.connector.post(query, JSON.stringify(params), this.connector.getRequestOptions());
      }
  }
  public removeDeletedImports(baseUrl:string,set:string,metadataPrefix:string){
    let query=this.connector.createUrl("admin/:version/import/oai/?baseUrl=:baseUrl&set=:set&metadataPrefix=:metadataPrefix",null,[
      [":baseUrl",baseUrl],
      [":set",set],
      [":metadataPrefix",metadataPrefix],
    ]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }

  private readRepositoryVersion(s: string) {
    return s.split("<body>")[1].split("</body>")[0].replace(/\n/g,"").replace(/<br\/>/g,"\n");
  }

  public getApplicationXML(xml:string) {
    let query=this.connector.createUrl("admin/:version/applications/:xml",null,[[":xml",xml]]);
    return this.connector.get<any>(query,this.connector.getRequestOptions());
  }

  public testMail(receiver:string,template:string) {
      let query=this.connector.createUrl("admin/:version/mail/:receiver/:template",null,[
          [":receiver",receiver],
          [":template",template],
      ]);
      return this.connector.post(query,null,this.connector.getRequestOptions());
  }

  public updateApplicationXML(xml:string,homeAppProperties: any[]) {
    let query=this.connector.createUrl("admin/:version/applications/:xml",null,[[":xml",xml]]);
    return this.connector.put(query,JSON.stringify(homeAppProperties),this.connector.getRequestOptions());
  }

  public applyTemplate(groupName:string, templateName:string){
      let query=this.connector.createUrl("admin/:version/applyTemplate?template=:template&group=:group",null,[
          [":template",templateName],
          [":group",groupName]
      ]);
      return this.connector.post(query,null,this.connector.getRequestOptions());
  }

    public updateRepositoryConfig(config:any){
        let query=this.connector.createUrl("admin/:version/repositoryConfig",null);
        return this.connector.put(query,JSON.stringify(config),this.connector.getRequestOptions());
    }
    public getRepositoryConfig(){
        let query=this.connector.createUrl("admin/:version/repositoryConfig",null);
        return this.connector.get(query,this.connector.getRequestOptions());
    }

    public deletePersons(user: string[], options: any) {
        let query=this.connector.createUrlNoEscape("admin/:version/deletePersons?:username",null,[
            [":username",RestHelper.getQueryStringForList("username",user)]
        ]);
        return this.connector.put<any>(query,JSON.stringify(options),this.connector.getRequestOptions());
    }

    public getConfigFile(filename:string) {
        let query=this.connector.createUrl("admin/:version/configFile?filename=:filename",null,[
            [":filename",filename]
        ]);
        let options:any=this.connector.getRequestOptions();
        options.responseType='text';
        return this.connector.get<string>(query,options);
    }
    public updateConfigFile(filename:string,content:string) {
        let query=this.connector.createUrl("admin/:version/configFile?filename=:filename",null,[
            [":filename",filename]
        ]);
        let options:any=this.connector.getRequestOptions();
        options.responseType='text';
        return this.connector.put<string>(query,content,options);
    }
}

