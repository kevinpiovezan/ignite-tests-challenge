import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  TRANSFERS = 'transfers',
  WITHDRAW = 'withdraw',
}
@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);
    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    let statementOperation;

    if(type === 'withdraw') {

      const { balance } = await this.statementsRepository.getUserBalance({ user_id });
      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }
    if(type === 'transfers') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id, sender_id });
      if (user_id === sender_id) {
        if(balance < amount) {
          throw new CreateStatementError.InsufficientFunds()
        }
      }
      statementOperation = await this.statementsRepository.create({
        user_id,
        type: OperationType.TRANSFERS,
        amount,
        description,
        sender_id
      });
      return statementOperation;
    }

    statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id
    });

    return statementOperation;
  }
}
