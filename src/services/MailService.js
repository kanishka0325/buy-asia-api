const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const hbs = require('nodemailer-express-handlebars');
const config = require('../config');
const { logger } = require('../utils/logger');

class MailService {
  constructor(to, subject, template, context) {
    this.transporter = nodemailer.createTransport(smtpTransport(config.mailserver.options))
      .use('compile', hbs(config.hbs.options));
    this.mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      template,
      context,
    };
  }

  send() {
    this.transporter.sendMail(this.mailOptions, (err, data) => {
      if (err) {
        logger.error(err.message);
      } else {
        logger.info(`An email sent for ${data.accepted[0]}`);
      }
    });
  }
}

module.exports = MailService;
