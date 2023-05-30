const invoiceRecordsModel = require('../models/invoiceRecords_model');
const productGroup = require('../models/prod_group');
const productModel = require('../models/product_model');
const sellerProdCategory = require('../models/seller_prod_category_model');
const sellerProdGroup = require('../models/seller_prod_group_model');
const sellerProdSubCategory = require('../models/seller_prod_sub_category_model');

class ReportService {
  // getProducts for Report
  static async findProductsForGroup(id, body) {
    const filter = {
      $and: [{ seller: id }, { prodGroup: body.group }],
    };
    const result = await productModel.find(filter);
    return result;
  }

  // category defining
  static async findCategoriesForCategory(id, body) {
    let result;
    if (body.type === 'main') {
      result = await sellerProdCategory.find({ sellerId: id })
        .populate({ path: 'prodCategory' })
        .exec();
    } else if (body.type === 'sub') {
      const filter = {
        $and: [{ sellerId: id }, { prodCategory: body.id }],
      };
      result = await sellerProdSubCategory.find(filter)
        .populate({ path: 'prodSubCategory' })
        .exec();
    } else if (body.type === 'group') {
      const filter = {
        $and: [{ sellerId: id }, { prodSubCategory: body.id }],
      };
      result = await sellerProdGroup.find(filter)
        .populate({ path: 'prodGroup' })
        .exec();
    } else {
      result = [];
    }
    return result;
  }

  // Get Invoices for a product group
  static async findInvoicesForSellerWithProducts(id, body) {
    const filter = {
      $and: [
        { seller: id },
      ],
    };

    if (body.from && body.to) {
      filter.$and.push({
        date: {
          $gte: body.from,
          $lte: body.to,
        },
      });
    }
    if (body.product) {
      filter.$and.push({
        productId: body.product,
      });
    }

    // const selectedGroup = await productGroup.findOne({ _id: body.group }).exec();
    const invoices = await invoiceRecordsModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'productId',
        match: { prodGroup: body.group },
      })
      .populate({ path: 'buyer', select: 'email' })
      .exec();

    const filteredInvoices = invoices;
    const count = (body.page * 10) - 1;
    const loopTill = count - 9;
    const finalDocuments = [];

    for (let i = count; i >= loopTill; i--) {
      if (filteredInvoices[i]) { finalDocuments.push(filteredInvoices[i]); }
    }
    return { documents: Math.ceil(invoices.length / 10), data: finalDocuments };
  }
}

module.exports = ReportService;
