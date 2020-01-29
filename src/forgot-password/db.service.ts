import { Injectable } from "@nestjs/common";
import { UserDbService, ForgotPasswordDbService, UserAdminDbService } from "../common/db/table.db.service";

/**
 * Database service for forgot password
 *
 * @export
 * @class DBService
 */
@Injectable()
export class DBService {
  /**
   *Creates an instance of DBService.
   * @param {UserDbService} userDbService User db service
   * @param {UserAdminDbService} userAdminDbService User admin db service
   * @param {ForgotPasswordDbService} forgotPasswordDbService forgot password db service
   * @memberof DBService
   */
  constructor(
    public userDbService: UserDbService,
    public userAdminDbService: UserAdminDbService,
    public forgotPasswordDbService: ForgotPasswordDbService
  ) { }
}