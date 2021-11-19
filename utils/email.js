const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours App <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        //1) Create a transporter - service that send mail
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return 1;
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // activate in gmail 'less secure app' option
        })
    }

    async send(template, subject) {
        // Send the actual mail

        // 1) Render HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
        }

        // 3) Create the transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to natours Family');
    }
}

