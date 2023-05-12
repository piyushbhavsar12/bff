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

export const sendDiscordAlert = async (title, description, color) => {
  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: title,
            description: description,
            color: color, // Use decimal representation of the color
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('Discord alert sent successfully!');
    } else {
      console.error('Error sending discord alert:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending discord alert:', error);
  }
};
