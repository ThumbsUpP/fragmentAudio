import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Generated
} from "typeorm";
import { VocabularyList } from "./VocabularyList.js";

@Entity()
export class VocabularyItem {
  @PrimaryGeneratedColumn()
  internalId!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  id!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "text" })
  pinyin!: string;

  @Column({ type: "text" })
  translation!: string;

  @Column({ type: "text", array: true, default: "{}" })
  examples!: string[];

  @Column({ type: "text", nullable: true })
  audioUrl?: string;

  @ManyToOne(() => VocabularyList, (list) => list.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "vocabularyListId" })
  vocabularyList!: VocabularyList;
}
