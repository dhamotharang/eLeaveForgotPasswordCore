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
 * Service for email nodemailer
 *
 * @export
 * @class EmailNodemailerService
 */
export class EmailNodemailerService {

  /**
   * Mail process forgot password
   *
   * @param {[string,string, string, string]} [userGuid,loginId, name, email]
   * @returns
   * @memberof EmailNodemailerService
   */
  public mailProcessForgotPassword([userGuid, loginId, name, email]: [string, string, string, string]) {
    smtpTransport = this.createSMTP();

    var replacements = {
      email: email,
      link: "http://localhost/send-email/send-email.php?id=" + userGuid + "&loginId=" + loginId,
      name: name
    };
    var from = 'wantan.wonderland.2018@gmail.com';
    var emailTosend = email;
    var subject = 'Forgot password eLeaveTenant';

    let data = {};
    data['replacement'] = replacements;
    data['from'] = from;
    data['emailTosend'] = emailTosend;
    data['subject'] = subject;

    let dataRes = this.readHTMLFile('src/common/email-templates/forgot-password.html', this.callbackReadHTML(data));

    return { "status": "email send" };
  }

  /**
   * Setup and send email
   *
   * @memberof EmailNodemailerService
   */
  public callbackReadHTML = (data) => async function (err, html) {

    var template = handlebars.compile(html);
    // var replacements = {
    //     email: email,
    //     code: "#" + name,
    //     name: name
    // };
    var htmlToSend = template(data.replacement);
    var mailOptions = {
      from: data.from, // 'wantan.wonderland.2018@gmail.com',
      to: data.emailTosend, // email,
      subject: data.subject, // 'Leave approval ✔',
      html: htmlToSend
    };

    return await smtpTransport.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return await error;
      } else {
        console.log(info);
        return await info;
      }
    });
  }

  /**
   * Method read html file
   *
   * @memberof EmailNodemailerService
   */
  public readHTMLFile = function (path, callback) {
    return fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
      if (err) {
        throw err;
        callback(err);
      }
      else {
        callback(null, html);
      }
    });
  };

  /**
   * Setup smtp data
   *
   * @returns
   * @memberof EmailNodemailerService
   */
  public createSMTP() {
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTPHOST || "smtp.ethereal.email",
      port: process.env.SMTPPORT || 587,
      secure: process.env.SMTPSECURE || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTPUSER || 'casimir.mcglynn@ethereal.email',
        pass: process.env.SMTPPASSWORD || 'GYSA4r14EQRPB9guAK'
      }
    });
    return smtpTransport;
  }
}