const genrOtp = () => Math.floor(100000 + Math.random() * 900000);

const generateInvoiceNum = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const randomNum = Math.floor(1000000 + Math.random() * 9999999);
  return `${day}${month}${year}-${randomNum}`;
};

const AddMinutesToDate = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const genrCode = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {
  genrOtp,
  generateInvoiceNum,
  AddMinutesToDate,
  genrCode,
};
