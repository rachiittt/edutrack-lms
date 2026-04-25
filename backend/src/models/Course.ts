import mongoose, { Schema, Document } from 'mongoose';
export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  teacher: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  pendingCollaborators: mongoose.Types.ObjectId[];
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    pendingCollaborators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    enrollmentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
courseSchema.index({ title: 'text', description: 'text', category: 'text' });
export const Course = mongoose.model<ICourse>('Course', courseSchema);
