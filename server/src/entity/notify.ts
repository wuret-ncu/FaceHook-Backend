import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./users";
@Entity()
export class Notify {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @Column( { nullable: false })
    title: string = ''

    @Column( { nullable: false })
    content: string = ''
}