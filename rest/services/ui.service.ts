import {Injectable, NgZone} from "@angular/core";
import {BridgeService} from "../../../core-bridge-module/bridge.service";
import {HttpClient} from "@angular/common/http";
import {RestConnectorService} from "./rest-connector.service";
import {Observable, Observer} from "rxjs";
import {RestConstants} from "../rest-constants";
import {MessageType} from "../../ui/message-type";

@Injectable()
export class UIService {
  /** Returns true if the current sessions seems to be running on a mobile device
   *
   */
  public isMobile(){
    if(this.bridge.isRunningCordova())
      return true;
    // http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
      return true;
    }
    else {
      return false;
    }

  }
  private appleCmd: boolean;
  private shiftCmd: boolean;
  public isAppleCmd() {
    return this.appleCmd;
  }
  public isShiftCmd() {
    return this.shiftCmd;
  }
  constructor(
      private bridge : BridgeService,
      private ngZone : NgZone,
      private http: HttpClient,
      private connector: RestConnectorService,
  ) {
    // HostListener not working, so use window
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('keydown', (event) => {
        if (event.key == 'Shift') {
          this.shiftCmd = true;
        }
        if (event.keyCode == 91 || event.keyCode == 93) {
          this.appleCmd = true;
          event.preventDefault();
          event.stopPropagation();
        }
      });
      window.addEventListener('keyup', (event) => {
        if (event.keyCode == 91 || event.keyCode == 93)
          this.appleCmd = false;
        if (event.key == 'Shift') {
          this.shiftCmd = false;
        }
      });
    });
  }

  /**
   * waits until the given component/object is not null and available
   * @param clz the class where the component is attached (usually "this")
   * @param componentName The name of the property
   */
  waitForComponent(clz: any, componentName: string) {
    return new Observable((observer: Observer<any>) => {
      this.ngZone.runOutsideAngular(() => {
        const interval = setInterval(() => {
          if (clz[componentName]) {
            observer.next(clz[componentName]);
            observer.complete();
            clearInterval(interval);
          } else if (!clz) {
            clearInterval(interval);
          }
        }, 1000 / 60);
      });
    });
  }


  hideKeyboardIfMobile() {
    if(this.isMobile()) {
      try {
        (document.activeElement as any).blur();
      }catch(e){console.warn(e);}
    }
  }
  public handleLogout() {
    return new Observable<void>((observer: Observer<void>) => {

      this.connector.getConfigurationService().getAll().subscribe((config) => {
        if (this.bridge.isRunningCordova()) {
          this.connector.logout().subscribe(() => {
            this.bridge.getCordova().restartCordova();
          });
          return;
        }
        if (config.logout) {
          const sessionData = this.connector.getCurrentLogin();
          if (config.logout.ajax) {
            this.http.get(config.logout.url).subscribe(
                () => {
                  if (config.logout.destroySession) {
                    this.connector.logout().subscribe(response => {
                      observer.next();
                      observer.complete();
                    });
                    return;
                  }
                  observer.next();
                  observer.complete();
                },
                (error: any) => {
                  this.bridge.showTemporaryMessage(MessageType.error, null, null, null, error);
                },
            );
          } else {
            if (config.logout.destroySession) {
              this.connector.logout().subscribe(response => {
                if (
                    sessionData.currentScope ===
                    RestConstants.SAFE_SCOPE
                ) {
                  observer.next();
                  observer.complete();
                } else {
                  window.location.href = config.logout.url;
                }
              });
            } else {
              if (sessionData.currentScope === RestConstants.SAFE_SCOPE) {
                observer.next();
                observer.complete();
              } else {
                window.location.href = config.logout.url;
              }
            }
          }
        } else {
          this.connector.logout().subscribe(response => {
            observer.next();
            observer.complete();
          });
        }
      });
    });
  }
}
