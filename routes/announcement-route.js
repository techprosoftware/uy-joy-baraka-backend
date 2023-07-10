const express = require("express");
const router = express.Router();

const {
    getActiveAnnouncements,
    getInactiveAnnouncements,
    activationAnnouncement,
    deleteAnnouncement,
    announcementCreate,
    likeAnnouncement,
    getLikedAnnouncements,
    unLikeAnnouncement,
    deleteLikedAnnouncements,
    updateAnnouncement,
} = require('../controllers/announcement/announcement-controller');

const userMiddleware= require("../middlewares/user-middleware");
const uploadMultiple = require("../middlewares/upload-multiple-middleware");

// middlewares
router.use(userMiddleware);

// Announcements
router.post('/create', uploadMultiple, announcementCreate);
router.get('/active', getActiveAnnouncements);
router.get('/inactive', getInactiveAnnouncements);
router.patch('/activation/:announcement_id', activationAnnouncement);
router.patch('/update', uploadMultiple, updateAnnouncement);
router.delete('/delete/:announcement_id', deleteAnnouncement);

// Likes
router.patch('/:announcement_id/like', likeAnnouncement);
router.patch('/:announcement_id/unlike', unLikeAnnouncement);
router.get('/liked', getLikedAnnouncements);
router.delete('/liked/delete', deleteLikedAnnouncements)

module.exports = {
    path: '/api/announcements',
    router,
}

