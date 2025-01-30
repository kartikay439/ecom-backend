import { Router } from "express";
import { signUpWithNumber,loginUser, logOutUser, registerUser} from "../contoller/buyer.controller.js";
import {upload} from '../middleware/multer.middleware.js'
import {verifyJWT} from '../middleware/auth.middleware.js'


const router = Router()

router.route("/signUpWithMobile").post(
    signUpWithNumber
)


router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/home").get(
    (req,res)=>{
        res.send("hello sunny")
    }
)
//secured routes
router.route("/logout").post(verifyJWT,logOutUser)
// router.route("/refresh-token").post(refreshAcessToken)







export default router