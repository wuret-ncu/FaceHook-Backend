import { Entity, PrimaryGeneratedColumn, Column, ManyToMany,JoinTable, JoinColumn,OneToOne, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Photo } from "./photo";
import { Users } from "./users";
import { File } from "./file";

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
    
}
