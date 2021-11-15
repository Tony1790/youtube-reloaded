import express from "express";
import { join, login } from "../controllers/usercontroller";
import { home } from "../controllers/videocontroller";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/join", join);
globalRouter.get("/login", login);

export default globalRouter;
