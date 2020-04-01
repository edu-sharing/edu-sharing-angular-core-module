import {OptionItem} from '../../core-ui-module/option-item';

export class DialogButton {
    public disabled=false;

    public static getOkCancel(cancel : () => void,ok : () => void) : DialogButton[]{
        return [
            new DialogButton("CANCEL",DialogButton.TYPE_CANCEL,cancel),
            new DialogButton("OK",DialogButton.TYPE_PRIMARY,ok),
        ];
    }
    public static getOk(ok : () => void) : DialogButton[]{
        return DialogButton.getSingleButton("OK",ok);
    }
    public static getCancel(cancel : () => void) : DialogButton[]{
        return DialogButton.getSingleButton("CANCEL",cancel,DialogButton.TYPE_CANCEL);
    }
    public static getSingleButton(label:string,ok : () => void,type = DialogButton.TYPE_PRIMARY) : DialogButton[]{
        return [
            new DialogButton(label,type,ok),
        ];
    }
    public static getYesNo(no : () => void,yes : () => void) : DialogButton[]{
        return [
            new DialogButton("NO",DialogButton.TYPE_CANCEL,no),
            new DialogButton("YES",DialogButton.TYPE_PRIMARY,yes),
        ];
    }
    public static getNextCancel(cancel : () => void,next : () => void) : DialogButton[]{
        return [
            new DialogButton("CANCEL",DialogButton.TYPE_CANCEL,cancel),
            new DialogButton("NEXT",DialogButton.TYPE_PRIMARY,next),
        ];
    }
    public static getSaveCancel(cancel : () => void,save : () => void) : DialogButton[]{
        return [
            new DialogButton("CANCEL",DialogButton.TYPE_CANCEL,cancel),
            new DialogButton("SAVE",DialogButton.TYPE_PRIMARY,save),
        ];
    }
    public static fromOptionItem(options: OptionItem[]) {
        if(options == null) {
            return null;
        }
        return options.map((o) => {
            return new DialogButton(o.name,DialogButton.TYPE_PRIMARY,() => o.callback(null));
        });
    }
    public static TYPE_PRIMARY=1;
    public static TYPE_CANCEL=2;
    /**
     * @param name the button name, which is used for the translation
     * @param type the button type, use one of the constants
     * @param callback A function callback when this option is choosen.
     */
    constructor(public name: string,public type : number, public callback: () => void) {
    }
}
