import bcrypt from 'bcrypt';

import { client, getByField, create } from '../models/mongodb.js';

async function initSetup() {
  try {
    await client.connect();
    const admin = await getByField('users', 'role', 'admin');

    if (!admin) {
      const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      const password = process.env.ADMIN_PASSWORD || '123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        borrow: [],
        fine: 0,
      };
      await create('users', newAdmin);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export default initSetup;
