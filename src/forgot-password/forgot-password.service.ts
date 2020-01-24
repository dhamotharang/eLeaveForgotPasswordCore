import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserDbService, ForgotPasswordDbService, UserAdminDbService } from '../common/db/table.db.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { mergeMap, map } from "rxjs/operators";
import { UserMainModel } from '../common/model/user-main.model';
import { encryptProcess, setUpdateData } from '../common/helper/basic-function.function';
import { Resource } from '../common/model/resource.model';
import { of, Observable } from 'rxjs';
import { EmailNodemailerService } from '../common/helper/email-nodemailer.service';
import { ForgotPasswordModel } from '../common/model/forgot-password.model';
import iplocation from "iplocation";
import { IPResponse } from 'iplocation/lib/interface';
import { SendEmailDTO } from './dto/send-email.dto';
import { deleteToken, createToken } from './token-password.function';

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
          // let dbTable = res[0].ROLE == 'tenant' ? this.userAdminDbService : this.userDbService;
          let processMethod = res[0].ROLE == 'tenant' ? this.userAdminDbService : this.userDbService;
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
        // console.log(data.data.resource);
      }, err => {
        // console.log(err);
      });

    return deleteToken([newPasswordData.tokenId, this.forgotPasswordDbService]);

  }

  /**
   * Setup database table to check for tenant and user
   *
   * @param {[SendEmailDTO, string, string, string]} [sendEmailDTO, userAgent, ip, role]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPasswordProcess([sendEmailDTO, userAgent, ip, role]: [SendEmailDTO, string, string, string]) {
    let method;

    if (role == 'tenant')
      method = this.forgotPasswordChecking([sendEmailDTO, this.userAdminDbService, userAgent, 'tenant', 'eLeave Tenant Management', ip]);
    else if (role == 'user')
      method = this.forgotPasswordChecking([sendEmailDTO, this.userDbService, userAgent, 'user', 'eLeave', ip]);

    return method;
  }

  /**
   * Check user exist in db
   *
   * @param {([SendEmailDTO, UserDbService | UserAdminDbService, string, string, string, string])} [sendEmailDTO, dbService, userAgent, role, title, ip]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPasswordChecking([sendEmailDTO, dbService, userAgent, role, title, ip]: [SendEmailDTO, UserDbService | UserAdminDbService, string, string, string, string]) {
    const { email, httpReferer } = sendEmailDTO;
    if (email != '{email}' && email.trim() != '') {

      return dbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(mergeMap(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = role == 'tenant' ? res[0].FULLNAME : res[0].EMAIL;
            let loginId = res[0].LOGIN_ID;
            let results = this.createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, role, title, ip, httpReferer]);

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
   * Create token and send email
   *
   * @param {[string, string, string, string, string, string, string, string, string]} [userGuid, loginId, userFullname, email, userAgent, role, app, myIp, httpReferer]
   * @returns
   * @memberof ForgotPasswordService
   */
  public async createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, role, app, myIp, httpReferer]: [string, string, string, string, string, string, string, string, string]) {

    let myLocation = await iplocation(myIp);

    return await createToken([userGuid, loginId, userFullname, role, myLocation, httpReferer, this.forgotPasswordDbService]).then(
      data => {
        const tokenId = data.data.resource[0].TOKEN_GUID;
        return this.sendMailSetup([userFullname, email, tokenId, userAgent, app, myLocation, role]);
      }
    );
  }

  /**
   * Send email setup
   *
   * @param {[string, string, string, string, string, IPResponse]} [name, email, tokenId, userAgent, appName, myLocation]
   * @returns
   * @memberof ForgotPasswordService
   */
  public sendMailSetup([name, email, tokenId, userAgent, appName, myLocation, role]: [string, string, string, string, string, IPResponse, string]) {
    const { ip, timezone, postal, city, region, country, latitude, longitude } = myLocation;

    var replacements = {
      email: email,
      product_name: appName,
      action_url: 'http://zencore:8104/#/reset-password/' + role + '/' + tokenId,
      name: name,
      ip_data: `[${ip}] [${timezone}] [${postal} ${city} ${region} ${country}] [${latitude},${longitude}]`
    };
    var from = 'wantan.wonderland.2018@gmail.com';
    var emailTosend = email;
    var subject = 'Forgot password ' + appName;
    var template = 'src/common/email-templates/forgot-password.html';

    return this.emailNodemailerService.mailProcessPublic([replacements, from, emailTosend, subject, userAgent, template]);
  }

}