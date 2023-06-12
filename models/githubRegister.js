const mongoose = require('mongoose');

const githubRegisterSchema = new mongoose.Schema({
    _id: String,
    token: String,
});

module.exports = mongoose.model('GithubRegister', githubRegisterSchema);