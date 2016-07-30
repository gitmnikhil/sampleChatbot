"use strict";

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatBotSchema = new Schema({
	id: { type: String, unique: true },
	userName: { type: String, required: true },
	timeStamp: { type: Date, required: true },
	messenger: { type: String, required: true },
	messageOne: { type: String },
	messageTwo: { type: String },
});

var ChatBot = mongoose.model('ChatBot', ChatBotSchema);
module.exports = ChatBot;