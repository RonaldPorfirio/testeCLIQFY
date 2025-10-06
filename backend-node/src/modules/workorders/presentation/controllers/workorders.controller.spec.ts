import { Test, TestingModule } from '@nestjs/testing'
import { WorkordersController } from './workorders.controller'
import { WorkordersService } from '@modules/workorders/application/services/workorders.service'
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard'
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard'

describe('WorkordersController', () => {
  let controller: WorkordersController

  const workordersServiceMock: Partial<WorkordersService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkordersController],
      providers: [
        { provide: WorkordersService, useValue: workordersServiceMock },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile()

    controller = module.get<WorkordersController>(WorkordersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

