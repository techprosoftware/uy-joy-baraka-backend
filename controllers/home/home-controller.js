const { Op } = require("sequelize");

const paginationValidation = require("../../validations/pagination-validation");
const searchValidation = require("../../validations/search-validation");
const slugValidation = require("../../validations/slug-validation");
const uuidValidation = require("../../validations/uuid-validation");

module.exports = class Home {
  static async HomeGET(req, res) {
    try {
      let { c_page, p_page } = await paginationValidation.validateAsync(req.query);
      const { announcement } = req.db;

      if (!c_page) c_page = 1;
      if (!p_page) p_page = 12;

      if (isNaN(Number(p_page)) || isNaN(Number(c_page)) || p_page > 50) {
        throw new Error("Invalid c_page and p_page options, p_page max size 50");
      }

      const whereOptions = {
        confirm: true,
        status: true,
        [Op.or]: [
          { rec: true },
          { rec: { [Op.is]: false } }, // rec: false bo'lgan postlarni ham qabul qiladi
        ],
      };

      const [totalCount, posts] = await Promise.all([
        announcement.count({ where: { confirm: true, status: true } }),
        announcement.findAll({
          where: whereOptions,
          order: [
            ["updatedAt", "DESC"],
            ["likeCount", "DESC"],
          ],
          limit: p_page,
          offset: p_page * (c_page - 1),
          raw: true,
        }),
      ]);

      res.status(200).json({
        ok: true,
        message: "UY JOY BARAKA",
        posts,
        c_page,
        p_page,
        totalCount,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async SearchGET(req, res) {
    try {
      let { type, city, price_type, c_page, p_page, search } =
        await searchValidation.validateAsync(req.query);
      const { announcement } = req.db;

      if (!c_page) c_page = 1;
      if (!p_page) p_page = 12;

      if (isNaN(Number(p_page)) || isNaN(Number(c_page)) || p_page > 50) {
        throw new Error("Invalid c_page and p_page options, p_page max size 50");
      }

      let whereCondition = {
        confirm: true,
        status: true,
        [Op.or]: [
          { rec: true },
          { rec: { [Op.is]: false } }, // rec: false bo'lgan postlarni ham qabul qiladi
        ],
      };

      if (type) whereCondition.type = type;

      if (city) whereCondition.city = city;

      if (price_type) whereCondition.price_type = price_type;

      if (search) {
        const searchCondition = {
          [Op.or]: [
            {
              title: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              city: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              district: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              address: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        };

        whereCondition = {
          ...whereCondition,
          ...searchCondition,
        };
      }

      const [totalCount, combinedPosts] = await Promise.all([
        announcement.count({ where: whereCondition }),
        announcement.findAll({
          where: whereCondition,
          order: [
            ["viewCount", "DESC"],
            ["likeCount", "DESC"],
          ],
          limit: p_page,
          offset: p_page * (c_page - 1),
          raw: true,
        }),
      ]);

      // Sending the response
      res.status(200).json({
        ok: true,
        message: "UY JOY BARAKA",
        posts: combinedPosts,
        c_page,
        p_page,
        totalCount,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async getAnnouncementBySlug(req, res) {
    try {
      const { slug } = await slugValidation.validateAsync(req.params);
      const { announcement } = req.db;

      const item = await announcement.findOne({
        where: { slug },
        raw: true,
      });

      if (!item) {
        throw new Error("E'lon topilmadi");
      }

      item.viewCount += 1;
      await announcement.update(
        { viewCount: item.viewCount },
        { where: { slug } }
      );

      res.status(200).json({
        ok: true,
        post: item,
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }

  static async viewCounter(req, res) {
    try {
      const { announcement_id } = await uuidValidation.validateAsync(
        req.params
      );
      const { announcement } = req.db;

      const item = await announcement.findOne({
        where: { announcement_id },
        raw: true,
      });

      if (!item) {
        throw new Error("E'lon topilmadi");
      }

      item.viewCount += 1;
      await announcement.update(
        { viewCount: item.viewCount },
        { where: { announcement_id } }
      );

      res.status(200).json({
        ok: true,
        message: "View count +1",
      });
    } catch (e) {
      res.status(400).json({
        ok: false,
        message: e.toString().replace("Error:", "").trim(),
      });
    }
  }
};
