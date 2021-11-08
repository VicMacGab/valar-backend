import mongoose, { Model } from "mongoose";
import { ChatDTO } from "../utils/dtos/chat";

import MessageSchema from "./Message";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const ChatSchema = new Schema<Partial<ChatDTO>>({
  idUser1: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  idUser2: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [MessageSchema],
});

const Chat: Model<Partial<ChatDTO>> = mongoose.model("Chat", ChatSchema);
export default Chat;
