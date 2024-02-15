import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, HttpModule } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HousesService } from './houses.service';
import { House, HouseSchema } from './house.schema';
import { ZodError } from 'zod';
import { ConfigService } from '@nestjs/config';

describe('HousesService', () => {
  let service: HousesService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HousesService, ConfigService],
      imports: [HttpModule],
    }).compile();

    service = module.get<HousesService>(HousesService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('downloadPage', () => {
    it('should fetch and parse houses successfully', (done) => {
      const mockApiResponse: AxiosResponse<{ houses: House[] }> = {
        data: {
          houses: [
            {
              id: 0,
              address: '4 Pumpkin Hill Street Antioch, TN 37013',
              homeowner: 'Nicole Bone',
              price: 105124,
              photoURL:
                'https://image.shutterstock.com/image-photo/big-custom-made-luxury-house-260nw-374099713.jpg',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(mockApiResponse));

      service.downloadPage(1).subscribe((result) => {
        expect(result).toEqual([
          {
            id: 0,
            address: '4 Pumpkin Hill Street Antioch, TN 37013',
            homeowner: 'Nicole Bone',
            price: 105124,
            photoURL:
              'https://image.shutterstock.com/image-photo/big-custom-made-luxury-house-260nw-374099713.jpg',
          },
        ]);
        done();
      });
    });

    it('should handle validation error with ZodError', (done) => {
      const mockApiResponse: AxiosResponse<{ houses: House[] }> = {
        data: {
          houses: [
            {
              id: 1,
              address: '4 Pumpkin Hill Street Antioch, TN 37013',
              homeowner: 'Nicole Bone',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(mockApiResponse));

      service.downloadPage(1).subscribe({
        next: () => {
          // This block should not be executed if there's a validation error
          done.fail('Validation error was not handled');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(ZodError);
          done();
        },
      });
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      const pageNumber = 1;

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => throwError(() => networkError));

      // Mock ConfigService.get to return base URL
      jest
        .spyOn(configService, 'get')
        .mockReturnValue('https://example.com/api/houses');

      try {
        await service.downloadPage(pageNumber);
      } catch (error) {
        // We expect this error because the HTTP request will fail
      }

      expect(httpService.get).toHaveBeenCalledWith(
        `https://example.com/api/houses?page=${pageNumber}&per_page=10`,
      );
    });
  });
});
