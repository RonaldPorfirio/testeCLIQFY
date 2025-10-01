import { Test, TestingModule } from '@nestjs/testing';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { WorkordersService } from '../workorders/workorders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('CheckinsController', () => {
  let controller: CheckinsController;

  const checkinsServiceMock = {
    create: jest.fn(),
    findByWorkorder: jest.fn(),
    findAll: jest.fn(),
  } as Partial<CheckinsService>;

  const workordersServiceMock = {
    findOne: jest.fn(),
    addComment: jest.fn(),
  } as Partial<WorkordersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckinsController],
      providers: [
        { provide: CheckinsService, useValue: checkinsServiceMock },
        { provide: WorkordersService, useValue: workordersServiceMock },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<CheckinsController>(CheckinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
