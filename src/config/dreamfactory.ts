require('dotenv').config();
/**
 * Dream factory master setup
 *
 * @export
 * @class DreamFactory
 */
export class DreamFactory {

  /** 
   * Get Query link
   * 
   * fields array [string] (query) : Comma-delimited list of properties to be returned for each resource, "*" returns all properties. If as_list, use this to override the default identifier.
   * related array [string] (query) : Comma-delimited list of related names to retrieve for each resource.
   * filter string (query) : SQL-like filter to limit the records to retrieve.
   * limit integer (query)	: Set to limit the filter results.
   * offset integer (query)	: Set to offset the filter results to a particular record count.
   * order string (query)	: SQL-like order containing field and direction for filter results.
   * group string (query)	: Comma-delimited list of the fields used for grouping of filter results.
   * count_only boolean (query)	: Return only the total number of filter results.
   * include_count boolean (query) : Include the total number of filter results in returned metadata.
   * include_schema boolean (query)	: Include the schema of the table queried in returned metadata.
   * ids array [integer] (query)	: Comma-delimited list of the identifiers of the records to retrieve.
   * id_field array [string] (query)	: Comma-delimited list of the fields used as identifiers, used to override defaults or provide identifiers when none are provisioned.
   * id_type array [string] (query)	: Comma-delimited list of the field types used as identifiers for the table, used to override defaults or provide identifiers when none are provisioned.
   * continue boolean (query)	: In batch scenarios where supported, continue processing even after one action fails. Default behavior is to halt and return results up to the first point of failure.
   * rollback boolean (query)	: In batch scenarios where supported, rollback all actions if one action fails. Default behavior is to halt and return results up to the first point of failure.
   * file string (query)	: Download the results of the request as a file. This is here for documentation purpose only. File will not download using API Docs.
   * table_name * string (path)	: Name of the table to perform operations on.
   * 
   * 
   * 
   */

  /**
   * Host dream factory - using table
   *
   * @static
   * @memberof DreamFactory
   */
  static df_host = process.env.DF_HOST || 'http://api.zen.com.my/api/v2/zcs_dev/_table/';
  /**
   * Key dream factory
   *
   * @static
   * @memberof DreamFactory
   */
  static df_key = process.env.DF_KEY || 'cb82c1df0ba653578081b3b58179158594b3b8f29c4ee1050fda1b7bd91c3881';
  /**
   * Host dream factory - using stored procedure
   *
   * @static
   * @memberof DreamFactory
   */
  static df_host_proc = process.env.DF_HOST_PROC || 'http://api.zen.com.my/api/v2/zcs_dev/_proc/';
}