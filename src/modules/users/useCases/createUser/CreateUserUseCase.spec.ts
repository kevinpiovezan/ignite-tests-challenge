import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"


let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })
  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Name',
      email: 'email@email.com',
      password: 'password'
    })
    expect(user).toHaveProperty('id');
  })
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
  })
})
