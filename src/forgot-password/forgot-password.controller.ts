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
  @Post(':email')
  @ApiOperation({ title: 'Send email forgot password' })
  @ApiImplicitParam({ name: 'email', description: 'Email user', required: true })
  create(@Param('email') email, @Req() req, @Res() res) {

    this.forgotPasswordService.forgotPasswordProcess(email).subscribe(
      data => {
        res.send(data);
      }, err => {
        res.send(err);
      }
    );

  }



}