const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Vendor Setup for Paragon OpenMLS API.pdf');

pdf(dataBuffer).then(function (data) {
  console.log(data.text);
}).catch(function (err) {
  console.log(err);
});
