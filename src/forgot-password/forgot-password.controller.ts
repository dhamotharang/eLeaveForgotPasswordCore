import { Controller, Body, Res, NotFoundException, Patch, Post, Param, Req, Get, BadRequestException } from '@nestjs/common';
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
  constructor(private readonly forgotPasswordService: ForgotPasswordService) { }

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
    let method;
    if (sendEmailDTO.role == 'tenant')
      method = this.forgotPasswordService.forgotPasswordTenantProcess([sendEmailDTO.email, userAgent]);
    else if (sendEmailDTO.role == 'user')
      method = this.forgotPasswordService.forgotPasswordUserProcess([sendEmailDTO.email, userAgent]);
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