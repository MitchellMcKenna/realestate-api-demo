import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class HousesService {
  private readonly logger = new Logger(HousesService.name);
  constructor(private readonly httpService: HttpService) {}

  async downloadPage(page: number = 1, perPage: number = 1): Promise<Observable<AxiosResponse<any[], any>>> {
    const apiUrl = `https://app-homevision-staging.herokuapp.com/api_project/houses?page=${page}&per_page=${perPage}`;
    // TODO:: timeout and retry.
    const { data } = await firstValueFrom(
      this.httpService.get<any[]>(apiUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}
