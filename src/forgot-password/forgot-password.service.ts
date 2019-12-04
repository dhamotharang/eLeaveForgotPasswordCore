import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserDbService, ForgotPasswordDbService, UserAdminDbService } from '../common/db/table.db.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { mergeMap, map } from "rxjs/operators";
import { UserMainModel } from '../common/model/user-main.model';
import { encryptProcess, setUpdateData } from '../common/helper/basic-function.function';
import { Resource } from '../common/model/resource.model';
import { of, Observable } from 'rxjs';
import { EmailNodemailerService } from '../common/helper/email-nodemailer.service';
import { v1 } from 'uuid';
import { ForgotPasswordModel } from '../common/model/forgot-password.model';

/**
 * Service for forgot password
 *
 * @export
 * @class ForgotPasswordService
 */
@Injectable()
export class ForgotPasswordService {
  // private readonly forgotPasswordDbService;
  /**
   *Creates an instance of ForgotPasswordService.
   * @param {UserDbService} userDbService DB service for usermain tenant
   * @param {EmailNodemailerService} emailNodemailerService Email nodemailer service
   * @memberof ForgotPasswordService
   */
  constructor(
    private readonly userDbService: UserDbService,
    private readonly userAdminDbService: UserAdminDbService,
    private readonly emailNodemailerService: EmailNodemailerService,
    private readonly forgotPasswordDbService: ForgotPasswordDbService
  ) { }

  /**
   * Forgot password function service
   *
   * @param {[NewPasswordDTO]} [data]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPassword([data]: [NewPasswordDTO]) {

    return this.forgotPasswordDbService.findByFilterV4([[], ['(TOKEN_GUID=' + data.tokenId + ')', 'AND (DELETED_AT IS NULL)'], null, null, null, [], null]).pipe(
      mergeMap(res => {
        if (res.length > 0) {
          let dbTable = res[0].ROLE == 'tenant' ? this.userAdminDbService : this.userDbService;
          let processMethod = res[0].ROLE == 'tenant' ? this.userAdminDbService : this.userDbService;
          return this.checkUser([dbTable, res[0].USER_GUID]).pipe(
            mergeMap(res2 => {
              if (res2.length == 0) {
                return of(new NotFoundException('User not found'));
              } else {
                return this.processPassword([data, res[0], processMethod]).pipe(map(res => {
                  return res.data.resource;
                }));
              }
            }));
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
  public checkUser([dbTable, userGuid]: [any, string]): Observable<any> {
    return dbTable.findByFilterV4([[], ['(USER_GUID=' + userGuid + ')'], null, null, null, [], null]);
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

    this.deleteToken(newPasswordData.tokenId);

    return method.updateByModel([resource, [], [], []]);

  }

  /**
   * Delete used token
   *
   * @param {string} tokenId
   * @returns
   * @memberof ForgotPasswordService
   */
  public deleteToken(tokenId: string) {
    let model = new ForgotPasswordModel();
    model.TOKEN_GUID = tokenId;
    model.DELETED_AT = new Date().toISOString();
    const resource = new Resource(new Array);
    resource.resource.push(model);
    return this.forgotPasswordDbService.updateByModel([resource, [], [], []]).subscribe(
      data => {
        console.log('token deleted');
      }, err => {
        console.log('error');
      }
    );
  }

  /**
   * Send email for user tenant
   *
   * @param {string} email
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPasswordTenantProcess([email, userAgent]: [string, string]) {

    if (email != '{email}' && email.trim() != '') {

      return this.userAdminDbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(mergeMap(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = res[0].FULLNAME;
            let loginId = res[0].LOGIN_ID;

            // let results = this.createToken([userGuid, loginId, userFullname, 'tenant']).pipe(map(
            //   data => {
            //     const tokenId = data.data.resource[0].TOKEN_GUID;
            //     return this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email, tokenId, userAgent, 'eLeave Tenant Management']);
            //   }, err => {
            //     return err.response.data.error.context.resource;
            //   }
            // ));

            let results = this.createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, 'tenant', 'eLeave Tenant Management']);

            // let results = this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email, null, 'eLeave Tenant Management']);
            return results;
          } else {
            throw new NotFoundException('No user registered with this email', 'No user found');
          }
        })
      );
    } else {
      throw new BadRequestException('Please set an email', 'No email specify');
    }

  }



  /**
   * Send email for user eLeave
   *
   * @param {[string, string]} [email, userAgent]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPasswordUserProcess([email, userAgent]: [string, string]) {

    if (email != '{email}' && email.trim() != '') {

      return this.userDbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(mergeMap(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = res[0].EMAIL;
            let loginId = res[0].LOGIN_ID;

            // let results = this.createToken([userGuid, loginId, userFullname, 'user']).pipe(map(
            //   data => {
            //     const tokenId = data.data.resource[0].TOKEN_GUID;
            //     return this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email, tokenId, userAgent, 'eLeave']);
            //   }, err => {
            //     return err.response.data.error.context.resource;
            //   }
            // ));
            // let results = this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email]);

            let results = this.createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, 'user', 'eLeave']);

            return results;
          } else {
            throw new NotFoundException('No user registered with this email', 'No user found');
          }
        })
      );
    } else {
      throw new BadRequestException('Please set an email', 'No email specify');
    }

  }

  public createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, role, app]: [string, string, string, string, string, string, string]) {
    return this.createToken([userGuid, loginId, userFullname, role]).pipe(map(
      data => {
        const tokenId = data.data.resource[0].TOKEN_GUID;
        return this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email, tokenId, userAgent, app]);
      }, err => {
        return err.response.data.error.context.resource;
      }
    ));
  }

  /**
   * Create token
   *
   * @param {[string, string, string, string]} [userGuid, loginId, fullname, role]
   * @returns
   * @memberof ForgotPasswordService
   */
  public createToken([userGuid, loginId, fullname, role]: [string, string, string, string]) {

    const resource = new Resource(new Array);
    let model = new ForgotPasswordModel();

    model.TOKEN_GUID = v1();
    model.USER_GUID = userGuid;
    model.LOGIN_ID = loginId;
    model.FULLNAME = fullname;
    model.ROLE = role;

    resource.resource.push(model);

    return this.forgotPasswordDbService.createByModel([resource, [], [], ['TOKEN_GUID']])
    // return userGuid + '-' + loginId + '-' + fullname + '-' + model.TOKEN_GUID;
  }

}