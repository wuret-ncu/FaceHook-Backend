import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn,OneToOne,JoinTable } from "typeorm";
import { Photo } from "./photo";
import { Users } from "./users";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @OneToOne(() => Users, { nullable: false }) 
    @JoinColumn({ name: "user_id" }) 
    user_id!: Users ;

    @Column({ nullable: false })
    content: string = ''

    @Column({ nullable: true })
    file: string = ''

    @Column({ nullable: false })
    group: string = 'everyone'

    @ManyToMany(() => Photo, { nullable: true })
    @JoinTable()
    photo_id!: Photo[] ;
}
