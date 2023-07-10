const { loginGET,
    LoginPOST,
    Dashboard,
    pendingAnnouncements,
    confirmAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,
    getAllUsers,
    recAnnouncement,
    deletePending,
    } = require("../controllers/admin/admin-controller");
const adminMiddleware = require("../middlewares/admin-middleware");

const express = require('express');
const router = express.Router();


router.get('/login', loginGET);
router.post('/login', LoginPOST);

router.use(adminMiddleware);

router.get('/', Dashboard);

router.get('/pending', pendingAnnouncements);
router.get('/pending/confirm/:announcement_id', confirmAnnouncement);
router.get('/announcements', getAllAnnouncements)
router.get('/announcements/delete/:announcement_id', deleteAnnouncement);
router.get('/pending/delete/:announcement_id', deletePending);
router.get('/announcements/rec/:announcement_id', recAnnouncement);

router.get('/users', getAllUsers);

router.get('/logout', (req, res) => {
   res.clearCookie('token').redirect('/');
});

router.use("*", (req, res) => {
    res.render('404');
});

module.exports = {
    path: "/admin",
    router,
};
