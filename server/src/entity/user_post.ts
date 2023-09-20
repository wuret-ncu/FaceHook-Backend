import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn,OneToOne, Unique } from "typeorm";
import { Photo } from "./photo";
import { Users } from "./users";

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class Post {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

    @OneToOne(() => Users, { nullable: false }) 
    @JoinColumn({ name: "user_id" }) 
    user_id!: Users ;

    @Column({ nullable: false })
    content: string = ''

    @Column({ nullable: true })
    file: string = ''

    @Column({ nullable: false })
    group: string = 'everyone'

    // @ManyToMany(() => Photo, { nullable: true }) 
    // @JoinColumn({ name: "photo_id" }) 
    // photo_id!: Photo;
    // @ManyToMany(() => Photo, { nullable: true }) 
    // photo_id!: Photo[];
}
