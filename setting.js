const { NULL } = require("mysql/lib/protocol/constants/types");
require('dotenv').config()

exports.dbConfig = {
    'user': process.env.DB_USER,
    'password': process.env.DB_PASS,
    'server': process.env.DB_SERVER,

    options: 
    {
    port: 1433,
    enableArithAbort: false,
    encrypt: false,
    database: process.env.DB_DB,
    
    instance: process.env.DB_INSTANCE,
    rowCollectionOnDone: true,
    arrayRowMode: false,  
    trustServerCertificate: false
    }
    };
