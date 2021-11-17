import mongoose, { Model } from "mongoose";
import isEmail from "validator/lib/isEmail";

import { UserDTO } from "../utils/dtos/user";

const Schema = mongoose.Schema;

const UserSchema = new Schema<UserDTO>({
  username: { type: String, required: true, index: "hashed" },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
    index: "hashed",
    validate: [isEmail, "Invalid email."],
  },
  verified: { type: Boolean, default: false },
  chats: [
    {
      chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
      key: Schema.Types.Buffer,
    },
  ],
  outgoingRequests: [
    {
      a: Schema.Types.Buffer,
      p: Schema.Types.Buffer,
      g: Schema.Types.Buffer,
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  incomingRequests: [
    {
      peerPrivatePart: Schema.Types.Buffer, // g^a mod p
      p: Schema.Types.Buffer,
      g: Schema.Types.Buffer,
      // g^b mod p
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const User: Model<UserDTO> = mongoose.model<UserDTO>("User", UserSchema);

export default User;
