import { Test, TestingModule } from '@nestjs/testing';
import { CheckinsService } from './checkins.service';
import { WorkordersService } from '@modules/workorders/application/services/workorders.service';
import { PrismaService } from '../../../../prisma/prisma.service';

describe('CheckinsService', () => {
  let service: CheckinsService;

  const workordersServiceMock: Partial<WorkordersService> = {
    findOne: jest.fn(),
  };

  const prismaMock = {
    checkin: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    timelineEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (handler: any) => handler(prismaMock)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinsService,
        { provide: WorkordersService, useValue: workordersServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CheckinsService>(CheckinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
