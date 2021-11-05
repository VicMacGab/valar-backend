import mongoose from "mongoose";

import MessageSchema from "./Message";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
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

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
