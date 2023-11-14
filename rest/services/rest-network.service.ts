import { Injectable } from '@angular/core';
import { NetworkService } from 'ngx-edu-sharing-api';
import { Observable } from 'rxjs';
import { UniversalNode } from '../definitions';
import { Node, Repository, Service } from '../../core.module';
import { Helper } from '../helper';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';

const shownWarnings: string[] = [];
function consoleWarn(s: string): void {
    if (!shownWarnings.includes(s)) {
        shownWarnings.push(s);
        console.warn(s);
    }
}

@Injectable({ providedIn: 'root' })
/** @deprecated use `NetworkService` from `ngx-edu-sharing-api` instead. */
export class RestNetworkService extends AbstractRestService {
    // FIXME: if methods of this service get called before `currentRepositories` is populated, we
    // will cause errors.
    private static currentRepositories: Repository[];

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
            consoleWarn('repository list is empty, home repo might not be detected');
        }
        for (let node of nodes) {
            if (!RestNetworkService.isHomeRepo(node.ref.repo, repositories)) return false;
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

    private _repositories = this.networkApi.getRepositories();

    constructor(connector: RestConnectorService, private networkApi: NetworkService) {
        super(connector);
    }

    init() {
        this._repositories.subscribe((repositories) => {
            RestNetworkService.currentRepositories = repositories;
        });
    }

    public getRepositories = () => {
        return this._repositories;
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
