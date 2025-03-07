import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class VideoData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  videoId!: string;

  @Column()
  videoUrl!: string;

  @Column("text")
  jsonData!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to get the JSON data as an object
  getJsonData(): any {
    try {
      return JSON.parse(this.jsonData);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return null;
    }
  }
}
