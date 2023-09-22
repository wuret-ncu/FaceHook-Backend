import express, { Application, Request, Response, NextFunction } from 'express';
import cors from "cors";
import postRoutes from "./router/post"


const app: Application = express();

import myDataSource from "./database/dbconfig"

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

app.use('/post', postRoutes);


app.listen(5050,() => {
    console.log("Server listening on port 5050");
});