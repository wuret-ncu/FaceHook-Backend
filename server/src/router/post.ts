import myDataSource from "../database/dbconfig"
import express, { Request, Response } from 'express';
import { Equal,In } from "typeorm";
import { Users, Post, Comment, Comment_like, Post_like } from '../entity'; 


const router = express.Router();


// Create a new post
router.post('/', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const userId = 1
    const group = "everybody"

    const post = new Post();
    post.content = content;
    post.group = group;

    const user = await myDataSource.getRepository(Users).findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: '找不到該用戶' });
    }

    post.user_id = user;

    await myDataSource.getRepository(Post).save(post);

    return res.status(201).json({ message: '成功新增貼文', post });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Read all posts
router.get("/", async (req: Request, res: Response) => {
  try {
    const postRepository = myDataSource.getRepository(Post);
    const posts = await postRepository.find({ relations: ["like","comments","comments.like"],order:{created_at: "DESC"} });

    res.json(posts);
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Read a single post
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
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id); 
    const { content } = req.body; 

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }});

    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    post.content = content;

    await postRepository.save(post);

    res.json({ message: '貼文已成功更新', post });
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Delete a post
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id); 

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }});

    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    const postLikeRepository = myDataSource.getRepository(Post_like);
    await postLikeRepository
      .createQueryBuilder()
      .delete()
      .where("post_id = :postId", { postId })
      .execute();

    const commentRepository = myDataSource.getRepository(Comment);
    await commentRepository
      .createQueryBuilder()
      .delete()
      .where("post_id = :postId", { postId })
      .execute();

    await postRepository.remove(post);

    res.json({ message: '貼文已成功刪除' });
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Like a post
router.post('/:postId/like', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId); 
    // const { userId } = req.body; 

    const userId = 1
    const user = await myDataSource.getRepository(Users).findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: '找不到該用戶' });
    }

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }});
    if (!post) {
      return res.status(404).json({ message: '找不到該貼文' });
    }

    const postLike = new Post_like();
    postLike.user_id = user;
    postLike.post_id = post;

    const postLikeRepository = myDataSource.getRepository(Post_like);
    await postLikeRepository.save(postLike);

    res.status(201).json({ message: '已成功新增讚', postLike });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Unlike a post
router.delete('/:postId/unlike', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId); 

    const postLikeRepository = myDataSource.getRepository(Post_like);
    const postLike = await postLikeRepository.findOne({
      where: { post_id: Equal(postId)}, 
    });
    if (!postLike) {
      return res.status(404).json({ message: '找不到該讚' });
    }

    await postLikeRepository.remove(postLike);

    res.json({ message: '讚已成功刪除' });
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Create a new comment
router.post('/:id/comment', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId }});
    if (!post) {
      return res.status(404).json({ message: '找不到此貼文' });
    }

    const userId = 1;
    const user = await myDataSource.getRepository(Users).findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: '找不到該用戶' });
    }

    const comment = new Comment();
    comment.user_id = user;
    comment.post_id = post;
    comment.content = content;

    const commentRepository = myDataSource.getRepository(Comment);
    await commentRepository.save(comment);

    res.status(201).json({ message: '評論已成功新增', comment });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Delete a comment
router.delete('/comment/:commentId', async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId); 

    const commentRepository = myDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ message: '找不到該評論' });
    }

    const commentLikeRepository = myDataSource.getRepository(Comment_like);
    await commentLikeRepository
      .createQueryBuilder()
      .delete()
      .where("comment_id = :commentId", { commentId })
      .execute();

    await commentRepository.remove(comment);

    res.json({ message: '評論已成功刪除' });
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Like a comment
router.post('/likecomment/:commentId', async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    // const { userId } = req.body;
    const userId = 1;

    const user = await myDataSource.getRepository(Users).findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: '找不到該用戶' });
    }
    const commentRepository = myDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: '找不到該評論' });
    }

    const like = new Comment_like();
    like.user_id = user;
    like.comment_id = comment;

    const likeRepository = myDataSource.getRepository(Comment_like);
    await likeRepository.save(like);

    res.status(201).json({ message: '讚已成功新增', like });
  } catch (error) {
      res.status(500).json({ error });
  }
});

// Unlike a comment
router.delete('/unlikecomment/:commentId', async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);

    const commentRepository = myDataSource.getRepository(Comment_like);
    const comment = await commentRepository.findOne({ where: { comment_id: Equal(commentId) } });
    if (!comment) {
      return res.status(404).json({ message: '找不到該讚' });
    }

    await commentRepository.remove(comment);

    res.status(200).json({ message: '讚已成功刪除' });
  } catch (error) {
      res.status(500).json({ error });
  }
});



export default router;