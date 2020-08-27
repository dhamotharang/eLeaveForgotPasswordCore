import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { EmailNodemailerService } from "../common/helper/email-nodemailer.service";
import { UserDbService, UserAdminDbService } from "../common/db/table.db.service";
import { SendEmailDTO } from "./dto/send-email.dto";
import { mergeMap } from "rxjs/operators";

import iplocation from "iplocation";
import { IPResponse } from 'iplocation/lib/interface';

import { createToken } from './token-password.function';
import { DBService } from "./db.service";
require('dotenv').config();
@Injectable()
export class ChangePasswordService {
  /**
   *Creates an instance of ChangePasswordService.
   * @param {DBService} dbService Database service
   * @param {EmailNodemailerService} emailNodemailerService Email node mailer service
   * @memberof ChangePasswordService
   */
  constructor(
    private readonly dbService: DBService,
    private readonly emailNodemailerService: EmailNodemailerService
  ) { }

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
      method = this.forgotPasswordChecking([sendEmailDTO, this.dbService.userAdminDbService, userAgent, 'tenant', 'eLeave Tenant Management', ip]);
    else if (role == 'user')
      method = this.forgotPasswordChecking([sendEmailDTO, this.dbService.userDbService, userAgent, 'user', 'eLeave', ip]);

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

    return await createToken([userGuid, loginId, userFullname, role, myLocation, httpReferer, this.dbService.forgotPasswordDbService]).then(
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

    // 'http://zencore:8104/#/reset-password/'

    var replacements = {
      email: email,
      product_name: appName,
      action_url: process.env.URL_FORGOT_PASSWORD + tokenId + '/local',
      name: name,
      ip_data: `[${ip}] [${timezone}] [${postal} ${city} ${region} ${country}] [${latitude},${longitude}]`
    };
    var from = process.env.SMTPSENDER;//'wantan.wonderland.2018@gmail.com';
    var emailTosend = email;
    var subject = 'Forgot password ' + appName;
    var template = 'src/common/email-templates/forgot-password.html';

    return this.emailNodemailerService.mailProcessPublic([replacements, from, emailTosend, subject, userAgent, template]);
  }

  /**
   * Send email setup
   *
   * @param {[string, string, string, string, string, IPResponse]} [name, email, tokenId, userAgent, appName, myLocation]
   * @returns
   * @memberof ForgotPasswordService
   */
  public sendMailSetup2([name, email, tokenId, userAgent, appName, myLocation, role]: [string, string, string, string, string, IPResponse, string]) {
    const { ip, timezone, postal, city, region, country, latitude, longitude } = myLocation;

    // 'http://zencore:8104/#/reset-password/'

    var replacements = {
      email: email,
      product_name: appName,
      action_url: process.env.URL_FORGOT_PASSWORD + role + '/' + tokenId,
      name: name,
      ip_data: `[${ip}] [${timezone}] [${postal} ${city} ${region} ${country}] [${latitude},${longitude}]`
    };
    var from = process.env.SMTPSENDER;//'wantan.wonderland.2018@gmail.com';
    var emailTosend = email;
    var subject = 'Forgot password ' + appName;
    var template = 'src/common/email-templates/forgot-password.html';

    return this.emailNodemailerService.mailProcessPublic([replacements, from, emailTosend, subject, userAgent, template]);
  }
}