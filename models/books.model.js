import { ObjectId } from 'mongodb';

import { client } from './mongodb.js';

const transactionOptions = {
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' },
  maxCommitTimeMS: 1000,
};

async function borrowBook(userId, bookId) {
  try {
    await client.connect();
    const session = client.startSession();

    try {
      await session.withTransaction(async session => {
        const date = Date.now();

        await client
          .db()
          .collection('books')
          .updateOne({ _id: ObjectId(bookId) }, { $push: { borrow: { userId, date } } });

        await client
          .db()
          .collection('users')
          .updateOne({ _id: ObjectId(userId) }, { $push: { borrow: { bookId, date } } });
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

async function returnbook() {}

export { borrowBook, returnbook };
