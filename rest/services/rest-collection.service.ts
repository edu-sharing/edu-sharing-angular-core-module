import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import {RestConnectorService} from './rest-connector.service';
import {RestHelper} from '../rest-helper';
import {RestConstants} from '../rest-constants';

import * as EduData from '../data-object';
import {
    AbstractList,
    CollectionFeedback,
    CollectionProposalStatus,
    CollectionSubcollections,
    CollectionWrapper, ProposalNode
} from '../data-object';
import {AbstractRestService} from './abstract-rest-service';
import {NodeWrapper} from '../data-object';

@Injectable({providedIn: 'root'})
export class RestCollectionService extends AbstractRestService {
    constructor(connector : RestConnectorService) {
        super(connector);
    }
    public deleteCollection = (collection : string,repository=RestConstants.HOME_REPOSITORY): Observable<void> => {
        const query=this.connector.createUrl('collection/:version/collections/:repository/:collection',repository,[[':collection',collection]]);
        return this.connector.delete(query,this.connector.getRequestOptions());
    }
    public addNodeToCollection = (collection : string,node:string,sourceRepo:string, allowDuplicate = false, asProposal = false,repository=RestConstants.HOME_REPOSITORY) => {
        const query=this.connector.createUrl('collection/:version/collections/:repository/:collection/references/:node?sourceRepo=:sourceRepo&allowDuplicate=:allowDuplicate&asProposal=:asProposal',repository,[
            [':collection',collection],
            [':node',node],
            [':sourceRepo',sourceRepo],
            [':asProposal',''+asProposal],
            [':allowDuplicate',''+allowDuplicate]
        ]);
        return this.connector.put<NodeWrapper>(query,null,this.connector.getRequestOptions());
    }
    public setPinning = (collections : string[],repository=RestConstants.HOME_REPOSITORY): Observable<Response> => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/pinning',repository);
        return this.connector.post(query,JSON.stringify(collections),this.connector.getRequestOptions());
    }
    public setOrder = (collection : string,nodes : string[]=[],repository=RestConstants.HOME_REPOSITORY): Observable<Response> => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/:collection/order',repository,[
            [':collection',collection],
        ]);
        return this.connector.post(query,JSON.stringify(nodes),this.connector.getRequestOptions());
    }
    public getCollection = (collection : string,repository=RestConstants.HOME_REPOSITORY) => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/:collection',repository,[
            [':collection',collection],
        ]);
        return this.connector.get<CollectionWrapper>(query,this.connector.getRequestOptions());
    }
    public search = (
        query='*',
        request:any=null,
        repository=RestConstants.HOME_REPOSITORY
    )=> {
        const http=this.connector.createUrlNoEscape('collection/:version/collections/:repository/search?query=:query&:request',repository,[
            [':query',encodeURIComponent(query)],
            [':request',this.connector.createRequestString(request)]
        ]);
        return this.connector.get<CollectionSubcollections>(http,this.connector.getRequestOptions());
    }


    public getCollectionSubcollections = (
        collection : string,
        scope = RestConstants.COLLECTIONSCOPE_ALL,
        propertyFilter : string[] = [],
        request:any = null,
        repository=RestConstants.HOME_REPOSITORY
    ) => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/:collection/children/collections?scope=:scope&:propertyFilter&:request',repository,[
            [':collection',encodeURIComponent(collection)],
            [':scope',encodeURIComponent(scope)],
            [':request',this.connector.createRequestString(request)],
            [':propertyFilter',RestHelper.getQueryString('propertyFilter',propertyFilter)]
        ]);
        return this.connector.get<EduData.CollectionSubcollections>(query,this.connector.getRequestOptions());
    }
    public getCollectionReferences = (
        collection : string,
        propertyFilter : string[] = [],
        request:any = null,
        repository=RestConstants.HOME_REPOSITORY
    ) => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/:collection/children/references?:propertyFilter&:request',repository,[
            [':collection',encodeURIComponent(collection)],
            [':request',this.connector.createRequestString(request)],
            [':propertyFilter',RestHelper.getQueryString('propertyFilter',propertyFilter)]
        ]);
        return this.connector.get<EduData.CollectionReferences>(query,this.connector.getRequestOptions());
    }
    public getCollectionProposals = (
        collection : string,
        status:CollectionProposalStatus = 'PENDING',
        repository=RestConstants.HOME_REPOSITORY
    ) => {
        const query=this.connector.createUrlNoEscape('collection/:version/collections/:repository/:collection/children/proposals?status=:status',repository,[
            [':collection',encodeURIComponent(collection)],
            [':status',encodeURIComponent(status)],
        ]);
        return this.connector.get<AbstractList<ProposalNode>>(query,this.connector.getRequestOptions());
    }
    public getCollectionMetadata = (collectionId:string, repository=RestConstants.HOME_REPOSITORY) => {
        const query=this.connector.createUrl('collection/:version/collections/:repository/:collectionid',repository,[[':collectionid',collectionId]]);
        return this.connector.get<EduData.Collection>(query,this.connector.getRequestOptions());
    }

    public createCollection = (
        collection:EduData.Node,
        parentCollectionId:string=RestConstants.ROOT, repository:string=RestConstants.HOME_REPOSITORY
    ) => {

        const query:string = this.connector.createUrl('collection/:version/collections/:repository/:collectionid/children',repository,[[':collectionid',parentCollectionId]]);
        const options = this.connector.getRequestOptions();
        return this.connector.post<EduData.CollectionWrapper>(query, JSON.stringify(collection), options);
    }

    public uploadCollectionImage = (collectionId:string, file:File, mimetype:string, repository:string = RestConstants.HOME_REPOSITORY):Observable<XMLHttpRequest> => {

        if(mimetype=='auto')
            mimetype=file.type;
        const query=this.connector.createUrl('collection/:version/collections/:repository/:collectionid/icon?mimetype=:mime',repository,
            [
                [':collectionid',collectionId],
                [':mime',mimetype]
            ]);
        const options=this.connector.getRequestOptions();

        return this.connector.sendDataViaXHR(query,file);
    };

    public deleteCollectionImage = (collectionId:string, repository:string = RestConstants.HOME_REPOSITORY):Observable<XMLHttpRequest> => {
        const query=this.connector.createUrl('collection/:version/collections/:repository/:collectionid/icon',repository,
            [
                [':collectionid',collectionId],
            ]);
        const options=this.connector.getRequestOptions();

        return this.connector.delete(query,options);
    };

    public updateCollection = (collection:EduData.Node) => {

        let repo:string = RestConstants.HOME_REPOSITORY;
        if ((collection.ref.repo!=null) && (collection.ref.repo !== 'local')) {
            repo = collection.ref.repo;
        }
        const query = this.connector.createUrl('collection/:version/collections/:repository/:collectionid',repo,[[':collectionid',collection.ref.id]]);
        const body = JSON.stringify(collection);
        const options = this.connector.getRequestOptions();
        return this.connector.put(query, body, options);

    };

    public removeFromCollection = (referenceId:string, collectionId:string, repository:string = RestConstants.HOME_REPOSITORY) => {

        const query:string = this.connector.createUrl('collection/:version/collections/:repository/:collectionid/references/:refid',repository,[[':collectionid',collectionId],[':refid',referenceId]]);

        return this.connector.delete(query, this.connector.getRequestOptions());
    };


    public addFeedback(collectionId:string,feedbackData:any, repository:string = RestConstants.HOME_REPOSITORY) {
        const query:string = this.connector.createUrl('collection/:version/collections/:repository/:collectionid/feedback',repository,[[':collectionid',collectionId]]);
        return this.connector.post(query, JSON.stringify(feedbackData), this.connector.getRequestOptions());
    };
    public getFeedbacks(collectionId:string, repository:string = RestConstants.HOME_REPOSITORY) {
        const query:string = this.connector.createUrl('collection/:version/collections/:repository/:collectionid/feedback',repository,[[':collectionid',collectionId]]);
        return this.connector.get<CollectionFeedback[]>(query, this.connector.getRequestOptions());
    };
}
