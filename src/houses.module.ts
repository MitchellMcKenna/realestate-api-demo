import { Module } from '@nestjs/common';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule, HousesModule],
  controllers: [HousesController],
  providers: [HousesService],
})
export class HousesModule {}
