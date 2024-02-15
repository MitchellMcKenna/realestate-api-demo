import { Controller, Get } from '@nestjs/common';
import { HousesService } from './houses.service';
import { catchError, finalize, from, mergeMap, Observable, of } from 'rxjs';
import { PhotoService } from './photo/photo.service';
import { House } from './house.schema';

@Controller()
export class HousesController {
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
        console.log('House photo download process completed.');
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

        return from(this.photoService.downloadPhotos(houses, './photos')).pipe(
          mergeMap(() => {
            if (currentPage >= maxPages) {
              return of(
                `Download complete. Reached max page limit: ${maxPages}.`,
              );
            } else {
              return this.fetchPagesRecursively(currentPage + 1, maxPages);
            }
          }),
        );
      }),
    );
  }
}
