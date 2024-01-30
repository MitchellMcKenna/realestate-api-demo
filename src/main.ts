import { NestFactory } from '@nestjs/core';
import { HousesModule } from './houses.module';

async function bootstrap() {
  // TODO:: Switch to Fastify for better speed.
  const app = await NestFactory.create(HousesModule);
  await app.listen(3000);
}
bootstrap();
