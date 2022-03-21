import cron from 'node-cron';

import { UserModel } from '../models/users.model';

const calculateFineJob = cron.schedule(
  '0 0 * * *',
  async () => {
    const borrowedMembers = await UserModel.getAllUsers({ borrow: { $exists: true, $not: { $size: 0 } } });

    if (!borrowedMembers) {
      return;
    }

    for (const borrowedMember of borrowedMembers) {
      // calculate fine
      let totalFine = 0;
      for (let borrow of borrowedMember.borrow) {
        // TODO mail send for which book
        const todayMidNight = new Date().setHours(0, 0, 0, 0);
        const borrowingTime = new Date(borrow.date).setHours(0, 0, 0, 0);
        const borrowDays = Math.floor((todayMidNight - borrowingTime) / (1000 * 3600 * 24));

        const finePerDay = process.env.FINE_PER_DAY ? Number(process.env.FINE_PER_DAY) : 10;
        const bookReturnDays = process.env.BOOK_RETURN_DAYS ? Number(process.env.BOOK_RETURN_DAYS) : 7;
        const fine = borrowDays > bookReturnDays ? (borrowDays - bookReturnDays) * finePerDay : 0;
        totalFine += fine;
      }
      // end calculate fine

      await UserModel.updateFineAndDeactivateIFNecessary(borrowedMember._id, totalFine);
    }
  },
  {
    scheduled: false,
  }
);

export { calculateFineJob };
