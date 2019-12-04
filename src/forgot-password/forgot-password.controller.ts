import { Controller, Body, Res, NotFoundException, Patch, Post, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiImplicitParam } from "@nestjs/swagger";
import { ForgotPasswordService } from './forgot-password.service';
import { NewPasswordDTO } from './dto/new-password.dto';
import { Response } from 'express';

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
  @Post(':role/:email')
  @ApiOperation({ title: 'Send email forgot password' })
  @ApiImplicitParam({ name: 'role', description: 'Role user', required: true, enum: ['tenant', 'user'] })
  @ApiImplicitParam({ name: 'email', description: 'Email user', required: true })
  create(@Param() param, @Req() req, @Res() res) {

    const userAgent = req.headers['user-agent'];

    let method;
    if (param.role == 'tenant')
      method = this.forgotPasswordService.forgotPasswordTenantProcess([param.email, userAgent]);
    else if (param.role == 'user')
      method = this.forgotPasswordService.forgotPasswordUserProcess([param.email, userAgent]);

    method.subscribe(
      data => {
        res.send(data);
      }, err => {
        res.send(err);
      }
    );

  }



}