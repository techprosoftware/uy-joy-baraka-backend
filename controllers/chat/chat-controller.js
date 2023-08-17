const { Op, Sequelize } = require("sequelize");

const receiverIdValidation = require("../../validations/receiver-id-validation");
const messageValidation = require("../../validations/message-validation");

module.exports = class Chat {
    static async PostMessage(req, res) {
        try {
            const { receiver_id } = await receiverIdValidation.validateAsync(req.params);
            const { message, announcement_id } = await messageValidation.validateAsync(req.body);
            const { messages, users, chats } = req.db;

            let user = await users.findOne({
                where: { user_id: receiver_id }
            });

            if (!user) throw new Error("Foydalanuvchi topilmadi");

            let post = await req.db.announcement.findOne({
                where: {
                    announcement_id,
                },
                raw: true,
            });

            if (!post) throw new Error("E'lon topilmadi");

            let chat = await chats.findOne({
                where: {
                    user_id: req.user.user_id,
                    receiver_id,
                },
                raw: true,
            });

            if (!chat) {
                chat = await chats.create({
                    user_id: req.user.user_id,
                    receiver_id,
                    announcement_id,
                    title: post.title,
                });
            }

            let messageItem = await messages.create({
                chat_id: chat.chat_id,
                sender_id: req.user.user_id,
                content: message,
            });

            res.status(201).json({
                ok: true,
                message: "Xabar yuborildi",
                chat,
                messageItem,
            })
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async GetMessages(req, res) {
        try {
            const { chat_id } = req.params;

            const messages = await req.db.messages.findAll({
                where: {
                    chat_id,
                },
                order: [["createdAt", "ASC"]]
            });

            res.status(200).json({
                ok: true,
                messages,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async getChats(req, res) {
        try {
            const { chats, users, announcement } = req.db;

            const chatsWithUsers = await chats.findAll({
                attributes: ["chat_id", "user_id", "announcement_id", "createdAt"],
                where: {
                    [Op.or]: [
                        { user_id: req.user.user_id },
                        { receiver_id: req.user.user_id },
                    ],
                },
                order: [["updatedAt", "DESC"]],
                raw: true,
            });

            for (let chat of chatsWithUsers) {
                chat.user = await users.findOne({
                    where: { user_id: chat.user_id },
                    attributes: ["avatar", "full_name", "user_id"],
                    raw: true,
                });

                chat.post = await announcement.findOne({
                    where: { announcement_id: chat.announcement_id },
                    attributes: ["title", "announcement_id", "slug"],
                    raw: true,
                });

                chat.message = await req.db.messages.findOne({
                    where: {
                        chat_id: chat.chat_id,
                    },
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                    raw: true,
                });
            }

            console.log(chatsWithUsers);

            res.status(200).json({
                ok: true,
                message: "Chatlar",
                members: chatsWithUsers,
            })
        } catch (e) {
            console.log(e);
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async DeleteChat(req, res) {
        try {
            const { chat_id } = req.params;
            const {chats, messages} = req.db;

            await messages.destroy({
                where: {
                    chat_id,
                }
            });

            await chats.destroy({
                where: {
                    chat_id,
                }
            });

            res.status(200).json({
                ok: true,
                message: "Chat o'chirildi",
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async SendMessage(req, res) {
        try {
            const { chat_id } = req.params;
            const { message } = req.body;

            const { messages } = req.db;

            let messageItem = await messages.create({
                chat_id,
                sender_id: req.user.user_id,
                content: message,
            });

            res.status(201).json({
                ok: true,
                message: "Xabar yuborildi"
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }
}