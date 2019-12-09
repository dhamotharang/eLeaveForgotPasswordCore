import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsString } from "class-validator";

/**
 * Data for send email
 *
 * @export
 * @class SendEmailDTO
 */
export class SendEmailDTO {
  /**
   * Email to send
   *
   * @type {string}
   * @memberof SendEmailDTO
   */
  @ApiModelProperty({ description: 'Email to send', example: 'lll@zen.com.my' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  /**
   * Role application to process forgot password
   *
   * @type {string}
   * @memberof SendEmailDTO
   */
  @ApiModelProperty({ description: 'Role application', example: 'tenant' })
  @IsNotEmpty()
  @IsString()
  role: string;
}