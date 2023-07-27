const axios = require("axios");

const { authService } = require("../../modules/sms");
const { generateToken } = require("../../modules/jwt");
const { compareHash } = require("../../modules/bcrypt");
const { SMS_EMAIL, SMS_PASSWORD } = require("../../config");
const adminLogin = require("../../validations/admin-login");
const qs = require("qs");

module.exports = class Admin {
  static async loginGET(req, res) {
    res.render("admin/login", {
      title: "Admin | Login",
    });
  }

  static async loginPOST(req, res) {
    try {
      const { phone, password } = await adminLogin.validateAsync(req.body);
      const { users, sessions } = req.db;

      let candidate = await users.findOne({
        where: { phone, role: "admin" },
        raw: true,
      });

      if (!candidate) throw new Error("Phone or Password is Incorrect");

      let isPasswordCorrect = await compareHash(password, candidate.password);

      if (!isPasswordCorrect) throw new Error("Phone or Password is Incorrect");

      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      if (!(ipAddress && userAgent)) {
        throw new Error("Noma'lum qurilma");
      }

      const session = await sessions.create({
        user_id: candidate.user_id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const token = generateToken({
        session_id: session.dataValues.session_id,
      });

      res.cookie("token", token).redirect("/admin");
    } catch (e) {
      res.render("admin/login", {
        error: e + "",
      });
    }
  }

  static async Dashboard(req, res) {
    try {
      const postCount = await req.db.announcement.count({
        where: { confirm: true },
      });
      const pendingCount = await req.db.announcement.count({
        where: { confirm: false },
      });
      const userCount = await req.db.users.count();
      const loginCount = await req.db.logins.count();

      const authInfo = await authService(SMS_EMAIL, SMS_PASSWORD);

      let balance = "Kutilmoqda...";

      if (authInfo.success) {
        let result = await axios.get(
          "http://notify.eskiz.uz/api/user/get-limit",
          {
            headers: {
              Authorization: `Bearer ${authInfo.data.token}`,
            },
          }
        );
        if (result.status >= 200 && result.status < 300) {
          balance = result.data.data.balance;
        }
      }

      res.render("admin/index", {
        ok: true,
        title: "Admin | Dashboard",
        postCount,
        pendingCount,
        userCount,
        loginCount,
        balance,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async pendingAnnouncements(req, res) {
    try {
      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.announcement.count({
        where: { confirm: false },
      });

      let annoucement_items = await req.db.announcement.findAll({
        where: { confirm: false },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/pending", {
        ok: true,
        title: "Kutilayotgan e'lonlar",
        announcement: annoucement_items,
        totalCount,
        c_page,
        p_page,
      });
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async confirmAnnouncement(req, res) {
    try {
      const { announcement_id } = req.params;

      await req.db.announcement.update(
        { confirm: true, status: true },
        { where: { announcement_id } }
      );

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.announcement.count({
        where: { confirm: false },
      });
      let annoucement_items = await req.db.announcement.findAll({
        where: { confirm: false },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/pending", {
        ok: true,
        title: "Kutilayotgan e'lonlar",
        announcement: annoucement_items,
        totalCount,
        c_page,
        p_page,
        message: "E'lon tasdiqlandi",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async getAllAnnouncements(req, res) {
    try {
      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.announcement.count({
        where: { confirm: true },
      });

      let annoucement_items = await req.db.announcement.findAll({
        where: { confirm: true },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/announcements", {
        ok: true,
        title: "E'lonlar",
        announcement: annoucement_items,
        totalCount,
        c_page,
        p_page,
      });
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async deleteAnnouncement(req, res) {
    try {
      const { announcement_id } = req.params;

      await req.db.announcement.destroy({ where: { announcement_id } });

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.announcement.count({
        where: { confirm: false },
      });
      let annoucement_items = await req.db.announcement.findAll({
        where: { confirm: true },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/announcements", {
        ok: true,
        title: "E'lonlar",
        announcement: annoucement_items,
        totalCount,
        c_page,
        p_page,
        message: "E'lon o'chiridi",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async deletePending(req, res) {
    try {
      const { announcement_id } = req.params;

      await req.db.announcement.destroy({ where: { announcement_id } });

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.announcement.count({
        where: { confirm: false },
      });
      let announcement_items = await req.db.announcement.findAll({
        where: { confirm: false },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/pending", {
        ok: true,
        title: "Kutilayotgan e'lonlar",
        announcement: announcement_items,
        totalCount,
        c_page,
        p_page,
        message: "E'lon o'chiridi",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async recAnnouncement(req, res) {
    try {
      const { announcement_id } = req.params;

      let item = await req.db.announcement.findOne({
        where: { announcement_id },
        raw: true,
      });

      await req.db.announcement.update(
        { rec: !item.rec },
        { where: { announcement_id } }
      );

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }

      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }

      const totalCount = await req.db.announcement.count({
        where: { confirm: true },
      });
      let annoucement_items = await req.db.announcement.findAll({
        where: { confirm: true },
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
        order: [["createdAt", "ASC"]],
      });

      res.render("admin/announcements", {
        ok: true,
        title: "E'lonlar",
        announcement: annoucement_items,
        totalCount,
        c_page,
        p_page,
        message: item.rec
          ? "E'lon rekomendatsiyadan o'chirildi"
          : "E'lon rekomendatsiyaga qo'shildi",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 10;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.users.count();

      let users = await req.db.users.findAll({
        order: [["createdAt", "ASC"]],
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
      });

      res.render("admin/users", {
        ok: true,
        title: "Foydalanuvchilar",
        users,
        totalCount,
        c_page,
      });
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { user_id } = req.params;

      await req.db.users.destroy({ where: { user_id } });

      await req.db.announcement.destroy({ where: { user_id } });

      await req.db.attempts.destroy({ where: { user_id } });

      await req.db.bans.destroy({ where: { user_id } });

      await req.db.sessions.destroy({ where: { user_id } });

      await req.db.likes.destroy({ where: { user_id } });

      await req.db.chats.destroy({ where: { user_id } });

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 10;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const totalCount = await req.db.users.count();

      let users = await req.db.users.findAll({
        order: [["createdAt", "ASC"]],
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
      });

      res.render("admin/users", {
        ok: true,
        title: "Foydalanuvchilar",
        users,
        totalCount,
        c_page,
        message: "Foydalanuvchi o'chirildi",
      });
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async getUserPosts(req, res) {
    try {
      const { user_id } = req.params;

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }
      if (isNaN(Number(p_page)) || isNaN(Number(c_page))) {
        throw new Error("invalid c_page and p_page options");
      }
      const user = await req.db.users.findOne({ where: { user_id }, raw: true });

      const totalCount = await req.db.announcement.count({
        where: { user_id },
      });

      let announcements = await req.db.announcement.findAll({
        where: { user_id },
        order: [["createdAt", "ASC"]],
        raw: true,
        limit: p_page,
        offset: p_page * (c_page - 1),
      });

      res.render("admin/user-posts", {
        ok: true,
        title: `${user.full_name}ning e'lonlari`,
        user,
        announcements,
        totalCount,
        c_page,
        p_page,
      });
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async getAds(req, res) {
    try {
      let { c_page } = req.query;

      if (!c_page) {
        c_page = 1;
      }
      if (isNaN(Number(c_page))) {
        throw new Error("invalid c_page options");
      }
      const totalCount = await req.db.ads.count();

      let ads = await req.db.ads.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
        limit: 4,
        offset: 4 * (c_page - 1),
      });

      res.render("admin/ads", {
        ok: true,
        title: "Reklama",
        // ads,
        // totalCount,
        // c_page,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  static async postAds(req, res) {
    try {
      const { title, description, link } = req.body;

      let image = "/images/uploads/default.png";
      if (req?.file) {
        image = `/images/uploads/${req.file.filename}`;
      }

      await req.db.ads.create({
        title,
        link,
        description,
        image,
      });

      const totalCount = await req.db.ads.count();

      let ads = await req.db.ads.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
        limit: 4,
      });

      res.render("admin/ads", {
        ok: true,
        title: "Reklama",
        ads,
        totalCount,
        message: "Reklama qo'shildi",
      });
    } catch (e) {
      console.log(e + "");
      res.render("admin/ads", {
        ok: false,
        title: "Reklama",
        message: e + "",
      });
    }
  }

  static async getChat(req, res) {
    try {
      res.render("admin/chat");
    } catch (e) {
      console.log(e + "");
      res.status(400).json({
        ok: false,
        message: e + "",
      });
    }
  }

  // static async getStat(req, res) {
  //   try {
  //     const authInfo = await authService(SMS_EMAIL, SMS_PASSWORD);
  //
  //     var qs = require("qs");
  //     var data = qs.stringify({
  //       year: "2018",
  //       user_id: "5",
  //     });
  //
  //     if (authInfo.success) {
  //       var config = {
  //         method: "post",
  //         maxBodyLength: Infinity,
  //         url: "https://notify.eskiz.uz/api/user/totals",
  //         headers: {
  //           Authorization: `Bearer ${authInfo.data.token}`,
  //         },
  //         data: data,
  //       };
  //     }
  //
  //     axios(config)
  //       .then(function (response) {
  //         console.log(JSON.stringify(response.data));
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //       });
  //   } catch (e) {
  //     console.log(e + "");
  //     res.status(400).json({
  //       ok: false,
  //       message: e + "",
  //     });
  //   }
  // }
};
