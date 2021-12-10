import mongoose from "mongoose";
import { MessageDTO } from "../utils/dtos/message";

const Schema = mongoose.Schema;

const MessageSchema = new Schema<Partial<MessageDTO>>({
  content: {
    type: Schema.Types.String,
    required: true,
  },
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
});

export default MessageSchema;
