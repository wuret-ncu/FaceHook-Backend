import { Entity, Column, PrimaryGeneratedColumn, Unique, BeforeInsert, CreateDateColumn,  UpdateDateColumn} from "typeorm"
import { v4 as uuidv4 } from 'uuid';

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

    @BeforeInsert()
    generateUid() {
        this.uid = uuidv4(); // 在插入之前生成唯一的 UUID
    }
}