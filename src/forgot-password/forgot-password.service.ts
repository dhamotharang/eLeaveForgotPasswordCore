import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserDbService } from '../common/db/table.db.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { mergeMap, map } from "rxjs/operators";
import { UserMainModel } from '../common/model/user-main.model';
import { encryptProcess, setUpdateData } from '../common/helper/basic-function.function';
import { Resource } from '../common/model/resource.model';
import { of } from 'rxjs';
import { EmailNodemailerService } from '../common/helper/email-nodemailer.service';

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
   * @param {UserDbService} userDbService DB service for usermain tenant
   * @param {EmailNodemailerService} emailNodemailerService Email nodemailer service
   * @memberof ForgotPasswordService
   */
  constructor(
    private readonly userDbService: UserDbService,
    private readonly emailNodemailerService: EmailNodemailerService
  ) { }

  /**
   * Forgot password function service
   *
   * @param {[NewPasswordDTO]} [data]
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPassword([data]: [NewPasswordDTO]) {
    return this.verifyUser(data.userGuid)
      .pipe(
        mergeMap(res => {
          if (res.length == 0) {
            return of(new NotFoundException('User not found'));
          } else {
            return this.processPassword([data]).pipe(map(res => {
              return res.data.resource;
            }));
          }
        })
      )
  }

  /**
   * Verify if user exist
   *
   * @param {string} userGuid
   * @returns
   * @memberof ForgotPasswordService
   */
  public verifyUser(userGuid: string) {
    return this.userDbService.findByFilterV4([[], ['(USER_GUID=' + userGuid + ')'], null, null, null, [], null]);
  }

  /**
   * Process update password
   *
   * @param {[NewPasswordDTO]} [newPasswordData]
   * @returns
   * @memberof ForgotPasswordService
   */
  public processPassword([newPasswordData]: [NewPasswordDTO]) {
    const data = new UserMainModel;

    data.USER_GUID = newPasswordData.userGuid;
    data.PASSWORD = encryptProcess([newPasswordData.password, newPasswordData.loginId]);
    setUpdateData([data, newPasswordData.userGuid]);

    const resource = new Resource(new Array);
    resource.resource.push(data);

    return this.userDbService.updateByModel([resource, [], [], []]);

  }

  /**
   * Send email
   *
   * @param {string} email
   * @returns
   * @memberof ForgotPasswordService
   */
  public forgotPasswordProcess(email: string) {

    if (email != '{email}' && email.trim() != '') {

      return this.userDbService.findByFilterV4([[], ['(EMAIL=' + email + ')'], null, null, null, [], null]).pipe(map(
        res => {
          if (res.length > 0) {
            let userGuid = res[0].USER_GUID;
            let userFullname = res[0].FULLNAME;
            let loginId = res[0].LOGIN_ID;
            let results = this.emailNodemailerService.mailProcessForgotPassword([userGuid, loginId, userFullname, email]);
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

}