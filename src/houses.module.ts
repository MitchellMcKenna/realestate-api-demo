import { Module } from '@nestjs/common';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { HttpModule } from '@nestjs/axios';
import { PhotoService } from './photo/photo.service';
import { ConfigModule } from '@nestjs/config';
import servicesConfig from './config/services.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [servicesConfig],
    }),
    // TODO:: Move static values to configService or HttpConfigService class.
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
