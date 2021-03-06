const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
require('dotenv').config();
const { postService, userService, fileService } = require('../services');

const {
  getManyPosts,
  insertPost,
  removePost,
  likePost,
  getPost,
  getPostComments,
  getPostLikes,
  votePoll,
} = postService;
const { getUser, getUserByHandle } = userService;
const verifyToken = require('../utils/verifyToken');

const { uploadToS3 } = fileService;

const getUserFeed = async (req, res, next) => {
  const pageSize = req.query.pageSize ? req.query.pageSize : 10;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;
  const { id: userId } = req.user;
  const auth = verifyToken(req);

  try {
    const userFollowing = await getUser(userId);
    const filterQuery = { user: [...userFollowing.following, userId] };
    const result = await getManyPosts(
      { filter: filterQuery, pageSize, currentPage },
      auth
    );
    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const getUserPosts = async (req, res, next) => {
  const { handle } = req.params;
  const auth = verifyToken(req);
  const user = await getUserByHandle(handle);
  try {
    const result = await getManyPosts({ filter: { user: user._id } }, auth);
    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const getPostById = async (req, res, next) => {
  const { id } = req.params;
  const auth = verifyToken(req);
  try {
    const result = await getPost(id, auth);
    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const insert = async (req, res, next) => {
  const { content, mediaType, media } = req.body;
  const { id: userId } = req.user;
  try {
    if (mediaType === 'image') {
      try {
        const image = await Jimp.read(req.file.path);
        let { width } = image.bitmap;
        let { height } = image.bitmap;
        if (width >= 1000 || (height >= 1000 && width >= height)) {
          const resize = (1000 * 100) / width;
          width = (width * resize) / 100;
          height = (height * resize) / 100;
        }
        if (width >= 1000 || (height >= 1000 && height >= width)) {
          const resize = (1000 * 100) / height;
          height = (height * resize) / 100;
          width = (width * resize) / 100;
        }
        image
          .quality(70)
          .resize(width, height)
          .write(
            `${path.resolve(__dirname, '..', '..')}/public/uploads/posts/${
              req.file.name
            }`,
            async () => {
              if (process.env.NODE_ENV === 'production') {
                const fileContent = fs.createReadStream(
                  `${path.resolve(
                    __dirname,
                    '..',
                    '..'
                  )}/public/uploads/posts/${req.file.name}`
                );
                const upload = await uploadToS3(req.file, fileContent);
                const result = await insertPost({
                  content,
                  mediaType,
                  media: upload.url,
                  user: userId,
                });
                res.send(result);
                next();
              } else {
                const result = await insertPost({
                  content,
                  mediaType,
                  media: `${req.protocol}://${req.headers.host}/public/uploads/posts/${req.file.name}`,
                  user: userId,
                });
                res.send(result);
                next();
              }
            }
          );
      } catch (err) {
        throw new Error(err);
      }
    } else {
      const result = await insertPost({
        content,
        mediaType,
        media,
        user: userId,
      });
      res.send(result);
      next();
    }
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;

  try {
    const result = await removePost(postId, userId);
    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const like = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;

  try {
    const result = await likePost(postId, userId);
    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const getComments = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const isAuthenticaded = verifyToken(req);
    const result = await getPostComments(postId, isAuthenticaded);

    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const getLikes = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const isAuthenticaded = verifyToken(req);
    const result = await getPostLikes(postId, isAuthenticaded);

    res.send(result);
    next();
  } catch (e) {
    next(e);
  }
};

const vote = async (req, res, next) => {
  const { pollId } = req.params;
  const { id: userId } = req.user;
  // eslint-disable-next-line no-shadow
  const { vote } = req.body;

  try {
    const optionVote = await votePoll(pollId, userId, vote);

    res.send(optionVote);
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getUserFeed,
  getUserPosts,
  getPostById,
  insert,
  remove,
  like,
  getComments,
  getLikes,
  vote,
};
