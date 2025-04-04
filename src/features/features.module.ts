import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { AuthModule } from "./auth/auth.module";
import { RidersModule } from "./riders/riders.module";
import { SponsorsModule } from "./sponsors/sponsors.module";

@Module({
  imports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    RouterModule.register([
      {
        path: "rider",
        module: RidersModule,
      },
      {
        path: "sponsor",
        module: SponsorsModule,
      },
    ]),
  ],
  controllers: [],
  exports: [RidersModule, SponsorsModule, AuthModule],
})
export class FeaturesModule {}
