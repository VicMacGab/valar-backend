export interface MessageDTO {
  content: Buffer;
  usernameFrom: string;
  edited?: boolean;
  deleted?: boolean;
  timestamp?: Date;
  nonce: Buffer;
  chatId: string;
}
