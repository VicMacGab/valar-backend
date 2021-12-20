export interface EditedMessageDto {
  msgId: string;
  newContent: Buffer;
  chatId: string;
  msgIdx: number;
  newNonce: Buffer;
}
