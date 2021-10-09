import { AppError } from "../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../users/useCases/createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
describe('Users Controllers', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it('should be able to authenticate a user', async () => {
    await createUserUseCase.execute({
      email: 'email@email.com',
      name: 'name',
      password: 'password'
    })
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: 'email@email.com',
      password: 'password'
    });
    expect(authenticatedUser).toHaveProperty('token');
  });
  it('should not be able to authenticate an user if password is wrong or missing', () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: 'email@email.com',
        name: 'name',
        password: 'password'
      })
      await authenticateUserUseCase.execute({
        email: 'email@email.com',
        password: 'wrongPassword'
      });
    }).rejects.toBeInstanceOf(AppError)
  });
  it('should not be able to authenticate an user if email is wrong or missing', () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: 'email@email.com',
        name: 'name',
        password: 'password'
      })
      await authenticateUserUseCase.execute({
        email: 'wrongemail@email.com',
        password: 'password'
      });
    }).rejects.toBeInstanceOf(AppError)
  });
  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Name',
      email: 'create@email.com',
      password: 'password'
    });
    expect(user).toHaveProperty('id');
  });
  it('should not be able to create a new user with the same email', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Name',
        email: 'email@email.com',
        password: 'password'
      })
      await createUserUseCase.execute({
        name: 'Name 2',
        email: 'email@email.com',
        password: 'password'
      })
    }).rejects.toBeInstanceOf(AppError)
  });
});