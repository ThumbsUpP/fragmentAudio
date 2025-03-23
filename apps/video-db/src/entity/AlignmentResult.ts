import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude, Type } from "class-transformer";
import { Segment } from "./Segment.js";

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

  @OneToMany("Segment", "alignmentResult", {
    cascade: true,
    eager: true,
  })
  @Type(() => Segment)
  segments!: Segment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
