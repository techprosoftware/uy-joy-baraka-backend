const { Op } = require("sequelize");
const moment = require("moment/moment");
const { generateHash, compareHash } = require("../../modules/bcrypt");
const { generateToken, verifyToken } = require("../../modules/jwt");
const generateCode = require("../../modules/generate-code");
const phoneValidation = require("../../validations/phone-validation");
const signUpValidation = require("../../validations/signup-validation");
const codeValidation = require("../../validations/code-validation");
const loginValidation = require("../../validations/login-validation");

const sendSms = require("../../modules/sms");

module.exports = class Login {
  static async CheckPhone(req, res) {
    try {
      const { phone } = await phoneValidation.validateAsync(req.body);
      const { users } = req.db;

      let user = await users.findOne({
        where: { phone },
        raw: true,
      });

      res.status(200).json({
        ok: true,
        exists: !!user,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async SignUp(req, res) {
    try {
      let { name, phone, password } = await signUpValidation.validateAsync(
        req.body
      );
      const { users } = req.db;

      let user = await users.findOne({ where: { phone } });

      if (user) throw new Error("Foydalanuvchi allaqachon ro'yxatdan o'tgan");

      let hash = await generateHash(password);

      user = await users.create({
        full_name: name,
        phone,
        password: hash,
        avatar: "/images/users/default.png",
      });

      res.status(201).json({
        ok: true,
        message: "Foydalanuvchi ro'yxatdan o'tdi",
        user: {
          ...user.dataValues,
          password: undefined,
        },
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async sendCode(req, res) {
    try {
      const { phone } = await phoneValidation.validateAsync(req.body);
      const { users, attempts, bans } = req.db;

      let user = await users.findOne({
        where: { phone },
        raw: true,
      });

      if (!user) throw new Error("Foydalanuvchi ro'yxatdan o'tmagan");

      let ban = await bans.findOne({
        where: {
          user_id: user.user_id,
          expire_date: {
            [Op.gt]: new Date(),
          },
        },
        raw: true,
      });

      if (ban) {
        throw new Error(
          `Ko'p urinish, Siz ban qilindingiz ${moment(ban.expire_date)}`
        );
      }

      // Send code
      let code = generateCode();
      console.log(code);
      await sendSms(phone, `uyjoybaraka.uz tasdiqlash kodi ${code}`);

      await attempts.destroy({
        where: {
          user_id: user.user_id,
        },
      });

      let attempt = await attempts.create({
        code: code,
        user_id: user.user_id,
      });

      res.status(200).json({
        ok: true,
        message: "Tekshiruv kodi yuborildi",
        codeValidationId: attempt.dataValues.attempt_id,
        code: code,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async ValidateCode(req, res) {
    try {
      const code_validation_id = req.headers["code-validation-id"];
      const { code } = await codeValidation.validateAsync(req.body);
      const { users, attempts, sessions, bans, logins } = req.db;

      const attempt = await attempts.findOne({
        where: {
          attempt_id: code_validation_id,
        },
        include: {
          model: users,
          attributes: ["user_attempts"],
        },
        raw: true,
      });

      if (!attempt) throw new Error("Tasdiqlash kodi topilmadi");

      let settings = {
        code_attempts: 5,
        phone_attempts: 1,
        verification_text: "Uy joy baraka kirish uchun tasdiqlash kodi: ",
        ban_time: 300000,
      };

      if (Number(code) !== Number(attempt.code)) {
        await attempts.update(
          {
            attempts: attempt.attempts + 1,
          },
          {
            where: {
              attempt_id: code_validation_id,
            },
          }
        );

        if (Number(attempt.attempts) > Number(settings.code_attempts) - 2) {
          await attempts.destroy({
            where: {
              attempt_id: code_validation_id,
            },
          });

          await users.update(
            {
              user_attempts: attempt["user.user_attempts"] + 1,
            },
            {
              where: {
                user_id: attempt.user_id,
              },
            }
          );

          if (
            Number(attempt["user.user_attempts"]) >
            Number(settings.phone_attempts) - 2
          ) {
            await users.update(
              {
                user_attempts: 0,
              },
              {
                where: {
                  user_id: attempt.user_id,
                },
              }
            );

            await bans.create({
              user_id: attempt.user_id,
              expire_date: new Date(Date.now() + Number(settings.ban_time)),
            });
          }
        }
        res.status(400).json({
          ok: false,
          message: "Tasdiqlash kodi xato",
          attempts:
            Number(settings.code_attempts) - Number(attempt.attempts) - 1,
        });
        return;
      }

      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      if (!(ipAddress && userAgent)) {
        throw new Error("Noma'lum qurilma");
      }

      const session = await sessions.create({
        user_id: attempt.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const token = generateToken({
        session_id: session.dataValues.session_id,
      });

      await attempts.destroy({
        where: {
          user_id: attempt.user_id,
        },
      });

      await users.update(
        {
          user_attempts: 0,
        },
        {
          where: {
            user_id: attempt.user_id,
          },
        }
      );

      await logins.create({
        user_id: attempt.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      res.status(201).json({
        ok: true,
        message: "Tizimga muvofaqqiyatli kirdingiz",
        token: token,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async Login(req, res) {
    try {
      const { phone, password } = await loginValidation.validateAsync(req.body);
      const { users, sessions, bans, attempts, logins } = req.db;

      let user = await users.findOne({
        where: { phone },
        raw: true,
      });

      if (!user) throw new Error("Foydalanuvchi ro'yxatdan o'tmagan");

      let ban = await bans.findOne({
        where: {
          user_id: user.user_id,
          expire_date: {
            [Op.gt]: new Date(),
          },
        },
        raw: true,
      });

      if (ban) {
        res.status(400).json({
          ok: false,
          message: "Ko'p urinish, Siz ban qilindingiz",
          ban: ban,
        });
        return;
      }

      let isPasswordTrue = await compareHash(password, user.password);

      if (!isPasswordTrue) {
        await users.update(
          { user_attempts: user.user_attempts + 1 },
          {
            where: {
              user_id: user.user_id,
            },
          }
        );
        const maxLoginAttempts = 5;
        if (user.user_attempts >= maxLoginAttempts) {
          await users.update(
            { user_attempts: 0 },
            {
              where: {
                user_id: user.user_id,
              },
            }
          );

          let ban = await bans.create({
            user_id: user.user_id,
            expire_date: new Date(Date.now() + 300000),
          });

          res.status(400).json({
            ok: false,
            message: "Ko'p urinish, Siz ban qilindingiz",
            ban: ban,
          });
          return;
        }

        res.status(400).json({
          ok: false,
          message: "Parol noto'g'ri",
          attempts: maxLoginAttempts - user.user_attempts,
        });
        return;
      }

      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      if (!(ipAddress && userAgent)) {
        throw new Error("Noma'lum qurilma");
      }

      await users.update(
        { user_attempts: 0 },
        {
          where: {
            user_id: user.user_id,
          },
        }
      );

      await attempts.destroy({
        where: {
          user_id: user.user_id,
        },
      });

      await logins.create({
        user_id: user.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const session = await sessions.create({
        user_id: user.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const token = generateToken({
        session_id: session.dataValues.session_id,
      });

      res.status(201).json({
        ok: true,
        message: "Tizimga muvofaqqiyatli kirdingiz",
        token: token,
        user,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async LogoutProfile(req, res) {
    try {
      const { sessions } = req.db;

      const token = req.cookies["token"] || req.headers["authorization"];

      if (!token) throw new Error("Token is not found");

      let { session_id } = verifyToken(token);
      if (session_id) {
        await sessions.destroy({
          where: { session_id },
        });
      }

      res.status("200").json({
        ok: true,
        message: "Logout succesfully",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }
};
