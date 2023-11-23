import cors from 'cors';
import express, { Application } from 'express';
import passport from 'passport';
import configurePassport from './passport';
import authRoute from "./router/auth";
import postRoute from "./router/post";
import userRoute from './router/user';

const app: Application = express();

import myDataSource from "./database/dbconfig";

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
import jwt from 'jsonwebtoken';
import { Server, Socket } from "socket.io";
import {Chatroom} from './entity/chatroom'
import {ChatText} from './entity/chat_text'
require('dotenv').config();
httpServer.listen(8080, () => {
    console.log("Server listening on port 8080");
});

interface ChatLogItem {
    user_uuid: string;
    chatroom_uuid: string;
    message: string;
    timestamp: number;
  }

interface ServerToClientEvents {
    onMessageReceived: (data: ChatLogItem) => void;
  }
  
interface ClientToServerEvents {
    hello: () => void;
    //onMessageSent: (data: ChatLogItem) => void;
    onMessageSent: (roomName: any, data: ChatLogItem) => void;
  
    onClientConnected :(data:ChatLogItem) =>void;
}
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer,{
    cors: {
		origin: ["http://localhost:3000", "https://admin.socket.io"],
		methods: ["GET", "POST"],
		credentials: true,
	},
});
interface CustomSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
    decoded?: any; // Adjust the type according to your decoded token structure
  }


const chatRoomRepository = myDataSource.getRepository(Chatroom);
const chatTextRepository = myDataSource.getRepository(ChatText);

// add middleware
io.use(async(socket: CustomSocket, next) => {
    // Access the query parameters sent from the client
    const token = socket.handshake.query.token as string | undefined;
  if (!token) {
    return next(new Error("Token is missing"));
  }

  // Verify
  try {
    const newToken = token.slice(4,)
    const decoded = await jwt.verify(newToken, process.env.PASSPORT_SECRET!) as any;
    socket.decoded = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    next(error instanceof Error ? error : new Error("Unknown error occurred during JWT verification"));
  }
});  


interface ConnectedClients {
    [roomName: string]: any; // 这里的 any 可以根据你的需要替换为具体的 WebSocket 类型
}

const connectedClientsTest: ConnectedClients = {};


const connectedClients: Array<any> = [];
//io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
io.on("connection", (socket: CustomSocket) => {


    console.log('connect success')
    console.log('Decoded Token:', socket.decoded);
    // 新連線 加入使用者uid 如果沒加過就要加進去
    if(!connectedClients.includes(socket.decoded.uid)){
        connectedClients.push(socket.decoded.uid)
    }



    // if(!connectedClientsTest[1]){
    //   connectedClientsTest[1] = [];
    // }
    // if(!connectedClientsTest[2]){
    //   connectedClientsTest[2] = [];
    // }
    
    // if(socket.decoded.uid ===1 && !connectedClientsTest[1].includes(socket.decoded.uid)){
    //   connectedClientsTest[1].push(socket.decoded.uid);
    // }else if(socket.decoded.uid ===3 && !connectedClientsTest[1].includes(socket.decoded.uid)){
    //   connectedClientsTest[1].push(socket.decoded.uid);
    // }else if(!connectedClientsTest[2].includes(socket.decoded.uid)){
    //   connectedClientsTest[2].push(socket.decoded.uid);
    // }

    //socket.on('onMessageSent', async({ roomName, data }) => {
		socket.on("onMessageSent", async(data) => {
          console.log( data)
            console.log('socketttt',socket.decoded.uid)
            const chatText = new ChatText();
            // 目前聊天室id預設1
            chatText.chatroom_id = 1;
            // chatText.chatroom_id = data.chatroom_uuid;
            // or data.chatroom _id??????
            chatText.user_id = socket.decoded.id;
            chatText.text = data.message;

            // 存到資料庫
            await chatTextRepository.save(chatText);

        
            io.emit('onMessageReceived', data);
            //to do select * from 'user_chatroom' where chatroom_id= chatroom join User user_uid


			console.log(data);
      console.log(connectedClients)
            // connectedClients.map(each =>{
            //     if(each != socket.decoded.uid){
            //       console.log(each)
            //         io.sockets.emit("onMessageReceived", data)
            //     }
            // })
            
			// if (data.room === "") {
			// 	io.sockets.emit("serverMsg", data);
			// } else {
			// 	socket.join(data.room);
			// 	io.to(data.room).emit("serverMsg", data);
			// }
		});


          // 处理断开连接事件
          // TO DO 修改資料型態？
    socket.on('disconnect', () => {
        console.log('A client disconnected');

        // 从数组中移除断开连接的客户端
        const index = connectedClients.indexOf(socket.decoded.uid);
        if (index !== -1) {
        connectedClients.splice(index, 1);
        }
    });
        

	}
);



////////////////////
// rubbish
// interface ConnectedClients {
//     [user_uuid: string]: any; // 这里的 any 可以根据你的需要替换为具体的 WebSocket 类型
// }

// const connectedClients: ConnectedClients = {};

// //const io = require('socket.io')(httpServer);
// // io.on("connection", function(socket: any){
// //     console.log('user is connected')

// //         setInterval(function () {
// //         socket.emit('second', { 'second': new Date().getSeconds() });
// //     }, 1000);
// // })
// io.on("connection", function (socket: any) {
//     console.log('user is connected')
//     //console.log(socket.id)
   
    
//     const chatRoomRepository = myDataSource.getRepository(Chatroom);
//     const chatTextRepository = myDataSource.getRepository(ChatText);

//     // 当有新用户连接时
//     socket.on('onClientConnected', (data: any) => {
//         console.log('new connect', data)
//         const { user_uuid, chatroom } = data;
//         console.log(user_uuid, chatroom)

//         // to do select chatroom from database


//         // 将用户加入聊室
//         //socket.join(chatroom);

//         // 维护用户与聊天室的映射
//         if (!connectedClients[user_uuid]) {
//             connectedClients[user_uuid] = [];
//         }

//         connectedClients[user_uuid].push(chatroom);
//     });

//     // 收到消息
//     socket.on('onMessageSent', async (data: object) => {
//         console.log('Received message:', data);
//         io.emit('onMessageReceived', {message : 'okkk!', user_uuid:'12344'})

//         // 使用 TypeORM 存储消息到数据库
//         const { user_uuid, chatroom, text } = data as { user_uuid: number, chatroom: number, text: string };
//         console.log(user_uuid)
//         // const chatText = new ChatText();
//         // chatText.chatroom_id = chatroom;
//         // chatText.user_id = user_uuid;
//         // chatText.text = text;

//         // // 存到資料庫
//         // await chatTextRepository.save(chatText);

//         // //to do select * from 'user_chatroom' where chatroom_id= chatroom join User user_uid

//         // if (connectedClients[user_uuid] && connectedClients[user_uuid].includes(chatroom)) {
//         //     // 如果用户所属的聊天室中有其他用户
//         //     connectedClients[user_uuid].forEach((chatroom:any) => {
//         //       // 遍历用户所属的聊天室
//         //       io.to(chatroom).emit('onMessageReceived', {
//         //         user_uuid,
//         //         text,
//         //       });
//         //     });
//         //   }

//         //socket.to(chatroom).emit('newMessage', data);
//     });

//     // 当用户断开连接时
//     socket.on('onClientDisconnected', () => {
//         // 在用户断开连接时从 connectedClients 中移除
//         const user_uuid = Object.keys(connectedClients).find(
//             (key) => connectedClients[key] === socket
//         );
//         if (user_uuid) {
//             delete connectedClients[user_uuid];
//         }
//     });

//     // 收到訊息
//     socket.on('onMessageSent', (message: string) => {
//         console.log(message)
//         const data = JSON.parse(message)

//         //回傳 message 給發送訊息的 Client
//         socket.emit('getMessage', message)

//     })

//  })


//app.listen(8888);