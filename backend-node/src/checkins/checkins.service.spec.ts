import { Test, TestingModule } from '@nestjs/testing';
import { CheckinsService } from './checkins.service';
import { WorkordersService } from '../workorders/workorders.service';

describe('CheckinsService', () => {
  let service: CheckinsService;

  const workordersServiceMock = {
    findOne: jest.fn(),
    addComment: jest.fn(),
  } as Partial<WorkordersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinsService,
        { provide: WorkordersService, useValue: workordersServiceMock },
      ],
    }).compile();

    service = module.get<CheckinsService>(CheckinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
