import {ElementRef} from '@angular/core';

export class KeyEvents{
    public static eventFromInputField(event:any) {
        return event.srcElement && (event.srcElement.minLength || event.srcElement.maxLength);
    }
    static isChildEvent(event: Event, parent: ElementRef<Element>) {
        let target: HTMLElement = event?.target as HTMLElement;
        while(target) {
            if(target === parent.nativeElement) {
                return true;
            }
            target = target.parentElement;
        }
        return false;
    }
}
