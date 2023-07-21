const path = require("path");

const phoneValidation = require("../../validations/phone-validation");
const editFullNameValidation = require("../../validations/edit-full-name-validation");
const passwordValidation = require("../../validations/password-validation");

const { generateHash } = require("../../modules/bcrypt");
const {generateToken} = require("../../modules/jwt");

module.exports = class User {
  static async editFullName(req, res) {
    try {
      const { full_name } =
        await editFullNameValidation.validateAsync(req.body);
      const { users, announcement } = req.db;

      await users.update(
        { full_name },
        { where: { user_id: req.user.user_id } }
      );

      await announcement.update(
        { full_name },
        { where: { user_id: req.user.user_id } },
      );

      res.status(200).json({
        ok: true,
        message: "edited",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async avatarPatch(req, res) {
    try {
      if (req.files) {
        const { avatar } = req.files;

        const type = avatar.mimetype.split("/")[0];
        const format = avatar.mimetype.split("/")[1];

        if (type !== "image" && type !== "vector") {
          throw new Error("avatar image type must be an image or svg vector");
        }

        const avatar_path = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "images",
          "users",
          `${avatar.md5}.${format}`
        );

        await avatar.mv(avatar_path, (err) => {
          if (err) {
            throw new Error(err);
          }
        });

        let user = await req.db.users.update(
          {
            avatar: `/images/users/${avatar.md5}.${format}`,
          },
          {
            where: {
              user_id: req.user.user_id,
            },
            raw: true,
            returning: true,
          }
        );

        user = await user[1][0];

        return res.status(200).json({
          ok: true,
          message: "Rasm o'zgartirildi",
          avatar: user.avatar,
        });
      }
      return res.status(200).json({
        ok: true,
        message: "Rasm o'zgartirilmadi",
      });
    } catch (e) {
      res.status(400).json({
        ok: true,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async editPhone(req, res) {
    try {
      const { phone } = await phoneValidation.validateAsync(req.body);
      const { users } = req.db;

      await users.update({ phone }, { where: { user_id: req.user.user_id } });

      res.status(200).json({
        ok: true,
        message: "Raqam o'zgartirildi",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async getProfile(req, res) {
    try {
      let user = await req.db.users.findOne({
        where: { user_id: req.user.user_id },
        raw: true,
      });

      res.status(200).json({
        ok: true,
        user: { ...user, password: undefined, attempt: undefined },
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async editPassword(req, res) {
    try {
      const { password } = await passwordValidation.validateAsync(req.body);
      const ipAddress =
          req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      if (!(ipAddress && userAgent)) {
        throw new Error("Noma'lum qurilma");
      }

      const { users, sessions } = req.db;

      const hash = await generateHash(password);

      let [_, user] = await users.update(
          { password: hash },
          { where: { user_id: req.user.user_id }, returning: true },
      );
      console.log(user[0].dataValues);

      await sessions.destroy({ where: { user_id: req.user.user_id } });

      const session = await sessions.create({
        user_id: req.user.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const token = generateToken({
        session_id: session.dataValues.session_id,
      });

      res.status(201).json({
        ok: true,
        message: "Parol o'zgartirildi",
        token,
      })
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      })
    }
  }
};
