import myDataSource from "../database/dbconfig"
import express, { NextFunction, Request, Response } from 'express';
import { Users, Post, Comment, Comment_like, Post_like,Profile } from '../entity'; 
import { ILike } from "typeorm";


declare global {
  namespace Express {
    interface Request {
      foundUser?: Users; // 在 Request 中添加 foundUser 屬性
    }
  }
}

const router = express.Router();


const authenticateUser = async (req: Request, res: Response, next: () => void) => {
  try {
    const user = req.user as Users;
    if (!user) {
      return res.status(401).json({ message: '未授權的用戶' });
    }
    const user_id = user.id;
    const foundUser = await myDataSource.getRepository(Users).findOne({ where: { id: user_id } });
    if (!foundUser) {
      return res.status(404).json({ message: '找不到該用戶' });
    }
    req.foundUser = foundUser; // 將已驗證的用戶信息附加到請求對象中
    next();
  } catch (error) {
    return res.status(500).send(error);
  }
};


// Create a new post
router.post('/', authenticateUser,async (req: Request, res: Response) => {
  try {
    const { content,group } = req.body;
    // const group = "everybody"

    const post = new Post();
    post.content = content;
    post.group = group;

    const foundUser = req.foundUser as Users;

    post.user_id = foundUser;

    await myDataSource.getRepository(Post).save(post);

    return res.status(201).json({ message: '成功新增貼文', post });
  } catch (error) {
    return res.status(500).send(error);
  }
});


// Get all posts
router.get("/",async (req: Request, res: Response) => {
  try {
    const postRepository = myDataSource.getRepository(Post);
    const posts = await postRepository.find({ relations: ["user_id","user_id.friend.freiend_user_id","like","like.user_id","comments","comments.like","comments.like.user_id","comments.user_id"],order:{createdAt: "DESC"} });

    res.json(posts);
  } catch (error) {
      res.status(500).json({ error });
  }
});


// Get a single post
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }});

    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    res.json(post);
  } catch (error) {
      res.status(500).json({ error });
  }
});


// Update a post
router.put("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { content,group } = req.body;

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }, relations: ["user_id"] });

    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    const postuserid = post.user_id.id
    const foundUser = req.foundUser as Users

    // Check if the user has permission to update the post
    if (postuserid !== foundUser.id) {
      return res.status(403).json({ message: '無權限更新該貼文' });
    }

    post.content = content;
    post.group = group;

    await myDataSource.getRepository(Post).save(post);

    return res.status(200).json({ message: '成功更新貼文', post });
  } catch (error) {
    res.status(500).json({error});
  }
});


// Delete a post
router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }, relations: ["user_id"] });

    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    const postuserid = post.user_id.id
    const foundUser = req.foundUser as Users

    if (postuserid !== foundUser.id) {
      return res.status(403).json({ message: '無權限刪除該貼文'});
    }

    // Delete related Post_like & Comment records
    const postLikeRepository = myDataSource.getRepository(Post_like);
    await postLikeRepository.delete({ post_id: {id:postId} });

    const commentRepository = myDataSource.getRepository(Comment);
    const relatedComments = await commentRepository.find({ where: { post_id: { id: postId } } });

    const commentLikeRepository = myDataSource.getRepository(Comment_like);
    for (const comment of relatedComments) {
      await commentLikeRepository.delete({ comment_id: {id:comment.id} });
    }

    await commentRepository.remove(relatedComments);

    await myDataSource.getRepository(Post).remove(post);

    return res.status(200).json({ message: '成功刪除貼文',post });
  } catch (error) {
    res.status(500).json({ error });
  }
});


// Like a post
router.post('/like/:postId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);

    const foundUser = req.foundUser as Users
    const userId = foundUser.id

    // 檢查是否已經點讚，如果已經點讚，可以選擇取消讚或不做任何事
    const existingLike = await myDataSource
      .getRepository(Post_like)
      .findOne({ where: { post_id: { id: postId }, user_id: { id: userId } } });
    
    if (existingLike) {
      return res.status(400).json({ message: '您已經點過讚了' });
    }

    // 創建新的讚
    const newLike = new Post_like();
    newLike.user_id = foundUser;


    // 使用關聯來設置post_id
    const post = new Post();
    post.id = postId;
    newLike.post_id = post;

    newLike.emoji = '1'; // 這裡可以設置您希望的表情符號
    await myDataSource.getRepository(Post_like).save(newLike);

    return res.status(201).json({ message: '成功新增讚', like: newLike });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Unlike a post
router.delete('/unlike/:postId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id;

    // 檢查是否已經點讚，如果已經點讚，則執行取消讚的操作
    const existingLike = await myDataSource
      .getRepository(Post_like)
      .findOne({ where: { post_id: { id: postId }, user_id: { id: userId } } });

    if (!existingLike) {
      return res.status(400).json({ message: '您尚未點讚' });
    }

    // 執行取消讚的操作
    await myDataSource.getRepository(Post_like).remove(existingLike);

    return res.status(200).json({ message: '成功取消讚' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Create a new comment
router.post('/:postId/comment', authenticateUser, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;
    const foundUser = req.foundUser as Users;

    // 檢查貼文是否存在
    const existingPost = await myDataSource
      .getRepository(Post)
      .findOne({ where: { id: postId } });

    if (!existingPost) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    // 創建新的評論
    const newComment = new Comment();
    newComment.user_id = foundUser;
    newComment.post_id = existingPost; // 使用現有的貼文
    newComment.content = content;

    await myDataSource.getRepository(Comment).save(newComment);

    return res.status(201).json({ message: '成功新增貼文評論', comment: newComment });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Delete a comment
router.delete('/comment/:commentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const foundUser = req.foundUser as Users;

    // 檢查評論是否存在
    const existingComment = await myDataSource
      .getRepository(Comment)
      .findOne({ where: { id: commentId },relations: ["user_id","post_id"] });
    
    if (!existingComment) {
      return res.status(404).json({ message: '找不到該貼文評論' });
    }

    // 檢查評論的擁有者是否是當前用戶
    if (existingComment.user_id.id !== foundUser.id) {
      return res.status(403).json({ message: '無權刪除該貼文評論' });
    }

    const commentLikeRepository = myDataSource.getRepository(Comment_like);
    await commentLikeRepository.delete({ comment_id: {id:commentId} });

    // 執行刪除評論的操作
    await myDataSource.getRepository(Comment).remove(existingComment);

    return res.status(201).json({ message: '成功刪除貼文評論' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Like a comment
router.post('/likecomment/:commentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const foundUser = req.foundUser as Users;

    // 檢查是否已經點讚，如果已經點讚，可以選擇取消讚或不做任何事
    const existingLike = await myDataSource
      .getRepository(Comment_like)
      .findOne({ where: { comment_id: {id:commentId}, user_id: {id:foundUser.id} } });

    if (existingLike) {
      return res.status(400).json({ message: '您已經點過評論讚了' });
    }

    // 創建新的評論讚
    const newLike = new Comment_like();
    newLike.user_id = foundUser;

    // 使用關聯來設置post_id
    const comment = new Comment();
    comment.id = commentId;
    newLike.comment_id = comment;

    // newLike.comment_id = commentId; // 設置評論讚的關聯評論 ID
    
    newLike.emoji = '1'; // 這裡可以設置您希望的表情符號

    await myDataSource.getRepository(Comment_like).save(newLike);

    return res.status(201).json({ message: '成功新增評論讚', like: newLike });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Unlike a comment
router.delete('/unlikecomment/:commentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const foundUser = req.foundUser as Users;

    // 檢查是否已經點讚，如果已經點讚，可以取消讚
    const existingLike = await myDataSource
      .getRepository(Comment_like)
      .findOne({ where: { comment_id: {id:commentId}, user_id: {id:foundUser.id} } });

    if (!existingLike) {
      return res.status(400).json({ message: '您尚未點過評論讚' });
    }

    // 執行取消評論讚的操作
    await myDataSource.getRepository(Comment_like).remove(existingLike);

    return res.status(201).json({ message: '成功取消評論讚' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});


// Search for posts
router.post("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: '關鍵字不能為空' });
    }

    const postRepository = myDataSource.getRepository(Post);
    const userRepository = myDataSource.getRepository(Users);
    const profileRepository = myDataSource.getRepository(Profile);

    const posts = await postRepository
      .createQueryBuilder("post")
      .leftJoin("post.user_id", "user")
      .leftJoinAndMapOne("user.friendUser", Users, "friendUser", "user.friend.freiend_user_id = friendUser.id")
      .where("post.content ILIKE :keyword OR user.username ILIKE :keyword", { keyword: `%${q}%` })
      .leftJoinAndSelect("post.like", "like")
      .leftJoinAndSelect("like.user_id", "likeUser")
      .leftJoinAndSelect("post.comments", "comment")
      .leftJoinAndSelect("comment.like", "commentLike")
      .leftJoinAndSelect("comment.user_id", "commentUser")
      .addSelect(["user.username", "user.friendUser.username"])
      .orderBy("post.createdAt", "DESC")
      .getMany();

    // Search for users with usernames matching the keyword
    const users = await userRepository.find({
      where: {
        username: ILike(`%${q}%`),
      },
      relations: ["profile"],
    });
    
    // Combine the results
    const combinedResults = {
      users,
      posts,
    };

    // if (posts.length === 0 && users.length === 0) {
    //   return res.status(200).json({ message: '無相關貼文或用戶' });
    // }

    res.status(200).json(combinedResults);
  } catch (error) {
    res.status(500).json({ error });
  }
});


export default router;