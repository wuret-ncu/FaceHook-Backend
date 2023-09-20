import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToMany,  JoinTable} from "typeorm"
import { Post } from "./user_post";

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class Photo {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

    @Column({ nullable: false })
    path: string = ''

    // @ManyToMany(() => Post, { nullable: true })
    // post_id!: Post[];
    // @ManyToMany(() => Photo, { nullable: true }) 
    // photo_id!: Photo[];
}