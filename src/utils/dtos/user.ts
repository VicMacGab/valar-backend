interface UserChat {
  chatId: string;
  key: Buffer;
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
  outgoingRequests: OutgoingRequest[];
  incomingRequests: IncomingRequest[];
  save: () => Promise<void>;
}
