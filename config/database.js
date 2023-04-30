const mongoose = require('mongoose');
require('dotenv').config()

class Database {
    constructor() {
        this.connection = null;
    }

    connect() {
        const mongo_url = process.env.MONGO_URL;
        console.log("⏳ Tentando conexão com o banco de dados...")
        mongoose.connect(mongo_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log('📡 Conectado com o banco de dados.');
            this.connect = mongoose.connection;
        }).catch(err => {
            console.error(err);
        });
    }
}

module.exports = Database;