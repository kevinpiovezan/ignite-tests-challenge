import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
describe('Authenticate User', () => {
  beforeEach(()=> {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })
  it('should be able to authenticate a user', async () => {
    const user = await createUserUseCase.execute({
      email: 'email@email.com',
      name: 'name',
      password: 'password'
    })
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: 'email@email.com',
      password: 'password'
    });
    expect(authenticatedUser).toHaveProperty('token');
  })
  it('should not be able to authenticate a user if password is wrong or missing', () => {
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
  })
  it('should not be able to authenticate a user if email is wrong or missing', () => {
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
  })
})
