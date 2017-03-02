'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Intent = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    barId: String
});

module.exports = mongoose.model('Intent', Intent);
