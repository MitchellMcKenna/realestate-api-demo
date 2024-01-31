import { Controller, Get, Logger } from '@nestjs/common';
import { HousesService } from './houses.service';
import {
  catchError,
  concatMap,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
} from 'rxjs';
import { PhotoService } from './photo/photo.service';
import { House } from './house.schema';

@Controller()
export class HousesController {
  // TODO:: Logger not needed any more?
  private readonly logger = new Logger(HousesService.name);

  private maxPages: number = 10;

  constructor(
    private readonly housesService: HousesService,
    private readonly photoService: PhotoService,
  ) {}

  @Get()
  downloadPages(): Observable<string> {
    const startPage: number = 1;

    return this.fetchPagesRecursively(startPage, this.maxPages).pipe(
      catchError((error) => {
        console.error(`Error during page download: ${error}`);
        return of(`Failed to download pages: ${error}`);
      }),
      finalize(() => {
        console.log('Page download process completed.');
      }),
    );
  }

  private fetchPagesRecursively(
    currentPage: number,
    maxPages: number,
  ): Observable<string> {
    return this.housesService.downloadPage(currentPage).pipe(
      mergeMap((houses: House[]): Observable<string> => {
        if (Array.isArray(houses) && houses.length === 0) {
          return of(
            `Finished fetching data. No results on page ${currentPage}.`,
          );
        }

        return from(
          this.photoService.downloadPhotos(
            houses.map((house: House) => house.photoURL),
            './photos',
          ),
        ).pipe(
          map(() => `Downloaded photos for page ${currentPage}.`),
          mergeMap(() => {
            if (currentPage >= maxPages) {
              return of(`Reached maxPages limit of ${maxPages}.`);
            } else {
              return this.fetchPagesRecursively(currentPage + 1, maxPages);
            }
          }),
        );
      }),
    );
  }
}
