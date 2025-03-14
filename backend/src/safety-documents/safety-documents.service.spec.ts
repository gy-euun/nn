import { Test, TestingModule } from '@nestjs/testing';
import { SafetyDocumentsService } from './safety-documents.service';

describe('SafetyDocumentsService', () => {
  let service: SafetyDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafetyDocumentsService],
    }).compile();

    service = module.get<SafetyDocumentsService>(SafetyDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
