/**
 * Declare nodemailer
 */
var nodemailer = require('nodemailer');
/**
 * Declare smtpTransport
 */
var smtpTransport = require('nodemailer-smtp-transport');
/**
 * Declare handlebars
 */
var handlebars = require('handlebars');
/**
 * Declare fs
 */
var fs = require('fs');
/**
 * Declare platform
 */
var platform = require('platform');

/**
 * Service for email nodemailer
 *
 * @export
 * @class EmailNodemailerService
 */
export class EmailNodemailerService {

  /**
   * Mail process for all request
   *
   * @param {[any, string, string, string, string, string]} [replacements, from, emailTosend, subject, userAgent, template]
   * @returns
   * @memberof EmailNodemailerService
   */
  public mailProcessPublic([replacements, from, emailTosend, subject, userAgent, template]: [any, string, string, string, string, string]) {
    smtpTransport = this.createSMTP();
    let info = platform.parse(userAgent);

    replacements.operating_system = platform.product;
    replacements.browser_name = info.description;

    let data = {};
    data['replacement'] = replacements;
    data['from'] = from;
    data['emailTosend'] = emailTosend;
    data['subject'] = subject;

    return this.readHTMLFile(template, this.callbackReadHTML(data));
  }

  /**
   * Setup and send email
   *
   * @memberof EmailNodemailerService
   */
  public callbackReadHTML = (data) => function (err, html) {
    var template = handlebars.compile(html);
    var htmlToSend = template(data.replacement);
    var mailOptions = {
      from: data.from, // 'wantan.wonderland.2018@gmail.com',
      to: data.emailTosend, // email,
      subject: data.subject, // 'Leave approval ✔',
      html: htmlToSend
    };

    const callBackSendMail = () => {
      return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mailOptions, function (error, info) {
          error ? reject(error) : resolve(info);
        });
      });
    }

    return callBackSendMail();
  }

  /**
   * Method read html file
   *
   * @memberof EmailNodemailerService
   */
  public readHTMLFile = function (path, callback) {
    const callBackReadFile = () => {
      return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
          err ? reject(err) : resolve(callback(null, html));
        });
      });
    }

    return callBackReadFile();
  };

  /**
   * Setup smtp data
   *
   * @returns
   * @memberof EmailNodemailerService
   */
  public createSMTP() {
    // require('dotenv').config();
    // console.log('are u here?');
    // console.log(process.env.SMTPHOST);
    // console.log(process.env.SMTPPORT);
    // console.log(process.env.SMTPSECURE);
    // console.log(process.env.SMTPUSER);
    // console.log(process.env.SMTPPASSWORD);

    let host1 = process.env.SMTPHOST;
    let port1: number = parseInt(process.env.SMTPPORT);
    let secure1: boolean = JSON.parse(process.env.SMTPSECURE.toLowerCase()); //Boolean(process.env.SMTPSECURE);
    let user1 = process.env.SMTPUSER;
    let pass1 = process.env.SMTPPASSWORD;

    let host = "smtp.office365.com";//"smtp.ethereal.email";
    let port = 587;
    let secure = false;
    let user = "donotreply@zen.com.my";//'casimir.mcglynn@ethereal.email';
    let pass = "Huc84941";//'GYSA4r14EQRPB9guAK';

    // username ni: donotreply@zen.com.my

    // password: 'Huc84941'

    // console.log(typeof (host1) + " :" + host1 + ":");
    // console.log(typeof (port1) + " :" + port1 + ":");
    // console.log(typeof (secure1) + " :" + secure1 + ":");
    // console.log(typeof (user1) + " :" + user1 + ":");
    // console.log(typeof (pass1) + " :" + pass1 + ":");

    // console.log('\n' + typeof (host) + " :" + host + ":");
    // console.log(typeof (port) + " :" + port + ":");
    // console.log(typeof (secure) + " :" + secure + ":");
    // console.log(typeof (user) + " :" + user + ":");
    // console.log(typeof (pass) + " :" + pass + ":");

    smtpTransport = nodemailer.createTransport({
      host: host1,
      port: port1,
      secure: secure1, // true for 465, false for other ports
      auth: {
        user: user1,
        pass: pass1,
      }
      ,

      // tls: { ciphers: 'SSLv3' },
      // tls: { rejectUnauthorized: false }
      // ,
      // tls: {
      //   // do not fail on invalid certs
      //   rejectUnauthorized: false
      // },
    });

    return smtpTransport;
  }

}