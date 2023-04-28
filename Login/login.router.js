const express = require('express')
const loginRouter = express.Router();
const jwt  = require('jsonwebtoken')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
loginRouter.use(cors())
loginRouter.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
loginRouter.options('*', cors(corsOptions));

loginRouter.use(bodyParser.urlencoded({ extended: false }));
loginRouter.use(bodyParser.json());

//login api for RANE USER LOGIN.
//Tables used: Employees  
loginRouter.post('/emp-login',  async(request, response)=> {
    try{
      var User_Name =request.body.User_Name;
      var Password =request.body.Password;
  
      console.log(User_Name, Password)
      const pool = await db.poolPromise;
      console.log("select * from employees where User_Name='"+User_Name+"' and Password= '"+Password+"' ")

      const result = await pool.request()
          .query("select * from employees where User_Name='"+User_Name+"' and Password= '"+Password+"' ")
  
      const result2 = await pool.request()
          .query("select * from employees where User_Name='"+User_Name+"' ")
        
      console.log(result2);
      if (result['recordset'].length > 0)
       {
          this.glob = 1;
          var userData = {
              "User_Name": User_Name,
              "Password": Password
          }
          let token = jwt.sign(userData, process.env.secret)
  
          response.status(200).json({"token": token, "message":"Success"});
      }
  
      else if((result['recordset'].length == 0)&&(result2['recordset'].length == 0) )
      {
          this.glob = 0;
          response.send([{"message":"User"}]);
      }
  
      else
      {
          this.glob = 0;
          response.send([{"message":"Failure"}]);
      }
    }catch(err){
      console.log(err)
      response.send({"message":"Failure"})
    }
  
  });
  
  
  //API for ARS-LOGIN. 
  // Tables used : trainee_apln
  loginRouter.post('/ars-login', async(request,response)=>{
    try
    {
      var pool = await db.poolPromise
      var User_Name =request.body.User_Name;
      var Password =request.body.Password;
      const result = await pool.request()
          .input('User_Name',User_Name)
          .input('Password',Password)
          .query("select apln_slno from trainee_apln where gen_id='"+User_Name+"' AND temp_password='"+Password+"' ")
  
      const result2 = await pool.request()
          .input('User_Name',User_Name)
          .query("select apln_slno from trainee_apln where gen_id = '"+User_Name+"' ")
  
        if((result['recordset'].length  > 0))
          {
            this.glob = 1;
            var userData = {
                "User_Name": result['recordset'][0].apln_slno,
                "Password": Password
            }
            let token = jwt.sign(userData, process.env.secret)
      
            response.status(200).json({"token": token, "message":"Success", apln_slno: result['recordset'][0].apln_slno});
            } 
        else if((result['recordset'].length == 0)&&(result2['recordset'].length == 0) )
        {
            this.glob = 0;
            response.send([{"message":"User"}]);
        }
        else
        {
            this.glob = 0;
            response.send([{"message":"Failure"}]);
        }
  
    }
    catch(err)
    {
      console.log(err)
      res.send({message:'failure'})
    }
  })
  
  //API for TraineeLogin for writing test
  // Tables used: trainee_apln
  loginRouter.post('/trainee-login', async(req, res)=>{
    try
    {
    console.log(req.body)
  
  
    var User_Name = req.body.username
    var Password = req.body.pass
    var pool =await db.poolPromise
    var result = await pool.request()
      .input('trainee_idno', User_Name)
      .input('pass', Password)
      .query("select * from trainee_apln where trainee_idno=@trainee_idno and temp_password=@pass ")
      console.log("select apln_slno from trainee_apln where trainee_idno='"+User_Name+"' and temp_password='"+Password+"' ")
    var result2 = await pool.request()
      .input('trainee_idno', User_Name)
      .query("select apln_slno from trainee_apln where trainee_idno=@trainee_idno")
  
    if(result['recordset'].length > 0)
    {
      let token = jwt.sign(result['recordset'][0], process.env.secret)
      res.send({'token': token, 'status': 'success' })
    }
    else
    {
      
      if(result2['recordset'].length == 0 && result['recordset'].length == 0)
      {
        res.send({'status': 'wrong_user'})
      }
      else
      {
        res.send({'status': 'wrong_pass'})
      }
    }
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })

  module.exports = loginRouter