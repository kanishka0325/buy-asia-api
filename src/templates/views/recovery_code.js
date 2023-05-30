const footer = require('../partials/footer');
const header = require('../partials/header');

const HTML_RECOVERY_CODE = `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
 ${header}
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff"
              style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p>Dear {{firstName}}, </p>
              <p>We received a request to reset your BuyAsia password. Enter the following password reset code:</p>
              <div align="center" bgcolor="#ffffff" style="font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 18px;">
                 <p>{{otp}}</p>
              </div> 
               <p>Alternatively, you can directly change your password.</p>
              <div align="center">
                 <a href={{hRef}} target="_blank" style="display: inline-block; padding: 5px 10px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; background-color:#fe0000;">Change password</a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="left" bgcolor="#ffffff"
              style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
              <p style="margin: 0;">Thanks,<br> {{sender}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
 ${footer}
</table>
`;

module.exports = HTML_RECOVERY_CODE; // firstName, otp, hRef, sender;
