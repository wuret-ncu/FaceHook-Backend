import myDataSource from '../database/dbconfig'; 
import express, { Request, Response } from 'express';
import { Users,Profile } from '../entity';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
require('dotenv').config();
import { body, validationResult } from 'express-validator';

const router = express.Router();

// 註冊使用者
router.post('/register', [
  body('username').notEmpty().withMessage('請輸入使用者姓名'),
  body('email').isEmail().withMessage('請輸入有效的電子郵件地址'),
  body('password').isLength({ min: 6 }).withMessage('你的密碼最少需要 6 個字元。請嘗試使用其他密碼。'),
  ], async (req: Request, res: Response) => {
  
    try {

    const errors= validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;

    const userRepository = myDataSource.getRepository(Users); 

    // 檢查email是否已被註冊
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '該信箱已被註冊' });
    }

    
    // 創建新使用者
    const newUser = userRepository.create({ username, email, password });
    await userRepository.save(newUser);

    // 創建使用者檔案
    const profileRepository = myDataSource.getRepository(Profile);
    const newProfile = profileRepository.create({ user_id: newUser }); // Assuming "user_id" is the foreign key in the Profile entity
    await profileRepository.save(newProfile);

    return res.status(200).json({ msg: '註冊成功', newUser, newProfile  });
  } catch (error) {
    return res.status(500).json({ msg: '無法註冊使用者' , error });
  }
});


// 登入
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userRepository = myDataSource.getRepository(Users);

    // 尋找使用者
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '找不到使用者，請確認信箱正確' });
    }

    // 驗證密碼
    // const passwordMatch = await user.comparePassword(password);
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: '密碼錯誤' });
    }
    // 製作 json web token
    const payload = {
      uid: user.uid,
      id: user.id,
      email: user.email,
      username: user.username
    };
    if (!process.env.PASSPORT_SECRET) {
      throw new Error('PASSPORT_SECRET is not defined');
    }
    const token = jwt.sign(payload, process.env.PASSPORT_SECRET, { expiresIn: '1h' });

    // return res.status(200).json({ msg: '登入成功', token:'JWT '+ token, user });
    return res.status(200).json({token:'JWT '+ token });
  } catch (error) {
    return res.status(500).json({ msg: '無法登入', error });
  }
});

export default router;
