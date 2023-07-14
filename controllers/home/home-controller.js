const { Op } = require("sequelize");

const paginationValidation = require("../../validations/pagination-validation");
const searchValidation = require("../../validations/search-validation");
const slugValidation = require("../../validations/slug-validation");

module.exports = class Home {
    static async HomeGET(req, res) {
        try {
            let { c_page } = await paginationValidation.validateAsync(req.query);
            const { announcement } = req.db;

            if (!c_page) {
                c_page = 1;
            }

            const totalCount = await announcement.count({ where: { confirm: true }});

            // Fetching 3 most viewed, liked posts
            const posts = await announcement.findAll({
                where: {
                    confirm: true,
                    status: true,
                    [Op.or]: [
                        { rec: true },
                        { rec: { [Op.is]: false } } // rec: false bo'lgan postlarni ham qabul qiladi
                    ],
                },
                order: [['viewCount', 'DESC'], ['likeCount', 'DESC']],
                limit: 10,
                offset: 10 * (c_page - 1),
            });

            res.status(200).json({
                ok: true,
                message: "UY JOY BARAKA",
                posts,
                c_page,
                totalCount,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async SearchGET(req, res) {
        try {
            let { type, city, price_type, c_page, search } = await searchValidation.validateAsync(req.query);

            const { announcement } = req.db;

            if (!c_page) {
                c_page = 1;
            }

            const totalCount = await announcement.count({ where: { confirm: true, status: true }});

            let whereCondition = {
                confirm: true,
                status: true,
            };

            if (type) whereCondition.type = type;

            if (city) whereCondition.city = city;

            if (price_type) whereCondition.price_type = price_type;

            if (search) {
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                        {
                            title: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                        {
                            city: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                        {
                            district: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                        {
                            address: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                    ],
                };
            }

            // Fetching 3 most viewed, liked posts
            const combinedPosts = await announcement.findAll({
                where: whereCondition,
                order: [['viewCount', 'DESC'], ['likeCount', 'DESC']],
                limit: 10,
                offset: 10 * (c_page - 1),
            });

            // Sending the response
            res.status(200).json({
                ok: true,
                message: "UY JOY BARAKA",
                posts: combinedPosts,
                c_page,
                totalCount,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async getAnnouncementBySlug(req, res) {
        try {
            const { slug } = await slugValidation.validateAsync(req.params);
            const { announcement } = req.db;

            const item = await announcement.findOne({ where: { slug } });

            if (!item) {
                throw new Error("Ma'lumot topilmadi");
            }

            let user = await item.getUser();

            user = {
                user_id: user.dataValues.user_id,
                full_name: user.dataValues.full_name,
                phone: user.dataValues.phone,
            };

            item.viewCount += 1;
            await item.save();

            res.status(200).json({
                ok: true,
                post: item.dataValues,
                user,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim(),
            });
        }
    }
}