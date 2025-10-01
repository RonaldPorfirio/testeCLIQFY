import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { WorkordersService } from './workorders.service';

describe('WorkordersService', () => {
  let service: WorkordersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkordersService,
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkordersService>(WorkordersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
