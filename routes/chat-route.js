const express = require("express");
const router = express.Router();

const userMiddleware = require("../middlewares/user-middleware");

const {
    PostMessage,
    GetMessages,
    getChats,
    DeleteChat,
    SendMessage,
} = require("../controllers/chat/chat-controller");

router.use(userMiddleware);

router.post("/message/:receiver_id", PostMessage);
router.get("/", getChats);
router.get("/:chat_id", GetMessages);
router.delete("/:chat_id", DeleteChat);
router.post("/:chat_id", SendMessage);

module.exports = {
    path: "/api/chats",
    router,
}