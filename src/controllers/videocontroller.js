import User from "../models/User";
import Comment from "../models/Comment";
import Video from "../models/video";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video is not found!!" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video is not found!!" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not Autorized!");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit : ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video is not found!!" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are Not the Owner of Video!");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtag(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  console.log(req.files);
  const { video, thumb } = req.files;
  //multer가 req.file을 제공해주고 file 안에는 path가 있다.
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      owner: _id,
      hashtags: Video.formatHashtag(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video is not found!!" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  //delete video
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  const userDB = await User.findById(user._id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  userDB.comments.push(comment._id);
  video.save();
  userDB.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  //fetch로 받아온 코멘트 아이디.
  const {
    user: { _id },
  } = req.session;
  //코멘트를 지우고자 하는 세션의 유저 아이디.
  const comment = await Comment.findById(id);
  // DB안의 코멘트
  const videoIdInsideOfcomment = comment.video;
  const userIdInsideOfComment = comment.owner;
  const video = await Video.findById(videoIdInsideOfcomment);
  // DB 안의 비디오
  const user = await User.findById(userIdInsideOfComment);
  // 지우고자 하는 코멘트의 아이디
  //DB의 비디오 안의 코멘트 어레이를 문자열로 만듬.
  const ownerId = String(comment.owner);
  if (ownerId !== _id) {
    return res.sendStatus(404);
  }
  await Comment.findByIdAndDelete(id);
  video.comments.splice(video.comments.indexOf(id), 1);
  user.comments.splice(user.comments.indexOf(id), 1);

  video.save();
  user.save();
  // DB 안의 코멘트 어레이를 수정.
  return res.sendStatus(200);
};

export const editComment = async (req, res) => {
  const {
    body: { text },
    params: { id },
  } = req;
  console.log(text);
  const comment = await Comment.findByIdAndUpdate(
    id,
    { text: text },
    { new: true }
  );
  if (!comment) {
    return res.sendStatus(404);
  }

  return res.sendStatus(200);
};
