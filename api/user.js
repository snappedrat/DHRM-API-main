const express = require('express');
const router = express.Router();
const db = require('../../core/db');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function getpool() {
    const pool = await db.poolPromise;
    const result = await pool.request();
    return result;
  }


  router.post('/signup', (req, res, next) => {

    if (req.body.userEmail != null && req.body.userPassword != null) {
    bcrypt.hash(req.body.userPassword, 10, async (err, hash) => {
    if (err) {
    return res.status(500).json({
    error: {
    message: err
    }
    });
    }
    else {
    
    const result = await getpool();
    result.
    input('userEmail', sql.NVarChar(50), req.body.userEmail)
        .input('userPassword', sql.NVarChar(sql.MAX), hash)
        .output('responseMessage', sql.VarChar(50))
        .execute('spSignupUser', function (err, data) {
    if (err) {
      const express = require('express');
      const router = express.Router();
      const db = require('../../core/db');
      const sql = require('mssql');
      const bcrypt = require('bcrypt');
      const jwt = require('jsonwebtoken');
      async function getpool() {
          const pool = await db.poolPromise;
          const result = await pool.request();
          return result;
        }
        router.post('/signup', (req, res, next) => {
      
          if (req.body.userEmail != null && req.body.userPassword != null) {
          bcrypt.hash(req.body.userPassword, 10, async (err, hash) => {
          if (err) {
          return res.status(500).json({
          error: {
          message: err
          }
          });
          }
          else {
          
          const result = await getpool();
          result.
          input('userEmail', sql.NVarChar(50), req.body.userEmail)
              .input('userPassword', sql.NVarChar(sql.MAX), hash)
              .output('responseMessage', sql.VarChar(50))
              .execute('spSignupUser', function (err, data) {
          if (err) {
          res.status(500).json({
          error: {
          message: err
          }
          });
          }
          else {
          console.log(data);
          if (data['output']['responseMessage'] == 'Failed') {
          res.status(404).json({
          error: {
          message: 'User Exist'
          }
          });
          }
          else {
          res.status(201).json({
          message: 'Success',
          data: {
          email: req.body.userEmail,
          password: hash,
          userId: data['recordset'][0]['userId']
          }
          });
          }
          }
          });
          }
          
          });
          }
          else {
          return res.status(404).json({
          error: {
          message: 'not found'
          }
          });
          }
          
          });
            res.status(500).json({
    error: {
    message: err
    }
    });
    }
    else {
    console.log(data);
    if (data['output']['responseMessage'] == 'Failed') {
    res.status(404).json({
    error: {
    message: 'User Exist'
    }
    });
    }
    else {
    res.status(201).json({
    message: 'Success',
    data: {
    email: req.body.userEmail,
    password: hash,
    userId: data['recordset'][0]['userId']
    }
    });
    }
    }
    });
    }
    
    });
    }
    else {
    return res.status(404).json({
    error: {
    message: 'not found'
    }
    });
    }
    
    });

    