import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RidersModule } from "src/riders/riders.module";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [RidersModule, PassportModule.register({ defaultStrategy: "jwt" })],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
