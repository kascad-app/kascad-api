import { Test, TestingModule } from '@nestjs/testing';
import { SponsorsController } from '../sponsors.controller';

describe('SponsorsController', () => {
  let controller: SponsorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SponsorsController],
    }).compile();

    controller = module.get<SponsorsController>(SponsorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
