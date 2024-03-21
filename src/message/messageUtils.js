const he = require('he');
const { formatDateRelative } = require('../util/dateFormatting');

function createMessage(item) {
    // Decode HTML entities
    let decodedDescription = he.decode(item.description);
    decodedDescription = decodedDescription.replace(/&amp;quot;/g, '"');
    
    const trimmedTitle = he.decode(item.title).replace(' - Upwork', '').trim();
    const { country, budget, clearedDescription, hourlyRate } = parseAndClearData(decodedDescription);
    const createdAt = formatDateRelative(item.pubDate);
  
    let msg = '';
    msg += (budget !== null ? '💼 Title: ' : '⏱️ Title: ') + trimmedTitle + '\n';
    msg += (budget !== null ? '💰 Budget: ' + budget + '\n' : '');
    msg += (hourlyRate !== null ? '💲 Rate: ' + hourlyRate + '\n' : '');
    msg += (country !== null ? '🗺️ Country: ' + he.decode(country) + '\n' : '');
    msg += '🕒 Created: ' + createdAt + '\n';
    msg += 'ℹ️ Description: ' + clearedDescription;
  
    return escapeSpecialCharacters(msg);
}

function parseAndClearData(description) {
    // Regular expression to match the "Country" and "Budget" information
    const countryRegex = /<b>Country<\/b>:\s*([^<]+)/;
    const budgetRegex = /<b>Budget<\/b>:\s*(\$[0-9,]+)/;
    const hourlyRateRegex = /<b>Hourly Range<\/b>: ([^<]+)<br \/>/;
  
    // Extracting matches from the description using regular expressions
    const countryMatch = description.match(countryRegex);
    const budgetMatch = description.match(budgetRegex);
    const hourlyRateMatch = description.match(hourlyRateRegex);
  
    // Extracted values
    const country = countryMatch ? countryMatch[1].trim() : null;
    const budget = budgetMatch ? budgetMatch[1].trim() : null;
    const hourlyRate = hourlyRateMatch ? hourlyRateMatch[1].trim() : null;
  
    // Find the position of '<b>Budget</b>'
    const positionBudget = description.indexOf('<b>Budget</b>');
    const positionRate = description.indexOf('<b>Hourly Range</b>');
  
    // Extract the substring before the position
    description = description.trim();
    let clearedDescription = positionBudget !== -1 ? description.substring(0, positionBudget) : description;
    clearedDescription = positionRate !== -1 ? clearedDescription.substring(0, positionRate) : clearedDescription;
    clearedDescription = clearedDescription.trim();
  
    return { country, budget, clearedDescription, hourlyRate };
}

function escapeSpecialCharacters(inputString) {
    const htmlTagsRegex = /<[^>]*>/g;
    const stringWithoutTags = inputString.replace(htmlTagsRegex, '');
  
    const specialCharacters = /[-+)(}_~*`@{}[\].><=\\$|#!]/g;
    
    return stringWithoutTags.replace(specialCharacters, '\\$&');
}

module.exports = { createMessage };