const nodemailer = require('nodemailer');

const smtpClient = function() {
    this.transporter = null;
}

smtpClient.prototype.connect = async function () {
    try {
        this.transporter = await nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        return await this.transporter.verify();
    } catch (err) {
        return false;
    }
}

smtpClient.prototype.sendEmail = async function (from, to, subject, html) {
    const mail = { from, to, subject, html };

    const isConnect = await this.connect();

    if (!isConnect) return false;

    const response = await this.transporter.sendMail(mail);
    
    if (response.rejected.length > 0) return false;

    // console.log(JSON.stringify(response, null, 4));

    this.transporter.close();
    return true;
}

smtpClient.prototype.formatRegisterEmail = async function (newUser) {

}

module.exports = new smtpClient();