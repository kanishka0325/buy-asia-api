const express = require('express');
const path = require('path');

const viewPath = path.resolve(__dirname, '../templates/views/');
const partialsPath = path.resolve(__dirname, '../templates/partials/');

module.exports = {
  mailserver: {
    options: {
      name: 'SMTP',
      host: 'mail.web3genes.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    },
  },
  hbs: {
    options: {
      viewEngine: {
        // extension name
        extName: '.handlebars',
        // layout path declare
        layoutsDir: viewPath,
        defaultLayout: false,
        // partials directory path
        partialsDir: partialsPath,
        express,
      },
      // View path declare
      viewPath,
      extName: '.handlebars',
    },
  },
  saltRounds: 10,
  ipfsServer: {
    options: {
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    },
  },

};
