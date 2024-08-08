import mongoose from "mongoose";

export const SessionSchema = new mongoose.Schema(
  {
    userId: String,
    socketId: String,
  },
  { timestamps: true },
);

export const UserSchema = new mongoose.Schema(
  {
    username: String,
    status: Boolean,
  },
  { timestamps: true },
);

export const MessagesSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    seen: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    content: String,
  },
  { timestamps: true },
);

export const SessionModel = mongoose.model("Session", SessionSchema);
export const UserModel = mongoose.model("User", UserSchema);
export const MessagesModel = mongoose.model("Messages", MessagesSchema);
