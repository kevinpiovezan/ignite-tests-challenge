import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFERS = 'transfers'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description, receiver_id } = request.body;

    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 1] as OperationType;
    const createStatement = container.resolve(CreateStatementUseCase);
    let statement;

    if(type === 'transfers') {
      statement = await createStatement.execute({
        user_id,
        type,
        amount,
        description,
        sender_id: user_id,

      });
      await createStatement.execute({
        user_id: receiver_id,
        type,
        amount,
        description,
        sender_id: user_id
      });

      return response.status(201).json(statement);
    }

      statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      sender_id: null,
    });

    return response.status(201).json(statement);
  }
}
