const mongoose = require('mongoose');
const Pdf = require('pdfkit');
const moment = require('moment');
const CartService = require('./CartService');
const InvoiceRecordsModel = require('../models/invoiceRecords_model');
const InvoiceModel = require('../models/invoice_model');
const CartModel = require('../models/cart_model');
const { generateInvoiceNum } = require('../utils/helper.util');
const { logger } = require('../utils/logger');
const { SENDER_BUYASIA } = require('../constants/senders');
const { SUBJECT_ORDER_CONFIRM } = require('../constants/subjects');
const { send } = require('./mail_service');
const ProductService = require('./product_service');
const { TMPLT_ORDER_CONFIRM } = require('../constants/templates');
const ProductModel = require('../models/product_model');

class InvoiceService {
  static async createInvoice(buyer, body) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      logger.info('transaction session started');

      const cartItems = await CartService.find(
        buyer._id,
      );

      let t = 0.0;
      let s = 0.0;
      let d = 0.0;

      cartItems.forEach((item) => {
        t += parseFloat(item.amount) * item.quantity;
        s += parseFloat(item.product?.shipmentPrice);
        d += (
          (parseFloat(item.amount)
            * item.quantity) / 100)
          * parseFloat(item.product?.discountPercent);
      });

      let total = (t - d) + s;
      total = Math.round((total + Number.EPSILON) * 100) / 100;

      let invoice = new InvoiceModel();
      const invoiceNum = generateInvoiceNum();
      invoice.invoiceNo = invoiceNum;

      logger.info('invoice document created');

      invoice.total = Math.round((t + Number.EPSILON) * 100) / 100;
      invoice.totalDiscount = Math.round((d + Number.EPSILON) * 100) / 100;
      invoice.totalShipping = Math.round((s + Number.EPSILON) * 100) / 100;
      invoice.finalTotal = total;
      invoice.date = new Date();
      invoice.buyer = buyer._id;
      invoice.billingAdd = body.billingAdd;
      invoice.shippingAdd = body.shippingAdd;
      invoice.status = 'payment done';
      invoice.transactionId = body.transactionId;
      invoice.name = `${body.firstName} ${body.lastName}`;

      // let invoiceRecords = [];
      const date = new Date();

      let invoiceRecords = cartItems.map((item) => {
        const amtIntoQty = item.amount * item.quantity;
        const fullAmount = amtIntoQty
          - ((amtIntoQty / 100) * item.product.discountPercent)
          + item.product.shipmentPrice;
        const sellerPortion = (
          (amtIntoQty
            - ((amtIntoQty / 100)
              * item.product.discountPercent)) / 100) * 90;
        const buyAsiaPortion = (
          (amtIntoQty
            - ((amtIntoQty / 100)
              * item.product.discountPercent)) / 100) * 10;
        const invoiceRecord = new InvoiceRecordsModel({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNo,
          productId: item.product._id,
          productTitle: item.product.title,
          prodImageUrl: item.product.imageUrls[0],
          sellerName: item.store,
          date,
          seller: item.product.seller,
          unit_price: Math.round((item.amount + Number.EPSILON) * 100) / 100,
          quantity: item.quantity,
          buyer,
          phoneNumber: body.phoneNumber,
          buyerName: `${body.firstName} ${body.lastName}`,
          email: body.email,
          billingAdd: body.billingAdd,
          shippingAdd: body.shippingAdd,
          paymentId: body.transactionId,
          variantCombo: item.variantCombo,
          total: Math.round((fullAmount + Number.EPSILON) * 100) / 100,
          sellerPortion: Math.round((sellerPortion + Number.EPSILON) * 100) / 100,
          buyAsiaPortion: Math.round((buyAsiaPortion + Number.EPSILON) * 100) / 100,
        });

        logger.info(`Invoice Record (${invoiceRecord._id}) which belongs to (${invoice._id}) created`);

        return invoiceRecord;
      });

      invoiceRecords = await InvoiceRecordsModel.insertMany(invoiceRecords, { session });

      logger.info(`buyer (${buyer._id}) invoice records inserted to the database`);

      invoice.invoicerecords = invoiceRecords;

      invoice = await invoice.save({ session });

      logger.info(`buyer (${buyer._id}) invoice inserted to the database`);

      await CartModel.deleteMany({ buyer: buyer._id }, { session });

      logger.info(`buyer (${buyer._id}) cart items deleted`);

      const productUpdate = cartItems.map(async (item) => {
        if (item.variantCombo.length > 0) {
          const product = await ProductModel.findById(item.product);

          product.variantCombos.forEach(async (itemTwo) => {
            if (item.variantComboId === itemTwo._id.toString()) {
              const query = { _id: product._id };
              const updateDocument = { $inc: { 'variantCombos.$[i].qty': -item.quantity } };
              const options = {
                arrayFilters: [
                  {
                    'i._id': item.variantComboId,
                  },
                ],
              };
              await ProductModel.updateOne(query, updateDocument, options);
            }
          });
        }
      });

      Promise.all(productUpdate);

      await session.commitTransaction();

      const tbody = invoiceRecords.reduce((p, c) => p.concat(`<tr>
        <td style="width:40%; text-align:left; padding-top:10px; vertical-align:top">
           ${c.productTitle}
        </td>
        <td style="width:20%; text-align:center; padding-top:10px; vertical-align:top">
          $${c.unit_price}
        </td>
        <td style="width:10%; text-align:center; padding-top:10px; vertical-align:top">
           ${c.quantity}
        </td>
        <td style="width:30%; text-align:right; padding-top:10px; vertical-align:top">
           $${c.unit_price * c.quantity}
        </td>
      </tr>`), '');

      const context = {
        title: SUBJECT_ORDER_CONFIRM,
        firstName: body.firstName,
        invoiceNo: invoice.invoiceNo,
        finalTotal: `$${invoice.finalTotal}`,
        address: `${invoice.name}, ${invoice.billingAdd.addLine1}, ${invoice.billingAdd.addLine2}, ${invoice.billingAdd.city
        }, ${invoice.billingAdd.country}, ${invoice.billingAdd.zip}`,
        date: moment(invoice.createdAt).format('Do, of MMMM YYYY'),
        tbody,
        totalDiscount: invoice.totalDiscount === 0 ? `$${invoice.totalDiscount}` : `-$${invoice.totalDiscount}`,
        totalShipping: `$${invoice.totalShipping}`,
        sender: SENDER_BUYASIA,
      };

      await send(['w3gtest@gmail.com'], TMPLT_ORDER_CONFIRM, context);

      return invoice;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async createInvoiceForBuyNow(buyer, body) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      logger.info('transaction session started');

      const product = await ProductService.findOne(body.productId);

      const t = parseFloat(body.amount) * body.quantity;
      const s = parseFloat(product.shipmentPrice);
      const d = parseFloat((body.amount / 100) * product.discountPercent) * body.quantity;

      let total = (t - d) + s;
      total = Math.round((total + Number.EPSILON) * 100) / 100;

      let invoice = new InvoiceModel();
      const invoiceNum = generateInvoiceNum();
      invoice.invoiceNo = invoiceNum;

      logger.info('invoice document created');

      invoice.total = Math.round((t + Number.EPSILON) * 100) / 100;
      invoice.totalDiscount = Math.round((d + Number.EPSILON) * 100) / 100;
      invoice.totalShipping = Math.round((s + Number.EPSILON) * 100) / 100;
      invoice.finalTotal = total;
      invoice.date = new Date();
      invoice.buyer = buyer._id;
      invoice.billingAdd = body.userDetails.billingAdd;
      invoice.shippingAdd = body.userDetails.shippingAdd;
      invoice.status = 'payment done';
      invoice.transactionId = body.transactionId;
      invoice.name = `${body.userDetails.firstName} ${body.userDetails.lastName}`;

      const date = new Date();
      const sellerPortion = ((t - d) / 100) * 90;
      const buyAsiaPortion = ((t - d) / 100) * 10;
      let invoiceRecord = new InvoiceRecordsModel({
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNo,
        productId: product._id,
        productTitle: product.title,
        prodImageUrl: product.imageUrls[0],
        sellerName: body.store,
        date,
        seller: product.seller,
        unit_price: Math.round((body.amount + Number.EPSILON) * 100) / 100,
        quantity: body.quantity,
        buyer,
        phoneNumber: body.userDetails.phoneNumber,
        buyerName: `${body.userDetails.firstName} ${body.userDetails.lastName}`,
        email: body.userDetails.email,
        billingAdd: body.userDetails.billingAdd,
        shippingAdd: body.userDetails.shippingAdd,
        paymentId: body.transactionId,
        variantCombo: body.variantCombo,
        total,
        sellerPortion: Math.round((sellerPortion + Number.EPSILON) * 100) / 100,
        buyAsiaPortion: Math.round((buyAsiaPortion + Number.EPSILON) * 100) / 100,
      });

      logger.info(`Invoice Record (${invoiceRecord._id}) which belongs to (${invoice._id}) created`);

      invoiceRecord = await invoiceRecord.save({ session });

      logger.info(`buyer (${buyer._id}) invoice record inserted to the database`);

      const invoiceRecords = [invoiceRecord];

      invoice.invoicerecords = [invoiceRecord];

      invoice = await invoice.save({ session });

      logger.info(`buyer (${buyer._id}) invoice inserted to the database`);

      if (body.variantCombo.length > 0) {
        product.variantCombos.forEach(async (itemTwo) => {
          if (body.variantComboId === itemTwo._id.toString()) {
            const query = { _id: product._id };
            const updateDocument = { $inc: { 'variantCombos.$[i].qty': -body.quantity } };
            const options = {
              arrayFilters: [
                {
                  'i._id': body.variantComboId,
                },
              ],
            };
            await ProductModel.updateOne(query, updateDocument, options);
          }
        });
      }

      await session.commitTransaction();

      const tbody = invoiceRecords.reduce((p, c) => p.concat(`<tr>
        <td style="width:40%; text-align:left; padding-top:10px; vertical-align:top">
           ${c.productTitle}
        </td>
        <td style="width:20%; text-align:center; padding-top:10px; vertical-align:top">
          $${c.unit_price}
        </td>
        <td style="width:10%; text-align:center; padding-top:10px; vertical-align:top">
           ${c.quantity}
        </td>
        <td style="width:30%; text-align:right; padding-top:10px; vertical-align:top">
           $${c.unit_price * c.quantity}
        </td>
      </tr>`), '');

      const context = {
        title: SUBJECT_ORDER_CONFIRM,
        firstName: body.userDetails.firstName,
        invoiceNo: invoice.invoiceNo,
        finalTotal: `$${invoice.finalTotal}`,
        address: `${invoice.name}, ${invoice.billingAdd.addLine1}, ${invoice.billingAdd.addLine2}, ${invoice.billingAdd.city
        }, ${invoice.billingAdd.country}, ${invoice.billingAdd.zip}`,
        date: moment(invoice.createdAt).format('Do, of MMMM YYYY'),
        tbody,
        totalDiscount: invoice.totalDiscount === 0 ? `$${invoice.totalDiscount}` : `-$${invoice.totalDiscount}`,
        totalShipping: `$${invoice.totalShipping}`,
        sender: SENDER_BUYASIA,
      };

      await send(['w3gtest@gmail.com'], TMPLT_ORDER_CONFIRM, context);

      return invoice;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async findOne(id) {
    const invoice = await InvoiceModel.findOne({ _id: id }).populate('invoicerecords').exec();
    return invoice;
  }

  static async findAll(id) {
    const invoices = await InvoiceModel.find({ buyer: id }).populate('invoicerecords').sort({ createdAt: -1 }).exec();
    return invoices;
  }

  static sepratingForPagination(items) {
    return Math.ceil(items.length / 10);
  }

  static getPaginationInvoices(max, invoices) {
    const count = (max * 10) - 1;
    const loopTill = count - 9;
    const finalDocuments = [];
    for (let i = count; i >= loopTill; i--) {
      if (invoices[i]) { finalDocuments.push(invoices[i]); }
    }
    return finalDocuments.reverse();
  }

  static async find(filter, populateInvrs) {
    let invoice;
    if (populateInvrs) {
      invoice = await InvoiceModel.findOne(filter).populate('invoicerecords');
    } else {
      invoice = await InvoiceModel.findOne(filter);
    }
    return invoice;
  }

  static async modify(id, body) {
    const invoiceRecord = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
      },
    );

    return invoiceRecord;
  }

  static async modifyManyInInvoiceRecords(id, body) {
    const invoiceRecord = await InvoiceRecordsModel.updateMany(
      { invoiceId: id },
      { $set: body },
      {
        new: true,
      },
    );

    return invoiceRecord;
  }

  static async createInvoicePdf(invoice, stream) {
    const pdf = new Pdf({
      size: 'A4',
      margins: {
        top: 30, left: 30, right: 30, bottom: 40,
      },
    });

    pdf.pipe(stream);
    pdf
      .font('Times-Bold')
      .fontSize(16)
      .fillColor('#000000')
      .text(`Invoice  #${invoice.invoiceNo}`, {
        continued: false,
        align: 'left',
      });
    pdf.moveDown();
    pdf
      .font('Times-Roman')
      .fontSize(14)
      .fillColor('#000000')
      .text('Total Amount (USD)', {
        continued: false,
        align: 'left',
      });
    pdf
      .font('Times-Bold')
      .fontSize(20)
      .fillColor('#000000')
      .text(`$${invoice.finalTotal}`, {
        continued: false,
        align: 'left',
      });
    pdf.moveDown();

    let currentLine = pdf.y;

    pdf
      .font('Times-Bold')
      .fontSize(14)
      .fillColor('#000000')
      .text('Billed to:');

    pdf.text('Invoice Number:', 30, currentLine, {
      continued: false,
      align: 'right',
    });

    currentLine = pdf.y;

    pdf
      .font('Times-Roman')
      .fontSize(14)
      .fillColor('#000000')
      .text(`${invoice.name}, ${invoice.billingAdd.addLine1}, ${invoice.billingAdd.addLine2}, ${invoice.billingAdd.city
      }, ${invoice.billingAdd.country}, ${invoice.billingAdd.zip}`, {
        width: 175,
      })
      .text(`${invoice.invoiceNo}`, 30, currentLine, {
        align: 'right',
      });

    pdf.moveDown();
    pdf
      .font('Times-Bold')
      .fontSize(14)
      .fillColor('#000000')
      .text('Date of Issue:', {
        continued: false,
        align: 'right',
      });
    pdf
      .font('Times-Roman')
      .fontSize(14)
      .fillColor('#000000')
      .text(moment(invoice.createdAt).format('Do, of MMMM YYYY'), {
        align: 'right',
        continued: false,
      });
    pdf.moveDown();
    pdf.moveTo(30, pdf.y).lineTo(pdf.page.width - pdf.page.margins.right, pdf.y).stroke();
    pdf.moveDown();

    // console.log(pdf.page.width);

    currentLine = pdf.y;

    pdf
      .font('Times-Bold')
      .fontSize(14)
      .fillColor('#000000')
      .text('Description', {
        width: 240,
      })
      .text('Rate', 270, currentLine, {
        width: 120,
      })
      .text('Qty', 390, currentLine, {
        width: 60,
      })
      .text('Line total', 450, currentLine, {
        width: 115.28,
        align: 'right',
        continued: false,
      });
    pdf.moveDown();

    for (let i = 0; i < invoice.invoicerecords.length; i++) {
      currentLine = pdf.y;

      const pageDemention = pdf.page.height - pdf.page.margins.bottom;
      const availableSpace = pageDemention - pdf.y;

      if (availableSpace < 50) {
        pdf.addPage();
        currentLine = 30;
      }

      pdf
        .font('Times-Roman')

        .text(`$${invoice.invoicerecords[i].unit_price}`, 270, currentLine, {
          width: 120,
        })
        .text(invoice.invoicerecords[i].quantity, 390, currentLine, {
          width: 60,
        })
        .text(`$${invoice.invoicerecords[i].unit_price * invoice.invoicerecords[i].quantity}`, 450, currentLine, {
          width: 115.28,
          align: 'right',
        })
        .text(invoice.invoicerecords[i].productTitle, 30, currentLine, {
          width: 240,
        });

      pdf.moveDown();
    }

    pdf.moveDown();

    pdf.moveTo(30, pdf.y).lineTo(pdf.page.width - pdf.page.margins.right, pdf.y).stroke();

    pdf.moveDown();

    currentLine = pdf.y;

    pdf.text('Shipping', 30, currentLine).text(`$${parseFloat(invoice.totalShipping).toFixed(2)}`, 0, currentLine, {
      align: 'right',
    });

    pdf.moveDown();

    currentLine = pdf.y;

    pdf.text('Discount', 30, currentLine).text(`$${parseFloat(invoice.totalDiscount).toFixed(2)}`, 0, currentLine, {
      align: 'right',
    });

    pdf.moveDown();

    pdf.moveTo(30, pdf.y).lineTo(pdf.page.width - pdf.page.margins.right, pdf.y).stroke();

    pdf.moveDown();

    currentLine = pdf.y;

    pdf.font('Times-Bold').fontSize(20).text('Subtotal', 30, currentLine);

    pdf.fontSize(16).text(`$${invoice.finalTotal}`, 0, currentLine, {
      align: 'right',
    });

    pdf.moveDown();

    pdf.end();

    // return memorystream;
  }

  static async findInvRec(filter) {
    const invRec = await InvoiceRecordsModel.findOne(filter);
    return invRec;
  }
}

module.exports = InvoiceService;
