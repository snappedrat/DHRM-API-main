const { NULL } = require("mysql/lib/protocol/constants/types");

exports.dbConfig = {
    'user': 'superuser',
    'password': 'superuser123',
    'server': '14.99.10.243',
    // 'server': '172.16.53.5',


    options: {
    port: 1433,
    enableArithAbort: false,
    encrypt: false,
    database: 'DHRM_PRD_DB_BKP',
    
    instance:'MSSQLSERVER',
    rowCollectionOnDone: true,
    useColumnNames: false,  
    trustServerCertificate: false
    }
    };
