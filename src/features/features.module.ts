import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { ArticlesModule } from "./articles/articles.module";
import { AuthModule } from "./auth/auth.module";
import { ContractOfferModule } from "./contracts/contracts.module";
import { RidersModule } from "./riders/riders.module";
import { SponsorsModule } from "./sponsors/sponsors.module";

@Module({
  imports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    ArticlesModule,
    ContractOfferModule,
    RouterModule.register([
      {
        path: "riders",
        module: RidersModule,
      },
      {
        path: "sponsors",
        module: SponsorsModule,
      },
      {
        path: "articles",
        module: ArticlesModule,
      },
      {
        path: "contracts",
        module: ContractOfferModule,
      },
    ]),
  ],
  controllers: [],
  exports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    ArticlesModule,
    ContractOfferModule,
  ],
})
export class FeaturesModule {}
