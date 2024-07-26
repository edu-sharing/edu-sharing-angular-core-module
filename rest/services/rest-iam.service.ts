import { Injectable, OnDestroy } from '@angular/core';
import { UserEntry, UserService } from 'ngx-edu-sharing-api';
import { Observable, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { VCard } from 'ngx-edu-sharing-ui';
import {
    GroupProfile,
    GroupSignupDetails,
    GroupSignupResult,
    IamAuthorities,
    IamGroup,
    IamGroups,
    IamUser,
    IamUsers,
    ProfileSettings,
    UserCredentials,
    UserProfile,
    UserSimple,
    UserStats,
} from '../data-object';
import { RestConstants } from '../rest-constants';
import { AbstractRestService } from './abstract-rest-service';
import { RestConnectorService } from './rest-connector.service';

@Injectable({ providedIn: 'root' })
export class RestIamService extends AbstractRestService implements OnDestroy {
    private destroyed$ = new Subject<void>();

    constructor(connector: RestConnectorService, private userService: UserService) {
        super(connector);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    getCurrentUserAsync(): Promise<IamUser> {
        return this.userService.observeCurrentUser().pipe(first(), map(mapVCard)).toPromise();
    }

    /**
     * return the current user as vcard
     */
    async getCurrentUserVCard(): Promise<VCard> {
        const vcard = new VCard();
        const user = (await this.userService.observeCurrentUser().pipe(first()).toPromise())
            ?.person;
        if (user && user.profile) {
            vcard.givenname = user.profile.firstName;
            vcard.surname = user.profile.lastName;
            vcard.email = user.profile.email;
            if (user.profile.vcard) {
                const userVCard = new VCard(user.profile.vcard);
                vcard.title = userVCard.title;
                vcard.orcid = userVCard.orcid;
                vcard.gnduri = userVCard.gnduri;
            }
        }
        vcard.uid = user?.properties?.[RestConstants.CM_PROP_ESUID]
            ? user.properties[RestConstants.CM_PROP_ESUID][0]
            : null;
        return vcard;
    }

    public searchAuthorities = (
        pattern = '*',
        global = true,
        groupType: string = '',
        signupMethod: string = '',
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrlNoEscape(
            'iam/:version/authorities/:repository?pattern=:pattern&global=:global&groupType=:groupType&signupMethod=:signupMethod&:request',
            repository,
            [
                [':pattern', encodeURIComponent(pattern)],
                [':global', global + ''],
                [':groupType', encodeURIComponent(groupType)],
                [':signupMethod', encodeURIComponent(signupMethod)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<IamAuthorities>(query, this.connector.getRequestOptions());
    };

    public searchGroups = (
        pattern = '*',
        global = true,
        groupType = '',
        signupMethod: string = '',
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrlNoEscape(
            'iam/:version/groups/:repository?pattern=:pattern&global=:global&groupType=:groupType&signupMethod=:signupMethod&:request',
            repository,
            [
                [':pattern', encodeURIComponent(pattern)],
                [':global', global + ''],
                [':groupType', encodeURIComponent(groupType)],
                [':signupMethod', encodeURIComponent(signupMethod)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<IamGroups>(query, this.connector.getRequestOptions());
    };

    public getGroup = (group: string, repository = RestConstants.HOME_REPOSITORY) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group',
            repository,
            [[':group', group]],
        );
        return this.connector.get<IamGroup>(query, this.connector.getRequestOptions());
    };

    public deleteGroup = (group: string, repository = RestConstants.HOME_REPOSITORY) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group',
            repository,
            [[':group', group]],
        );
        return this.connector.delete(query, this.connector.getRequestOptions());
    };

    public createGroup = (
        group: string,
        profile: GroupProfile,
        parent = '',
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group?parent=:parent',
            repository,
            [
                [':group', group],
                [':parent', parent],
            ],
        );
        return this.connector.post(
            query,
            JSON.stringify(profile),
            this.connector.getRequestOptions(),
        );
    };

    public editGroup = (
        group: string,
        profile: GroupProfile,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/profile',
            repository,
            [[':group', group]],
        );
        return this.connector.put(
            query,
            JSON.stringify(profile),
            this.connector.getRequestOptions(),
        );
    };

    public editGroupSignup = (
        group: string,
        data: GroupSignupDetails,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/signup/config',
            repository,
            [[':group', group]],
        );
        return this.connector.post<void>(
            query,
            JSON.stringify(data),
            this.connector.getRequestOptions(),
        );
    };

    public signupGroup = (
        group: string,
        password = '',
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/signup?password=:password',
            repository,
            [
                [':group', group],
                [':password', password],
            ],
        );
        return this.connector.post<GroupSignupResult>(
            query,
            null,
            this.connector.getRequestOptions(),
        );
    };

    public confirmSignup = (
        group: string,
        user: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/signup/list/:user',
            repository,
            [
                [':group', group],
                [':user', user],
            ],
        );
        return this.connector.put<void>(query, null, this.connector.getRequestOptions());
    };

    public rejectSignup = (
        group: string,
        user: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/signup/list/:user',
            repository,
            [
                [':group', group],
                [':user', user],
            ],
        );
        return this.connector.delete<void>(query, this.connector.getRequestOptions());
    };

    public getGroupSignupList = (group: string, repository = RestConstants.HOME_REPOSITORY) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/signup/list',
            repository,
            [[':group', group]],
        );
        return this.connector.get<UserSimple[]>(query, this.connector.getRequestOptions());
    };

    public getSubgroupByType = (
        group: string,
        type: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/type/:type',
            repository,
            [
                [':group', group],
                [':type', type],
            ],
        );
        return this.connector.get<IamGroup>(query, this.connector.getRequestOptions());
    };

    public getGroupMembers = (
        group: string,
        pattern = '',
        authorityType = '',
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrlNoEscape(
            'iam/:version/groups/:repository/:group/members/?pattern=:pattern&authorityType=:authorityType&:request',
            repository,
            [
                [':group', encodeURIComponent(group)],
                [':pattern', encodeURIComponent(pattern)],
                [':authorityType', encodeURIComponent(authorityType)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<IamAuthorities>(query, this.connector.getRequestOptions());
    };

    public deleteGroupMember = (
        group: string,
        member: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/members/:member',
            repository,
            [
                [':group', group],
                [':member', member],
            ],
        );
        return this.connector.delete(query, this.connector.getRequestOptions());
    };

    public addGroupMember = (
        group: string,
        member: string,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/groups/:repository/:group/members/:member',
            repository,
            [
                [':group', group],
                [':member', member],
            ],
        );
        return this.connector.put(query, '', this.connector.getRequestOptions());
    };

    public searchUsers = (
        pattern = '*',
        global = true,
        status: string = '',
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrlNoEscape(
            'iam/:version/people/:repository?pattern=:pattern&global=:global&status=:status&:request',
            repository,
            [
                [':pattern', encodeURIComponent(pattern)],
                [':global', global + ''],
                [':status', status],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<IamUsers>(query, this.connector.getRequestOptions());
    };

    public updateUserStatus = (
        user: string,
        status: string,
        notify = true,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/status/:status?notify=:notify',
            repository,
            [
                [':user', user],
                [':status', status],
                [':notify', '' + notify],
            ],
        );
        return this.connector.put(query, null, this.connector.getRequestOptions());
    };

    getUser(
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<IamUser> {
        return this.userService.getUser(user, repository).pipe(map(mapVCard));
    }

    public getUserStats = (user = RestConstants.ME, repository = RestConstants.HOME_REPOSITORY) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/stats',
            repository,
            [[':user', user]],
        );
        return this.connector.get<UserStats>(query, this.connector.getRequestOptions());
    };

    public getUserGroups = (
        user = RestConstants.ME,
        pattern = '*',
        request: any = null,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrlNoEscape(
            'iam/:version/people/:repository/:user/memberships?pattern=:pattern&:request',
            repository,
            [
                [':user', encodeURIComponent(user)],
                [':pattern', encodeURIComponent(pattern)],
                [':request', this.connector.createRequestString(request)],
            ],
        );
        return this.connector.get<IamGroups>(query, this.connector.getRequestOptions());
    };

    public getUserPreferences = (
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/preferences',
            repository,
            [[':user', user]],
        );
        return this.connector
            .get<any>(query, this.connector.getRequestOptions())
            .pipe(map((response) => JSON.parse(response.preferences)));
    };

    public setUserPreferences = (
        preferences: any,
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/preferences',
            repository,
            [[':user', user]],
        );
        return this.connector.put<void>(
            query,
            JSON.stringify(preferences),
            this.connector.getRequestOptions(),
        );
    };

    /**
     * get profileSettings configuration from API
     * @param profileSettings Object with profile configuration
     * @param user current User
     * @param repository current Repository
     * @returns profileSettings object.
     */
    public getProfileSettings = (
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/profileSettings',
            repository,
            [[':user', user]],
        );
        return this.connector.get<ProfileSettings>(query, this.connector.getRequestOptions());
    };

    /**
     * set Configuration for profileSettings to backend.
     * @param profileSettings Object with profile configuration
     * @param user current User
     * @param repository current Repository
     * @returns Https code Status 200=OK.
     */
    public setProfileSettings = (
        profileSettings: ProfileSettings,
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/profileSettings/',
            repository,
            [[':user', user]],
        );
        return this.connector.put(
            query,
            JSON.stringify(profileSettings),
            this.connector.getRequestOptions(),
        );
    };

    public setCredentials = (
        password: { oldPassword?: string; newPassword: string },
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/credential/',
            repository,
            [[':user', user]],
        );
        return this.connector.put(
            query,
            JSON.stringify(password),
            this.connector.getRequestOptions(),
        );
    };

    public removeUserAvatar = (
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ): Observable<Response> => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/avatar',
            repository,
            [[':user', user]],
        );
        return this.connector.delete(query, this.connector.getRequestOptions());
    };

    public setUserAvatar = (
        avatar: File,
        user = RestConstants.ME,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/avatar',
            repository,
            [[':user', user]],
        );
        return this.connector.sendDataViaXHR(query, avatar, 'PUT', 'avatar');
    };

    public createUser = (
        user: string,
        password: string,
        profile: UserProfile,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/?password=:password',
            repository,
            [
                [':user', user],
                [':password', password],
            ],
        );
        return this.connector.post(
            query,
            JSON.stringify(profile),
            this.connector.getRequestOptions(),
        );
    };

    public editUser = (
        user: string,
        profile: UserProfile,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const convertedProfile = { ...profile, vcard: profile.vcard.toVCardString() };
        return this.userService.editProfile(user, convertedProfile, repository);
    };

    public editUserCredentials = (
        user: string,
        credentials: UserCredentials,
        repository = RestConstants.HOME_REPOSITORY,
    ) => {
        const query = this.connector.createUrl(
            'iam/:version/people/:repository/:user/credential',
            repository,
            [[':user', user]],
        );
        return this.connector.put(
            query,
            JSON.stringify(credentials),
            this.connector.getRequestOptions(),
        );
    };

    public getRecentlyInvited(repository = RestConstants.HOME_REPOSITORY) {
        const query = this.connector.createUrl(
            'iam/:version/authorities/:repository/recent',
            repository,
        );
        return this.connector.get<IamAuthorities>(query, this.connector.getRequestOptions());
    }
}

export function mapVCard(userEntry: UserEntry): IamUser {
    return {
        ...userEntry,
        person: {
            ...userEntry?.person,
            profile: {
                ...userEntry?.person?.profile,
                vcard: new VCard(userEntry?.person?.profile?.vcard),
            },
        },
    };
}
