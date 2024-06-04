import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RidersModule } from './riders/riders.module';

@Module({
  imports: [RidersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
