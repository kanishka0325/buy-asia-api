const AWS = require('aws-sdk');
const mimemessage = require('mimemessage');
const fs = require('fs');
const ErrorService = require('../services/ErrorService');
const ProductModel = require('../models/product_model');
const {
  send, sendWithAttachment, publishEmailTemplate, deleteEmailTemplate,
} = require('../services/mail_service');
const { mailQueue } = require('../queue');
const {
  TMPLT_ADMIN_VERIFY,
  TMPLT_BRAND_APPROVAL,
  TMPLT_BRAND_REJECTION,
  TMPLT_ORDER_CONFIRM,
  TMPLT_ORDER_PACKAGING,
  TMPLT_ORDER_DELIVERED,
  TMPLT_RECOVERY_CODE,
  TMPLT_MESSAGE_NOTIFICATION,
} = require('../constants/templates');
const { SENDER_BUYASIA } = require('../constants/senders');
const InvoiceRecordModel = require('../models/invoiceRecords_model');
const {
  SUBJECT_BRAND_APPROVAL,
  SUBJECT_REJECTED,
  SUBJECT_ORDER_CONFIRM,
  SUBJECT_ORDER_UPDATE,
  SUBJECT_RECOVERY_CODE,
  SUBJECT_MESSAGE_NOTIFICATION,
} = require('../constants/subjects');
const HTML_BRAND_APPROVAL = require('../templates/views/brand_approval');
const HTML_BRAND_REJECTION = require('../templates/views/brand_rejection');
const HTML_BUYER_INVOICE = require('../templates/views/buyer_invoice');
const HTML_PACKAGING = require('../templates/views/packaging');
const HTML_DELIVERED = require('../templates/views/delivered');
const HTML_RECOVERY_CODE = require('../templates/views/recovery_code');
const HTML_MESSAGE_NOTIFICATION_CODE = require('../templates/views/message_notification');

const sendEmail = async (req, res, next) => {
  try {
    const data = {
      to: 'gihanlsw@gmail.com',
      subject: 'Test email',
      template: 'test',
      context: {
        sender: 'Test team',
      },
    };

    mailQueue.push(data);

    res.status(200).send('ok');
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

AWS.config.update(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  },
);

const awsMail = async (req, res, next) => {
  try {
  //   const invoiceRecords = [
  //     {
  //       productTitle: 'Samsung Tv',
  //       unit_price: 4,
  //       quantity: 2,
  //     },
  //     {
  //       productTitle: 'LG Tv',
  //       unit_price: 4,
  //       quantity: 2,
  //     },
  //   ];

    //   const tbody = invoiceRecords.reduce((p, c) => p.concat(`<tr>
    //   <td style="width:40%; text-align:left; padding-top:10px; vertical-align:top">
    //      ${c.productTitle}
    //   </td>
    //   <td style="width:20%; text-align:center; padding-top:10px; vertical-align:top">
    //     $${c.unit_price}
    //   </td>
    //   <td style="width:10%; text-align:center; padding-top:10px; vertical-align:top">
    //      ${c.quantity}
    //   </td>
    //   <td style="width:30%; text-align:right; padding-top:10px; vertical-align:top">
    //      $${c.unit_price * c.quantity}
    //   </td>
    // </tr>`), '');

    //   const context = {
    //     title: SUBJECT_ORDER_CONFIRM,
    //     firstName: 'Eshan',
    //     invoiceNo: '2332023-9817583',
    //     finalTotal: '$5',
    //     address: '171/6, Bandara Mawatha, Hiripitiya, Pannipitiya.',
    //     date: '28/04/2023',
    //     tbody,
    //     totalDiscount: '$-5',
    //     totalShipping: '$0',
    //     sender: SENDER_BUYASIA,
    //   };

    // const context = {
    //   from: 'Eshan',
    //   otp: '123456',
    //   hRef: `${process.env.CLIENT_BASE_URL}/reset/fsfsfsfsfsfs`,
    //   sender: SENDER_BUYASIA,
    // };

    const context = {
      from: 'Purna',
      hRef: `${process.env.CLIENT_BASE_URL}/`,
      message: 'Test Message Body',
    };

    const data = await send(['w3gtest@gmail.com'], TMPLT_MESSAGE_NOTIFICATION, context);

    res.status(200).send(data);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const publishTemplate = async (req, res, next) => {
  try {
    const result = await publishEmailTemplate(
      TMPLT_MESSAGE_NOTIFICATION,
      SUBJECT_MESSAGE_NOTIFICATION,
      HTML_MESSAGE_NOTIFICATION_CODE,
    );

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const result = await deleteEmailTemplate(TMPLT_MESSAGE_NOTIFICATION);
    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const updateProducts = async (req, res, next) => {
  try {
    const upProducts = await InvoiceRecordModel.updateMany(
      {},
      {
        rating: {
          status: false,
        },
      },
      { new: true },
    );

    res.status(200).send(upProducts);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const awsRawMail = async (req, res, next) => {
  try {
    const mailContent = mimemessage.factory({ contentType: 'multipart/mixed', body: [] });
    mailContent.header('From', 'tech@web3genes.com');
    mailContent.header('To', 'iameshan09@gmail.com');
    mailContent.header('Subject', 'Customer service contact info');

    const alternateEntity = mimemessage.factory({
      contentType: 'multipart/alternate',
      body: [],
    });

    const htmlEntity = mimemessage.factory({
      contentType: 'text/html;charset=utf-8',
      body: '   <html>  '
             + '   <head></head>  '
             + '   <body>  '
             + '   <h1>Hello!</h1>  '
             + '   <p>Please see the attached file for a list of    customers to contact.</p>  '
             + '   </body>  '
             + '  </html>  ',
    });

    const plainEntity = mimemessage.factory({
      body: 'Please see the attached file for a list of    customers to contact.',
    });

    alternateEntity.body.push(htmlEntity);
    alternateEntity.body.push(plainEntity);
    mailContent.body.push(alternateEntity);

    // const data = fs.readFileSync('customers.txt');

    // const attachmentEntity = mimemessage.factory({
    //   contentType: 'text/plain',
    //   contentTransferEncoding: 'base64',
    //   body: data.toString('base64').replace(/([^\0]{76})/g, '$1\n'),
    // });
    // attachmentEntity.header('Content-Disposition', 'attachment ;filename="customers.txt"');

    // mailContent.body.push(attachmentEntity);

    const result = await sendWithAttachment(mailContent);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  sendEmail,
  awsMail,
  publishTemplate,
  updateProducts,
  awsRawMail,
  deleteTemplate,
};
