import { ChatDTO } from "./chat";

interface UserChat {
  chat: string | Partial<ChatDTO>;
  user: string | Partial<UserDTO>;
  key: Buffer;
  encrypted?: boolean;
  _id?: string;
}

interface OutgoingRequest {
  user: string | Partial<UserDTO>;
  _id?: string;
}

interface IncomingRequest {
  peerPublicPart: Buffer;
  p: Buffer;
  g: Buffer;
  user: string | Partial<UserDTO>;
  _id?: string;
}

export interface UserDTO {
  _id: string;
  username: string;
  password?: string;
  email: string;
  verified: boolean;
  chats: UserChat[];
  outgoingRequests: OutgoingRequest[] | any;
  incomingRequests: IncomingRequest[] | any;
  save: () => Promise<void>;
}
