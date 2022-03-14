import { createTestAccount, createTransport, getTestMessageUrl } from 'nodemailer';

async function emailSend(to: string, subject: string, text: string) {
  let testAccount = await createTestAccount();

  let transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject,
    text,
  });

  console.log('Preview URL: %s', getTestMessageUrl(info));
}

export { emailSend };
