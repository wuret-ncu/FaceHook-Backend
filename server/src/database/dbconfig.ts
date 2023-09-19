import { DataSource } from "typeorm"

const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1234",
    database: "fb",
    entities: ["build/entity/*.js"],
    logging: true,
    synchronize: true,
})

export default myDataSource;