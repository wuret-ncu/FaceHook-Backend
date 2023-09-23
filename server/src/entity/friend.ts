import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Photo } from "./photo"; // 引入 Photo 模型
import { Users } from "./users"; // 引入 Photo 模型

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @ManyToOne(() => Users, { nullable: false }) 
    @JoinColumn({ name: "friend_user_id" }) 
    freiend_user_id!: Users ;

    @Column({ default: false })
    status!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
