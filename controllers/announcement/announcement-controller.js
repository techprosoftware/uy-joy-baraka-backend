const slugify = require("slugify");

const announcementValidation = require("../../validations/announcement-validation");
const paginationValidation = require("../../validations/pagination-validation");
const updateAnnouncementValidation = require("../../validations/announcement-update-validation");
const uuidValidation = require("../../validations/uuid-validation");

module.exports = class Announcement {
    static async announcementCreate(req, res) {
        try {
            let {
                city,
                district,
                address,
                type,
                title,
                description,
                price,
                price_type,
                phone } = await announcementValidation.validateAsync(req.body);

            // console.log(req.user);

            const { announcement } = req.db;

            let images = ["/images/uploads/default.png"];
            if (req.files.images) {
                images = req.files.images.map(a => `/images/uploads/${a.filename}`);
            }

            // Slug yaratish va borligini tekshirish
            async function createUniqueSlug(title) {
                const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@,;><`~]/g });
                const existingModel = await announcement.findOne({ where: { slug } });

                if (!existingModel) {
                    return slug;
                }

                const newSlug = `${slug}${Math.floor(Math.random() * 10)}`;
                return createUniqueSlug(newSlug);
            }

            let slug = await createUniqueSlug(title);

            let item = await announcement.create({
                user_id: req.user.user_id,
                slug,
                city,
                district,
                address,
                type,
                title,
                description,
                price,
                thumb: images,
                price_type,
                phone,
                full_name: req.user.full_name,
                avatar: req.user.avatar,
            });
 
            res.status(201).json({
                ok: true,
                message: "E'lon tasdiqlash uchun yuborildi",
                announcement: item.dataValues,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim(),
            });
        }
    }

    static async getActiveAnnouncements(req, res) {
        try {
            let { p_page, c_page } = await paginationValidation.validateAsync(req.query);

            if (!c_page) c_page = 1;
            if (!p_page) p_page = 12;

            if (isNaN(Number(p_page)) || isNaN(Number(c_page)) || p_page > 50) {
                throw new Error("Invalid c_page and p_page options, p_page max size 50");
            }

            const whereOptions = {
                confirm: true, status: true, user_id: req.user.user_id
            }

            const totalCount = await req.db.announcement.count({ where: whereOptions });

            let posts = await req.db.announcement.findAll({
                where: whereOptions,
                order: [["createdAt", "DESC"]],
                raw: true,
                limit: p_page,
                offset: p_page * (c_page - 1),
            });

            res.status(200).json({
                ok: true,
                title: "Faol E'lonlar",
                posts,
                totalCount,
                c_page,
                p_page,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async getInactiveAnnouncements(req, res) {
        try {
            let { p_page, c_page } = await paginationValidation.validateAsync(req.query);

            if (!c_page) c_page = 1;
            if (!p_page) p_page = 12;

            if (isNaN(Number(p_page)) || isNaN(Number(c_page)) || p_page > 50) {
                throw new Error("Invalid c_page and p_page options, p_page max size 50");
            }

            const whereOptions = { status: false, user_id: req.user.user_id }

            const totalCount = await req.db.announcement.count({ where: whereOptions });

            let posts = await req.db.announcement.findAll({
                order: [["createdAt", "DESC"]],
                where: whereOptions,
                raw: true,
                limit: p_page,
                offset: p_page * (c_page - 1),
            });

            res.status(200).json({
                ok: true,
                title: "Nofaol E'lonlar",
                posts,
                totalCount,
                c_page,
                p_page,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async activationAnnouncement(req, res) {
        try {
            const { announcement_id } = await uuidValidation.validateAsync(req.params);
            const { announcement } = req.db;

            let item = await req.db.announcement.findOne({
                where: {
                    user_id: req.user.user_id,
                    announcement_id,
                },
                raw: true,
            });

            if (!item) throw new Error("E'lon topilmadi");

            if(!item.confirm) throw new Error("E'lon tasdiqlanmagan, e'lon tasdiqlangandan so'ng uni faollashtirishingiz mumkin");

            await announcement.update(
                { status: !item.status },
                { where: { announcement_id } }
            );

            res.status(200).json({
                ok: true,
                message: item.status ? "E'lon nofaol" : "E'lon faol",
                status: !item.status,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async updateAnnouncement(req, res) {
        try {
            const { announcement_id, city, district, address, type, title, description, price, price_type, phone } = await updateAnnouncementValidation.validateAsync(req.body);
            const { announcement } = req.db;

            let images;
            if (req.files.images) {
                images = req.files.images.map(a => `/images/uploads/${a.filename}`);
            }

            let item = await announcement.findOne({
                where: { announcement_id, user_id: req.user.user_id },
                raw: true,
            });

            if (!item) throw new Error("E'lon topilmadi");

            let updatedAnnouncement = await announcement.update(
                { city, district, address, thumb: images, type, title, description, price, price_type, phone },
                { where: { announcement_id, user_id: req.user.user_id }, returning: true },
            );

            res.status(200).json({
                ok: true,
                message: "E'lon yangilandi",
                post: updatedAnnouncement[1][0],
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async deleteAnnouncement(req, res) {
        try {
            const { announcement_id } = await uuidValidation.validateAsync(req.params);
            const { announcement } = req.db;

            let item = await req.db.announcement.findOne({
                where: { announcement_id, user_id: req.user.user_id }
            });

            if (!item) throw new Error("E'lon topilmadi");

            await announcement.destroy(
                { where: { announcement_id, user_id: req.user.user_id } }
            );

            res.status(200).json({
                ok: true,
                message: "E'lon o'chirildi",
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async likeAnnouncement(req, res) {
        try {
            const { announcement_id } = await uuidValidation.validateAsync(req.params);

            const like = await req.db.likes.findOne({
                where: { user_id: req.user.user_id, announcement_id }
            });

            if (like) throw new Error("Siz allaqachon like bosgansiz");

            const announcement = await req.db.announcement.findByPk(announcement_id);

            if (!announcement) throw new Error("E'lon topilmadi");

            announcement.likeCount += 1;
            await announcement.save();

            await req.db.likes.create({
                user_id: req.user.user_id,
                announcement_id,
            });

            res.status(200).json({
                ok: true,
                count: announcement.likeCount,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim(),
            });
        }
    }

    static async unLikeAnnouncement(req, res) {
        try {
            const { announcement_id } = await uuidValidation.validateAsync(req.params);

            const like = await req.db.likes.findOne({
                where: { user_id: req.user.user_id, announcement_id }
            });

            if (!like) throw new Error("Siz like bosmagansiz");

            const announcement = await req.db.announcement.findByPk(announcement_id);

            if (!announcement) throw new Error("E'lon topilmadi");

            announcement.likeCount -= 1;
            await announcement.save();

            await like.destroy();

            res.status(200).json({
                ok: true,
                count: announcement.likeCount
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim(),
            });
        }
    }

    static async getLikedAnnouncements(req, res) {
        try {
            let { p_page, c_page } = await paginationValidation.validateAsync(req.query);

            if (!c_page) c_page = 1;
            if (!p_page) p_page = 12;

            if (isNaN(Number(p_page)) || isNaN(Number(c_page)) || p_page > 50) {
                throw new Error("Invalid c_page and p_page options, p_page max size 50");
            }

            const totalCount = await req.db.likes.count({ where: { user_id: req.user.user_id },});

            let liked_items = await req.db.likes.findAll({
                include: req.db.announcement,
                where: { user_id: req.user.user_id },
                order: [["createdAt", "DESC"]],
                raw: true,
                limit: p_page,
                offset: p_page * (c_page - 1),
            });

            res.status(200).json({
                ok: true,
                title: "Saqlanganlar",
                posts: liked_items,
                totalCount,
                c_page,
                p_page,
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }

    static async deleteLikedAnnouncements(req, res) {
        try {
            await req.db.likes.destroy({
                where: { user_id: req.user.user_id }
            });

            res.status(200).json({
                ok: true,
                message: "Saqlanganlar o'chirildi",
            });
        } catch (e) {
            res.status(400).json({
                ok: false,
                message: e.toString().replace("Error:", "").trim()
            });
        }
    }
}