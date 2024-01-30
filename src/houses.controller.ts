import { Controller, Get, Logger } from "@nestjs/common";
import { HousesService } from './houses.service';
import { HttpService } from '@nestjs/axios';

@Controller()
export class HousesController {
  private readonly logger = new Logger(HousesService.name);

  constructor(private readonly housesService: HousesService) {}

  @Get()
  /*
  getHello(): Observable<any> {
    const houses = this.httpService
      .get('https://app-homevision-staging.herokuapp.com/api_project/houses')
      .pipe(map((resp) => resp.data));
    console.log(houses);

    return houses;
  }
   */
  async download(): any {
    try {
      const houses = await this.housesService.downloadPage();
    } catch (e) {
      console.log(e);
    }
    console.log(houses);
    return houses;
  }
}
