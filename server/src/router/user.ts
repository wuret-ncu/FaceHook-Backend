import myDataSource from "../database/dbconfig"
import express, { NextFunction, Request, Response } from 'express';
import { Users, Post, Profile, Comment, Comment_like, Post_like,Friend,Chatroom } from '../entity'; 


declare global {
  namespace Express {
    interface Request {
      foundUser?: Users;
    }
  }
}

// 建立 chatroom 與 user 的關聯
async function addUserToChatroom(userId: number, chatroomId: number): Promise<void> {
  const chatroomRepository = myDataSource.getRepository(Chatroom);
  const userRepository = myDataSource.getRepository(Users);
  
  console.log(`userId: ${userId}, chatroomId: ${chatroomId}`);
  const user = await userRepository.findOne({ where: { id: userId } });
  const chatroom = await chatroomRepository.findOne({ where: { id: chatroomId } });

  if (chatroom && user) {
    
    chatroom.name = "default";
    chatroom.user_id = [user];
    
    await chatroomRepository.manager.save(chatroom);
}
}

// 查詢 chatroom 有哪些 user
async function getChatroomUsers(chatroomId: number): Promise<Users[]> {
  const chatroomRepository = myDataSource.getRepository(Chatroom);
  const chatroom = await chatroomRepository.findOne({
    where: { id: chatroomId },
    relations: ["user_id"],
  });
  

  return chatroom?.user_id || [];
}

// 刪除 chatroom 與 user 的關聯
async function removeUserFromChatroom(userId: number, chatroomId: number): Promise<void> {
  const chatroomRepository = myDataSource.getRepository(Chatroom);
  const userRepository = myDataSource.getRepository(Users);

  const user = await userRepository.findOne({ where: { id: userId } });
  const chatroom = await chatroomRepository.findOne({ where: { id: chatroomId } });

  if (user && chatroom) {
    chatroom.user_id = chatroom.user_id.filter(u => u.id !== user.id);
    await chatroomRepository.save(chatroom);
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

// 更新個人檔案資訊
router.patch('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { introduction, address, job, school, interest, birthday, single } = req.body;

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id

    // 檢查使用者是否已經有個人檔案
    let profile = await myDataSource.getRepository(Profile).findOne({ where: { user_id: {id:userId} } });

    if (!profile) {
      // 如果沒有，創建新的
      profile = new Profile();
      profile.user_id = foundUser;
    }

    if (introduction !== undefined) {
      profile.introduction = introduction;
    }
    if (address !== undefined) {
      profile.address = address;
    }
    if (job !== undefined) {
      profile.job = job;
    }
    if (school !== undefined) {
      profile.school = school;
    }
    if (interest !== undefined) {
      profile.interest = interest;
    }
    if (birthday !== undefined) {
      profile.birthday = birthday;
    }
    if (single !== undefined) {
      profile.single = single;
    }

    await myDataSource.getRepository(Profile).save(profile);

    return res.status(201).json({ message: '成功修改個人檔案', profile });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 取得個人檔案資訊 by user_id
router.get("/profile/:id", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const profileRepository = myDataSource.getRepository(Profile);
    const profile = await profileRepository.findOne({ where: { user_id: {id:userId} }, relations: ['user_id']});

    if (!profile) {
      return res.status(200).send("None");
    }

    res.status(200).json(profile);
  } catch (error) {
      res.status(500).json({ error });
  }
});

// 取得個別使用者貼文
router.get("/userpost/:id", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const postRepository = myDataSource.getRepository(Post);
    const post = await postRepository.find({ where: { user_id: {id:userId} },relations: ["user_id","like","like.user_id","comments","comments.like","comments.user_id"],order:{createdAt: "DESC"}});

    if (!post) {
      return res.status(404).json({ message: '查無使用者貼文' });
    }

    res.status(201).json(post);
  } catch (error) {
      res.status(500).json({ error });
  }
});

// 發出及刪除交友邀請
router.post('/add-friend-invite/:friendUserId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const friendId = parseInt(req.params.friendUserId);

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id

    // 檢查是否已經是好友
    const isAlreadyFriend = await myDataSource
      .getRepository(Friend)
      .findOne({ where: { freiend_user_id: { id: friendId }, user_id: { id: userId } } });

    if (isAlreadyFriend) {
      await myDataSource.getRepository(Friend).remove(isAlreadyFriend);
      return res.status(200).json({ message: '取消交友邀請' });
    }

    // 創建新的好友關係
    const newFriend = new Friend();
    newFriend.user_id = foundUser;
    const friend = await myDataSource
      .getRepository(Users)
      .findOne({ where: { id: friendId } }) as Users;
    newFriend.freiend_user_id = friend

    await myDataSource.getRepository(Friend).save(newFriend);

    // 新增 chatroom
    const chatroomRepository = myDataSource.getRepository(Chatroom);
    const newChatroom = new Chatroom;
    newChatroom.name = 'default';
    // 取得 chatroom id
    const savedChatroom = await chatroomRepository.save(newChatroom);
    const chatroomId = savedChatroom.id;

    // user 與 chatroom 建立關聯（把使用者加到聊天室裡面）
    addUserToChatroom(userId,chatroomId);

    return res.status(201).json({ message: '成功發出好友邀請', friend: newFriend });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 刪除好友邀請
router.delete('/remove-friend-invite/:friendUserId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const friendId = parseInt(req.params.friendUserId);

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id

    // 檢查是否是好友
    const friendToRemove = await myDataSource
      .getRepository(Friend)
      .findOne({ where: { freiend_user_id: { id: userId }, user_id: { id: friendId },status:false } });

    if (!friendToRemove) {
      return res.status(400).json({ message: '不是好友關係，無法刪除' });
    }

    // 刪除好友關係
    await myDataSource.getRepository(Friend).remove(friendToRemove);

    return res.status(200).json({ message: '成功刪除好友', removedFriend: friendToRemove });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 取得使用者的交友邀請
router.get('/friend-invitations/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    // const foundUser = req.foundUser as Users;
    // const userId = foundUser.id;
    const userId = parseInt(req.params.id);

    // Find friendship invitations where the user is the recipient and the status is false
    const friendshipInvitations = await myDataSource
      .getRepository(Friend)
      .find({
        where: { freiend_user_id: { id: userId }, status: false },
        relations: ['user_id', 'freiend_user_id'],
      });

    return res.status(200).json(friendshipInvitations);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 確認好友邀請
router.patch('/confirm-friend/:friendUserId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const friendId = parseInt(req.params.friendUserId);

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id

    // 檢查是否有待確認的好友邀請
    const pendingFriend = await myDataSource
      .getRepository(Friend)
      .findOne({ where: { freiend_user_id: { id: userId  }, user_id: { id: friendId }, status: false } });

    if (!pendingFriend) {
      return res.status(400).json({ message: '找不到待確認的好友邀請' });
    }

    // 更新好友狀態
    pendingFriend.status = true;
    await myDataSource.getRepository(Friend).save(pendingFriend);

    const newFriend = new Friend();
    const friend = await myDataSource
      .getRepository(Users)
      .findOne({ where: { id: friendId } }) as Users;
    newFriend.user_id = foundUser;
    newFriend.freiend_user_id = friend;
    newFriend.status = true
    await myDataSource.getRepository(Friend).save(newFriend);

    return res.status(200).json({ message: '成功確認好友', confirmedFriend: pendingFriend });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 刪除好友
router.delete('/remove-friend/:friendUserId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const friendId = parseInt(req.params.friendUserId);

    const foundUser = req.foundUser as Users;
    const userId = foundUser.id

    // 檢查是否是好友
    const friendToRemove = await myDataSource
      .getRepository(Friend)
      .findOne({ where: { freiend_user_id: { id: friendId }, user_id: { id: userId },status:true } });

    const friendToRemove2 = await myDataSource
    .getRepository(Friend)
    .findOne({ where: { freiend_user_id: { id: userId }, user_id: { id: friendId },status:true } });

    if (!friendToRemove || !friendToRemove2) {
      return res.status(400).json({ message: '不是好友關係，無法刪除' });
    }

    // 刪除好友關係
    await myDataSource.getRepository(Friend).remove(friendToRemove);
    await myDataSource.getRepository(Friend).remove(friendToRemove2);

    return res.status(200).json({ message: '成功刪除好友', removedFriend: {friendToRemove,friendToRemove2} });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 取得使用者目前的好友
router.get('/current-friends/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Find current friends where the user is either the sender or recipient, and the status is true
    const currentFriends = await myDataSource
      .getRepository(Friend)
      .createQueryBuilder('friend')
      .where('(friend.user_id = :userId AND friend.status = true) OR (friend.friend_user_id = :userId AND friend.status = true)', { userId })
      .leftJoinAndSelect('friend.user_id', 'user')
      .leftJoinAndSelect('friend.freiend_user_id', 'friendUser')
      .getMany();

    // Extract friend IDs
    const friendIds = currentFriends.map((friend) => friend.freiend_user_id.id);

    // Fetch profile data for each friend
    const profiles = await myDataSource
    .getRepository(Profile)
    .find({
      where: friendIds.map(id => ({ user_id: { id } })),
      relations: ['user_id', 'background_photo', 'avatar'],
    });

    // Combine Friend and Profile data
    const friendsWithProfiles = currentFriends.map((friend) => {
      const profile = profiles.find((p) => p.user_id.id === friend.freiend_user_id.id);
      return {
        ...friend,
        profile,
      };
    });

    return res.status(200).json(friendsWithProfiles);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 取得共同朋友
router.get('/common-friends/:userId2', authenticateUser, async (req: Request, res: Response) => {
  try {
    const foundUser = req.foundUser as Users;
    const userId = foundUser.id;
    const userId2 = parseInt(req.params.userId2);

    // Find friends of user 1
    const friendsUser1 = await myDataSource.getRepository(Friend).find({
      where: { user_id: { id: userId }, status: true },
      relations: ['freiend_user_id'],
    });

    // Find friends of user 2
    const friendsUser2 = await myDataSource.getRepository(Friend).find({
      where: { user_id: { id: userId2 }, status: true },
      relations: ['freiend_user_id'],
    });

    // Extract friend IDs for both users
    const friendIdsUser1 = friendsUser1.map((friend) => friend.freiend_user_id.id);
    const friendIdsUser2 = friendsUser2.map((friend) => friend.freiend_user_id.id);

    // Find common friend IDs
    const commonFriendIds = friendIdsUser1.filter(id => friendIdsUser2.includes(id));

    // Fetch profile data for common friends
    const profiles = await myDataSource
      .getRepository(Profile)
      .find({
        where: commonFriendIds.map(id => ({ user_id: { id } })),
        relations: ['user_id', 'background_photo', 'avatar'],
      });

    // Combine Friend and Profile data for common friends
    const commonFriendsWithProfiles = friendsUser1
      .filter(friend1 => commonFriendIds.includes(friend1.freiend_user_id.id))
      .map((friend1) => {
        const profile = profiles.find((p) => p.user_id.id === friend1.freiend_user_id.id);
        return {
          ...friend1,
          profile,
        };
      });

    return res.status(200).json({ commonFriends: commonFriendsWithProfiles, count: commonFriendIds.length });
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;