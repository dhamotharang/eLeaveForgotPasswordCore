import { Test } from '@nestjs/testing';
import { ForgotPasswordController } from '../../src/forgot-password/forgot-password.controller';
import { ForgotPasswordService } from '../../src/forgot-password/forgot-password.service';

describe('ForgotPasswordController', () => {
  let Controller: ForgotPasswordController;
  let Service: ForgotPasswordService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ForgotPasswordController],
      providers: [ForgotPasswordService],
    }).compile();

    Service = module.get<ForgotPasswordService>(ForgotPasswordService);
    Controller = module.get<ForgotPasswordController>(ForgotPasswordController);
  });

  // describe('findAll', () => {
  //   it('should return an array of users', async () => {
  //     const result = ['test'];
  //     jest.spyOn(Service, 'findAll').mockImplementation(() => result);

  //     expect(await Controller.findAll()).toBe(result);
  //   });
  // });
});