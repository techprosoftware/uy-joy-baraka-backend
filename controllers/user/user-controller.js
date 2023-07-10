const path = require("path");

const phoneValidation = require("../../validations/phone-validation");
const editFullNameValidation = require("../../validations/edit-full-name-validation");

module.exports = class User {
  static async EditFullName(req, res) {
    try {
      const { firstName, lastName } =
        await editFullNameValidation.validateAsync(req.body);
      const { users } = req.db;

      await users.update(
        { full_name: firstName + " " + lastName },
        { where: { user_id: req.user.user_id } }
      );

      res.status(200).json({
        ok: true,
        message: "edited",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async AvatarPatch(req, res) {
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
        message: e + "",
      });
    }
  }

  static async EditPhone(req, res) {
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
        message: e + "",
      });
    }
  }

  static async GetProfile(req, res) {
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
        message: e + "",
      });
    }
  }
};
