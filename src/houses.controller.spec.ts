import { Test, TestingModule } from '@nestjs/testing';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';

describe('HousesController', () => {
  let appController: HousesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HousesController],
      providers: [HousesService],
    }).compile();

    appController = app.get<HousesController>(HousesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
