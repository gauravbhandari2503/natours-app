const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    //1) Create a transporter - service that send mail
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // activate in gmail 'less secure app' option
    })

    //2) Define email options   
    const mailOptions = {
        from: "Natours App <garry2503bhandari@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html: 
    }
    //3) Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail