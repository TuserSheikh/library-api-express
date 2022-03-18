import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { UserModel } from '../models/users.model';
import { UserRole } from './enums';

async function initSetup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/library');

    const admin = await UserModel.getByRole(UserRole.Admin);

    if (!admin) {
      const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      const password = process.env.ADMIN_PASSWORD || '123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: UserRole.Admin,
        isActive: true,
      };

      await UserModel.createUser(newAdmin as any);
    }
  } catch (err) {
    console.error('Error from initSetup', err);
  }
}

export default initSetup;
