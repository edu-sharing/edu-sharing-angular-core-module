import { Injectable } from '@angular/core';
import { RestConstants } from '../rest-constants';
import { Observable, Observer } from 'rxjs';
import { RestConnectorService } from './rest-connector.service';
import { AbstractRestService } from './abstract-rest-service';
import { NetworkRepositories, Node, Repository, Service } from '../../core.module';
import { Helper } from '../helper';
import { shareReplay } from 'rxjs/operators';
import { UniversalNode } from '../../../common/definitions';

@Injectable({ providedIn: 'root' })
export class RestNetworkService extends AbstractRestService {
    // FIXME: if methods of this service get called before `currentRepositories` is populated, we
    // will cause errors.
    private static currentRepositories: Repository[];

    private readonly getRepositories_ = new Observable<NetworkRepositories>((observer) => {
        let query = this.connector.createUrl('network/:version/repositories', null);
        return this.connector
            .get<NetworkRepositories>(query, this.connector.getRequestOptions())
            .subscribe(
                (repositories) => {
                    RestNetworkService.currentRepositories = repositories.repositories;
                    observer.next(repositories);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                    observer.complete();
                },
            );
    }).pipe(
        shareReplay(1), // Cache result
    );

    public static supportsImport(repository: string, repositories: Repository[]) {
        if (repositories == null) return false;
        for (let r of repositories) {
            if (r.id == repository) {
                return (
                    r.repositoryType == 'PIXABAY' ||
                    r.repositoryType == 'YOUTUBE' ||
                    r.repositoryType == 'DDB'
                );
            }
        }
        return false;
    }
    static allFromHomeRepo(nodes: Node[], repositories = this.currentRepositories) {
        if (!nodes) return true;
        if (repositories == null) {
            console.warn('repository list is empty, home repo might not be detected');
        }
        for (let node of nodes) {
            if (!node.ref.isHomeRepo && !RestNetworkService.isHomeRepo(node.ref.repo, repositories))
                return false;
        }
        return true;
    }
    static getRepository(node: Node, repositories = this.currentRepositories) {
        if (RestNetworkService.isFromHomeRepo(node, repositories)) {
            return repositories.filter((r) => r.isHomeRepo)[0];
        }
        return repositories.filter((r) => r.id === node.ref.repo)[0];
    }
    static isFromHomeRepo(node: UniversalNode, repositories = this.currentRepositories) {
        if (!node || !node.ref) {
            return false;
        }
        if (node.ref && node.ref.isHomeRepo) {
            return true;
        }
        return RestNetworkService.isHomeRepo(node.ref.repo, repositories);
    }

    static getRepositoryById(id: string, repositories = this.currentRepositories) {
        let i = Helper.indexOfObjectArray(repositories, 'id', id);
        if (id == RestConstants.HOME_REPOSITORY) {
            i = Helper.indexOfObjectArray(repositories, 'isHomeRepo', true);
        }
        if (i == -1) return null;
        return repositories[i];
    }

    static isHomeRepo(repositoryId: string, repositories = this.currentRepositories) {
        if (repositoryId == RestConstants.HOME_REPOSITORY) return true;
        if (!repositories) return false;
        let repository = RestNetworkService.getRepositoryById(repositoryId, repositories);
        if (repository) {
            return repository.isHomeRepo;
        }
        return false;
    }
    constructor(connector: RestConnectorService) {
        super(connector);
    }
    public getRepositories = () => {
        return this.getRepositories_;
    };

    public addService = (jsondata: string): Observable<any> => {
        let query = this.connector.createUrl('network/:version/services', null);
        return this.connector.post<any>(query, jsondata, this.connector.getRequestOptions());
    };

    public getServices = () => {
        let query = this.connector.createUrl('network/:version/services', null);
        return this.connector.get<Service[]>(query, this.connector.getRequestOptions());
    };

    public getStatistics = (url: string) => {
        return this.connector.get<any>(url, this.connector.getRequestOptions(), false);
    };

    /**
     * prepare the remote repos infos to be available in cache for static access
     */
    public prepareCache() {
        this.getRepositories().subscribe(() => {});
    }
}
