function isValidUrl(url) {
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }
  
  module.exports = { isValidUrl };
  