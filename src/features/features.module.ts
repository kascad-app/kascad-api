import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { AuthModule } from "./auth/auth.module";
import { RidersModule } from "./riders/riders.module";
import { SponsorsModule } from "./sponsors/sponsors.module";
import { ArticlesModule } from "./articles/articles.module";

@Module({
  imports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    ArticlesModule,
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
    ]),
  ],
  controllers: [],
  exports: [RidersModule, SponsorsModule, AuthModule, ArticlesModule],
})
export class FeaturesModule {}
