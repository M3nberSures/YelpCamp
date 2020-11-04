const ejs = require('ejs');
const path = require('path');

const smtpClient = require('../libs/smtp');

module.exports.sendRegisterEmail = async (_id, username, email, host, token) => {

    let templateData = { user: { _id, username, email }, host, token }

    let html = await ejs.renderFile(path.join(__dirname, '../views/emails/register.ejs'), templateData);

    await smtpClient.sendEmail('YelpCamp <mathieu@mathieulussier.ca>', email, 'Registration to YelpCamp', html);
}