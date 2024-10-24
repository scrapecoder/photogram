const express = require('express');
const router = express.Router();
const multer = require('multer')
const checkAuth = require('../middleware/auth')
const taskController = require('../controller/task-controller')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
})

const fileFilter = (req, file, cb) => {
    
    
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage: storage, limits: 1024 * 1024 * 10, fileFilter: fileFilter })
router.get('/',checkAuth, taskController.get_all_task);

router.post('/', checkAuth,upload.single('taskImage'),taskController.add_task);

router.get('/:taskId',taskController.get_task_by_id );


router.delete('/:taskId',checkAuth, taskController.delete_task)


router.patch('/:taskId',checkAuth,upload.single('taskImage'), taskController.update_task)

module.exports = router;
