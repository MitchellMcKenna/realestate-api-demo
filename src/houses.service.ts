import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, Observable, retry } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HouseSchema, House } from './house.schema';
import { ZodError } from 'zod';

interface ApiResponse {
  houses: House[];
  ok: boolean;
}

@Injectable()
export class HousesService {
  private readonly logger = new Logger(HousesService.name);
  constructor(private readonly httpService: HttpService) {}

  downloadPage(page: number = 1, perPage: number = 100): Observable<House[]> {
    // TODO:: Pull apiUrl out to a config file.
    const apiUrl: string = `https://app-homevision-staging.herokuapp.com/api_project/houses?page=${page}&per_page=${perPage}`;

    return this.httpService.get(apiUrl).pipe(
      retry({ count: 5, delay: 100 }), // TODO:: Improve with exponential backoff.
      map((response: AxiosResponse<ApiResponse>) => {
        return response.data.houses.map((house: House) => {
          try {
            return HouseSchema.parse(house);
          } catch (error) {
            if (error instanceof ZodError) {
              console.error(
                `Validation error for house on page ${page}:`,
                error.errors,
                'For House:',
                house,
              );
            }

            // Rethrow the error to propagate it to the catchError block
            throw error;
          }
        });
      }),
      catchError((error) => {
        console.error(`Error fetching page ${page}:`, error.message);
        throw error;
      }),
    );
  }
}
