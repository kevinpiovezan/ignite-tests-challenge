import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('should not be able to get a statement operation if user_id not found or missing', () => {
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

      const statement = await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT
      })
      const statement_id = statement.id as string;
      await getStatementOperationUseCase.execute({
        user_id: 'invalidUserId',
        statement_id
      })
    }).rejects.toBeInstanceOf(AppError);
  })
    it('should not be able to get a statement operation if statement_id not found or missing', () => {
      expect(async () => {
        const user = await createUserUseCase.execute({
          email: 'email@email.com',
          name: 'name',
          password: 'password'
        });
        const user_id = user.id as string;

        enum OperationType {
          DEPOSIT = 'deposit',
          WITHDRAW = 'withdraw',
        };

        await createStatementUseCase.execute({
          user_id,
          amount: 100,
          description: 'Test Deposit',
          type: OperationType.DEPOSIT
        });
        await getStatementOperationUseCase.execute({
          user_id,
          statement_id: 'invalidStatementId'
        });
      }).rejects.toBeInstanceOf(AppError)
    });
    it('should be able to get a statement operation', async () => {
      const user = await createUserUseCase.execute({
        email: 'email@email.com',
        name: 'name',
        password: 'password'
      });
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      };

      const statement = await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT
      });

      const statement_id = statement.id as string;

      const statementOperation = await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      });
      expect(statementOperation).toHaveProperty('id');
    })
});
