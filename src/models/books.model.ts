import mongoose from 'mongoose';

import { emailSend } from '../utils/mail';
import { IUser, UserModel } from '../models/users.model';

interface IBook {
  title: string;
  author: string;
  qty: number;
  imgUrl: string;
  borrow: Array<{
    userId: String;
    date: Date;
  }>;
}

interface IBookModel extends mongoose.Model<IBook> {
  getAllBooks(condition: { title?: RegExp; author?: RegExp }): Promise<IBook[]>;
  getBook(bookId: string): Promise<IBook | null | undefined>;

  createBook(book: { title: string; author: string; qty?: number; imgUrl: string }): Promise<IBook | undefined>;
  borrowBook(userId: string, bookId: string): Promise<boolean | null | undefined>;
  returnBook(userId: string, bookId: string): Promise<boolean | null | undefined>;

  updateBook(bookId: string, newDocument: { imgUrl?: string; qty?: number }): Promise<IBook | null | undefined>;

  deleteBook(bookId: string): Promise<IBook | null | undefined>;
}

const bookSchema = new mongoose.Schema<IBook, IBookModel>({
  title: String,
  author: String,
  qty: { type: Number, min: 1, max: 100, default: 1 },
  imgUrl: String,
  borrow: [
    {
      _id: false,
      userId: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

bookSchema.index({ title: 1, author: 1 }, { unique: true });

bookSchema.statics.getAllBooks = async function (condition: any): Promise<IBook[]> {
  return await this.find(condition);
};

bookSchema.statics.getBook = async function (bookId: string): Promise<IBook | null | undefined> {
  try {
    return await this.findById(bookId);
  } catch (e) {
    console.log('error from getBook static method of book model :', e);
  }
};

bookSchema.statics.createBook = async function (book: {
  title: string;
  author: string;
  qty?: number;
}): Promise<IBook | undefined> {
  try {
    return await this.create(book);
  } catch (e) {
    console.error('error from deleteBook static method of book model :', e);
  }
};

bookSchema.statics.borrowBook = async function (userId: string, bookId: string): Promise<boolean | null | undefined> {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await this.findByIdAndUpdate(bookId, { $push: { borrow: { userId } } });
      await UserModel.findByIdAndUpdate(userId, { $push: { borrow: { bookId } } });
    });
    session.endSession();

    return true;
  } catch (e) {
    console.log('error from borrowBook static method of book model :', e);
  }
};

bookSchema.statics.returnBook = async function (userId: string, bookId: string): Promise<boolean | null | undefined> {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await this.findByIdAndUpdate(bookId, { $pull: { borrow: { userId } } });
      await UserModel.findByIdAndUpdate(userId, { $pull: { borrow: { bookId } } });
    });
    session.endSession();

    return true;
  } catch (e) {
    console.log('error from borrowBook static method of book model :', e);
  }
};

bookSchema.statics.updateBook = async function (
  bookId: string,
  newDocument: { imgUrl?: string; qty?: number }
): Promise<IBook | null | undefined> {
  try {
    return await this.findByIdAndUpdate(bookId, newDocument, {
      new: true,
    });
  } catch (e) {
    console.log('error from updateBook static method of book model :', e);
  }
};

bookSchema.statics.deleteBook = async function (bookId: string): Promise<IBook | null | undefined> {
  try {
    return await this.findByIdAndDelete(bookId);
  } catch (e) {
    console.log('error from deleteBook static method of book model :', e);
  }
};

const BookModel = mongoose.model<IBook, IBookModel>('Book', bookSchema);

export { BookModel };
