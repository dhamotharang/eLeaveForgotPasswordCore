import { Resource } from '../common/model/resource.model';

/**
 * Interface for IDbService
 *
 * @export
 * @interface IDbService
 */
export interface IDbService {

  /**
   * Find by filter v4
   *
   * @param {[string[], string[], string, number, number, string[], string]} [fields, filters, order, limit, offset, relations, groups]
   * @memberof IDbService
   */
  findByFilterV4([fields, filters, order, limit, offset, relations, groups]: [string[], string[], string, number, number, string[], string])

  /**
   * Create by model
   *
   * @param {[Resource, string[], string[], string[]]} [resource, fields, filters, idFields]
   * @memberof IDbService
   */
  createByModel([resource, fields, filters, idFields]: [Resource, string[], string[], string[]]);

  /**
   * Update by model
   *
   * @param {[Resource, string[], string[], string[]]} [resource, fields, filters, idFields]
   * @memberof IDbService
   */
  updateByModel([resource, fields, filters, idFields]: [Resource, string[], string[], string[]])
}