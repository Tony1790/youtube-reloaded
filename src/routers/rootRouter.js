import express from "express";
import { all } from "express/lib/application";
import {
  getJoin,
  getLogin,
  postJoin,
  postLogin,
} from "../controllers/usercontroller";
import { home, search } from "../controllers/videocontroller";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;
