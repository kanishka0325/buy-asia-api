const footer = require('../partials/footer');
const header = require('../partials/header');

const HTML_BUYER_INVOICE = `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
 ${header}
 <tr>
 <td align="center" bgcolor="#e9ecef">
   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
     <tr>
      <td align="left" bgcolor="#ffffff"
        style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">{{title}}</h1>
      </td>
     </tr>
     <tr>
       <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
         <p>Dear {{firstName}}, </p>
         <p style="text-indent: 10%;">Here is your Invoice for the recent purchases from BuyAsia.</p>
       </td>
     </tr>
      <tr>
       <td bgcolor="white" style="padding:0 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif">
         <div style="padding: 24px; border: 1px solid">
          <div style="font-weight:700">Invoice #{{invoiceNo}}</div>
          <div style="margin-top:30px; font-size:14px">Total Amount (USD)</div>
          <div style="font-size:20px; font-weight:700">{{finalTotal}}</div>
          <table style="margin-top:25px; width:100%">
              <tr style="font-size:14px">
                  <th style="width:50%; text-align:left">
                    Billed to:
                  </th>
                   <th style="width:50%; text-align:right">
                    Invoice Number:
                  </th>
              </tr>
              <tr style="font-size:12px">
                  <td style="width:50%">
                   {{address}}
                  </td>
                  <td style="width:50%; text-align:right">
                    {{invoiceNo}}
                  </td>
              </tr>
              <tr style="font-size:14px">
                  <th style="width:50%; text-align:left">
                  </th>
                   <th style="width:50%; text-align:right; padding-top:10px">
                    Date of Issue:
                  </th>
              </tr>
               <tr style="font-size:12px">
                  <td style="width:50%">
                  </td>
                  <td style="width:50%; text-align:right">
                    {{date}}
                  </td>
              </tr>
          </table>
          <br>
          <hr>
          <br>
          <table style="width:100%">
              <thead>
                  <tr>
                     <th style="width:40%; text-align:left">
                         Description
                     </th>
                     <th style="width:20%">
                         Rate
                     </th>
                     <th style="width:10%">
                         Qty
                     </th>
                     <th style="width:30%; text-align:right">
                         Line total
                     </th>
                   </tr>
               </thead>
               <tbody>
               {{tbody}}
               </tbody>
          </table>
          <br>
          <hr>
          <table style="margin-top:25px; width:100%" cellpadding="0" cellspacing="0">
              <tr style="font-size:14px; line-height:0">
                  <td style="width:50%;">
                    Discount
                  </td>
                   <td style="width:50%; text-align:right">
                    {{totalDiscount}}
                  </td>
              </tr>
          </table>
           <br>
          <hr>
          <table style="margin-top:25px; width:100%;" cellpadding="0" cellspacing="0">
              <tr style="font-size:14px; line-height:0">
                  <td style="width:50%;">
                    Shipping
                  </td>
                   <td style="width:50%; text-align:right;">
                    {{totalShipping}}
                  </td>
              </tr>
          </table>
          <br>
          <hr>
            <table style="margin-top:25px; width:100%">
              <tr>
                  <th style="width:50%; text-align:left; font-size:20px">
                    Subtotal
                  </th>
                   <th style="width:50%; text-align:right">
                    {{finalTotal}}
                  </th>
              </tr>
          </table>
          </div>
       </td>
     </tr>
     <tr>
       <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
         <p style="margin: 0;">Thanks,<br> {{sender}}</p>
       </td>
     </tr>
   </table>
 </td>
</tr>
 ${footer}
</table>
`;

module.exports = HTML_BUYER_INVOICE;
// title, firstName, invoiceNo, finalTotal, address, date, tbody, totalDiscount
// totalShipping, sender
