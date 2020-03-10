import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import {RestConnectorService} from './rest-connector.service';
import {RestHelper} from '../rest-helper';
import {RestConstants} from '../rest-constants';
import {
  ArchiveRestore, ArchiveSearch, Node, NodeList, IamGroup, IamGroups, IamAuthorities, GroupProfile,
  IamUsers, IamUser, UserProfile, UserCredentials, UserStatus, Person, User
} from '../data-object';
import {AbstractRestService} from './abstract-rest-service';
import {TemporaryStorageService} from './temporary-storage.service';
import {VCard} from '../../ui/VCard';

@Injectable()
export class RestIamService extends AbstractRestService {
    constructor(connector : RestConnectorService, private storage : TemporaryStorageService) {
        super(connector);
    }

  /**
   * Get's the currently authenticated user object (same as calling getUser)
   * Please note that getUser() has to be called before, otherwise it will return null
   */
  getCurrentUser() : User {
    return this.storage.get(TemporaryStorageService.USER_INFO);
  }

  /**
   * return the current user as vcard
   */
  getCurrentUserVCard() : VCard {
    const vcard = new VCard();
    if(this.getCurrentUser() && this.getCurrentUser().profile) {
      vcard.givenname = this.getCurrentUser().profile.firstName;
      vcard.surname = this.getCurrentUser().profile.lastName;
      vcard.email = this.getCurrentUser().profile.email;
    }
    vcard.uid = this.getCurrentUser() &&
          this.getCurrentUser().properties &&
          this.getCurrentUser().properties[RestConstants.CM_PROP_ESUID] ?
          this.getCurrentUser().properties[RestConstants.CM_PROP_ESUID][0] : null;
    return vcard;
  }
  public searchAuthorities = (pattern='*',global=true,groupType:string='',request : any = null,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrlNoEscape('iam/:version/authorities/:repository?pattern=:pattern&global=:global&groupType=:groupType&:request',repository,[
      [':pattern',encodeURIComponent(pattern)],
      [':global',global+''],
      [':groupType',encodeURIComponent(groupType)],
      [':request',this.connector.createRequestString(request)]
    ]);
    return this.connector.get<IamAuthorities>(query,this.connector.getRequestOptions());
  }
  public searchGroups = (pattern='*',global=true,groupType='',request : any = null,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrlNoEscape('iam/:version/groups/:repository?pattern=:pattern&global=:global&groupType=:groupType&:request',repository,[
      [':pattern',encodeURIComponent(pattern)],
      [':global',global+''],
      [':groupType',encodeURIComponent(groupType)],
      [':request',this.connector.createRequestString(request)]
    ]);
    return this.connector.get<IamGroups>(query,this.connector.getRequestOptions());
  }
  public getGroup = (group : string,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group',repository,[[':group',group]]);
    return this.connector.get<IamGroup>(query,this.connector.getRequestOptions());
  }
  public deleteGroup = (group : string,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group',repository,[[':group',group]]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }
  public createGroup = (group : string,profile : GroupProfile,parent='',repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group?parent=:parent',repository,[
      [':group',group],
      [':parent',parent]
    ]);
    return this.connector.post(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public editGroup = (group : string,profile : GroupProfile,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group/profile',repository,[[':group',group]]);
    return this.connector.put(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public getGroupMembers = (group : string,pattern='',authorityType='',request : any = null,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrlNoEscape('iam/:version/groups/:repository/:group/members/?pattern=:pattern&authorityType=:authorityType&:request',repository,[
      [':group',encodeURIComponent(group)],
      [':pattern',encodeURIComponent(pattern)],
      [':authorityType',encodeURIComponent(authorityType)],
      [':request',this.connector.createRequestString(request)]
    ]);
    return this.connector.get<IamAuthorities>(query,this.connector.getRequestOptions());
  }
  public deleteGroupMember = (group : string,member : string,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group/members/:member',repository,
      [
        [':group',group],
        [':member',member]
      ]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }
  public addGroupMember = (group : string,member : string,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/groups/:repository/:group/members/:member',repository,
      [
        [':group',group],
        [':member',member]
      ]);
    return this.connector.put(query,'',this.connector.getRequestOptions());
  }
  public searchUsers = (pattern='*',global=true,status:string='',request:any=null,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrlNoEscape('iam/:version/people/:repository?pattern=:pattern&global=:global&status=:status&:request',repository,[
      [':pattern',encodeURIComponent(pattern)],
      [':global',global+''],
      [':status',status],
      [':request',this.connector.createRequestString(request)]
    ]);
    return this.connector.get<IamUsers>(query,this.connector.getRequestOptions());
  }
  public updateUserStatus = (user : string,status:string,notify = true,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/status/:status?notify=:notify',repository,[
        [':user',user],
        [':status',status],
        [':notify',''+notify]
    ]);
    return this.connector.put(query,null,this.connector.getRequestOptions());
  }
  public getNodeList = (list : string,request:any=null,user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrlNoEscape('iam/:version/people/:repository/:user/nodeList/:list?:request',repository,
      [
        [':user',encodeURIComponent(user)],
        [':list',encodeURIComponent(list)],
        [':request',this.connector.createRequestString(request)],
      ]);
    return this.connector.get<NodeList>(query,this.connector.getRequestOptions())
  }
  public removeNodeList = (list : string,node:string,user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/nodeList/:list/:node',repository,
      [
        [':user',user],
        [':list',list],
        [':node',node],
      ]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }
  public addNodeList = (list : string,node:string,user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/nodeList/:list/:node',repository,
      [
        [':user',user],
        [':list',list],
        [':node',node],
      ]);
    return this.connector.put(query,null,this.connector.getRequestOptions());
  }
  public getUser = (user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user',repository,[[':user',user]]);
    return this.connector.get<IamUser>(query,this.connector.getRequestOptions()).do((data)=>user===RestConstants.ME ? this.storage.set(TemporaryStorageService.USER_INFO,data.person) : null);
  }
  public getUserGroups = (user=RestConstants.ME,pattern='*',request:any=null,repository=RestConstants.HOME_REPOSITORY) => {
      const query=this.connector.createUrlNoEscape('iam/:version/people/:repository/:user/memberships?pattern=:pattern&:request',repository,[
          [':user',encodeURIComponent(user)],
          [':pattern',encodeURIComponent(pattern)],
          [':request',this.connector.createRequestString(request)]
      ]);
      return this.connector.get<IamGroups>(query,this.connector.getRequestOptions());
  }
  public getUserPreferences = (user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/preferences',repository,[[':user',user]]);
    return this.connector.get<any>(query,this.connector.getRequestOptions())
      .map((response) => JSON.parse(response.preferences));
  }
  public setUserPreferences = (preferences:any,user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/preferences',repository,[[':user',user]]);
    return this.connector.put(query,JSON.stringify(preferences),this.connector.getRequestOptions());
  }
  public removeUserAvatar = (user=RestConstants.ME,repository=RestConstants.HOME_REPOSITORY): Observable<Response> => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/avatar',repository,[[':user',user]]);
    return this.connector.delete(query,this.connector.getRequestOptions());
  }
  public setUserAvatar = (avatar : File,
                          user=RestConstants.ME,
                          repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/avatar',repository,[[':user',user]]);
    return this.connector.sendDataViaXHR(query,avatar,'PUT','avatar');
  }
  public createUser = (user : string,password : string,profile : UserProfile,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/?password=:password',repository,[
      [':user',user],
      [':password',password]
    ]);
    return this.connector.post(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public editUser = (user : string,profile : UserProfile,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/profile',repository,[[':user',user]]);
    return this.connector.put(query,JSON.stringify(profile),this.connector.getRequestOptions());
  }
  public editUserCredentials = (user : string,credentials : UserCredentials,repository=RestConstants.HOME_REPOSITORY) => {
    const query=this.connector.createUrl('iam/:version/people/:repository/:user/credential',repository,[[':user',user]]);
    return this.connector.put(query,JSON.stringify(credentials),this.connector.getRequestOptions());
  }
  public getRecentlyInvited(repository=RestConstants.HOME_REPOSITORY) {
    const query = this.connector.createUrl('iam/:version/authorities/:repository/recent',repository);
    return this.connector.get<IamAuthorities>(query,this.connector.getRequestOptions());
  }
}
