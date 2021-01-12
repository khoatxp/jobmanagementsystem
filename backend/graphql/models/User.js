const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    profileUrl: String,
    firstName: String,
    lastName: String,
    biography: String,
    messageRooms: Array
});

module.exports = model('User', userSchema);