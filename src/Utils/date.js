const moment = require('moment');

module.exports.formatFromAgo = function(rawDate) {
    const createdAt = moment(rawDate);
    const now = moment(new Date());
    let string = '';

    const diff = moment.duration(now.diff(createdAt));

    const years = diff.years();
    if (years > 0) {
        string += `${years} ${years > 1 ? 'years' : 'year'} `;
    }
    
    const months = diff.months();
    if (months > 0) {
        string += `${months} ${months > 1 ? 'months' : 'month'} `;
    }
    
    const days = diff.days();
    if (days > 0 && months < 1 && years < 1) {
        string += `${days} ${days > 1 ? 'days' : 'day'} `;
    }
                    
    const hours = diff.hours();
    if (hours > 0 && days < 1 && months < 1 && years < 1) {
        string += `${hours} ${hours > 1 ? 'hours' : 'hour'} `;
    }
                    
    const minutes = diff.minutes();
    if (minutes > 0 && hours < 1 && days < 1 && months < 1 && years < 1) {
        string += `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} `;
    }

    const seconds = diff.seconds();
    if (seconds > 0 && minutes < 1 && hours < 1 && days < 1 && months < 1 && years < 1) {
        string += `${seconds} ${seconds > 1 ? 'seconds' : 'second'} `;
    }

    return string + 'ago';
}