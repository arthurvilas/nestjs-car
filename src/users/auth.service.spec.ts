import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const testingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // If anyone depends on:
          provide: UsersService,
          // Give them:
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    authService = testingModule.get(AuthService);
  });

  it('can create an instance of AuthService', async () => {
    expect(authService).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await authService.signup('bob@bob', 'secret');
    const [salt, hash] = user.password.split('.');
    expect(user.password).not.toEqual('secret');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email already in use', async () => {
    await authService.signup('email@inuse', 'secret');

    await expect(authService.signup('email@inuse', 'secret')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      authService.signin('inexistent@email', 'secret'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await authService.signup('my@email', 'right');

    await expect(authService.signin('my@email', 'wrong')).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await authService.signup('new@email', 'secret');

    const user = await authService.signin('new@email', 'secret');
    expect(user).toBeDefined();
  });
});
