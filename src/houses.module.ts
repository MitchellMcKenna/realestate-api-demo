import { Module } from '@nestjs/common';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { HttpModule } from '@nestjs/axios';
import { PhotoService } from './photo/photo.service';

@Module({
  imports: [
    // TODO:: Move to static values to configService or HttpConfigService class.
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    HousesModule,
  ],
  controllers: [HousesController],
  providers: [HousesService, PhotoService],
})
export class HousesModule {}
