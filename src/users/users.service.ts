import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  // DI does not play well with generics, so it is aided by @InjectRepository
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  create(email: string, password: string) {
    const user = this.usersRepository.create({ email, password });

    return this.usersRepository.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.usersRepository.findOneBy({ id });
  }

  find(email: string) {
    return this.usersRepository.find({ where: { email } });
  }

  async update(id: number, attributes: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attributes);
    return this.usersRepository.save(user);
  }

  async remove(id) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.remove(user);
  }
}
