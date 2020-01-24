import { ForgotPasswordModel } from "../common/model/forgot-password.model";
import { Resource } from "../common/model/resource.model";
import { IPResponse } from "iplocation/lib/interface";
import { v1 } from 'uuid';
import { ForgotPasswordDbService } from "src/common/db/table.db.service";

var { convertJsonToXML } = require('@zencloudservices/xmlparser');

export function deleteToken([tokenId, method]: [string, ForgotPasswordDbService]) {

  let model = new ForgotPasswordModel();
  model.TOKEN_GUID = tokenId;
  model.DELETED_AT = new Date().toISOString();
  const resource = new Resource(new Array);
  resource.resource.push(model);

  return method.updateByModel([resource, ['TOKEN_GUID', 'HTTP_REFERER'], [], []]);
}

export function createToken([userGuid, loginId, fullname, role, myLocation, httpReferer, method]: [string, string, string, string, IPResponse, string, ForgotPasswordDbService]) {
  // setup xml data user access from location
  let xmlLocation = [];
  xmlLocation['root'] = myLocation;

  const resource = new Resource(new Array);
  let model = new ForgotPasswordModel();

  model.TOKEN_GUID = v1();
  model.USER_GUID = userGuid;
  model.LOGIN_ID = loginId;
  model.FULLNAME = fullname;
  model.HTTP_REFERER = httpReferer;
  model.ROLE = role;
  model.USER_TRACKING = convertJsonToXML(xmlLocation);

  resource.resource.push(model);

  return method.createByModel([resource, [], [], ['TOKEN_GUID']]).toPromise();
}