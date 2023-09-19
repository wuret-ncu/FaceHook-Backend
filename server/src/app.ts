import express, { Application, Request, Response, NextFunction } from 'express';
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

app.get('/',(req: Request, res: Response, next: NextFunction) => {
    res.send("Root route is working");
});
app.listen(3000,() => {
    console.log("Server listening on port 3000");
});