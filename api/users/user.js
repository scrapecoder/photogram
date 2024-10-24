const express = require('express');
const router = express.Router();
const userController = require('../controller/account')
const checkAuth = require('../middleware/auth')

router.post('/login', userController.login)

router.post('/signup', userController.signup)

router.post('/verifyOtp', userController.verifyOtp)
router.get('/:userId',checkAuth, userController.getProfile)
router.get('/',checkAuth, userController.get_all_users)
router.post('/addCircle',checkAuth, userController.sendFollowRequest)
router.post('/requestAction',checkAuth, userController.acceptFollowRequest)


module.exports = router;