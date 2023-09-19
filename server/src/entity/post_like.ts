import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./user_post"; // 引入 Photo 模型
import { Users } from "./users"; // 引入 Photo 模型

@Entity()
export class Post_like {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @Column({ nullable: false })
    emoji: string = ''

    @ManyToOne(() => Post, { nullable: false }) 
    @JoinColumn({ name: "post_id" }) 
    post_id!: Post ;
}
