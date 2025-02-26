const nodemailer = require("nodemailer");

module.exports = (email, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "phaodai2000@gmail.com",
      pass: "huzx vhve jccv uzni",
    },
  });
  // send mail with defined transport object
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <phaodai2000@gmail.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
  }
  main();
};
