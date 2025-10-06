import { Test, TestingModule } from '@nestjs/testing'
import { CheckinsController } from './checkins.controller'
import { CheckinsService } from '@modules/checkins/application/services/checkins.service'
import { WorkordersService } from '@modules/workorders/application/services/workorders.service'
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard'
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard'

describe('CheckinsController', () => {
  let controller: CheckinsController

  const checkinsServiceMock: Partial<CheckinsService> = {
    create: jest.fn(),
    findByWorkorder: jest.fn(),
    findAll: jest.fn(),
  }

  const workordersServiceMock: Partial<WorkordersService> = {
    findOne: jest.fn(),
    addComment: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckinsController],
      providers: [
        { provide: CheckinsService, useValue: checkinsServiceMock },
        { provide: WorkordersService, useValue: workordersServiceMock },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile()

    controller = module.get<CheckinsController>(CheckinsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

