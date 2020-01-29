import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserDbService, ForgotPasswordDbService, UserAdminDbService } from '../common/db/table.db.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { mergeMap, map } from "rxjs/operators";
import { UserMainModel } from '../common/model/user-main.model';
import { encryptProcess, setUpdateData } from '../common/helper/basic-function.function';
import { Resource } from '../common/model/resource.model';
import { of, Observable } from 'rxjs';
import { ForgotPasswordModel } from '../common/model/forgot-password.model';
import { deleteToken } from './token-password.function';
import { DBService } from './db.service';

/**
 * Service for forgot password
 *
 * @export
 * @class ForgotPasswordService
 */
@Injectable()
export class ForgotPasswordService {

  /**
   *Creates an instance of ForgotPasswordService.
   * @param {DBService} dbService Database service
   * @memberof ForgotPasswordService
   */
  constructor(private readonly dbService: DBService) { }

  /**
   * Forgot password function service
   *
   * @param {[NewPasswordDTO]} [data]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPassword([data]: [NewPasswordDTO]) {

    return this.dbService.forgotPasswordDbService.findByFilterV4([[], ['(TOKEN_GUID=' + data.tokenId + ')', 'AND (DELETED_AT IS NULL)'], null, null, null, [], null]).pipe(
      mergeMap(res => {
        if (res.length > 0) {
          let processMethod = res[0].ROLE == 'tenant' ? this.dbService.userAdminDbService : this.dbService.userDbService;
          return this.checkUser([res, processMethod, data]);
        } else
          return of(new BadRequestException('Invalid token'));
      }));
  }

  /**
   * check again user if exist
   *
   * @param {[any, string]} [dbTable, userGuid]
   * @returns {Observable<any>}
   * @memberof ForgotPasswordService
   */
  public checkUser([res, processMethod, data]: [any[], UserAdminDbService | UserDbService, NewPasswordDTO]): Observable<any> {
    return processMethod.findByFilterV4([[], ['(USER_GUID=' + res[0].USER_GUID + ')'], null, null, null, [], null]).pipe(
      mergeMap(res2 => {
        if (res2.length == 0) {
          return of(new NotFoundException('User not found'));
        } else {
          return this.processPassword([data, res[0], processMethod]).pipe(map(res => {
            return res.data.resource;
          }));
        }
      }));
  }

  /**
   * Process update password
   *
   * @param {[NewPasswordDTO]} [newPasswordData]
   * @returns
   * @memberof ForgotPasswordService
   */
  public processPassword([newPasswordData, tokenModel, method]: [NewPasswordDTO, ForgotPasswordModel, any]): Observable<any> {
    const data = new UserMainModel;

    data.USER_GUID = tokenModel.USER_GUID;
    if (tokenModel.ROLE == 'tenant')
      data.PASSWORD = encryptProcess([newPasswordData.password, tokenModel.LOGIN_ID]);
    else
      data.PASSWORD = newPasswordData.password;
    setUpdateData([data, tokenModel.USER_GUID]);

    const resource = new Resource(new Array);
    resource.resource.push(data);

    method.updateByModel([resource, [], [], []]).subscribe(
      data => {
      }, err => {
      });

    return deleteToken([newPasswordData.tokenId, this.dbService.forgotPasswordDbService]);

  }



}