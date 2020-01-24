import { Controller, Body, Res, NotFoundException, Patch, Post, Req, BadRequestException } from '@nestjs/common';
import { ApiOperation } from "@nestjs/swagger";
import { ForgotPasswordService } from './forgot-password.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { Response } from 'express';
import { SendEmailDTO } from './dto/send-email.dto';
import { of } from 'rxjs';
import { ChangePasswordService } from './change-password.service';

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
    private readonly changePasswordService: ChangePasswordService
  ) { }

  /**
   * Forgot password api
   *
   * @param {NewPasswordDTO} newPasswordData
   * @param {Response} res
   * @memberof ForgotPasswordController
   */
  @Patch()
  @ApiOperation({ title: 'Forgot password', description: 'Set new user password in local db. \nPermission : superadmin, salesperson, support' })
  forgotPassword(@Body() newPasswordData: NewPasswordDTO, @Res() res: Response) {
    this.forgotPasswordService.forgotPassword([newPasswordData]).subscribe(
      data => {
        res.send(data);
      }, err => {
        res.send(new NotFoundException('Password not update'));
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

    // let ip;
    let ip = await this.getMyIp([req]);

    // var externalip = require('externalip');

    // const getExternalIp = async () => {
    //   return await new Promise((resolve, reject) => {
    //     externalip(function (err, ip) {
    //       // if (err) { return reject(err); }
    //       // else { resolve(ip); }
    //       err ? reject(err) : resolve(ip);
    //     });
    //   });
    // }
    // const myIp = await getExternalIp();

    // ip = myIp;

    // if (req.headers.hasOwnProperty('x-real-ip') && req.headers['x-real-ip'] != '-')
    //   ip = req.headers['x-real-ip'];
    // else if (req.headers.hasOwnProperty('x-forwarded-for'))
    //   ip = req.headers['x-forwarded-for'];

    let method;
    if (sendEmailDTO.role == 'tenant')
      method = this.changePasswordService.forgotPasswordProcess([sendEmailDTO, userAgent, ip, 'tenant']);
    else if (sendEmailDTO.role == 'user')
      method = this.changePasswordService.forgotPasswordProcess([sendEmailDTO, userAgent, ip, 'user']);
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

  private async getMyIp([req]) {

    let myIp;

    if (req.headers.hasOwnProperty('x-real-ip') && req.headers['x-real-ip'] != '-')
      myIp = req.headers['x-real-ip'];
    else if (req.headers.hasOwnProperty('x-forwarded-for'))
      myIp = req.headers['x-forwarded-for'];
    else {
      var externalip = require('externalip');

      const getExternalIp = async () => {
        return await new Promise((resolve, reject) => {
          externalip(function (err, ip) { err ? reject(err) : resolve(ip); });
        });
      }
      myIp = await getExternalIp();
    }

    return myIp;
  }


}