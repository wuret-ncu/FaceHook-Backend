import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Comment } from "./comment"; 
import { Users } from "./users"; 

@Entity()
export class Comment_like {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @Column({ nullable: false })
    emoji: string = ''

    @ManyToOne(() => Comment, { nullable: false }) 
    @JoinColumn({ name: "comment_id" }) 
    comment_id!: Comment ;
}