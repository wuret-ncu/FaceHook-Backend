import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './passport';
import postRoute from "./router/post";
import authRoute from "./router/auth";
import userRoute from './router/user';

const app: Application = express();

import myDataSource from "./database/dbconfig"
import { IntegerType } from 'typeorm';

// 初始化 Passport
app.use(passport.initialize());

// 選擇配置 Passport
configurePassport();

const httpServer = require('http').createServer(app);

// establish database connection
myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err)
    })

// app.get('/',(req: Request, res: Response, next: NextFunction) => {
//     res.send("Root route is working");
// });

app.use(express.json())
app.use(cors());

app.use('/auth', authRoute);
app.use('/post', passport.authenticate("jwt", { session: false }), postRoute);
app.use('/user', passport.authenticate("jwt", { session: false }), userRoute);



// websocket
import { ChatText } from './entity/chat_text';
import { Chatroom } from './entity/chatroom';

httpServer.listen(8888, () => {
    console.log("Server listening on port 8888");
});

interface ConnectedClients {
    [user_uuid: string]: any; // 这里的 any 可以根据你的需要替换为具体的 WebSocket 类型
}

const connectedClients: ConnectedClients = {};

const io = require('socket.io')(httpServer);
io.on("connection", function (socket: any) {
    console.log('user is connected')

    const chatRoomRepository = myDataSource.getRepository(Chatroom);
    const chatTextRepository = myDataSource.getRepository(ChatText);

    // 当有新用户连接时
    socket.on('onClientConnected', (data: any) => {
        const { user_uuid, chatroom } = data;

        // to do select chatroom from database


        // 将用户加入聊室
        //socket.join(chatroom);

        // 维护用户与聊天室的映射
        if (!connectedClients[user_uuid]) {
            connectedClients[user_uuid] = [];
        }

        connectedClients[user_uuid].push(chatroom);
    });

    // 收到消息
    socket.on('onMessageSent', async (data: object) => {
        console.log('Received message:', data);

        // 使用 TypeORM 存储消息到数据库
        const { user_uuid, chatroom, text } = data as { user_uuid: number, chatroom: number, text: string };

        const chatText = new ChatText();
        chatText.chatroom_id = chatroom;
        chatText.user_id = user_uuid;
        chatText.text = text;

        // 存到資料庫
        await chatTextRepository.save(chatText);

        //to do select * from 'user_chatroom' where chatroom_id= chatroom join User user_uid

        if (connectedClients[user_uuid] && connectedClients[user_uuid].includes(chatroom)) {
            // 如果用户所属的聊天室中有其他用户
            connectedClients[user_uuid].forEach((chatroom:any) => {
              // 遍历用户所属的聊天室
              io.to(chatroom).emit('onMessageReceived', {
                user_uuid,
                text,
              });
            });
          }

        //socket.to(chatroom).emit('newMessage', data);
    });

    // 当用户断开连接时
    socket.on('onClientDisconnected', () => {
        // 在用户断开连接时从 connectedClients 中移除
        const user_uuid = Object.keys(connectedClients).find(
            (key) => connectedClients[key] === socket
        );
        if (user_uuid) {
            delete connectedClients[user_uuid];
        }
    });

    // 收到訊息
    socket.on('onMessageSent', (message: string) => {
        console.log(message)
        const data = JSON.parse(message)

        //回傳 message 給發送訊息的 Client
        socket.emit('getMessage', message)

    })
    // 檢查 socket 是否具有 .on 方法

    // console.log(typeof socket.on)
    // if (typeof socket.on === 'function') {
    //     socket.on('getMessage', function(message: string){
    //         console.log(message)
    //         //回傳 message 給發送訊息的 Client
    //         socket.emit('getMessage', message)
    //     })
    // } else {
    //     console.error('socket.on is not a function');
    // }
})


//app.listen(3000);