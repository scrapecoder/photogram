const express = require('express');
const router = express.Router();
const multer = require('multer')
const checkAuth = require('../middleware/auth')
const postController = require('../controller/post')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("postimage");
        cb(null, './postImage/')
    },
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})

const fileFilter = (req, file, cb) => {
    console.log("fileFilter");
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage: storage, limits: 1024 * 1024 * 10, fileFilter: fileFilter })
router.get('/',checkAuth, postController.get_all_post);
router.get('/circlePost', checkAuth, postController.get_circle_post)

router.post('/', checkAuth,upload.single('postImage'),postController.add_post);

router.get('/:postId',postController.get_post_by_id);

router.delete('/:postId',checkAuth, postController.delete_post)
router.post('/comment',checkAuth, postController.add_comment)
router.get('/comment/:postId',checkAuth, postController.get_comment)

router.patch('/:postId/like',checkAuth, postController.update_post)



module.exports = router;














