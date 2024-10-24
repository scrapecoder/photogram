const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const Users = require('../models/user');
const OtpVerification = require('../models/otp-verification');
const Circle = require('../models/circle')
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",

    auth: {
        user: process.env.ACCOUNT_EMAIL,
        pass: process.env.ACCOUNT_PASSWORD,
    },
});
const SALT = 10;

exports.login = (req, res, next) => {

    Users.find({ email: req.body.email }, { __v: 0 }).exec().then((user) => {
        if (user.length === 0) return res.status(401).json({ error: "Invalid combination" });

        else {

            if (!user[0].verified) return res.status(409).json({ error: "account is not verified" });
            bcrypt.compare(req.body.password, user[0].password, function (err, result) {
                if (err) {
                    return res.status(401).json({ error: "Invalid combination" });
                } else if (result) {
                    let token = jwt.sign({ email: req.body.email, userId: user[0]._id }, process.env.JWT_KEY, { expiresIn: '1h' });
                    const detail = user[0]
                    console.log("detail=>", detail);
                    return res.status(200).json({
                        message: "Auth successfull", data: {
                            token,
                            detail
                        }
                    });
                }
                res.status(401).json({ error: "Invalid combination" });
            });
        }
    })

}

exports.verifyOtp = async (req, res, next) => {
    const { userId, otp } = req.body;
    const userFound = await OtpVerification.find({ userId: userId }).exec()
    if (userFound.length <= 0) res.status(404).json({ error: "Account doesn't exits" })
    else {
        const {
            expiredAt } = userFound[0];
        const hashOtp = userFound[0].otp

        if (expiredAt < Date.now()) {
            await OtpVerification.deleteMany({ userId }).exec()
            return res.status(200).json({ message: "Code expired" })
        }
        const isSameOtp = await bcrypt.compare(otp, hashOtp);
        if (!isSameOtp) return res.status(200).json({ message: "Wrong otp" })
        else await Users.updateOne({ _id: userId }, { verified: true }).exec()
        OtpVerification.deleteMany({ userId }).exec()
        res.status(200).json({ message: "otp verification done" })
    }
}


const sendOtpVerification = async (result, res) => {
    const { _id, email } = result;
    const otp = Math.floor(`${Math.floor(1000 * Math.random() * 9999)}`).toString()
    try {
        const mailOptions = {
            from: process.env.ACCOUNT_EMAIL,
            to: email,
            subject: "Hello ✔", // Subject line
            text: "Hello User!", // plain text body
            html: `<b>Please verify your email.\nyour verification code is ${otp}</b>`, // html body
        }


        const hashedOtp = await bcrypt.hash(otp, SALT)
        const otpVerification = new OtpVerification({
            userId: _id,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiredAt: Date.now() + 360000
        })
        await otpVerification.save();
        await transporter.sendMail(mailOptions)
        res.status(200).json({
            message: "Otp send successfully",
            data: {
                userId: _id,
                email
            }
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,

        })
    }
}


exports.signup = (req, res, next) => {
    Users.find({ email: req.body.email }).exec().then(async (user) => {
        if (user.length > 0) return res.status(409).json({ error: "User already registered" });
        else {

            bcrypt.hash(req.body.password, SALT, function (err, hash) {

                if (err) {
                    res.status(500).json({ error: err });
                } else if (hash) {

                    const user = new Users({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        verified: false
                    })

                    user.save().then(result => {
                        console.log("result=>", result);
                        sendOtpVerification(result, res)


                    })
                        .catch(err => {
                            console.log("err=>", err);
                            res.status(500).json({ error: err });
                        });
                }
            });
        }
    })

}


exports.get_all_users = (req, res, next) => {
    const token = req.headers.authorization
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId; // Assuming user ID is stored in the token payload as 'userId'
    Users.find({ _id: { $ne: userId } }).exec().then(async (users) => {
        return res.status(200).json(users);
    })
}

exports.getProfile = (req, res, next) => {
    const id = req.params.userId
    console.log("id====>", id);

    try {
        Users.findOne({ _id: id }).exec().then(async (user) => {
            if (!user) return res.status(404).json({ error: "User doesn't exist." });
            else {

                return res.status(300).json(user);
            }
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.addToMyCircle = async (req, res, next) => {
    const id = req.body.userId;
    const circleId = req.body.circleId;
    const status = req.body.status;

    console.log("idd====>", { id, circleId });
    try {
        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has already followed the circle
        const alreadyFollowed = user.circle.includes(circleId);

        if (alreadyFollowed) {
            // Unfollow the circle
            await Circle.deleteOne({ user: id, _id: circleId, status: 0 });
            await Users.findByIdAndUpdate(id, { $pull: { circle: circleId } }, { new: true });

            res.status(200).json({ message: 'Unfollowed successfully' });
        } else {
            // Follow the circle
            const follow = await Circle.create({ user: id, status: status });
            await Users.findByIdAndUpdate(id, { $addToSet: { circle: circleId, status: status } }, { new: true });

            res.status(200).json({ message: 'Followed successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.sendFollowRequest = async (req, res) => {
    const userId = req.body.userId;
    const targetUserId = req.body.circleId;

    try {
        // Check if the target user exists
        const targetUser = await Users.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Add a new circle entry with pending request status
        await Users.findByIdAndUpdate(targetUserId, { $push: { circle: { user: userId, status: 0 } } });

        res.status(200).json({ message: 'Follow request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.acceptFollowRequest = async (req, res, next) => {
    const userId = req.body.userId;
    const followerId = req.body.followerId;
    const status = req.body.status; // 1: Accepted, -1: Rejected

    try {
        // Find the user's document and their circle entry for the follower
        const user = await Users.findOne({ _id: userId });
        const followerUser = await Users.findOne({ _id: followerId });
        const circleEntry = user.circle.find(entry => entry.user.toString() === followerId && entry.status === 1);
        const circleEntryIndex = user.circle.findIndex(entry => entry.user.toString() === followerId);
        const userEntryIndex = followerUser.circle.findIndex(entry => entry.user.toString() === userId);
        if (!user || !followerUser) return res.status(404).json({ message: 'User doesn\'t exist' });

        if (circleEntry && circleEntryIndex != -1 && userEntryIndex != -1) {

            // If the follower already exists in the circle, update its status

            user.circle[circleEntryIndex].status = status;
            followerUser.circle[userEntryIndex].status = status

        } else if (status !== -1) {

            // If the follower doesn't exist in the circle, add a new entry
            user.circle[circleEntryIndex].status = status;
            followerUser.circle.push({ user: userId, status: status });
        }

        // Save the updated user documents
        await user.save();
        await followerUser.save();

        // If the status is rejected, remove the follower from the other user's circle
        if (status === -1) {
            await Users.updateOne({ _id: userId }, { $pull: { circle: { user: followerId } } });
            await Users.updateOne({ _id: followerId }, { $pull: { circle: { user: userId } } });
        }

        res.status(200).json({ message: 'Follow request updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};








