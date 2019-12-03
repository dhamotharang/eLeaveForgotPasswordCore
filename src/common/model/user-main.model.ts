import { CreateUpdateModel } from "./create-update.model";

/**
 * User main model
 *
 * @export
 * @class UserMainModel
 */
export class UserMainModel extends CreateUpdateModel {
  /**
   * User guid
   *
   * @type {string}
   * @memberof UserMainModel
   */
  USER_GUID: string;
  /**
   * Ligin id
   *
   * @type {string}
   * @memberof UserMainModel
   */
  LOGIN_ID: string;
  /**
   * Password
   *
   * @type {string}
   * @memberof UserMainModel
   */
  PASSWORD: string;
  /**
   * Email
   *
   * @type {string}
   * @memberof UserMainModel
   */
  EMAIL: string;
  /**
   * Fullname
   *
   * @type {string}
   * @memberof UserMainModel
   */
  FULLNAME: string;
  /**
   * Role
   *
   * @type {string}
   * @memberof UserMainModel
   */
  ROLE: string;
  /**
   * Activation flag
   *
   * @type {number}
   * @memberof UserMainModel
   */
  ACTIVATION_FLAG: number;
}