import mongoose, { Schema, Document } from 'mongoose';
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'new_material' | 'new_quiz' | 'enrollment' | 'general';
  title: string;
  message: string;
  courseId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['new_material', 'new_quiz', 'enrollment', 'general'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
