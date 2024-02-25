require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = (mailOptions, confirmationLink) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_ADRESS, 
            pass: process.env.EMAIL_PSW 
        }
    });

    if (confirmationLink) {
        mailOptions.text += `\n\nPlease click on the following link to confirm your email address: ${confirmationLink}`;
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Password recovery message
let recuperatePasswordMessage = {
    from: 'eliasidori@outlook.it',
    to: 'recipient_address@example.com',
    subject: 'Password Recovery',
    text: 'Hello, please follow the link to reset your password: [Insert link here]'
};

// Email confirmation message
let confirmMailMessage = {
    from: 'eliasidori@outlook.it',
    to: 'recipient_address@example.com',
    subject: 'Email Address Confirmation',
    text: 'Thank you for signing up.'
};

// // Send the password recovery message
// sendMail(recuperatePasswordMessage);

// // Send the email confirmation message with confirmation link
// sendMail(confirmMailMessage, 'http://example.com/confirm-email');
