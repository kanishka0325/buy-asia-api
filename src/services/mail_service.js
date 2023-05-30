const AWS = require('aws-sdk');

AWS.config.update(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  },
);

const { logger } = require('../utils/logger');

class MailService {
  static send(ToAddresses, Template, context, Source = process.env.SMTP_FROM_EMAIL) {
    const params = {
      Destination: {
        ToAddresses,
      },
      Source,
      Template, // admin_verify seller_active seller_rejected seller_verify
      TemplateData: JSON.stringify(context),
    };

    return new Promise((resolve, reject) => {
      new AWS.SES({ apiVersion: '2010-12-01' }).sendTemplatedEmail(params, (err, info) => {
        if (err) {
          logger.error(err.message);
          reject(err);
        } else {
          logger.info(`An email sent for ${ToAddresses.join(', ')}`);
          resolve(info);
        }
      });
    });
  }

  static sendWithAttachment(mailContent) {
    return new Promise((resolve, reject) => {
      new AWS.SES({ apiVersion: '2010-12-01' }).sendRawEmail({ RawMessage: { Data: mailContent.toString() } }, (err, info) => {
        if (err) {
          logger.error(err.message);
          reject(err);
        } else {
          logger.info('Raw email sent!');
          resolve(info);
        }
      });
    });
  }

  static async publishEmailTemplate(TemplateName, SubjectPart, HtmlPart) {
    const params = {
      Template: {
        TemplateName,
        SubjectPart,
        HtmlPart,
      },
    };

    const result = await new AWS.SES({ apiVersion: '2010-12-01' }).createTemplate(params).promise();

    logger.info(`Pulished new email template ${TemplateName}`);

    return result;
  }

  static async deleteEmailTemplate(TemplateName) {
    const params = {
      TemplateName,
    };

    const result = await new AWS.SES({ apiVersion: '2010-12-01' }).deleteTemplate(params).promise();

    logger.info(`Template ${TemplateName} deleted`);

    return result;
  }
}

module.exports = MailService;
