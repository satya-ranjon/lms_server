import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import ejs from "ejs";

interface IEmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: IEmailOptions): Promise<void> => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_SERVICE ||
    !process.env.SMTP_MAIL ||
    !process.env.SMTP_PASSWORD
  ) {
    throw new Error("Missing required SMTP environment variables");
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const { email, subject, template, data } = options;

  // get the mail template
  const templatePath = path.join(__dirname, "../mail", template);

  // render the email template with EJS
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
