import { MessageDTO } from "./message";

export interface ChatDTO {
  idUser1: string;
  idUser2: string;
  messages: MessageDTO[];
}
