interface UserChat {
  chatId: string;
  key: Buffer;
}

interface OutgoingRequest {
  a: Buffer;
  p: Buffer;
  g: Buffer;
  userId: string;
}

interface IncomingRequest {
  peerPrivatePart: Buffer;
  p: Buffer;
  g: Buffer;
  userId: string;
}

export interface UserDTO {
  username: string;
  password?: string;
  email: string;
  verified: boolean;
  chats: UserChat[];
  outgoingRequests: OutgoingRequest[];
  incomingRequests: IncomingRequest[];
}
