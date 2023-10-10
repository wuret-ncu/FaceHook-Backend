import { Entity, PrimaryGeneratedColumn, Column, ManyToMany,JoinTable, JoinColumn,ManyToOne, Unique, CreateDateColumn, UpdateDateColumn,OneToMany,BeforeInsert } from "typeorm";
import { Photo, Users, File, Post_like, Comment } from "./index"
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class Post {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

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

    @ManyToMany(() => File, { nullable: true })
    @JoinTable()
    file_id!: File[] ;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Comment, (comment) => comment.post_id, { cascade: true }) 
    comments!: Comment[]; 

    @OneToMany(() => Post_like, (postLike) => postLike.post_id, { cascade: true })
    like!: Post_like[];

    @BeforeInsert()
    generateUid() {
        this.uid = uuidv4(); // 在插入之前生成唯一的 UUID
    }
    
}
