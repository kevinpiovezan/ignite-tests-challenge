export interface IGetBalanceDTO {
  user_id: string;
  sender_id?: string | null;
  with_statement?: boolean;
}
