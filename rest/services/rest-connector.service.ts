import {EventEmitter, Injectable, NgZone} from '@angular/core';
import {RestConstants} from '../rest-constants';
import {RestHelper} from '../rest-helper';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import {RequestObject} from '../request-object';
import {OAuthResult, LoginResult, AccessScope, About} from '../data-object';
import {Router, ActivatedRoute} from '@angular/router';
import {RestLocatorService} from './rest-locator.service';
import {HttpClient} from '@angular/common/http';
import {ConfigurationService} from "./configuration.service";
import {FrameEventsService} from "./frame-events.service";
import {TemporaryStorageService} from "./temporary-storage.service";
import {BridgeService} from "../../../core-bridge-module/bridge.service";
import {DialogButton} from "../../ui/dialog-button";

/**
 * The main connector. Manages the API Endpoint as well as common api parameters and url generation
 * Use this service to setup your REST Service Connection.
 * NO NOT USE this service to directly perform requests; Use the proper Rest Services for the endpoints instead
 */
@Injectable()
export class RestConnectorService {
  private static DEFAULT_NUMBER_PER_REQUEST = 25;
  private _lastActionTime=0;
  private _currentRequestCount=0;
  private _logoutTimeout: number;
  private _autoLogin = true;
  public _scope: string;
  private toolPermissions: string[];
  private themesUrl="../themes/default/";
  currentLogin = new BehaviorSubject<LoginResult>(null);
  isValidatingSession = false;

  get autoLogin(): boolean {
    return this._autoLogin;
  }

  set scope(value: string) {
    this._scope = value;
  }
  get scope(): string {
    return this._scope;
  }

  set autoLogin(value: boolean) {
    this._autoLogin = value;
  }
  get endpointUrl(): string {
    return this.locator.endpointUrl;
  }
  get numberPerRequest(): number {
    return this.locator.numberPerRequest;
  }

  set numberPerRequest(value: number) {
    this.locator.numberPerRequest=value;
  }
  get lastActionTime(){
    return this._lastActionTime;
  }
  get logoutTimeout(){
    return this._logoutTimeout;
  }
  public getRequestOptions(contentType="application/json",username:string = null,password:string = null){
    return this.locator.getRequestOptions(contentType,username,password);
  }
  constructor(private router:Router,
              private http : HttpClient,
              private ngZone : NgZone,
              private config: ConfigurationService,
              private locator: RestLocatorService,
              private bridge: BridgeService,
              private storage : TemporaryStorageService,
              private event:FrameEventsService) {
    this.numberPerRequest=RestConnectorService.DEFAULT_NUMBER_PER_REQUEST;
    event.addListener(this);
  }
  public getBridgeService(){
    return this.bridge;
  }
  public getConfigurationService(){
      return this.config;
  }
  public getLocatorService(){
    return this.locator;
  }
  public onEvent(event:string,request:any){
    if(event==FrameEventsService.EVENT_UPDATE_SESSION_TIMEOUT) {
      this._lastActionTime=new Date().getTime();
    }
    if(event==FrameEventsService.EVENT_PARENT_REST_REQUEST){
      let method=request.method ? request.method.toLowerCase() : "get";
      let path=request.path;
      let body=request.body;
      if(method=='get'){
        this.get(path,this.getRequestOptions()).subscribe((data:any)=>{
          this.notifyFrame(data,request,true);
        },(error:any)=>this.notifyFrame(error,request,false));
      }
    }
  }


  public getOAuthToken(){
  let url=this.createUrl("../oauth2/token",null);
  //"grant_type=password&client_id=eduApp&client_secret=secret&username=admin&password=admin"
  return new Observable<OAuthResult>((observer : Observer<OAuthResult>)=>{
    this.post<OAuthResult>(url,"client_id=eduApp&grant_type=client_credentials&client_secret=secret"
      //"&username="+encodeURIComponent(username)+
      //"&password="+encodeURIComponent(password)
      ,this.getRequestOptions("application/x-www-form-urlencoded")).subscribe(
      (data) => {
        observer.next(data);
        observer.complete();
      },
      (error:any) =>{
        observer.error(error);
        observer.complete();
      });
  });

}
  public logout() {
    let url=this.createUrl("authentication/:version/destroySession",null);
    return this.get(url,this.getRequestOptions()).do(()=> {
        this.currentLogin.next(null);
        this._scope = null;
        this.event.broadcastEvent(FrameEventsService.EVENT_USER_LOGGED_OUT)
    });
  }
  public logoutSync() : any{
    let url=this.createUrl("authentication/:version/destroySession",null);
    let xhr = new XMLHttpRequest();
    let options=this.getRequestOptions("");
    xhr.withCredentials=options.withCredentials;
    xhr.open("GET",this.endpointUrl+url,false);
    let result=xhr.send();
    this._scope = null;
    this.currentLogin.next(null);
    this.event.broadcastEvent(FrameEventsService.EVENT_USER_LOGGED_OUT);
    return result;
  }
  public getCurrentLogin() : LoginResult{
    return this.currentLogin.hasError ? null : this.currentLogin.value;
  }
  public getAbout(){
      let url=this.createUrl("_about",null);
      return this.get<About>(url,this.getRequestOptions());
  }
  public isLoggedIn(forceRenew = true){
      console.log('isLoggedIn');
    const url = this.createUrl("authentication/:version/validateSession",null);
    return new Observable<LoginResult>((observer : Observer<LoginResult>)=> {
        if(!forceRenew) {
            if(!this.isValidatingSession && this.currentLogin.value) {
                observer.next(this.currentLogin.value);
                observer.complete();
                return;
            }
        }
        if(this.isValidatingSession) {
            this.currentLogin.filter((result) => result != null).first().subscribe((result) => {
                observer.next(result);
                observer.complete();
            }, error => {
                observer.error(error);
                observer.complete();
            });
            return;
            }
        this.isValidatingSession = true;
        this.locator.locateApi().subscribe(() => {
            console.log('result');
            this.get<LoginResult>(url, this.getRequestOptions()).subscribe(
                (data: LoginResult) => {
                    this.isValidatingSession = false;
                    this.toolPermissions = data.toolPermissions;
                    this.event.broadcastEvent(FrameEventsService.EVENT_UPDATE_LOGIN_STATE, data);
                    this.currentLogin.next(data);
                    this._logoutTimeout = data.sessionTimeout;
                    if(data.statusCode!=RestConstants.STATUS_CODE_OK && this.bridge.isRunningCordova()){
                      this.bridge.getCordova().reinitStatus(this.locator.endpointUrl,false).subscribe(()=>{
                        this.isLoggedIn().subscribe((data:LoginResult)=>{
                                this.currentLogin.next(data);
                                observer.next(data);
                                observer.complete();
                            },(error:any)=>{
                            observer.error(error);
                            observer.complete();
                            });
                      },(error:any)=>{
                          observer.error(error);
                          observer.complete();
                      });
                      return;
                    }
                    this.isValidatingSession = false;
                    observer.next(data);
                    observer.complete();
                },
                (error: any) => {
                    console.error('validateSession failed', error);
                    this.isValidatingSession = false;
                    this.currentLogin.error(error);
                    this.bridge.showError(error);
                    observer.error(error);
                    observer.complete();
                }
            );
        });
    });
  }
  public hasAccessToScope(scope:string) {
    let url=this.createUrl("authentication/:version/hasAccessToScope/?scope=:scope",null,[[":scope",scope]]);
    return this.get<AccessScope>(url,this.getRequestOptions());
  }
  public hasToolPermissionInstant(permission:string){
    if(this.toolPermissions)
      return this.toolPermissions.indexOf(permission) != -1;
    return false;
  }
  public prepareToolpermissions(){
    return this.hasToolPermission(null);
  }
  public hasToolPermission(permission:string){
    return new Observable<boolean>((observer : Observer<boolean>) => {
      if (this.toolPermissions == null) {
        this.isLoggedIn(false).subscribe(() => {
          observer.next(this.hasToolPermissionInstant(permission));
          observer.complete();
        }, (error: any) => observer.error(error));
      }
      else{
        observer.next(this.hasToolPermissionInstant(permission));
        observer.complete();
      }
    });
  }
  public login(username:string,password:string,scope:string=null){

    let url = this.createUrl("authentication/:version/validateSession", null);
    if(scope) {
      url = this.createUrl("authentication/:version/loginToScope", null);
    }
    return new Observable<LoginResult>((observer)=>{
      if(scope){
        this.post<LoginResult>(url,JSON.stringify({
          userName:username,
          password:password,
          scope:scope
        }),this.getRequestOptions()).subscribe(
          (data) => {
            this.currentLogin.next(data);
            if(data.isValidLogin) {
                this.event.broadcastEvent(FrameEventsService.EVENT_USER_LOGGED_IN, data);
            }
            observer.next(data);
            observer.complete();
          },
          (error:any) =>{
            observer.error(error);
            observer.complete();
          });
      }
      else {
        this.get<LoginResult>(url, this.getRequestOptions("",username,password)).subscribe(
          (data) => {
            this.currentLogin.next(data);
            if(data.isValidLogin) {
                this.event.broadcastEvent(FrameEventsService.EVENT_USER_LOGGED_IN, data);
            }
            observer.next(data);
            observer.complete();
          },
          (error: any) => {

            observer.error(error);
            observer.complete();
          });
      }
    });

  }
  public createRequestString(request : RequestObject){
    let str="skipCount="+(request && request.offset ? request.offset : 0)+
      "&maxItems="+(request && request.count!=null ?  request.count : this.numberPerRequest);
    if(request==null)
      return str;
    str+="&"+RestHelper.getQueryString("sortProperties",request && request.sortBy!=null ? request.sortBy : RestConstants.DEFAULT_SORT_CRITERIA);

    if(request.sortAscending!=null && request.sortAscending.length>1)
      str+="&"+RestHelper.getQueryString("sortAscending",request.sortAscending);
    else
      str+="&sortAscending="+(request && request.sortAscending!=null ? request.sortAscending : RestConstants.DEFAULT_SORT_ASCENDING);

    str+="&"+RestHelper.getQueryString("propertyFilter",request && request.propertyFilter!=null ? request.propertyFilter : []);
    return str;
  }
  /**
   * Replaces jokers inside the url and espaces them. The default joker :version and :repository is always replaced!
   * @param url
   * @param repository the repo name
   * @param urlParams An array of params First value is the search joker, second the replace value
   * The search value may ends with |noescape. E.g. :sort|noescape. This tells the method to not escape the value content
   * @returns {string}
   */
  public createUrl(url : string,repository : string,urlParams : string[][] = []) {
    return RestLocatorService.createUrl(url,repository,urlParams);
  }


  /**
   * Same as createUrl, but does not escape the params. Escaping needs to be done when calling the method
   * @param url
   * @param repository
   * @param urlParams
   * @returns {string}
   */
  public createUrlNoEscape(url : string,repository : string,urlParams : string[][] = []) {
    return RestLocatorService.createUrlNoEscape(url,repository,urlParams);
  }

  public sendDataViaXHR(url : string,file : File,method='POST',fieldName='file',onProgress:Function=null) : Observable<XMLHttpRequest>{
    return Observable.create( (observer:Observer<XMLHttpRequest>) => {
      try {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if(onProgress)
              onProgress({progress:1});
            if (xhr.status === 200) {
              observer.next(xhr);
              observer.complete();
            } else {
              console.error(xhr);
              observer.error(xhr);
            }
          }
        };
        let options:any=this.getRequestOptions("");
        xhr.withCredentials=options.withCredentials;
        xhr.open(method, this.endpointUrl+url, true);
        for (let key in options.headers) {
           xhr.setRequestHeader(key, options.headers[key]);
        }
        let formData = new FormData();
        if(file) {
            formData.append(fieldName, file, file.name);
        }
        let progress:any={start:new Date().getTime()};
        xhr.upload.addEventListener("progress",(event:any)=>{
          if (event.lengthComputable) {
            progress.progress=event.loaded / event.total;
            progress.loaded=event.loaded;
            progress.total=event.total;
            progress.elapsed=(new Date().getTime()-progress.start)/1000;
            progress.remaining=(event.total-event.loaded) * progress.elapsed / event.loaded;
            if (onProgress)
              onProgress(progress);
          }
        });
        xhr.send(formData);
      }catch(e){
        console.error(e);
        observer.error(e);
      }
    });
  }
  private request<T>(method:string,url:string,body:any,options:any,appendUrl=true){
      return new Observable<T>((observer : Observer<T>) => {
          this.locator.locateApi().subscribe(data => {
              this._lastActionTime=new Date().getTime();
              this._currentRequestCount++;
              let requestUrl=(appendUrl ? this.endpointUrl : '') + url;
              let call=null;
              if(method=='GET'){
                call=this.http.get<T>(requestUrl, options);
              }
              else if(method=='POST'){
                  call=this.http.post<T>(requestUrl,body, options);
              }
              else if(method=='PUT'){
                  call=this.http.put<T>(requestUrl,body, options);
              }
              else if(method=='DELETE'){
                  call=this.http.delete<T>(requestUrl, options);
              }
              else{
                throw new Error("Unknown request method "+method);
              }
              call.subscribe((response:any) => {
                      this._currentRequestCount--;
                      this.checkHeaders(response);
                      observer.next(response.body);
                      observer.complete();
                  },
                  error => {
                      this._currentRequestCount--;

                      if (!this._autoLogin) {

                      }else if (error.status === RestConstants.HTTP_UNAUTHORIZED || (
                          error.status === RestConstants.HTTP_FORBIDDEN && ['POST','PUT','DELETE'].indexOf(method) !== -1)) {
                          let callback=() => {
                              if(this.bridge.isRunningCordova() && options.headers['Authorization']){
                                  this.bridge.getCordova().reinitStatus(this.locator.endpointUrl,true).subscribe(()=>{
                                      options.headers['Authorization']='Bearer '+this.bridge.getCordova().oauth.access_token;
                                      this.request<T>(method,url,body,options,appendUrl).subscribe(data=>{
                                          observer.next(data);
                                          observer.complete();
                                      },(error:any)=>{
                                          this.goToLogin();
                                          observer.error(error);
                                          observer.complete();
                                      });
                                  });
                                  return;
                              }
                              else if(!requestUrl.endsWith('iam/v1/people/-home-/-me-')) {
                                  this.goToLogin();
                              }
                          };
                          if(error.status === RestConstants.HTTP_FORBIDDEN){
                              this.isLoggedIn(true).subscribe((result) => {
                                  if(result.statusCode !== RestConstants.STATUS_CODE_OK){
                                      console.log('forbidden request and user session is lost -> go to login');
                                      callback();
                                  } else {
                                      // login is okay, person has no access, throw error
                                      observer.error(error);
                                      observer.complete();
                                  }
                              });
                              return;
                          } else {
                              callback();
                          }

                      }
                      if (this.bridge.isRunningCordova() && error.status==0){
                          this.noConnectionDialog();
                          observer.complete();
                          return;
                      }


                      observer.error(error);
                      observer.complete();
                  });
          });
      });
  }

    noConnectionDialog(): any {
      let buttons=[];
      buttons.push(new DialogButton('LOGIN_APP.NOTINTERNET_RETRY',DialogButton.TYPE_PRIMARY,()=>{
          //RouterHelper.navigateToAbsoluteUrl(this.platformLocation,this.router,window.location.href,true);
          this.isLoggedIn().subscribe(()=>{
              window.location.reload();
          });
      }));
      if(this.bridge.isRunningCordova() && this.bridge.getCordova().isAndroid()) {
          buttons.push(new DialogButton('LOGIN_APP.NOTINTERNET_EXIT', DialogButton.TYPE_CANCEL, () => {
              this.bridge.getCordova().exitApp();
          }));
      }
      this.bridge.showModalDialog({
          title: 'LOGIN_APP.NOTINTERNET',
          message: 'LOGIN_APP.NOTINTERNET_TEXT',
          buttons,
          isCancelable: this.bridge.getCordova().isAndroid(),
          onCancel: () => this.bridge.getCordova().exitApp()
      });
    }

  public get<T>(url:string,options:any,appendUrl=true) : Observable<T>{
    return this.request('GET',url,null,options,appendUrl);
  }
  public post<T>(url:string,body : any,options:any) : Observable<T>{
    return this.request('POST',url,body,options);
  }
  public put<T>(url:string,body : any,options:any) : Observable<T>{
      return this.request('PUT',url,body,options);
  }
  public delete<T>(url:string,options:any) : Observable<T>{
      return this.request('DELETE',url,null,options);
  }

  /**
   * returns how much requests are currently not answered (waiting for response)
   */
  public getCurrentRequestCount(){
    return this._currentRequestCount;
  }

  /**
   * Fires the observer as soon as all requests are done
   * @returns {Observable<void>|"../../../Observable".Observable<void>|"../../Observable".Observable<void>}
   */
  public onAllRequestsReady() : Observable<void> {
    return new Observable<void>((observer : Observer<void>) => {
      this.onAllRequestsReadyObserver(observer);
    });
  }
  private onAllRequestsReadyObserver(observer:Observer<void>){
      this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
              if (this._currentRequestCount > 0) {
                  this.onAllRequestsReadyObserver(observer);
              } else {
                  observer.next(null);
                  observer.complete();
              }
          }, 50);
      });
  }

  /**
   * Returns the current api version (usually a value > 1, can be floating point), or -1 if no api is connected
   * @returns {number}
   */
  public getApiVersion(){
    return this.locator.apiVersion;
  }

  /**
   * Returns the absolute url to the current rest endpoint
   * @returns {string}
   */
  public getAbsoluteEndpointUrl() {
    if(this.endpointUrl.toLowerCase().startsWith("http://") || this.endpointUrl.toLowerCase().startsWith("https://"))
      return this.endpointUrl;
    let baseURL = location.protocol + "//" + location.hostname + (location.port && ":" + location.port);
    if (document.getElementsByTagName('base').length > 0) {
      baseURL = document.getElementsByTagName('base')[0].href;
    }
    if(!baseURL.endsWith("/"))
      baseURL+="/";
    return baseURL+this.endpointUrl;
  }
  /**
   * returns the absolute url to the current edu-sharing instance, e.g. http://localhost/
   * It will NOT include /edu-sharing !
  */
  public getAbsoluteServerUrl(){
    return this.getUrlClipped(3);
  }
  /**
   * returns the absolute url to the current edu-sharing instance, e.g. http://localhost/edu-sharing/
   * It will include /edu-sharing !
   */
  public getAbsoluteEdusharingUrl(){
    return this.getUrlClipped(2);
  }

  private getUrlClipped(clip:number) {
    let url = this.getAbsoluteEndpointUrl();
    let split = url.split("/");
    split.splice(split.length - clip, clip);
    return split.join('/') + '/';
  }

  private notifyFrame(data: any,request:any, success : boolean) {
    let result={request:request,response:data,success:success};
    this.event.broadcastEvent(FrameEventsService.EVENT_REST_RESPONSE,result);
  }

  public setRoute(route: ActivatedRoute) {
    return this.locator.setRoute(route);
  }

  private checkHeaders(response: Response) {
    if(!this._scope)
      return;
    const headerScope = response.headers.get('X-Edu-Scope') || response.headers.get('x-edu-scope');
    if(this._scope !== headerScope) {
      this.goToLogin(null);
      console.warn('current scope ' + this._scope + ' != ' + headerScope + ' enforcing re-login', response.url);
    }
  }
  private goToLogin(scope=this._scope) {
    if(this.currentPageIsLogin())
      return;
    RestHelper.goToLogin(this.router,this.config,scope);
    //this.router.navigate([UIConstants.ROUTER_PREFIX+"login"],{queryParams:{scope:scope?scope:"",next:window.location}});
  }

  private currentPageIsLogin() {
    return window.location.href.indexOf("components/login")!=-1;
  }
  public getThemeMimeIconSvg(name:string){
    return this.getAbsoluteEndpointUrl()+this.themesUrl+"images/common/mime-types/svg/"+name;
  }
  public getThemeMimePreview(name:string){
    return this.getAbsoluteEndpointUrl()+this.themesUrl+"images/common/mime-types/previews/"+name;
  }


}
