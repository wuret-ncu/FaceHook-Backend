import { DataSource } from "typeorm"
require('dotenv').config()

const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1234",
    database: process.env.DATABASE_NAME,
    entities: ["build/entity/*.js"],
    logging: true,
    synchronize: true,
})

export default myDataSource;