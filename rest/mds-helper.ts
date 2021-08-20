import {RestConstants} from "./rest-constants";
import {ListItem, ListItemType} from '../ui/list-item';
import {RestConnectorService} from "./services/rest-connector.service";
import {Collection, Mds, Sort} from './data-object';
import {TranslateService} from '@ngx-translate/core';
import {MdsDefinition, MdsWidget, MdsWidgetValue, Values} from '../../common/ui/mds-editor/types';
import {Widget} from '../../common/ui/mds-editor/mds-editor-instance.service';

export class MdsHelper{
    static getSortInfo(mdsSet: Mds|MdsDefinition, name: string): Sort{
        if(mdsSet) {
            if (mdsSet.sorts) {
                for (const list of mdsSet.sorts) {
                    if (list.id == name) {
                        return list;
                    }
                }
             }
            console.error('mds does not define sort info for ' + name + ', invalid configuration!');
        }
        return null;
    }
  static getColumns(translate: TranslateService, mdsSet: any, name: string) {
    let columns:ListItem[]=[];
    if(mdsSet) {
      for (const list of mdsSet.lists) {
        if (list.id === name) {
          for (const column of list.columns) {
            let type: ListItemType = 'NODE';
            if(name === 'mediacenterGroups') {
                type = 'GROUP';
            }
            const item = new ListItem(type, column.id);
            item.format = column.format;
            columns.push(item);
          }
          break;
        }
      }
    }
    if(!columns.length) {
        console.warn('mds does not define columns for ' + name + ', invalid configuration!');
        if (name === 'search' || name === 'collectionReferences') {
            columns.push(new ListItem("NODE", RestConstants.LOM_PROP_TITLE));
            columns.push(new ListItem("NODE", RestConstants.CM_MODIFIED_DATE));
            columns.push(new ListItem("NODE", RestConstants.CCM_PROP_LICENSE));
            columns.push(new ListItem("NODE", RestConstants.CCM_PROP_REPLICATIONSOURCE));
        } else if (name === 'mediacenterManaged') {
            columns.push(new ListItem("NODE", RestConstants.LOM_PROP_TITLE));
            columns.push(new ListItem("NODE", RestConstants.CCM_PROP_REPLICATIONSOURCEID));
            columns.push(new ListItem("NODE", RestConstants.CCM_PROP_REPLICATIONSOURCE));
        } else if (name === 'mediacenterGroups') {
            columns.push(new ListItem('GROUP', RestConstants.AUTHORITY_DISPLAYNAME));
            columns.push(new ListItem('GROUP', RestConstants.AUTHORITY_GROUPTYPE));
        }
    }
      columns.map((c) => {
          const key = c.type + '.' +c.name;
          if(c.type === 'NODE' && translate.instant(key) === key) {
              c.label = mdsSet.widgets.filter((w: any) => w.id === c.name)?.[0]?.caption;
          }
          return c;
      });
    return columns;
  }

    /**
     * Finds the appropriate widget with the id, but will not check any widget conditions
     * @param cid
     * @param template
     * @param widgets
     */
    static getWidget(cid: string,template:string=null,widgets:MdsWidget[]) {
        if(widgets == null) {
            console.warn('Could not iterate widget '+cid+': no widgets data provided');
            return null;
        }
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
        return true;
    }
    /**
     * Find a template by id in the given mds
     */
    static findTemplate(mds: Mds|MdsDefinition, id: string) {
       return mds.views.find((v) => v.id === id);
    }
    /**
     * Returns all widgets used by the given template
     */
    static getUsedWidgets(mds: Mds|MdsDefinition, template:string=null): any[] {
        const used: any = [];
        const templateData = MdsHelper.findTemplate(mds, template);
        for(const w of mds.widgets) {
            if(templateData.html.indexOf('<' + w.id) !== -1 && !used.find((w2: any) => w2.id === w.id)){
                used.push(w);
            }
        }
        return used;
    }
}
