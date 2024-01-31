import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PhotoService {
  constructor(private readonly httpService: HttpService) {}

  async downloadPhoto(
    imageUrl: string,
    destinationFolder: string,
  ): Promise<void> {
    try {
      const response: AxiosResponse<Buffer> = await this.httpService
        .get(imageUrl, { responseType: 'arraybuffer' })
        .toPromise();

      const fileExtension = path.extname(imageUrl);
      const fileName = `${path.basename(imageUrl, fileExtension)}${fileExtension}`;
      const filePath = path.join(destinationFolder, fileName);

      fs.writeFileSync(filePath, Buffer.from(response.data));
      console.log(`Downloaded photo: ${fileName}`);
    } catch (error) {
      console.error(
        `Failed to download photo from ${imageUrl}:`,
        error.message,
      );
    }
  }

  async downloadPhotos(
    imageUrls: string[],
    destinationFolder: string,
  ): Promise<void> {
    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    // Download photos concurrently
    const downloadPromises: Promise<void>[] = imageUrls.map(
      (imageUrl: string) => this.downloadPhoto(imageUrl, destinationFolder),
    );
    await Promise.all(downloadPromises);

    console.log('All photos downloaded successfully.');
  }
}
