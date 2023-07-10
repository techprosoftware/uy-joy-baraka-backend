const { verifyToken } = require("../modules/jwt");

module.exports = async (req, res, next) => {
  const { users, sessions } = req.db;

  let token = req.cookies["token"] || req.headers["authorization"];

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
        res.clearCookie("token").redirect("/");
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
    });

    if (user.role !== "admin" && user.role !== "superadmin") {
      res.redirect("/");
      return;
    }

    req.admin = user;

    next();

    return;
  }
  res.redirect("/");

  return;
};
