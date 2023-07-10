const multer = require("multer");
const md5 = require("md5");
const path = require("path");

module.exports = async (req, res, next) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, "../public/images/uploads"));
        },
        filename: (req, file, cb) => {
            cb(null, md5(file.originalname) + path.extname(file.originalname));
        },
    });

    const upload = multer({
        storage,
        limits: {
            fileSize: 2 * 1024 * 1024, // 2MB hajmini oshirish
        },
    });

    const uploadMultiple = upload.fields([{ name: "images" }]);

    try {
        uploadMultiple(req, res, (err) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    message: err + "",
                });
                return;
            }
            next();
        });
    } catch (e) {
        res.status(400).json({
            ok: false,
            message: e + "",
        });
        return;
    }
}