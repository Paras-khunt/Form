const OTP = require('../models/otpdata');

const mailer = (email, otp) => {

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'paraskhunt2@gmail.com',
            pass: 'ywmlpfxdfifqyuzc'
        }
    });

    var mailOptions = {
        from: 'paraskhunt2@gmail.com',
        to: req.body.email,
        subject: 'Sending Email for OTP',
        text: OTP.code
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = mailer