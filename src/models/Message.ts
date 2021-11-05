import mongoose from "mongoose";

// schema = los tipos de dato de cada fila
// collection = tabla
// document = tupla

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content: String,
  idFrom: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  edited: Boolean,
  deleted: Boolean,
});

export default MessageSchema;
