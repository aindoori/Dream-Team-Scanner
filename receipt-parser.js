/* Basic scraping of receipt using the google cloud vision api
 * Pretty much taken directly off of their website except for the splitting of
 * the array annotations into each description.
 */
const moment = require('moment');

async function scrapeReceipt(image) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  const [result] = await client.textDetection(image);
  const annotations = result.textAnnotations;
  var arr = [];
  annotations.forEach(function(annotation) {
    if(annotation.description.length > 2 && annotation.description.length <= 20) {
      arr.push(annotation.description)
    }
  });
  return arr;
}
function isDate(value) {
  var bool = false;
  try {
    bool =  moment(value).isValid();
  } catch (err) {
    console.log(err);
  } finally {
    return bool;
  }
}

// Parse text for date, total, and vendor. This is done fairly manualy right now
function parseText(textarr) {
  attributes = {} //date, total, vendor
  attributes.total = textarr[textarr.indexOf('TOTAL') + 1];
  attributes.vendor = textarr[1]; //TODO: actually figure out what the vendor is

  var date = textarr.find(isDate);
  if(typeof date !== 'undefined') {
    attributes.date = moment(date).format("DD/MM/YY");
  } else {
    attributes.date = moment().format("DD/MM/YY");
  }

  return attributes;
}

async function parseReceipt(image) {
  var textarr = await scrapeReceipt(image);
  var attribs = await parseText(textarr);
  return attribs;
}

module.exports.parseReceipt = parseReceipt;
