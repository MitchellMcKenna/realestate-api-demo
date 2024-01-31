import { Controller, Get, Logger } from '@nestjs/common';
import { HousesService } from './houses.service';
import { concatMap, mergeMap, Observable, of } from 'rxjs';
import { PhotoService } from './photo/photo.service';
import { House } from './house.schema';

@Controller()
export class HousesController {
  // TODO:: Logger not needed any more?
  private readonly logger = new Logger(HousesService.name);

  constructor(
    private readonly housesService: HousesService,
    private readonly photoService: PhotoService,
  ) {}

  @Get()
  download(): any {
    const startPage: number = 1;
    // TODO:: only download the first 10 pages as noted in requirements.
    return this.fetchPagesRecursively(startPage);
  }

  private fetchPagesRecursively(page: number): Observable<string> {
    return this.housesService.downloadPage(page).pipe(
      mergeMap(async (result: House[]) => {
        console.log(`Page ${page} has result:`);
        console.log(result);

        if (Array.isArray(result) && result.length === 0) {
          return of(`Finished fetching data. No results on page ${page}.`);
        } else {
          try {
            await this.photoService.downloadPhotos(
              result.map((house: House) => house.photoURL),
              './photos',
            );
            // Continue fetching data recursively for the next page
            return this.fetchPagesRecursively(page + 1);
          } catch (error) {
            console.error('Failed to download photos:', error.message);
            // Return an observable with the error message
            return of(`Failed to download photos on page ${page}.`);
          }
        }
      }),
    );
  }
}
