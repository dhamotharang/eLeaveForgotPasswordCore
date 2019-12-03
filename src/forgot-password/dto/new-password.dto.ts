import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * Data for new password
 *
 * @export
 * @class NewPasswordDTO
 */
export class NewPasswordDTO {
  /**
   * User guid
   *
   * @type {string}
   * @memberof NewPasswordDTO
   */
  @ApiModelProperty({ description: 'User guid', example: '0f69b190-0ccf-11ea-93cb-d741ec3e5f8f' })
  @IsNotEmpty()
  @IsString()
  userGuid: string;

  /**
   * Login id
   *
   * @type {string}
   * @memberof NewPasswordDTO
   */
  @ApiModelProperty({ description: 'Login id', example: 'lll@zen.com.my' })
  @IsNotEmpty()
  @IsString()
  loginId: string;

  /**
   * New encrypted password
   *
   * @type {string}
   * @memberof NewPasswordDTO
   */
  @ApiModelProperty({ description: 'Encrypted new password', example: '1f86c446121a0219e5eae8c531981ee550b0844384f1603bc0c9eb625b2c3d91' })
  @IsNotEmpty()
  @IsString()
  password: string;
}