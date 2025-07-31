import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { ArticlesModule } from "./articles/articles.module";
import { AuthModule } from "./auth/auth.module";
import { DirectMessagesModule } from "./direct-messages/direct-messages.module";
import { MailModule } from "./mails/mails.module";
import { OffersModule } from "./offers/offers.module";
import { RidersModule } from "./riders/riders.module";
import { SearchModule } from "./search/search.module";
import { SponsorsModule } from "./sponsors/sponsors.module";

@Module({
  imports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    ArticlesModule,
    SearchModule,
    MailModule,
    OffersModule,
    DirectMessagesModule,
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
        path: "mails",
        module: MailModule,
      },
      {
        path: "offers",
        module: OffersModule,
      },
      {
        path: "dm",
        module: DirectMessagesModule,
      },
    ]),
  ],
  controllers: [],
  exports: [
    RidersModule,
    SponsorsModule,
    AuthModule,
    ArticlesModule,
    SearchModule,
    DirectMessagesModule,
  ],
})
export class FeaturesModule {}
