const { MSG_UNREAD, MSG_SENT } = require('../constants/message_code');
const { TMPLT_MESSAGE_NOTIFICATION } = require('../constants/templates');
const MessageModel = require('../models/message');
const Seller = require('../models/seller');
const { send } = require('./mail_service');

class MessageService {
  static async create(customer, body) {
    // todo: need to send a notification email
    const seller = await Seller.find({ _id: body.seller }).exec();

    const context = {
      from: customer?.firstName === null || customer?.firstName === undefined ? 'Unknown' : customer.firstName,
      to: seller?.basic?.companyName === null || seller?.basic?.companyName === undefined ? 'Unknown' : seller?.basic?.companyName,
      hRef: `${process.env.CLIENT_BASE_URL}/`,
      message: body.message,
    };

    await send(['w3gtest@gmail.com'], TMPLT_MESSAGE_NOTIFICATION, context);
    const data = {
      title: body.title,
      message: body.message,
      buyer: customer._id,
      seller: body.seller,
      author: customer._id,
      read: false,
    };

    let message = MessageModel(data);
    message = await message.save();
    return message;
  }

  static async getMessageHistory(customer, body) {
    const buyer = customer;
    const { seller } = body;
    const currentMonth = new Date().getMonth();
    const messages = await MessageModel
      .find({
        buyer,
        seller,
        createdAt: { $gte: new Date().setMonth(currentMonth, 1) },
      })
      .exec();
    return messages;
  }

  static async allMessages(customer, body) {
    const filter = {
      $and: [
        { buyer: customer },
      ],
    };

    if (body.type && body.type === MSG_UNREAD) {
      filter.$and.push({ read: false });
    }
    if (body.type && body.type === MSG_SENT) {
      filter.$and.push({ author: customer });
    }

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'seller',
        select: 'basic',
      })
      .exec();

    const count = (body.page * 10) - 1;
    const loopTill = count - 9;
    const finalMessgaes = [];

    for (let i = count; i >= loopTill; i--) {
      if (messages[i]) { finalMessgaes.push(messages[i]); }
    }
    return { documents: Math.ceil(messages.length / 10), messages: finalMessgaes.reverse() };
  }

  static async getChat(customer, body) {
    const filter = {
      $and: [
        { buyer: customer },
        { seller: body.seller },
      ],
    };

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'seller', select: 'basic' })
      .exec();

    return messages;
  }
}

module.exports = MessageService;
