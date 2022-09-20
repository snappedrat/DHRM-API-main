const { NULL } = require("mysql/lib/protocol/constants/types");

exports.dbConfig = {
    'user': 'sa',
    'password': '1234',
    'server': 'AHAMED',


    options: {
    port: 1433,
    enableArithAbort: false,
    encrypt: false,
    database: 'DHRM_PRD_DB',
    instance:'MSSQLSERVER',
    rowCollectionOnDone: true,
    useColumnNames: false,  
    trustServerCertificate: false
    }
    };
