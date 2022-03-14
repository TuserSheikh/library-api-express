import cron from 'node-cron';

import { updateFineAndDeactivateIFNecessary } from '../models/books.model';
import { getAll } from '../models/mongodb';
import { IUser } from '../models/users.model'

const calculateFineJob = cron.schedule(
  '0 0 * * *',
  async () => {
    const borrowedMembers = await getAll('users', { borrow: { $exists: true, $not: { $size: 0 } } });

    if (!borrowedMembers) {
      return;
    }

    for (const borrowedMember of borrowedMembers) {
      // calculate fine
      let totalFine = 0;
      for (let borrow of borrowedMember.borrow) {
        const borrowDays = Math.ceil((Date.now() - new Date(borrow.date).getTime()) / (1000 * 3600 * 24));
        const finePerDay = process.env.FINE_PER_DAY ? Number(process.env.FINE_PER_DAY) : 10;
        const bookReturnDays = process.env.BOOK_RETURN_DAYS ? Number(process.env.BOOK_RETURN_DAYS)  : 7;
        const fine = borrowDays > bookReturnDays ? (borrowDays - bookReturnDays) * finePerDay : 0;
        totalFine += fine;
      }
      // end calculate fine

      await updateFineAndDeactivateIFNecessary(totalFine, borrowedMember);
    }
  },
  {
    scheduled: false,
  }
);

export { calculateFineJob };
