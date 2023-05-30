const footer = require('../partials/footer');
const header = require('../partials/header');

const HTML_BRAND_REJECTION = `
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
    <p>Dear Seller, </p>
    <p style="text-indent: 10%;">We're sorry to inform that your brand requisition was rejected by the administration of BuyAsia due to following reason:</p>
    <div style="padding-left: 10%; padding-right: 10%;">
         <p style="text-align: justify; color:#999; font-style:italic;">{{rejectReason}}</p>
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

module.exports = HTML_BRAND_REJECTION; // title, rejectReason, sender
