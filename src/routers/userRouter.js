import express from "express";
import { remove, edit, see, logout } from "../controllers/usercontroller";

const userRouter = express.Router();

userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
userRouter.get("/logout", logout);
userRouter.get("/:id", see);
export default userRouter;
