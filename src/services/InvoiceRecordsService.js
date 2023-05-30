const { STATUS_DELIVERED, STATUS_PACKAGING } = require('../constants/status');
const InvoiceRecordsModel = require('../models/invoiceRecords_model');

class InvoiceRecordsService {
  static async find(id) {
    // eslint-disable-next-line max-len
    const reviews = await InvoiceRecordsModel.find({ buyer: id, 'rating.status': true }).sort({ updatedAt: -1 }).exec();
    return reviews;
  }

  static async findbyId(id) {
    const invoiceRecord = await InvoiceRecordsModel.findById(id).exec();
    return invoiceRecord;
  }

  static async findbyInvoiceRecordId(id) {
    const invoiceRecords = await InvoiceRecordsModel.find({ invoiceId: id }).exec();
    return invoiceRecords;
  }

  static async findDeliveredInvoiceRecord(id) {
    // eslint-disable-next-line max-len
    const invoiceRecords = await InvoiceRecordsModel.find({ $and: [{ invoiceId: id }], $or: [{ status: STATUS_DELIVERED }, { status: STATUS_PACKAGING }] }).exec();
    return invoiceRecords;
  }

  static async findInvoicesForSeller(id, body) {
    const filter = {
      $and: [
        {
          seller: id,
        },
      ],
    };

    if (body.from && body.to) {
      filter.$and.push({
        date: {
          $gte: body.from,
        },
      });
      filter.$and.push({
        date: {
          $lte: body.to,
        },
      });
    }

    if (body.status) {
      filter.$and.push({ status: body.status });
    }

    const invoices = await InvoiceRecordsModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'buyer',
        select: ['email', 'mobile'],
      })
      .exec();

    const count = (body.page * 10) - 1;
    const loopTill = count - 9;
    const finalDocuments = [];

    for (let i = count; i >= loopTill; i--) {
      if (invoices[i]) { finalDocuments.push(invoices[i]); }
    }

    return { documents: Math.ceil(invoices.length / 10), invoices: finalDocuments.reverse() };
  }

  static async findReviewsForSeller(id, body) {
    const filter = {
      $and: [
        {
          seller: id,
        },
        {
          'rating.status': true,
        },
      ],
    };

    if (body.productId) {
      filter.$and.push({ productId: body.productId });
    }

    const invoices = await InvoiceRecordsModel.find(filter)
      .populate({ path: 'productId', select: 'code' })
      .select('prodImageUrl rating')
      .sort({ createdAt: -1 })
      .exec();

    const count = (body.page * 10) - 1;
    const loopTill = count - 9;
    const finalDocuments = [];

    for (let i = count; i >= loopTill; i--) {
      if (invoices[i]) { finalDocuments.push(invoices[i]); }
    }

    return { pages: Math.ceil(invoices.length / 10), reviews: finalDocuments.reverse() };
  }

  static async count(id) {
    const totalinvoices = await InvoiceRecordsModel.countDocuments({ buyer: id }).exec();
    return totalinvoices;
  }

  static sepratingForPagination(items) {
    return Math.ceil(items.length / 4);
  }

  static getPaginationReviews(max, reviews) {
    const count = (max * 4) - 1;
    const loopTill = count - 3;
    const finalDocuments = [];
    for (let i = count; i >= loopTill; i--) {
      if (reviews[i]) { finalDocuments.push(reviews[i]); }
    }
    return finalDocuments.reverse();
  }

  static async modify(id, body) {
    const invoiceRecord = await InvoiceRecordsModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
      },
    );

    return invoiceRecord;
  }

  static async findinvoicesForSpecificSeller(id) {
    const invoiceRecords = await InvoiceRecordsModel.find({ seller: id }).exec();

    let totalReviews = 0;
    let count = 0;
    let positiveFeedback = 0;

    invoiceRecords.forEach((item) => {
      if (item.rating.status === true) {
        totalReviews += item.rating.value;
        count += 1;
        if (item.rating.value >= 3) {
          positiveFeedback += 1;
        }
      }
    });

    return {
      sales: invoiceRecords.length,
      rating: Math.round((totalReviews / count) * 10) / 10,
      positiveFeedback: Math.round(((positiveFeedback / count) * 100) * 10) / 10,
    };
  }
}

module.exports = InvoiceRecordsService;
