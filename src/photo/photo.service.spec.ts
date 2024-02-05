import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PhotoService } from './photo.service';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as fs from 'fs';

// Mocking AxiosResponse and HttpService
jest.mock('axios');
jest.mock('fs');

const mockedAxiosResponse: AxiosResponse<Buffer> = {
  data: Buffer.from('Mocked image data'),
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: undefined,
  },
};

describe('PhotoService', () => {
  let service: PhotoService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of(mockedAxiosResponse)),
          },
        },
      ],
    }).compile();

    service = module.get<PhotoService>(PhotoService);
    httpService = module.get<HttpService>(HttpService);

    console.log = jest.fn();
    console.error = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('downloadPhoto', () => {
    it('should download and save a photo successfully', async () => {
      const house = {
        id: 123,
        address: 'Mocked Address',
        homeOwner: 'Mocked Owner',
        price: 199,
        photoURL: 'http://example.com/mock.jpg',
      };

      await service.downloadPhoto(house, './mock-destination');

      // Assert that HttpService.get was called with the correct URL
      expect(httpService.get).toHaveBeenCalledWith(house.photoURL, {
        responseType: 'arraybuffer',
      });

      // Assert that fs.writeFileSync was called with the correct parameters
      const expectedFileName = '123-mocked-address.jpg';
      const expectedFilePath = 'mock-destination/' + expectedFileName;
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        expect.any(Buffer),
      );

      // Assert that the log message indicates successful download
      expect(console.log).toHaveBeenCalledWith(
        `Downloaded photo: ${expectedFileName}`,
      );
    });

    it('should handle download failure', async () => {
      const house = {
        id: 123,
        address: 'Mocked Address',
        photoURL: 'http://example.com/mock.jpg',
      };

      // Mocking the httpService.get to simulate an error
      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of({} as AxiosResponse));

      await service.downloadPhoto(house, './mock-destination');

      // Assert that the error message is logged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to download photo from http://example.com/mock.jpg:',
        'The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined',
      );
    });
  });

  describe('downloadPhotos', () => {
    it('should download photos concurrently', async () => {
      service.downloadPhoto = jest.fn();

      const houses = [
        {
          id: 123,
          address: 'Mocked Address 1',
          photoURL: 'http://example.com/mock1.jpg',
        },
        {
          id: 456,
          address: 'Mocked Address 2',
          photoURL: 'http://example.com/mock2.jpg',
        },
      ];

      // Mocking fs.existsSync to simulate folder existence
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);

      // Mocking fs.mkdirSync to simulate folder creation
      jest.spyOn(fs, 'mkdirSync').mockImplementationOnce(() => undefined);

      // Mocking fs.writeFileSync to simulate file writing
      jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});

      await service.downloadPhotos(houses, './mock-destination');

      // Assert that downloadPhoto was called for each house
      expect(service.downloadPhoto).toHaveBeenCalledWith(
        houses[0],
        './mock-destination',
      );
      expect(service.downloadPhoto).toHaveBeenCalledWith(
        houses[1],
        './mock-destination',
      );

      // Assert that the log message indicates successful completion
      expect(console.log).toHaveBeenCalledWith(
        'All photos concurrently downloaded successfully.',
      );
    });
  });
});
