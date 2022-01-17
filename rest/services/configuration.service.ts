import {Injectable} from "@angular/core";
import {Observable, Observer} from "rxjs";
import {RestLocatorService} from "./rest-locator.service";
import {BridgeService} from "../../../core-bridge-module/bridge.service";
import {MessageType} from '../../ui/message-type';
import { ConfigService } from 'ngx-edu-sharing-api';
import { first } from "rxjs/operators";

/**
 Service to get configuration data while running (e.g. loaded extension)
 */
@Injectable()
export class ConfigurationService {
  private data : any=null;

  constructor(
    private bridge: BridgeService,
    private locator: RestLocatorService,
    private configApi: ConfigService,
  ) {
      //this.getAll().subscribe(()=>{});
  }
  public getLocator(){
    return this.locator;
  }

  /**
   * Gets the whole configuration
   * @returns {any}
   */
  public getAll() : Observable<any>{
    return Observable.create( (observer:Observer<any>) => {
      if(this.data) {
        observer.next(this.data);
        observer.complete();
        return;
      }
      // TODO: cleanup. This method used to directly fetch the config from the API. The wrapping and
      // caching is not needed anymore.
      this.configApi.getConfig().pipe(first()).subscribe((data)=>{
        this.data=data;
        this.applyGlobal();
        observer.next(this.data);
        observer.complete();
      },(error)=>{
        // no language available, so use a fixed string
        this.bridge.showTemporaryMessage(MessageType.error, 'Error fetching configuration data. Please contact administrator.\nFehler beim Abrufen der Konfigurationsdaten. Bitte Administrator kontaktieren.', null, null, error);
        console.warn(error)
        this.data = {};
        observer.next(this.data);
        observer.complete();
      });
    });
  }
  public getDynamic(key:string,name:string,defaultValue:any=null){
      return Observable.create( (observer:Observer<any>) => {
          this.locator.getConfigDynamic(key).subscribe((data)=>{
              observer.next(this.instantInternal(name,defaultValue,data));
              observer.complete();
          },(error)=>{
              observer.error(error);
              observer.complete();
          });
      });
  }
  /**
   * Gets a value
   * Example: config.get("extension").subscribe((data)=>console.log(data));
   * Cascaded values can be also resolved by using a "." for seperation
   * E.g. rendering.showMetadata
   * @param name
   * @param defaultValue
   * @returns {any}
   */
  public get(name : string,defaultValue:any = null) : Observable<any>{
    return Observable.create( (observer:Observer<any>) => {
      if(this.data) {
        observer.next(this.instant(name,defaultValue));
        observer.complete();
        return;
      }
      this.getAll().subscribe((data:any)=>{
        observer.next(this.instant(name,defaultValue));
        observer.complete();
      });
    });
  }
  public instantInternal<T>(name:string,defaultValue:T=null,object: any=this.data) : T{
    if(!object)
      return defaultValue;
    let parts=name.split(".");
    if(parts.length>1){
      if(object[parts[0]]) {
        let joined=name.substr(parts[0].length+1);
        return this.instantInternal(joined, defaultValue,object[parts[0]]);
      }
      else{
        return defaultValue;
      }
    }
    if (object[name] != null)
      return object[name];
    return defaultValue;
  }
  /**
   * Like `get`, but assumes that the configuration is already initialized.
   *
   * It is the responsibility of the caller to assure that the configuration is initialized! If you
   * are not sure, use `get` instead.
   */
  public instant<T = string>(name:string,defaultValue:T=null) : T {
    return this.instantInternal(name, defaultValue);
  }

    private applyGlobal() {
        if(document.getElementById('es-custom-css')) {
            return;
        }
        if(this.data.customCSS) {
            const child = document.createElement('style');
            child.id = 'es-custom-css';
            child.innerHTML = this.data.customCSS;
            document.head.appendChild(child);
        }
    }
}
