import { Test, TestingModule } from "@nestjs/testing";

import { RidersController } from "../controllers/riders.controller";

describe("RidersController", () => {
  let controller: RidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RidersController],
    }).compile();

    controller = module.get<RidersController>(RidersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
