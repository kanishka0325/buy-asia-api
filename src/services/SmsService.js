const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { logger } = require('../utils/logger');

class SmsService {
  constructor(to, body) {
    this.smsOptions = {
      from: process.env.TWILIO_FROM_MOBILE,
      to,
      body,
    };
  }

  send() {
    return new Promise((resolve, reject) => {
      client.messages.create(this.smsOptions, (err, info) => {
        if (err) {
          logger.error(err.message);
          reject(err);
        } else {
          logger.info(`A sms sent for ${this.smsOptions.to}`);
          resolve(info);
        }
      });
    });
  }
}

module.exports = SmsService;
