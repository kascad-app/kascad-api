import { Module } from '@nestjs/common';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { SponsorSchema } from './schemas/sponsor.schema';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBConfigService } from 'src/config/database/mongodb.config';
import MongoDBConnection from 'src/common/constants/mongoDbConnections';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: 'Sponsors',
        schema: SponsorSchema,
        collection: MongoDBConnection.SPONSORS,
      },
    ]),
  ],
  controllers: [SponsorsController],
  providers: [SponsorsService],
})
export class SponsorsModule {}
