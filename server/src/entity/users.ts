import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

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
}