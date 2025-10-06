import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { WorkordersService } from './workorders.service';
import { PrismaService } from '../../../../prisma/prisma.service';

const prismaMock = {
  workorder: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  timelineEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (operations: any) => {
    if (Array.isArray(operations)) {
      return Promise.all(operations.map((fn) => (typeof fn === 'function' ? fn() : fn)));
    }
    if (typeof operations === 'function') {
      return operations(prismaMock);
    }
    return null;
  }),
};

describe('WorkordersService', () => {
  let service: WorkordersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkordersService,
        { provide: PrismaService, useValue: prismaMock },
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
