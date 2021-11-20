import mongoose from "mongoose";
import { MessageDTO } from "../utils/dtos/message";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const MessageSchema = new Schema<Partial<MessageDTO>>({
  // TODO: timestamp
  content: String,
  idFrom: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  edited: Boolean,
  deleted: Boolean,
});

export default MessageSchema;
