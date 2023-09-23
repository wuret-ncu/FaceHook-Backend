import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Users } from "./users"; 

@Entity()
export class Friend_Block {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id!: Users ;

    @ManyToOne(() => Users, { nullable: false }) 
    @JoinColumn({ name: "block_user_id" })
    blocked_user_id!: Users ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
