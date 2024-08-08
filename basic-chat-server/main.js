import { Server } from "socket.io";
import { createServer } from "node:http";
import "dotenv/config";
import mongoose from "mongoose";
import cron from "node-cron";
import { MessagesModel, SessionModel, UserModel } from "./db.js";

const PORT = 4000;

const server = createServer();

const io = new Server(server, {
  cors: { origin: "*" },
});
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Executing the cron job for removing the expired sessions");
    const sessions = await SessionModel.find({}, "_id createdAt");
    const expiredSessions = sessions.filter((value) => {
      return (
        (new Date() - new Date(value.createdAt)) / (60 * 60 * 60 * 24) >= 3
      );
    });
    for (let session in expiredSessions) {
      await SessionModel.deleteOne({ _id: session._id }).exec();
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);
server.listen(PORT, async () => {
  await mongoose.connect(process.env.MONGODB);
  console.log("Web socket started");
});
io.on("connection", async (socket) => {
  const auth = socket.handshake.auth;
  let session = "";
  let user = "";
  if (auth.sessionId && (await SessionModel.findOne({ _id: auth.sessionId }))) {
    const userSession = await SessionModel.findOne({ _id: auth.sessionId });
    user = await UserModel.findOne({ _id: userSession.userId });
    await UserModel.updateOne({ _id: userSession.userId }, { status: true });
  } else {
    user = await UserModel.findOne({
      username: auth.username,
    }).exec();
    if (!user) {
      user = await UserModel.create({
        username: auth.username,
        status: true,
      });
    }
    await UserModel.updateOne({ username: auth.username }, { status: true });
  }
  session = await SessionModel.findOne({
    userId: user._id,
  }).exec();
  if (!session) {
    session = await SessionModel.create({
      userId: user._id,
      socketId: socket.id,
    });
  } else {
    await SessionModel.updateOne(
      {
        userId: user._id,
      },
      { socketId: socket.id },
    );
  }
  session = await SessionModel.findOne({
    userId: user._id,
  });
  socket.emit("session", {
    sessionId: session._id,
    userId: session.userId,
    username: user.username,
  });
  const users = await UserModel.find({});
  for (let [id, sock] of io.of("/").sockets) {
    sock.emit("users", users);
  }

  socket.on("get_user", async (data) => {
    const session = await SessionModel.findOne({ userId: data.currentUserId });
    const fromMessages = await MessagesModel.find({
      from: data.currentUserId,
      to: data.userId,
    });
    let toMessages = await MessagesModel.find({
      from: data.userId,
      to: data.currentUserId,
    });
    let seen = false;
    if (session) {
      for (let [id, sock] of io.of("/").sockets) {
        if (id === session.socketId) {
          seen = true;
          break;
        }
      }
      for (let i = 0; i < toMessages.length; i++) {
        await MessagesModel.updateOne(
          { _id: toMessages[i]._id },
          { seen: toMessages[i].seen | seen },
        );
      }
    }
    toMessages = await MessagesModel.find({
      from: data.userId,
      to: data.currentUserId,
    });
    const messages = fromMessages.concat(toMessages);
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const toUser = await UserModel.findOne({ _id: data.userId });
    const fromUser = await UserModel.findOne({ _id: data.currentUserId });
    if (seen) {
      socket.to(session.socketId).emit("private chat", {
        toUser: fromUser,
        fromUser: toUser,
        messages: messages,
      });
    }
    socket.emit("private chat", {
      fromUser: fromUser,
      toUser: toUser,
      messages: messages,
    });
  });

  socket.on("message", async ({ content, from, to }) => {
    const toSession = await SessionModel.findOne({ userId: to });
    let seen = false;
    for (let [id, sock] of io.of("/").sockets) {
      if (id === toSession.socketId) {
        seen = true;
        break;
      }
    }
    await MessagesModel.create({
      content: content,
      from: from,
      to: to,
      seen: seen,
    });
    if (seen) {
      const toMessages = await MessagesModel.find({
        from: to,
        to: from,
      });
      for (let i = 0; i < toMessages.length; i++) {
        await MessagesModel.updateOne(
          { _id: toMessages[i]._id },
          { seen: toMessages[i].seen | seen },
        );
      }
    }
    const fromMessages = await MessagesModel.find({
      from: from,
      to: to,
    });
    const toMessages = await MessagesModel.find({
      from: to,
      to: from,
    });

    const messages = fromMessages.concat(toMessages);
    messages.sort((a, b) => a.createdAt < b.createdAt);
    const toUser = await UserModel.findOne({ _id: to });
    const fromUser = await UserModel.findOne({ _id: from });
    if (seen) {
      socket.to(toSession.socketId).emit("private chat", {
        fromUser: toUser,
        toUser: fromUser,
        messages: messages,
      });
    }
    socket.emit("private chat", {
      fromUser: fromUser,
      toUser: toUser,
      messages: messages,
    });
  });

  socket.on("disconnect", async () => {
    const auth = socket.handshake.auth;
    let user = "";
    if (auth.sessionId) {
      const session = await SessionModel.findOne({ _id: auth.sessionId });
      user = await UserModel.findOne({ _id: session.userId });
    } else {
      user = await UserModel.findOne({ username: auth.username });
    }
    await UserModel.updateOne({ _id: user._id }, { status: false });
    const users = await UserModel.find({});
    for (let [id, sock] of io.of("/").sockets) {
      sock.emit("users", users);
    }
  });
});
