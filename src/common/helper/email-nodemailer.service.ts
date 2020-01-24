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