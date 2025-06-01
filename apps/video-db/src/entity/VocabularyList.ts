import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { VocabularyItem } from "./VocabularyItem.js";

@Entity()
export class VocabularyList {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", unique: true })
  videoId!: string;

  @OneToMany(() => VocabularyItem, (item) => item.vocabularyList, {
    cascade: true,
    eager: true
  })
  items!: VocabularyItem[];
}
