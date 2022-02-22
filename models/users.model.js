import { ObjectId } from 'mongodb';

import { client } from './mongodb.js';
import { emailSend } from '../utils/mail.js';

const collectionName = 'users';

async function payFine(user) {
  try {
    await client.connect();

    await client
      .db()
      .collection(collectionName)
      .updateOne(
        { _id: ObjectId(user._id) },
        {
          $set: {
            fine: 0,
          },
        }
      );

    // send email to user for reactivate account
    await emailSend(user.email, 'Account active', 'Account activate for pay fine');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export { payFine };
