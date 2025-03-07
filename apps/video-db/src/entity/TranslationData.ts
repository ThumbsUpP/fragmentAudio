import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { VideoData } from "./VideoData.js";

@Entity()
export class TranslationData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  videoId!: string;

  @Column()
  @Index()
  language!: string;

  @Column("text")
  translatedText!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => VideoData, { onDelete: "CASCADE" })
  @JoinColumn({ name: "videoId", referencedColumnName: "videoId" })
  video!: VideoData;
}
