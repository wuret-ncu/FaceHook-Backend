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

app.listen(3000,() => {
    console.log("Server listening on port 3000");
});