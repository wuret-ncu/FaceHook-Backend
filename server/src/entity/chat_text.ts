import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,OneToMany,BeforeInsert } from "typeorm";
import { Chatroom } from "./chatroom"; 

@Entity()
export class ChatText {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    type: string = ''

    @Column({ nullable: false })
    text: string = ''

    @Column({ nullable: false })
    is_return: boolean = false ;

    @ManyToOne(() => ChatText, { nullable: true }) // 添加對自己的關聯
    @JoinColumn({ name: "parent_id" })
    parent_id!: ChatText | null;

    @ManyToOne(() => Chatroom, { nullable: false }) 
    @JoinColumn({ name: "chatroom_id" }) 
    chatroom_id!: Chatroom ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
