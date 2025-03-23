import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Exclude, Type } from "class-transformer";
import { Translation } from "./models/Translation.js";
// Import for class-transformer Type decorator
import { Word } from "./Word.js";
// Use type-only import to break circular dependency
import type { AlignmentResult } from "./AlignmentResult.js";

/**
 * Entity representing the Segment structure from alignment
 */
@Entity()
export class Segment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  text!: string;

  @Column("float")
  start!: number;

  @Column("float")
  end!: number;

  @Column()
  alignmentResultId!: number;

  @Column({ type: "jsonb", nullable: true })
  translatedText?: Translation;

  @ManyToOne("AlignmentResult", "segments")
  @JoinColumn({ name: "alignmentResultId" })
  @Exclude({ toPlainOnly: true })
  alignmentResult!: AlignmentResult;

  @OneToMany("Word", "segment", {
    cascade: true,
    eager: true,
  })
  @Type(() => Word)
  words!: Word[];
}
