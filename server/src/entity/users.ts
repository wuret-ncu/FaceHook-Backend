import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,Unique, BeforeInsert } from "typeorm"
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

    @BeforeInsert()
    async hashPassword() {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
    generateUid() {
        this.uid = uuidv4(); // 在插入之前生成唯一的 UUID
    }
}