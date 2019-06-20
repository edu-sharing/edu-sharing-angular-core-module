import {RestConstants} from "./rest-constants";
import {ListItem} from "../ui/list-item";
import {RestConnectorService} from "./services/rest-connector.service";

export class MdsHelper{
    static getSortInfo(mdsSet: any, name: string) {
        if(mdsSet) {
            if (mdsSet.sorts) {
                for (let list of mdsSet.sorts) {
                    if (list.id == name) {
                        return list;
                    }
                }
             }
            console.error('mds does not define sort info for ' + name + ', invalid configuration!');
        }
        return null;
    }
  static getColumns(mdsSet: any, name: string) {
    let columns:ListItem[]=[];
    if(mdsSet) {
      for (let list of mdsSet.lists) {
        if (list.id == name) {
          for (let column of list.columns) {
            let item = new ListItem("NODE", column.id);
            item.format = column.format;
            columns.push(item);
          }
          return columns;
        }
      }
      console.warn('mds does not define columns for ' + name + ', invalid configuration!');
    }
    if(name=='search' || name=='collectionReferences') {
      columns.push(new ListItem("NODE", RestConstants.CM_PROP_TITLE));
      columns.push(new ListItem("NODE", RestConstants.CM_MODIFIED_DATE));
      columns.push(new ListItem("NODE", RestConstants.CCM_PROP_LICENSE));
      columns.push(new ListItem("NODE", RestConstants.CCM_PROP_REPLICATIONSOURCE));
    }
    return columns;
  }

    /**
     * Finds the appropriate widget with the id, but will not check any widget conditions
     * @param cid
     * @param template
     * @param widgets
     */
    static getWidget(cid: string,template:string=null,widgets:any) {
        for(let w of widgets){
            if(w.id==cid){
                if((template==null || w.template==template)){
                    return w;
                }
            }
        }
        return null;
    }

    /**
     * Same as getWidget, but will also check the widget conditions
     * @param connector
     * @param properties
     * @param id
     * @param template
     * @param widgets
     */
    static getWidgetWithCondition(connector:RestConnectorService,properties:any,id: string,template:string=null,widgets:any) {
        for(let w of widgets){
            if(w.id==id){
                if((template==null || w.template==template) && this.isWidgetConditionTrue(connector,w,properties)){
                    return w;
                }
            }
        }
        return null;
    }
    static isWidgetConditionTrue(connector:RestConnectorService,widget:any,properties:any){
        if(!widget.condition)
            return true;
        let condition=widget.condition;
        console.log('condition:');
        console.log(condition);
        if(condition.type=='PROPERTY' && properties) {
            if (!properties[condition.value] && !condition.negate || properties[condition.value] && condition.negate) {
                return false;
            }
        }
        if(condition.type=='TOOLPERMISSION'){
            let tp=connector.hasToolPermissionInstant(condition.value);
            if(tp==condition.negate){
                return false;
            }
        }
        console.log('condition is true, will display widget');
        return true;
    }
}
