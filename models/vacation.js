var mongoose = require('mongoose');

var vacationSchema = mongoose.Schema({
    name: String,
    slug: String,
    category: String,
    sku: String,
    description: String,
    priceInCents: Number,
    tags: [String],
    isSeason: Boolean,
    avaliable: Boolean,
    requireWaiver: Boolean,
    maximumGuests: Number,
    packageSold: Number
});

vacationSchema.methods.getDisplayPrice = function(){
    return '$' + (this.priceInCents / 100).toFixed(2);
};

//相当于创建了数据库以及对应的table
var vacation = mongoose.model('Vacation', vacationSchema);

module.exports = vacation;
