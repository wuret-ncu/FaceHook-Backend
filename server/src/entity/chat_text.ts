import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,OneToMany,BeforeInsert } from "typeorm";
import { Chatroom } from "./chatroom"; 
import {Users} from './users'

@Entity()
export class ChatText {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    type: string = 'text'

    @Column({ nullable: false })
    text: string = ''

    @Column({ nullable: false })
    is_return: boolean = false ;

    @ManyToOne(() => ChatText, { nullable: true }) // 添加對自己的關聯
    @JoinColumn({ name: "parent_id" })
    reply_id!: ChatText | null;

    @ManyToOne(() => Users, { nullable: false }) 
    @JoinColumn({ name: "user_id" }) 
    user_id!: number ;

    @ManyToOne(() => Chatroom, { nullable: false }) 
    @JoinColumn({ name: "chatroom_id" }) 
    chatroom_id!: number ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
