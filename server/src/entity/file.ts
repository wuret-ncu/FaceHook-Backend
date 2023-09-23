import { Entity, Column, PrimaryGeneratedColumn, Unique, CreateDateColumn,  UpdateDateColumn} from "typeorm"

@Entity()
@Unique(["uid"]) // 設置 uuid 為唯一值
export class File {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ nullable: false })
    uid: string = ''

    @Column({ nullable: false })
    path: string = ''

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}