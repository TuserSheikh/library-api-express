import mongoose from 'mongoose';

import { emailSend } from '../utils/mail';
import { UserRole } from '../utils/enums';

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  fine: number;
  borrow: Array<{
    bookId: string;
    date: Date;
  }>;
}

interface IUserModel extends mongoose.Model<IUser> {
  getAllUsers(condition: { name?: RegExp }): Promise<IUser[]>;
  getUser(bookId: string): Promise<IUser | null | undefined>;
  getByRole(role: UserRole): Promise<IUser[] | null | undefined>;
  getByEmail(email: string): Promise<IUser | null | undefined>;

  createUser(user: IUser): Promise<IUser>;
  payFine(userId: string, fine: number): Promise<IUser | null | undefined>;

  updateUser(
    userId: string,
    newDocument: { role?: string; isActive?: boolean; fine?: number }
  ): Promise<IUser | null | undefined>;

  delete(userId: string): Promise<IUser | null | undefined>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, default: UserRole.Member },
  isActive: { type: Boolean, default: false },
  fine: { type: Number, min: 0, default: 0 },
  borrow: [
    {
      _id: false,
      bookId: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

userSchema.index({ email: 1 });

userSchema.statics.getAllUsers = async function (condition: any): Promise<IUser[]> {
  return await this.find(condition);
};

userSchema.statics.getUser = async function (userId: string): Promise<IUser | null | undefined> {
  try {
    return await this.findById(userId);
  } catch (e) {
    console.error('error from getUser static method of users model :', e);
  }
};

userSchema.statics.getByRole = async function (role: UserRole): Promise<IUser[] | null | undefined> {
  try {
    return await this.findOne({ role });
  } catch (e) {
    console.error('error from getByRole static method of users model :', e);
  }
};

userSchema.statics.getByEmail = async function (email: string): Promise<IUser | null | undefined> {
  try {
    return await this.findOne({ email });
  } catch (e) {
    console.error('error from getUser static method of users model :', e);
  }
};

userSchema.statics.createUser = async function (user: IUser): Promise<IUser> {
  return await this.create(user);
};

userSchema.statics.payFine = async function (userId: string, fine: number): Promise<IUser | null | undefined> {
  try {
    return await this.findByIdAndUpdate(userId, { fine }, { new: true });
  } catch (e) {
    console.log('error from payFine static method of book model :', e);
  }
};

userSchema.statics.delete = async function (userId: string): Promise<IUser | null | undefined> {
  try {
    return await this.findByIdAndDelete(userId);
  } catch (e) {
    console.log('error from deleteUser static method of user model :', e);
  }
};

// bookSchema.statics.updateBook = async function (
//   bookId: string,
//   newDocument: { imgUrl?: string; qty?: number }
// ): Promise<IBook | null | undefined> {
//   try {
//     return await this.findByIdAndUpdate(bookId, newDocument, {
//       new: true,
//     });
//   } catch (e) {
//     console.log('error from updateBook static method of book model :', e);
//   }
// };

const UserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export { IUser, UserModel };
