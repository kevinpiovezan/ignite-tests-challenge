import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });
  it('should not be able to get balance if user id is missing or not found', () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: 'email@email.com',
        name: 'name',
        password: 'password'
      })
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }

      await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT
      })
      await getBalanceUseCase.execute({
        user_id: 'invalidUserId'
      });
    }).rejects.toBeInstanceOf(AppError);
  })
  it('should be able to get balance of the user', async () => {
    const user = await createUserUseCase.execute({
      email: 'email@email.com',
      name: 'name',
      password: 'password'
    })
    const user_id = user.id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test Deposit',
      type: OperationType.DEPOSIT
    })
    const balance = await getBalanceUseCase.execute({
      user_id
    });
    expect(balance.balance).toBe(100);
    expect(balance.statement.length).toBe(1);
  });
})
