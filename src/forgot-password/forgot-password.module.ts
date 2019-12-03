import { ForgotPasswordController } from "./forgot-password.controller";
import { getModuleHttp } from "../common/helper/basic-function.function";
import { Module } from "@nestjs/common";
import { QueryParserService } from "../common/helper/query-parser.service";
import { ForgotPasswordService } from "./forgot-password.service";
import { UserDbService } from "../common/db/table.db.service";
import { EmailNodemailerService } from "../common/helper/email-nodemailer.service";

@Module({
  providers: [
    QueryParserService,
    ForgotPasswordService,
    UserDbService,
    EmailNodemailerService
  ],
  controllers: [
    ForgotPasswordController
  ],
  imports: [
    getModuleHttp()
  ]
})
export class ForgotPasswordModule { }