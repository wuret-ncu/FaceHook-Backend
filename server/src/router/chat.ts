import myDataSource from "../database/dbconfig"
import express, { NextFunction, Request, Response } from 'express';
import { Users, Post, Chatroom} from '../entity'; 

const router = express.Router();

// Get all chatroom by user
router.get("/getAllRoom",async (req: Request, res: Response) => {
    try {
      const postRepository = await myDataSource.getRepository(Chatroom);
      //const posts = await postRepository.find({ relations: ["user_id","id","name"],order:{createdAt: "DESC"} });
  
      res.json(postRepository);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error });
    }
  });

export default router;