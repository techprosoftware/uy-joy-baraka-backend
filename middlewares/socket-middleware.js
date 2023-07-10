const { verifyToken } = require("../modules/jwt");
const redis = require("redis");
module.exports = async (socket, next) => {
    try {
        const redisClient = redis.createClient();

        const { users, sessions } = await socket.db;
        const { headers } = socket.handshake;
        const token = headers.authorization;

        if (token) {
            try {
                const { session_id } = verifyToken(token); // Tokenni tekshirish va session_id olish

                if (session_id) {
                    const session = await sessions.findOne({
                        where: {
                            session_id,
                        },
                        raw: true,
                    });

                    if (!session) {
                        throw new Error("Session yakunlangan");
                    }

                    const user = await users.findOne({
                        where: {
                            user_id: session.user_id,
                        },
                        raw: true,
                    });

                    const userData = {
                        ...user,
                        session_id,
                        attempt: undefined,
                        password: undefined,
                    };

                    socket.user = userData;
                }
            } catch (error) {
                return next(new Error("Invalid token"));
            }
        } else {
            return next(new Error("Token not found"));
        }
        next();
    } catch (e) {
        return next(new Error(e + ""));
    }
}