const { Server } = require("socket.io");
const { NODE_ENV, URL } = require("../../config");
const db = require("../../modules/postgres");
const socketMiddleware = require("../../middlewares/socket-middleware");
const redis = require("redis");

async function socketIO(server) {
  const client = redis.createClient();
  await client.connect()

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
      const { users, chats, messages, sessions } = socket.db;

      socket.on("join", async (data) => {
        await client.hSet("online_users", socket.user.session_id, JSON.stringify({...socket.user, socket_id: socket.id}));
        console.log(await client.get("online_users"))
      }); 

      socket.on("newMessage", async (data) => {
        const { receiver_id, chat_id, message } = data;

        let messageItem = await messages.create({
          chat_id,
          sender_id: socket.user.user_id,
          content: message,
        });

        let seans = await sessions.findAll({
          where: {
            user_id: receiver_id,
            online: true,
          },
          raw: true,
        });

        console.log(seans);

        for (let item of seans) {
          io.to(item.socket_id).emit("receivedMessage", messageItem.dataValues);
        }

        console.log(messageItem.dataValues);

        io.emit("message", data); // Barcha klientlarga xabar yuborish
      });

      socket.on('disconnect', async() => {
        console.log("Client disconnected:", socket.id);
      });
    } catch (error) {
        console.log(error);
    }
  });
}

module.exports = { socketIO };
