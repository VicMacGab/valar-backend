import mongoose, { Model } from "mongoose";
import { MessageDTO } from "../utils/dtos/message";

const Schema = mongoose.Schema;

const MessageSchema = new Schema<Partial<MessageDTO>>({
  content: {
    type: Schema.Types.Buffer,
    required: true,
  },
  //TODO: username cambiar a id
  usernameFrom: {
    type: Schema.Types.String,
    required: true,
  },
  edited: {
    type: Schema.Types.Boolean,
    default: false,
  },
  deleted: {
    type: Schema.Types.Boolean,
    default: false,
  },
  timestamp: {
    type: Schema.Types.Date,
    default: () => Date.now(),
  },
  nonce: {
    type: Schema.Types.Buffer,
    required: true,
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },
});

const Message: Model<Partial<MessageDTO>> = mongoose.model(
  "Message",
  MessageSchema
);

export default Message;
