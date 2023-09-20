import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm"
import { Post } from "./user_post";

@Entity()
@Unique(["uuid"]) // 設置 uuid 為唯一值
export class Photo {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uuid: string = ''

    @Column({ nullable: false })
    path: string = ''
}