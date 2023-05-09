const mongoose = require('mongoose');

const jiraRegisterSchema = new mongoose.Schema({
    _id: String,
    token: String,
});

module.exports = mongoose.model('JiraRegister', jiraRegisterSchema);