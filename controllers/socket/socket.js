const { Server } = require("socket.io");
const { NODE_ENV, URL } = require("../../config");
const db = require("../../modules/postgres");
const socketMiddleware = require("../../middlewares/socket-middleware");
const socketMessageValidation = require("../../validations/socket-message-validation");
const chatIdValidation = require("../../validations/chat-id-validation");
const messageIdValidation = require("../../validations/message-id-validation");

async function socketIO(server) {
  const corsOptions = {
    origin: NODE_ENV === "production" ? URL : "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  };

  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use(async (socket, next) => {
    socket.db = await db();
    next();
  });
  io.use(socketMiddleware);

  io.on("connection", async (socket) => {
    try {
      console.log("Client connected:", socket.id);
      const { users, chats, messages } = socket.db;

      socket.on("join", async () => {
        try {
          await users.update(
              { status: "online", socket_id: socket.id },
              { where: { user_id: socket.user.user_id } },
          );

          io.to(socket.id).emit("joinResponse", {
            ok: true,
            message: "online"
          });
        } catch (e) {
          io.to(socket.id).emit("joinResponse", {
            ok: false,
            message: e + "",
          });
        }
      }); 

      socket.on("message", async (data) => {
        try {
          const { receiver_id, chat_id, message } = await socketMessageValidation.validateAsync(data);

          let messageItem = await messages.create({
            chat_id,
            sender_id: socket.user.user_id,
            content: message,
          });

          let user = await users.findOne({
            where: { status: "online", user_id: receiver_id },
            raw: true
          });

          if (user) {
            io.to(user.socket_id).emit("receivedMessage", {
              ok: true,
              message: messageItem.dataValues
            });
          }

          io.to(socket.id).emit("messageResponse", {
            ok: true,
            message: "Xabar yuborildi",
          });
        } catch (e) {
          io.to(socket.id).emit("messageResponse", {
            ok: false,
            message: e + "",
          });
        }
      });

      socket.on("delete", async (data) => {
        try {
          const { chat_id } =  await chatIdValidation.validateAsync(data);

          await messages.destroy({ where: { chat_id } });

          await chats.destroy({ where: { chat_id } });

          io.to(socket.id).emit("deleteResponse", "Chat o'chirildi");
        } catch (e) {
          io.to(socket.id).emit("deleteResponse", e + "");
        }
      });

      socket.on("read", async (data) => {
        try {
          const { message_id } = await messageIdValidation.validateAsync(data);

          await messages.update(
            { read: true },
            { where: { message_id, sender_id: socket.user.user_id } },
          );

          io.to(socket.id).emit("readResponse", "Xabarlar o'qildi");
        } catch (e) {
          io.to(socket.id).emit("readResponse", e + "");
        }
      });
      socket.on('disconnect', async() => {
        await users.update(
            { status: "offline" },
            { where: { user_id: socket.user.user_id } }
        );
      });
    } catch (error) {
        console.log(error);
    }
  });
}

module.exports = { socketIO };
