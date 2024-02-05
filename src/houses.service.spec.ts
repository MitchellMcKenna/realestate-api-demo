import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, HttpModule } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HousesService } from './houses.service';
import { House, HouseSchema } from './house.schema';
import { ZodError } from 'zod';

describe('HousesService', () => {
  let service: HousesService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HousesService],
      imports: [HttpModule],
    }).compile();

    service = module.get<HousesService>(HousesService);
    httpService = module.get<HttpService>(HttpService);
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

    it('should handle network error', (done) => {
      const networkError = new Error('Network error');

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => throwError(networkError));

      service.downloadPage(1).subscribe({
        next: () => {
          // This block should not be executed if there's a network error
          done.fail('Network error was not handled');
        },
        error: (error) => {
          expect(error).toEqual(networkError);
          done();
        },
      });
    });
  });
});
