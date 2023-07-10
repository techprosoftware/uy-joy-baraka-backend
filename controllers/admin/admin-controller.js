const adminLogin = require("../../validations/admin-login");
const { compareHash } = require("../../modules/bcrypt");
const { generateToken } = require("../../modules/jwt");

module.exports = class Admin {
  static loginGET(req, res) {
    res.render("admin/login", {
      title: "Admin | Login",
    });
  }

  static async LoginPOST(req, res) {
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

      console.log("login" + token)

      res.cookie("token", token).redirect("/admin");

      // let hash = await generateHash(password)
      //
      // await users.create({
      //     full_name: "Super Admin",
      //     phone,
      //     password: hash,
      //     role: "admin",
      // })

      // let candidate = await users.findOne({ where: { phone }, raw: true });
      // if (!candidate) throw new Error("Phone or Password is Incorrect");
      //
      // let isPasswordCorrect = await compareHash(password, candidate.password);
      // if (!isPasswordCorrect) throw new Error("Phone or Password is Incorrect");
      //
      // const token = generateToken({
      //     user_agent: req.headers['user-agent'],
      //     phone,
      //     ...candidate,
      //     password: undefined,
      // });
      //
      // res.cookie('token', token).redirect("/admin");
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
      const userCount = await req.db.users.count({ where: { role: "user" } });
      const loginCount = await req.db.logins.count();

      res.render("admin/index", {
        ok: true,
        title: "Admin | Dashboard",
        postCount,
        pendingCount,
        userCount,
        loginCount,
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
      if (Number(p_page) === NaN || Number(c_page) === NaN) {
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
      if (Number(p_page) === NaN || Number(c_page) === NaN) {
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
      if (Number(p_page) === NaN || Number(c_page) === NaN) {
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
      if (Number(p_page) === NaN || Number(c_page) === NaN) {
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
        { rec: item.rec ? false : true },
        { where: { announcement_id } }
      );

      let { p_page, c_page } = req.query;
      if (!(p_page || c_page)) {
        p_page = 8;
        c_page = 1;
      }

      if (Number(p_page) === NaN || Number(c_page) === NaN) {
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
};
