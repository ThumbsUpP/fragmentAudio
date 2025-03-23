import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Translation } from "./models/Translation.js";
// Use type-only import to break circular dependency
import type { Segment } from "./Segment.js";

/**
 * Entity representing the Word structure from alignment
 */
@Entity()
export class Word {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  word!: string;

  @Column("float")
  start!: number;

  @Column("float")
  end!: number;

  @Column({ nullable: true })
  pinyin?: string;

  @Column({ type: "jsonb", nullable: true })
  translation?: Translation;

  @Column()
  segmentId!: number;

  @ManyToOne("Segment", "words")
  @JoinColumn({ name: "segmentId" })
  @Exclude({ toPlainOnly: true })
  segment!: Segment;
}
