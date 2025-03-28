import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from "typeorm";

/**
 * Entity representing a grammar explanation for a segment
 */
@Entity()
export class GrammarExplanation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  videoId!: string;

  @Column("text")
  segmentId!: string;

  @Column("text")
  originalText!: string;

  @Column("text")
  answer!: string;

  @Column("text")
  processingType!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
