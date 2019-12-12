import { Controller, Body, Res, NotFoundException, Patch, Post, Param, Req, Get, BadRequestException, HttpService } from '@nestjs/common';
import { ApiOperation } from "@nestjs/swagger";
import { ForgotPasswordService } from './forgot-password.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { Response } from 'express';
import { SendEmailDTO } from './dto/send-email.dto';
import { of } from 'rxjs';

/**
 * Controller for forgot password
 *
 * @export
 * @class ForgotPasswordController
 */
@Controller('api/forgot-password')
export class ForgotPasswordController {
  /**
   *Creates an instance of ForgotPasswordController.
   * @param {ForgotPasswordService} forgotPasswordService Service for forgot password
   * @memberof ForgotPasswordController
   */
  constructor(
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly httpService: HttpService
  ) { }

  /**
   * Forgot password api
   *
   * @param {NewPasswordDTO} newPasswordData
   * @param {Response} res
   * @memberof ForgotPasswordController
   */
  @Patch()
  @ApiOperation({ title: 'Forgot password', description: 'Forgot password set new user password in local db. \nPermission : superadmin, salesperson, support' })
  forgotPassword(@Body() newPasswordData: NewPasswordDTO, @Res() res: Response) {
    this.forgotPasswordService.forgotPassword([newPasswordData]).subscribe(
      data => {
        res.send(data);
      }, err => {
        res.send(new NotFoundException('User not found'));
      }
    );

  }

  /**
   * Send email to reset password
   *
   * @param {*} email
   * @param {*} req
   * @param {*} res
   * @memberof ForgotPasswordController
   */
  @Post()
  @ApiOperation({ title: 'Send email forgot password' })
  async create(@Body() sendEmailDTO: SendEmailDTO, @Req() req, @Res() res) {

    const userAgent = req.headers['user-agent'];
    // console.log(req.connection);

    // const requestIp = require('request-ip');

    let ip;

    // // inside middleware handler
    // const ipMiddleware = function (req) {
    //   const clientIp = requestIp.getClientIp(req);
    //   var splitted = clientIp.split(':');
    //   return splitted[splitted.length - 1];
    // };

    // ip = ipMiddleware(req);
    // console.log(ip);
    var externalip = require('externalip');

    const getExternalIp = async () => {
      return await new Promise((resolve, reject) => {
        externalip(function (err, ip) {
          if (err) { return reject(err); }
          else { resolve(ip); }
        });
      });
    }
    const myIp = await getExternalIp();

    // console.log(myIp);

    ip = myIp;

    // const dataTemp = () => {
    //   return new Promise((resolve, reject) => {
    //     this.httpService.get('http://pv.sohu.com/cityjson').subscribe(
    //       data => {
    //         resolve(data.data);
    //       }, err => {
    //         return reject(err);
    //       }
    //     );
    //   });
    // }
    // const dataIp = await dataTemp();
    // console.log(dataIp);

    // var get_non_routable_prefix_list = require('ipware');
    // var ip_info = get_non_routable_prefix_list();
    // var ip_data = get_non_routable_prefix_list().get_headers_attribute(req.header, 'X_FORWARDED_FOR');
    // console.log(ip_info);
    // console.log(ip_data);
    console.log(req.headers);


    let method;
    if (sendEmailDTO.role == 'tenant')
      method = this.forgotPasswordService.forgotPasswordTenantProcess([sendEmailDTO.email, userAgent, ip]);
    else if (sendEmailDTO.role == 'user')
      method = this.forgotPasswordService.forgotPasswordUserProcess([sendEmailDTO.email, userAgent, ip]);
    else
      method = of(new BadRequestException('Invalid filter'));

    method.subscribe(
      data => {
        res.send(data);
      }, err => {
        res.send(err);
      }
    );
  }

}