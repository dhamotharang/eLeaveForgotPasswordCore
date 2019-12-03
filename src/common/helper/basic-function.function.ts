import { HttpModule } from "@nestjs/common";
import { DreamFactory } from "../../config/dreamfactory";

//  ---------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Declare base module http
 */
const baseModule = HttpModule.register({ headers: { 'Content-Type': 'application/json', 'X-Dreamfactory-API-Key': DreamFactory.df_key } });
/**
 * Return http base module
 *
 * @export
 * @returns
 */
export function getModuleHttp() {
  return baseModule;
}

//  ---------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Declare cryptojs library
 */
var CryptoJS = require("crypto-js");
/**
 * Encrypt process
 *
 * @export
 * @param {[string, string]} [value, key]
 * @returns
 */
export function encryptProcess([value, key]: [string, string]) {
  var ciphertext = CryptoJS.AES.encrypt(value, key);
  return ciphertext.toString();
}
/**
 * Decrypt process
 *
 * @export
 * @param {[string, string]} [value, key]
 * @returns
 */
export function decryptProcess([value, key]: [string, string]) {
  var bytes = CryptoJS.AES.decrypt(value, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

//  ---------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Set update data (declare once only in all update api)
 *
 * @export
 * @param {[any, string]} [data, userGuid]
 * @returns
 */
export function setUpdateData([data, userGuid]: [any, string]) {
  data.UPDATE_TS = (new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, -1);
  data.UPDATE_USER_GUID = userGuid;
  return data;
}