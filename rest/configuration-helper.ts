/**
 * Different helper functions, may be used globally
 */

import { MdsInfo, Repository } from './data-object';
import { RestConstants } from './rest-constants';
import { ConfigService, MdsService } from 'ngx-edu-sharing-api';
import { NodePersonNamePipe } from 'ngx-edu-sharing-ui';
import { take } from 'rxjs/operators';

export class ConfigurationHelper {
    public static getBanner(config: ConfigService) {
        let banner = config.instant<any>('banner');
        if (!banner) banner = {};
        if (!banner.components || !banner.components.length) banner.components = ['search'];
        return banner;
    }
    public static hasMenuButton(config: ConfigService, button: string): boolean {
        let hide = config.instant('hideMainMenu');
        if (!hide) return true;
        // if button was not found in hide -> it has the menu button
        return hide.indexOf(button) == -1;
    }
    static getPersonWithConfigDisplayName(person: any, config: ConfigService) {
        return new NodePersonNamePipe(config).transform(person);
    }
    public static async getAvailableMds(
        repository: string | Repository,
        mds: MdsService,
        config: ConfigService,
    ) {
        const metadatasets = await mds.getAvailableMetadataSets().toPromise();
        await config.observeConfig().pipe(take(1)).toPromise();
        let validMds = config.instant<any>('availableMds');
        if (validMds && validMds.length) {
            for (let mds of validMds) {
                if (
                    !(
                        mds.repository == repository ||
                        mds.repository == (repository as Repository).id ||
                        (mds.repository == RestConstants.HOME_REPOSITORY &&
                            (repository == RestConstants.HOME_REPOSITORY ||
                                (repository as Repository).isHomeRepo))
                    )
                ) {
                    continue;
                }
                // no metadatasets provided (happens for "all" search -> simply return the allowed list)
                if (metadatasets == null) {
                    return mds.mds;
                }
                for (let i = 0; i < metadatasets.length; i++) {
                    if (mds.mds.indexOf(metadatasets[i].id) == -1) {
                        metadatasets.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        return metadatasets;
    }

    /**
     * @deprecated use getAvailableMds instead
     * @param repository
     * @param metadatasets
     * @param config
     */
    public static filterValidMds(
        repository: string | Repository,
        metadatasets: MdsInfo[],
        config: ConfigService,
    ) {
        let validMds = config.instant<any>('availableMds');
        if (validMds && validMds.length) {
            for (let mds of validMds) {
                if (
                    !(
                        mds.repository == repository ||
                        mds.repository == (repository as Repository).id ||
                        (mds.repository == RestConstants.HOME_REPOSITORY &&
                            (repository == RestConstants.HOME_REPOSITORY ||
                                (repository as Repository).isHomeRepo))
                    )
                ) {
                    continue;
                }
                // no metadatasets provided (happens for "all" search -> simply return the allowed list)
                if (metadatasets == null) {
                    return mds.mds;
                }
                for (let i = 0; i < metadatasets.length; i++) {
                    if (mds.mds.indexOf(metadatasets[i].id) == -1) {
                        metadatasets.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        return metadatasets;
    }
    public static filterValidRepositories(
        repositories: Repository[],
        config: ConfigService,
        onlyLocal: boolean,
    ) {
        let validRepositories = config.instant<string[]>('availableRepositories');
        if (validRepositories && validRepositories.length) {
            for (let i = 0; i < repositories.length; i++) {
                if (
                    validRepositories.indexOf(RestConstants.HOME_REPOSITORY) != -1 &&
                    repositories[i].isHomeRepo
                )
                    continue;
                if (validRepositories.indexOf(repositories[i].id) == -1) {
                    repositories.splice(i, 1);
                    i--;
                }
            }
        }
        if (onlyLocal) {
            for (let i = 0; i < repositories.length; i++) {
                if (!repositories[i].isHomeRepo) {
                    repositories.splice(i, 1);
                    i--;
                }
            }
        }
        return repositories;
    }
}
