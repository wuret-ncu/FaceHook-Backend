import myDataSource from "../database/dbconfig"
import express, { NextFunction, Request, Response } from 'express';
import { Users, Post, Comment, Comment_like, Post_like } from '../entity'; 


declare global {
  namespace Express {
    interface Request {
      foundUser?: Users;
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

// 取得當前使用者資訊
router.get('/', authenticateUser, (req: Request, res: Response) => {
    try {
      const foundUser = req.foundUser as Users;
  
      // 此處可以使用 foundUser 來返回使用者資訊
      res.json(foundUser);
    } catch (error) {
      return res.status(500).send(error);
    }
});


export default router;