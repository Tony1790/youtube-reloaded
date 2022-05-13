import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
  editComment,
} from "../controllers/videocontroller";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comments", createComment);
apiRouter.post("/:id([0-9a-f]{24})/editcomments", editComment);
apiRouter.delete("/comments/:id([0-9a-f]{24})", deleteComment);

export default apiRouter;
