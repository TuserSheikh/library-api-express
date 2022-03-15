import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

import { client } from './mongodb';
import { emailSend } from '../utils/mail';
import { UserRole } from '../utils/enums';

const collectionName = 'users';

interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  fine: number;
  borrow: Array<{ bookId: string; date: Date }>;
}

interface IUserModel extends mongoose.Model<IUser> {
  getAllUsers(condition: { name?: RegExp }): Promise<IUser[]>;
  getUser(bookId: string): Promise<IUser | null | undefined>;

  createUser(user: IUser): Promise<IUser>;

  updateUser(
    userId: string,
    newDocument: { role?: string; isActive?: boolean; fine?: number }
  ): Promise<IUser | null | undefined>;

  deleteUser(userId: string): Promise<IUser | null | undefined>;
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
      bookId: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

userSchema.statics.getAllUsers = async function (condition: any): Promise<IUser[]> {
  return await this.find(condition);
};

// bookSchema.statics.getBook = async function (bookId: string): Promise<IBook | null | undefined> {
//   try {
//     return await this.findById(bookId);
//   } catch (e) {
//     console.log('error from getBook static method of book model :', e);
//   }
// };

// bookSchema.statics.createBook = async function (book: IBook): Promise<IBook> {
//   return await this.create(book);
// };

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

// bookSchema.statics.deleteBook = async function (bookId: string): Promise<IBook | null | undefined> {
//   try {
//     return await this.findByIdAndDelete(bookId);
//   } catch (e) {
//     console.log('error from deleteBook static method of book model :', e);
//   }
// };

const UserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

async function payFine(user: IUser) {
  // try {
  //   await client.connect();
  //   await client
  //     .db()
  //     .collection(collectionName)
  //     .updateOne(
  //       { _id: new ObjectId(user._id) },
  //       {
  //         $set: {
  //           fine: 0,
  //         },
  //       }
  //     );
  //   // send email to user for reactivate account
  //   await emailSend(user.email, 'Account active', 'Account activate for pay fine');
  // } catch (err) {
  //   console.error(err);
  // } finally {
  //   await client.close();
  // }
}

export { IUser, payFine, UserModel };
