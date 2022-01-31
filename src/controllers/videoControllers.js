import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

const BASE_VIDEOS_PUG_PATH = "videos/";
const BAD_REQUEST_CODE = 400;
const NOT_FOUND_CODE = 404;

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).populate("owner").sort({ createdAt: "desc" });
    return res.render("home", {
      pageTitle: "Home",
      videos
    });
  } catch (error) {
    return res.status(BAD_REQUEST_CODE).render("server-error", {
      pageTitle: "Home"
    });
  }
};

export const watch = async (req, res) => {
  const id = req.params.id;

  const video = await Video.findById(id).populate("owner").populate("comments");

  if (!video) {
    return res.status(NOT_FOUND_CODE).render("404", {
      pageTitle: "Video not found",
    });
  }

  if (video) {
    return res.render(BASE_VIDEOS_PUG_PATH + "watch", {
      pageTitle: `${video.title}`,
      video,
    });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.status(NOT_FOUND_CODE).render("404", {
      pageTitle: "Video not found",
    });
  }

  if (video) {
    return res.render(BASE_VIDEOS_PUG_PATH + "edit", {
      pageTitle: `${video.title}`,
      video,
    });
  }
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  const {
    user: { _id }
  } = req.session;

  if (!video) {
    return res.status(NOT_FOUND_CODE).render("404", {
      pageTitle: "Video Not Found",
    });
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }

  if (video) {
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    req.flash("success", "Changes saved.");
    return res.redirect(`/${BASE_VIDEOS_PUG_PATH}${id}`)
  }
};

export const getUpload = (req, res) => {
  return res.render(BASE_VIDEOS_PUG_PATH + "upload", {
    pageTitle: "Upload Video",
  })
};

export const postUpload = async (req, res) => {
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  const user = req.session.user;

  try {
    const newVideo = await Video.create({
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
      createdAt: Date.now(),
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      meta: {
        views: 0,
        rating: 0,
      },
      owner: user._id,
    });

    const updatedUser = await User.findById(user._id);
    updatedUser.videos.push(newVideo._id);
    await updatedUser.save();
    await newVideo.save();
  } catch (error) {
    return res.status(BAD_REQUEST_CODE).render(BASE_VIDEOS_PUG_PATH + "upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    })
  }

  return res.redirect("/");
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const keyword = req.query.k;
  let videos = [];

  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
  }

  return res.render(BASE_VIDEOS_PUG_PATH + "search", {
    pageTitle: "Search Videos",
    videos,
  });
};

export const registerView = async (req, res) => {
  const {
    params: { id }
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await Video.findById(id);
  const userWhoCommented = await User.findById(user._id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    video: id,
    owner: user._id,
  });

  video.comments.push(comment._id);
  userWhoCommented.comments.push(comment._id);
  await video.save();
  await userWhoCommented.save();


  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    params: { commentId },
  } = req;

  const comment = await Comment.findById(commentId);
  const video = await Video.findById(comment.video);
  const user = await User.findById(comment.owner);

  user.comments.splice(user.comments.indexOf(commentId));
  video.comments.splice(video.comments.indexOf(commentId));
  comment.deleteOne({ _id: commentId });

  await user.save();
  await video.save();

  return res.sendStatus(200);
};
