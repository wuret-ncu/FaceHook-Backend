import myDataSource from "../database/dbconfig"
import express, { Request, Response } from 'express';
import {  Chatroom} from '../entity'; 
import {ChatText} from '../entity/chat_text';

const router = express.Router();

// Get chatrooms by user id
router.get("/getAllRoom/:userId", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);

        const chatroomRepository = await myDataSource.getRepository(Chatroom);

        const userChatrooms = await chatroomRepository
            .createQueryBuilder("chatroom")
            .innerJoinAndSelect("chatroom.user_id", "user")
            .select(["chatroom.id", "user", "chatroom.name","chatroom.uid"])
            .getMany();

        const result = await userChatrooms.filter(obj =>
          obj.user_id.some(userObj => userObj.id === userId)
        );    

        res.json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error });
    }
});


// Get chat log by chatroomId
router.get("/getChatLog/:chatroomId", async (req: Request, res: Response) => {
    try {
        const chatroomId = parseInt(req.params.chatroomId);

        const chatTextRepository = await myDataSource.getRepository(ChatText);

        const ChatroomLog = await chatTextRepository
        .createQueryBuilder("chat_text")
            .innerJoinAndSelect("chat_text.user_id", "user")
            .where({chatroom_id: chatroomId})
            .select(["chat_text.id", "user.id", "chat_text.text","chat_text.createdAt"])
            .orderBy({ "chat_text.createdAt": "ASC" }) 
            .getMany();
        //.find({where:{chatroom_id:chatroomId},order:{createdAt: "ASC"}, relations: ["user_id"],select: ["id", "text", "createdAt", "user_id.id"]})

        res.json(ChatroomLog);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error });
    }
});



export default router;