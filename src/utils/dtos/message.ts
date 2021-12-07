export interface MessageDTO {
  content: string;
  usernameFrom: string;
  edited?: boolean;
  deleted?: boolean;
  timestamp?: Date;
}
