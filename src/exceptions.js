// Some simple exception handling
exports.UserException = function(message) {
    this.message = message;
};

exports.CommandArgException = function(message) {
    this.message = message;
};
