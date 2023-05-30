const Queue = require('better-queue');
const MailService = require('../services/MailService');

const mailQueue = new Queue((task, cb) => {
  const mailService = new MailService(
    task.to,
    task.subject,
    task.template,
    task.context,
  );

  mailService.send();
  cb(null);
});

module.exports = {
  mailQueue,
};
