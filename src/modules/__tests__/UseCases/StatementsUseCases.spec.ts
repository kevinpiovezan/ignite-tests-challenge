import { AppError } from "../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../../statements/useCases/getBalance/GetBalanceUseCase";
import { GetStatementOperationUseCase } from "../../statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { User } from "../../users/entities/User";
import { InMemoryUsersRepository } from "../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../users/useCases/createUser/CreateUserUseCase";
import request from 'supertest';
import {v4 as uuidv4 } from 'uuid';
import { Connection, createConnection } from 'typeorm';
import { hash } from 'bcryptjs';
import { app } from "../../../app";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user: User;
describe('Statements Use Cases', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    user = await createUserUseCase.execute({
      name: 'Statements Use Cases',
      email: 'usecases@statments.com',
      password: 'password'
    });
  });

  it('should not be able to create a new statement if user is not found', () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
        TRANSFER = 'transfer'
      }
      await createStatementUseCase.execute({
        user_id: 'noUserId',
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT,
        sender_id: null
      })
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should be able to create a new deposit statement', async () => {
    const user_id = user.id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
      TRANSFER = 'transfer'
    }

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test Deposit',
      type: OperationType.DEPOSIT,
      sender_id: null
    })
    expect(statement.amount).toBe(100);
  });
  it('should be able to create a new withdraw statment', async () => {
    const user_id = user.id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
      TRANSFER = 'transfer'
    }

    await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test',
      type: OperationType.DEPOSIT,
      sender_id: null
    })
    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 50,
      description: 'Test Withdraw',
      type: OperationType.WITHDRAW,
      sender_id: null
    })
    expect(statement.amount).toBe(50);
  });
  it('should not be able to create a new withdraw statment if amount is bigger than current amount', () => {
    expect(async () => {
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
        TRANSFER = 'transfer'
      }

      await createStatementUseCase.execute({
        user_id,
        amount: 50,
        description: 'Test',
        type: OperationType.DEPOSIT,
        sender_id: null
      });
      await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test',
        type: OperationType.WITHDRAW,
        sender_id: null
      });
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to get balance if user id is missing or not found', () => {
    expect(async () => {
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
        TRANSFER = 'transfer'
      }

      await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT,
        sender_id: null
      })
      await getBalanceUseCase.execute({
        user_id: 'invalidUserId'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should be able to get balance of the user', async () => {
    const user_id = user.id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
      TRANSFER = 'transfer'
    }

    await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test Deposit',
      type: OperationType.DEPOSIT,
      sender_id: null
    })
    const balance = await getBalanceUseCase.execute({
      user_id
    });
    expect(balance.balance).toBe(100);
    expect(balance.statement.length).toBe(1);
  });
  it('should not be able to get a statement operation if user_id not found or missing', () => {
    expect(async () => {
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
        TRANSFER = 'transfer'
      }

      const statement = await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT,
        sender_id: null
      })
      const statement_id = statement.id as string;
      await getStatementOperationUseCase.execute({
        user_id: 'invalidUserId',
        statement_id
      })
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to get a statement operation if statement_id not found or missing', () => {
    expect(async () => {
      const user_id = user.id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
        TRANSFER = 'transfer'
      }

      await createStatementUseCase.execute({
        user_id,
        amount: 100,
        description: 'Test Deposit',
        type: OperationType.DEPOSIT,
        sender_id: null
      });
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'invalidStatementId'
      });
    }).rejects.toBeInstanceOf(AppError)
  });
  it('should be able to get a statement operation', async () => {
    const user_id = user.id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
      TRANSFER = 'trasnfer'
    };

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'Test Deposit',
      type: OperationType.DEPOSIT,
      sender_id: null
    });

    const statement_id = statement.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    });
    expect(statementOperation).toHaveProperty('id');
  });
});
