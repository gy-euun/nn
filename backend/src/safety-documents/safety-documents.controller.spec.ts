import { Test, TestingModule } from '@nestjs/testing';
import { SafetyDocumentsController } from './safety-documents.controller';

describe('SafetyDocumentsController', () => {
  let controller: SafetyDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SafetyDocumentsController],
    }).compile();

    controller = module.get<SafetyDocumentsController>(SafetyDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
