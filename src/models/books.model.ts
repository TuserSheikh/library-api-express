import { ObjectId, ReadConcernLike, WriteConcern, ReadPreferenceMode } from 'mongodb';
import mongoose from 'mongoose';

import { client } from './mongodb';
import { emailSend } from '../utils/mail';
import { IUser } from '../models/users.model';
import { date, number, string } from 'joi';

const transactionOptions = {
  readPreference: 'primary' as ReadPreferenceMode,
  readConcern: { level: 'local' } as ReadConcernLike,
  writeConcern: { w: 'majority' } as WriteConcern,
  maxCommitTimeMS: 1000,
};

interface IBook {
  title: String;
  author: String;
  qty: Number;
  imgUrl: String;
  borrow: Array<{ userId: String; date: Date }>;
}

interface IBookModel extends mongoose.Model<IBook> {
  getAllBooks(condition: { title?: RegExp; author?: RegExp }): Promise<IBook[]>;

  createBook(book: IBook): Promise<IBook>;
}

const bookSchema = new mongoose.Schema<IBook, IBookModel>({
  title: String,
  author: String,
  qty: { type: Number, min: 1, max: 100 },
  imgUrl: String,
  borrow: [
    {
      userId: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

bookSchema.statics.getAllBooks = async function (condition: any): Promise<IBook[]> {
  return await this.find(condition);
};

bookSchema.statics.createBook = async function (book: IBook): Promise<IBook> {
  return await this.create(book);
};

const BookModel = mongoose.model<IBook, IBookModel>('Book', bookSchema);

async function borrowBook(userId: string, bookId: string) {
  try {
    await client.connect();
    const session = client.startSession();

    try {
      await session.withTransaction(async session => {
        const date = Date.now();

        await client
          .db()
          .collection('books')
          .updateOne({ _id: new ObjectId(bookId) }, { $push: { borrow: { userId, date } } });

        await client
          .db()
          .collection('users')
          .updateOne({ _id: new ObjectId(userId) }, { $push: { borrow: { bookId, date } } });
      }, transactionOptions);
    } catch (err) {
      console.error('transaction borrow book: ', err);
    } finally {
      await session.endSession();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function returnbook(userId: string, bookId: string) {
  try {
    await client.connect();
    const session = client.startSession();

    try {
      await session.withTransaction(async session => {
        await client
          .db()
          .collection('books')
          .updateOne(
            { _id: new ObjectId(bookId) },
            {
              $pull: { borrow: { userId } },
            }
          );

        await client
          .db()
          .collection('users')
          .updateOne(
            { _id: new ObjectId(userId) },
            {
              $pull: { borrow: { bookId } },
            }
          );
      }, transactionOptions);
    } catch (err) {
      console.error('transaction borrow book: ', err);
    } finally {
      await session.endSession();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function updateFineAndDeactivateIFNecessary(totalFine: number, user: IUser) {
  try {
    await client.connect();

    if (totalFine > 100) {
      await client
        .db()
        .collection('users')
        .updateOne(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              fine: totalFine,
              isActive: false,
            },
          }
        );

      // send email to user for user deactivate
      await emailSend(
        user.email,
        'Account deactivate for fine',
        'Account temporary deactivate for fine. to active account pay the due fine'
      );
    } else {
      await client
        .db()
        .collection('users')
        .updateOne(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              fine: totalFine,
            },
          }
        );
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export { borrowBook, returnbook, updateFineAndDeactivateIFNecessary, BookModel };
