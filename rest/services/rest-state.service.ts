import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IamUser, LoginResult } from '../data-object';

@Injectable()
export class RestStateService {
    currentUser = new BehaviorSubject<{ user: IamUser; login: LoginResult }>(null);
    currentLogin = new BehaviorSubject<LoginResult>(null);
}
