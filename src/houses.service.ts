import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, interval, map, Observable, retry } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HouseSchema, House } from './house.schema';
import { ZodError } from 'zod';
import { ConfigService } from '@nestjs/config';

interface ApiResponse {
  houses: House[];
  ok: boolean;
}

@Injectable()
export class HousesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  downloadPage(page: number = 1, perPage: number = 10): Observable<House[]> {
    const apiUrl: string =
      this.configService.get('services.houses_api.base_url') +
      `?page=${page}&per_page=${perPage}`;

    return this.httpService.get(apiUrl).pipe(
      retry({
        count: 5,
        delay: (error, retryAttempt) => {
          // Implements exponential backoff
          const retryDelay: number = Math.pow(2, retryAttempt) * 100;
          console.log('retrying in ' + retryDelay + 'ms');
          return interval(retryDelay);
        },
      }),
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
