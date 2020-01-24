import { Injectable, HttpService } from "@nestjs/common";
import { BaseDBService } from "../base/base-db.service";
import { QueryParserService } from "../helper/query-parser.service";
import { IDbService } from '../../../dist/interface/IDbService';


/**
 *  DB table : tenant view role : t_view_role
 *
 * @export
 * @class RoleDbService
 * @extends {BaseDBService}
 * @implements {IDbService}
 */
@Injectable()
export class RoleDbService extends BaseDBService implements IDbService {
  /**
   *Creates an instance of RoleDbService.
   * @param {HttpService} httpService http service
   * @param {QueryParserService} queryService query service
   * @memberof RoleDbService
   */
  constructor(public readonly httpService: HttpService, public readonly queryService: QueryParserService) { super(httpService, queryService, "t_view_role") }
}


/**
 * DB table : user main tenant : user_main_tenant
 *
 * @export
 * @class UserAdminDbService
 * @extends {BaseDBService}
 * @implements {IDbService}
 */
@Injectable()
export class UserAdminDbService extends BaseDBService implements IDbService {
  /**
   * Declare table
   *
   * @memberof UserDbService
   */
  public tableDB = 'user_main_tenant';
  /**
   *Creates an instance of UserDbService.
   * @param {HttpService} httpService http service
   * @param {QueryParserService} queryService query service
   * @memberof UserDbService
   */
  constructor(public readonly httpService: HttpService, public readonly queryService: QueryParserService) { super(httpService, queryService, "user_main_tenant") }
}

/**
 * DB table : user main tenant : user_main_tenant
 *
 * @export
 * @class UserDbService
 * @extends {BaseDBService}
 * @implements {IDbService}
 */
@Injectable()
export class UserDbService extends BaseDBService implements IDbService {
  /**
   * Declare table
   *
   * @memberof UserDbService
   */
  public tableDB = 'user_main';
  /**
   *Creates an instance of UserDbService.
   * @param {HttpService} httpService http service
   * @param {QueryParserService} queryService query service
   * @memberof UserDbService
   */
  constructor(public readonly httpService: HttpService, public readonly queryService: QueryParserService) { super(httpService, queryService, "user_main") }
}

/**
 * DB table : forgot password : l_forgot_password
 *
 * @export
 * @class ForgotPasswordDbService
 * @extends {BaseDBService}
 * @implements {IDbService}
 */
@Injectable()
export class ForgotPasswordDbService extends BaseDBService implements IDbService {
  /**
   * Declare table
   *
   * @memberof UserDbService
   */
  public tableDB = 'l_forgot_password';
  /**
   *Creates an instance of ForgotPasswordDbService.
   * @param {HttpService} httpService http service
   * @param {QueryParserService} queryService query service
   * @memberof ForgotPasswordDbService
   */
  constructor(public readonly httpService: HttpService, public readonly queryService: QueryParserService) { super(httpService, queryService, "l_forgot_password") }
}