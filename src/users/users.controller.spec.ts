import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'example@mail.com',
          password: 'secret',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'secret' } as User]),
      // remove: () => {},
      // update: () => {},
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await usersController.findAllUsers('example@mail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('example@mail.com');
  });

  it('findUser returns a single user with a given id', async () => {
    const user = await usersController.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(usersController.findUser('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('signin updates session object and returns user', async () => {
    const mockSession = { userId: null };
    const user = await usersController.signin(
      { email: 'example@mail.com', password: 'secret' },
      mockSession,
    );

    expect(user.id).toEqual(1);
    expect(mockSession.userId).toEqual(1);
  });
});
