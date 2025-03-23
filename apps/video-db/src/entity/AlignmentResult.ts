import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";

type Language = 'zh' | 'en' | 'fr';
export type Translation = Partial<Record<Language, string>>;

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
}

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

  @OneToMany(() => Word, word => word.segmentId, {
    cascade: true,
    eager: true,
  })
  words!: Word[];
}

/**
 * Entity representing the AlignmentResult from stable-ts
 */
@Entity()
export class AlignmentResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  videoId!: string;

  @Column()
  videoUrl!: string;

  @Column({ default: true })
  savedToDb!: boolean;

  @Column({ type: "jsonb", nullable: true })
  dbRecord?: any;

  @OneToMany(() => Segment, segment => segment.alignmentResultId, {
    cascade: true,
    eager: true,
  })
  segments!: Segment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
