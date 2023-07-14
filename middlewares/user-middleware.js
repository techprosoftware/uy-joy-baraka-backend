const { verifyToken } = require("../modules/jwt");

module.exports = async (req, res, next) => {
    try {
        const { users, sessions } = req.db;

        const token = req.cookies["token"] || req.headers["authorization"];

        if (token) {
            let { session_id } = verifyToken(token);
            let session;
            if (session_id) {
                session = await sessions.findOne({
                    where: {
                        session_id,
                    },
                    raw: true,
                });
            }

            if (!session) {
                try {
                    res.status(400).json({
                        ok: false,
                        message: "Sessiya yakunlangan",
                    });
                } catch (e) {
                    res.redirect("/");
                } finally {
                    return;
                }
            }

            const user = await users.findOne({
                where: {
                    user_id: session.user_id,
                },
                raw: true,
            })

            req.user = {
                ...user,
                attempt: undefined,
                password: undefined,
            }
        } else {
            res.status(400).json({
                ok: false,
                message: "Token not found",
            });
            return;
        }

        next();
    } catch (e) {
        res.status(400).json({
            ok: false,
            message: e.toString().replace("Error:", "").trim(),
        })
    }
};