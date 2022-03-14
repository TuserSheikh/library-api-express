import { ObjectId } from 'mongodb';

import { client } from './mongodb';
import { emailSend } from '../utils/mail';
import { UserRole } from '../utils/enums'

const collectionName = 'users';

interface IUser {
  _id: string,
  name : string,
  email : string,
  password : string,
  borrow : Array<{bookId: string, Date: Date}>,
  isActive : boolean,
  fine : number,
  role : UserRole
}

async function payFine(user: IUser) {
  try {
    await client.connect();

    await client
      .db()
      .collection(collectionName)
      .updateOne(
        { _id: new ObjectId(user._id) },
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

export { IUser, payFine };
