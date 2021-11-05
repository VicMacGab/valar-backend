import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  verified: Boolean,
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
      peerPrivatePart: Schema.Types.Buffer,
      p: Schema.Types.Buffer,
      g: Schema.Types.Buffer,
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const User = mongoose.model("User", UserSchema);
export default User;
