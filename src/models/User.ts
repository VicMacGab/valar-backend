import mongoose, { Model } from "mongoose";
import isEmail from "validator/lib/isEmail";

import { UserDTO } from "../utils/dtos/user";

const Schema = mongoose.Schema;

const UserSchema = new Schema<UserDTO>({
  username: { type: String, required: true, index: "hashed" },
  password: { type: String, required: true },
  // TODO: el indice del mail esta porlas creo
  email: {
    type: String,
    required: true,
    index: "hashed",
    validate: [isEmail, "Invalid email."],
  },
  verified: { type: Boolean, default: false },
  chats: [
    {
      chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  outgoingRequests: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      accepted: {
        type: Boolean,
        default: false,
      },
      peerPublicPart: Schema.Types.Buffer, // g^b mod p
      p: Schema.Types.Buffer,
      g: Schema.Types.Buffer,
    },
  ],
  incomingRequests: [
    {
      peerPublicPart: Schema.Types.Buffer, // g^a mod p
      p: Schema.Types.Buffer,
      g: Schema.Types.Buffer,
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const User: Model<UserDTO> = mongoose.model<UserDTO>("User", UserSchema);

export default User;
