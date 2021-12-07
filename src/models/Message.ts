import mongoose from "mongoose";
import logger from "../services/loggerService";
import { MessageDTO } from "../utils/dtos/message";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const MessageSchema = new Schema<Partial<MessageDTO>>({
  // TODO: timestamp
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
