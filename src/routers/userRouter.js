import express from "express";

import { logout, see, startGithubLgin, finishGithubLgin, getEdit, postEdit, getChangePassword, postChangePassword } from "../controllers/userControllers";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLgin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLgin);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/:id", see);

export default userRouter;
