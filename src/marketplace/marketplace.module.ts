import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { RidersModule } from "src/riders/riders.module";
import { SponsorsModule } from "src/sponsors/sponsors.module";

@Module({
  imports: [RidersModule, SponsorsModule],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
