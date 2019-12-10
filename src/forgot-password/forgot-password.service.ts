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
import iplocation from "iplocation";
import { IPResponse } from 'iplocation/lib/interface';
// const publicIp = require('public-ip');
var { convertJsonToXML } = require('@zencloudservices/xmlparser');

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
  public forgotPasswordTenantProcess([email, userAgent, ip]: [string, string, string]) {

    if (email != '{email}' && email.trim() != '') {

      return this.userAdminDbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(mergeMap(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = res[0].FULLNAME;
            let loginId = res[0].LOGIN_ID;

            let results = this.createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, 'tenant', 'eLeave Tenant Management', ip]);

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
  public forgotPasswordUserProcess([email, userAgent, ip]: [string, string, string]) {

    if (email != '{email}' && email.trim() != '') {

      return this.userDbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(mergeMap(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = res[0].EMAIL;
            let loginId = res[0].LOGIN_ID;
            let results = this.createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, 'user', 'eLeave', ip]);

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

  public async createTokenAndSendMail([userGuid, loginId, userFullname, email, userAgent, role, app, ip]: [string, string, string, string, string, string, string, string]) {
    // const myIp = await publicIp.v4();

    // const getIP = require('external-ip')();

    // const ipData = () => {
    //   return new Promise((resolve, reject) => {
    //     getIP((err, ip) => {
    //       if (err) {
    //         // every service in the list has failed
    //         return reject(err);
    //       }
    //       else {
    //         resolve(ip)
    //       }
    //     });
    //   });
    // }

    // let myIp: any = await ipData();
    // console.log(myIpTemp + '' + myIp);
    let myIp = ip;
    console.log(myIp);
    // if (myIp == '1') {
    //   myIp = '60.53.219.114';
    // }

    let myLocation = await iplocation(myIp);

    return await this.createToken([userGuid, loginId, userFullname, role, myLocation]).then(
      data => {
        const tokenId = data.data.resource[0].TOKEN_GUID;
        return this.sendMailSetup([userFullname, email, tokenId, userAgent, app, myLocation]);
      }
    );
  }

  /**
   * Create token
   *
   * @param {[string, string, string, string]} [userGuid, loginId, fullname, role]
   * @returns
   * @memberof ForgotPasswordService
   */
  public createToken([userGuid, loginId, fullname, role, myLocation]: [string, string, string, string, IPResponse]) {
    // setup xml data user access from location
    let xmlLocation = [];
    xmlLocation['root'] = myLocation;

    const resource = new Resource(new Array);
    let model = new ForgotPasswordModel();

    model.TOKEN_GUID = v1();
    model.USER_GUID = userGuid;
    model.LOGIN_ID = loginId;
    model.FULLNAME = fullname;
    model.ROLE = role;
    model.USER_TRACKING = convertJsonToXML(xmlLocation);

    resource.resource.push(model);

    return this.forgotPasswordDbService.createByModel([resource, [], [], ['TOKEN_GUID']]).toPromise();
  }

  /**
   * Send email setup
   *
   * @param {[string, string, string, string, string, IPResponse]} [name, email, tokenId, userAgent, appName, myLocation]
   * @returns
   * @memberof ForgotPasswordService
   */
  public sendMailSetup([name, email, tokenId, userAgent, appName, myLocation]: [string, string, string, string, string, IPResponse]) {
    const { ip, timezone, postal, city, region, country, latitude, longitude } = myLocation;

    var replacements = {
      email: email,
      product_name: appName,
      action_url: 'http://zencore:8103/#/reset-password/' + tokenId,
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