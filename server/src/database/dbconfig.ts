import { DataSource } from "typeorm"
require('dotenv').config()

require('dotenv').config()

const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "john",
    password: "1234",
    database: process.env.DATABASE_NAME,
    entities: ["build/entity/*.js"],
    //entities: [Users],
    logging: true,
    synchronize: true,
})

export default myDataSource;