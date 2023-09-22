import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,OneToMany,CreateDateColumn } from "typeorm";
import { Photo } from "./photo";
import { Users } from "./users"; 
import { Post } from "./user_post";
import { Comment_like } from "./comment_like";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" }) 
    user_id!: Users ;

    @ManyToOne(() => Post, { nullable: false })
    @JoinColumn({ name: "post_id" })
    post_id!: Post ;

    @Column({ nullable: false })
    content: string = ''

    @ManyToOne(() => Photo, { nullable: true }) // 多對一關聯，nullable: true 表示可選關聯
    @JoinColumn({ name: "photo_id" }) // 使用 photo_id 作為外鍵
    photo_id!: Photo ;

    @ManyToOne(() => Comment, { nullable: true }) // 添加對自己的關聯
    @JoinColumn({ name: "parent_id" })
    parent_id!: Comment | null;

    @OneToMany(() => Comment_like, (commentLike) => commentLike.comment_id)
    like!: Comment_like[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

}