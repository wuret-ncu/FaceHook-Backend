import express, { Application, Request, Response, NextFunction } from 'express';
import cors from "cors";
import passport from 'passport';
import configurePassport from './passport'
import postRoute from "./router/post"
import authRoute from "./router/auth"

const app: Application = express();

import myDataSource from "./database/dbconfig"

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
app.use('/post', passport.authenticate("jwt",{session:false}) , postRoute);


httpServer.listen(8888,() => {
    console.log("Server listening on port 8888");
});


const io = require('socket.io')(httpServer);
io.on("connection", function(socket: any){
    console.log('user is connected')
    // socket.on('getMessage', (message: string)  => {
    //     console.log(message)
    //     //回傳 message 給發送訊息的 Client
    //     socket.emit('getMessage', message)
    // })
    // 檢查 socket 是否具有 .on 方法

    console.log(typeof socket.on)
    if (typeof socket.on === 'function') {
        socket.on('getMessage', function(message: string){
            console.log(message)
            //回傳 message 給發送訊息的 Client
            socket.emit('getMessage', message)
        })
    } else {
        console.error('socket.on is not a function');
    }
})


//app.listen(3000);