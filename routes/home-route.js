const express = require("express");
const router = express.Router();

const {
    HomeGET,
    SearchGET,
    getAnnouncementBySlug,
    viewCounter,
} = require("../controllers/home/home-controller");

router.get("/home", HomeGET);
router.get("/search", SearchGET);
router.get("/posts/:slug", getAnnouncementBySlug);
router.patch("/posts/view/:announcement_id", viewCounter);

module.exports = {
    path: '/api',
    router,
}