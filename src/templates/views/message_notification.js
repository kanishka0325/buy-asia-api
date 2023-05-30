const footer = require('../partials/footer');
const header = require('../partials/header');

const HTML_MESSAGE_NOTIFICATION_CODE = `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
 ${header}
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff"
              style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p>Dear Seller, </p>
              <p>You have New Message from {{from}}, Make reply from the <b>BuyAsia</b></p>
               <p>{{message}}</p>
              <div align="center">
                 <a href={{hRef}} target="_blank" style="display: inline-block; padding: 5px 10px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; background-color:#2296F3;">Go to Chat</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
 ${footer}
</table>
`;

module.exports = HTML_MESSAGE_NOTIFICATION_CODE; // from, message, hRef;
