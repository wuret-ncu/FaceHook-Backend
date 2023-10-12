import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Unique, CreateDateColumn, UpdateDateColumn,OneToMany,BeforeInsert } from "typeorm";
import { Users } from "./users"; 
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class Chatroom {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

    @Column({ nullable: false })
    name: string = ''

    @ManyToMany(() => Users, { nullable: false })
    @JoinTable()
    user_id!: Users[] ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    generateUid() {
        this.uid = uuidv4(); // 在插入之前生成唯一的 UUID
    }
}
