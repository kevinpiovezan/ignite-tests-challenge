import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase} from './ShowUserProfileUseCase'

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase
describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })
  it('should be able to list the user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'Name',
      email: 'email@email.com',
      password: 'password'
    })
    const profile = await showUserProfileUseCase.execute(user.id as string);
    expect(profile).toBeInstanceOf(User);
  })
  it('should not be able list the user profile if user ID not found or Missing', async () => {
    expect(async () => {
      const profile = await showUserProfileUseCase.execute('umIdQualquerDeTeste');
    }).rejects.toBeInstanceOf(AppError)
  })
})
