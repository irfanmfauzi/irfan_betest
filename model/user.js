const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
	id: {
		type: mongoose.Schema.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
		unique: true,
		required: true
	},
	userName: {
		type: String,
		required: true,
		trim: true
	},
	accountNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	emailAddress: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		match: [/.+@.+\..+/, 'Please enter a valid email address']
	},
	identityNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true
	}
})

const User = mongoose.model("User", UserSchema)

module.exports = User
