import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert } from "typeorm"
import * as bcrypt from 'bcrypt'; 

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number = 0;

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
}