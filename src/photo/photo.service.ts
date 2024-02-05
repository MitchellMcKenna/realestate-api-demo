import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom, retry } from 'rxjs';
import { House } from '../house.schema';
import slugify from 'slugify';

@Injectable()
export class PhotoService {
  constructor(private readonly httpService: HttpService) {}

  async downloadPhoto(house: House, destinationFolder: string): Promise<void> {
    try {
      const response: AxiosResponse<Buffer> = await firstValueFrom(
        this.httpService
          .get(house.photoURL, { responseType: 'arraybuffer' })
          .pipe(
            retry({ count: 5, delay: 100 }), // TODO:: Improve with exponential backoff.
          ),
      );

      // Save photo in format [id]-[address].[ext]
      const fileExtension: string = path.extname(house.photoURL);
      const addressSlug: string = slugify(house.address, { lower: true });
      const fileName: string = `${house.id}-${addressSlug}${fileExtension}`;
      const filePath: string = path.join(destinationFolder, fileName);

      // TODO:: Check if file already exists and skip if if it does.

      // TODO:: Use fs.promises.writeFile() instead of fs.writeFileSync() to increase concurrency.
      fs.writeFileSync(filePath, Buffer.from(response.data));

      console.log(`Downloaded photo: ${fileName}`);
    } catch (error) {
      console.error(
        `Failed to download photo from ${house.photoURL}:`,
        error.message,
      );
    }
  }

  // TODO:: Update class to take url/filename instead of House if needed to use for other image downloads.
  async downloadPhotos(
    houses: House[],
    destinationFolder: string,
  ): Promise<void> {
    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    // Download photos concurrently
    const downloadPromises: Promise<void>[] = houses.map((house: House) =>
      this.downloadPhoto(house, destinationFolder),
    );
    await Promise.all(downloadPromises);

    console.log('All photos concurrently downloaded successfully.');
  }
}
