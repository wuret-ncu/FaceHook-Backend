import { Entity, Column, PrimaryGeneratedColumn, ManyToOne,JoinColumn, OneToOne,CreateDateColumn, UpdateDateColumn  } from "typeorm"
import { Photo } from "./photo";
import { Users } from "./users"; 


@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @OneToOne(() => Users, { nullable: false })
    @JoinColumn({ name: "user_id" }) 
    user_id!: Users ;

    @ManyToOne(() => Photo, { nullable: true })
    @JoinColumn({ name: "background_photo" }) 
    background_photo!: Photo ;

    @ManyToOne(() => Photo, { nullable: true })
    @JoinColumn({ name: "avatar" })
    avatar!: Photo ;

    @Column( { nullable: true })
    introduction: string = '';

    @Column( { nullable: true })
    address: string = '';

    @Column( { nullable: true })
    job: string = '';

    @Column( { nullable: true })
    school: string = '';

    @Column( { nullable: true })
    interest: string = '';

    @Column( { nullable: true })
    birthday: string = '';

    @Column( { nullable: true })
    single: string = '';

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}