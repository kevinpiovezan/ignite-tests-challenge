import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase;
describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  });
  it('should not be able to create a new statment if user is not found', () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }
      await createStatementUseCase.execute({
        user_id: 'noUserId',
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should be able to create a new deposit statment', async () => {
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

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test Deposit',
      type: OperationType.DEPOSIT
    })
    expect(statement.amount).toBe(100);
  });
  it('should be able to create a new withdraw statment', async () => {
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
      description: 'Test',
      type: OperationType.DEPOSIT
    })
    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 50,
      description: 'Test Withdraw',
      type: OperationType.WITHDRAW
    })
    expect(statement.amount).toBe(50);
  });
  it('should not be able to create a new withdraw statment if amount is bigger than current amount', () => {
    expect(async ()=> {
      const user = await createUserUseCase.execute({
        email: 'email@email.com',
        name: 'name',
        password: 'password'
      })
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      };

      await createStatementUseCase.execute({
        user_id,
        amount: 50,
        description: 'Test',
        type: OperationType.DEPOSIT
      });
      await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test',
        type: OperationType.WITHDRAW
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
