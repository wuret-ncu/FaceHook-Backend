import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ChatText } from "./chat_text"; 
import { Users } from "./users"; 

@Entity()
export class Chat_like {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @Column({ nullable: false })
    emoji: string = ''

    @ManyToOne(() => ChatText, { nullable: false }) 
    @JoinColumn({ name: "chat_id" }) 
    chat_id!: ChatText ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}