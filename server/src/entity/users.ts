import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,Unique, BeforeInsert, OneToOne,OneToMany } from "typeorm"
import { Profile,Friend } from "./index"
import * as bcrypt from 'bcrypt'; 
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class Users {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

    @Column()
    username: string = ''

    @Column()
    email: string = ''

    @Column()
    password: string = ''

    @CreateDateColumn()
    createdAt!: Date;

    @OneToOne(() => Profile, (profile) => profile.user_id, { cascade: true }) 
    profile!: Profile[]; 

    @OneToMany(() => Friend, (friend) => friend.user_id, { cascade: true }) 
    friend!: Friend[]; 

    @BeforeInsert()
    generateUid() {
        this.uid = uuidv4(); // 在插入之前生成唯一的 UUID
    }

    @BeforeInsert()
    async hashPassword() {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
}