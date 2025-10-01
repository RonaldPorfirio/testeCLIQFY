import { Test, TestingModule } from '@nestjs/testing';
import { WorkordersController } from './workorders.controller';
import { WorkordersService } from './workorders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('WorkordersController', () => {
  let controller: WorkordersController;

  const workordersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as Partial<WorkordersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkordersController],
      providers: [
        { provide: WorkordersService, useValue: workordersServiceMock },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<WorkordersController>(WorkordersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
