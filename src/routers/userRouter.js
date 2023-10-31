import express from "express";
import { 
    getEdit,
    postEdit, 
    logout, 
    see, 
    startGithubLogin, 
    finishGithubLogin,
    getChangePassword,
    postChangePassword,
} from "../controllers/userController";
import { 
    protectorMiddleware, 
    publicOnlyMiddleware,
    avatarUpload, 
    } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    /** multer를 먼저 쓰고 postEdit을 하면 Multer가 작동됨 */
    .post(avatarUpload.single("avatar"), postEdit);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get(":id", see);



export default userRouter;