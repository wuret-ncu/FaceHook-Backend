import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn,OneToOne,JoinTable,CreateDateColumn, ManyToOne,OneToMany } from "typeorm";
import { Photo } from "./photo";
import { Users } from "./users";
import { Post_like } from "./post_like";
import { Comment } from "./comment";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @ManyToOne(() => Users, { nullable: false }) 
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    @OneToMany(() => Comment, (comment) => comment.post_id) 
    comments!: Comment[]; 

    @OneToMany(() => Post_like, (postLike) => postLike.post_id, { cascade: true })
    like!: Post_like[];
}
