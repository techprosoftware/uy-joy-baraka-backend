const express = require("express");
const router = express.Router();

const {
    HomeGET,
    SearchGET,
    getAnnouncementBySlug,
} = require("../controllers/home/home-controller");

router.get("/home", HomeGET);
router.get("/search", SearchGET);
router.get("/posts/:slug", getAnnouncementBySlug);

module.exports = {
    path: '/api',
    router,
}