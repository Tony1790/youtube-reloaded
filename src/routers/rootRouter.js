import express from "express";
import { getJoin, login, postJoin } from "../controllers/usercontroller";
import { home, search } from "../controllers/videocontroller";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.get("/login", login);
rootRouter.get("/search", search);

export default rootRouter;