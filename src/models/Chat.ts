import mongoose, { Model } from "mongoose";
import { ChatDTO } from "../utils/dtos/chat";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const ChatSchema = new Schema<Partial<ChatDTO>>({
  user1: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  user2: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Chat: Model<Partial<ChatDTO>> = mongoose.model("Chat", ChatSchema);
export default Chat;
