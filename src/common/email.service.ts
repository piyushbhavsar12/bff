const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
   host: 'smtp.sendgrid.net',
   port: 587,
   auth: {
       user: "apikey",
       pass: process.env.SENDGRID_API_KEY
   }
})

export const sendEmail = async (to,subject,text) => {
    try {
        const info = await transporter.sendMail({
          from: process.env.SENDGRID_SENDER_EMAIL,
          to,
          subject,
          text
        });
        console.log('Email sent: ' + info.response);
      } catch (error) {
        console.log(error);
      }
}
