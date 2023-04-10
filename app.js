const express = require('express')
const jwt = require('jsonwebtoken');
// const authorize = require('./auth');
const app = express();
const request = require('request');
var expressJWT = require('express-jwt');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('./db');
const { json } = require('express/lib/response');
const { rows, pool } = require('mssql');
const { response } = require('express');
const res = require('express/lib/response');
let glob = 0;
const multer = require('multer');
const fs = require("fs");
const nodemailer = require('nodemailer');
const verifyJWT = require('./Middleware/auth');

var q_bank = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "qbank";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var plant_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "plant";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var offline_test_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "offline_test";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var skill_dev_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "skill_dev";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var storage = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
     cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var filedrop1 = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "filedrop";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});
var filedrop2 = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
      cb(null, process.env.FILEDROP);    
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

const destA = multer({ storage: filedrop1 })
const destB = multer({ storage: filedrop2 })

function fileDrop(req, res, next) {
  destA.single('file')(req, res, next);
  destB.single('file')(req, res, next);
  next();
}

const qbank = multer({storage: q_bank}).single('file')
const upload = multer({storage: storage}).single('file')
const plant = multer({storage: plant_}).single('file')
const offline_test = multer({storage: offline_test_}).single('file')
const skill_dev = multer({storage: skill_dev_}).single('file')
// const filedrop = multer({storage: filedrop_}).single('file')

app.use('/uploads',express.static('uploads'))
app.use('/qbank',express.static('qbank'))
app.use('/plant',express.static('plant'))
app.use('/skill_dev',express.static('skill_dev'))
app.use('/offline_test',express.static('offline_test'))
app.use('/filedrop',express.static('filedrop'))

//Uploading the file for trainee new application
//Tables used : trainee_apln

//Uploading the file for trainee new application
//Tables used : trainee_apln

app.post("/image", upload , verifyJWT, async(req, res) => {
  
  var user = await getpool()
    res.send({'Message':req.body,"file": req.file})

    var name = req.file.path
    var mobile = req.body.mobile
    var company = req.body.company
    var fileno = req.body.fileno
    user.query("update trainee_apln set other_files"+fileno+" = '"+name+"' where mobile_no1= '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+")  "  )

});

const cors = require('cors');
app.use(cors())
app.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
app.options('*', cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function getpool() {
    const pool = await db.poolPromise;
    const result = await pool.request();
    return result;
  }


//login api for RANE USER LOGIN.
//Tables used: Employees  
app.post('/logins',  async(request, response)=> {
  try{
    var User_Name =request.body.User_Name;
    var Password =request.body.Password;

    console.log(User_Name, Password)
    const pool = await db.poolPromise;
    const result = await pool.request()
        .input('User_Name',User_Name)
        .input('Password',Password)
        .query("select * from employees where User_Name='"+User_Name+"' or Password=@Password")

    const result2 = await pool.request()
        .input('User_Name',User_Name)
        .query("select * from employees where User_Name=@User_Name")
        
    
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
app.post('/ars-login', async(request,response)=>{
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
app.post('/traineelogin', async(req, res)=>{
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



//Get user details like access control for employees and department, plant details for trainee.
//Tables Used : employees, trainee_apln.
app.post('/gethrappr', async(req,res)=>{
  try{

  var user_name = req.body.username;
  var usertype = req.body.user;

  var pool = await db.poolPromise;

  if(usertype == 'emp' || usertype == 'emp2')
  {
    var result = await pool.request()
    .query("select employees.*, department.dept_name, plant.plant_name from employees left join department on employees.department = department.dept_slno left join plant on plant.plant_code = employees.plant_code where employees.User_Name = '"+user_name+"' ")
  }
  else if(usertype == 'trainee')
  {
  var result = await pool.request()
      .query("select t.fullname, p.plant_name, d.dept_name from trainee_apln t left join department d on t.dept_slno = d.dept_slno left join plant p on p.plant_code = t.plant_code where t.apln_slno = '"+user_name+"' ")
  }
  else if(usertype == 'ars')
  {
  var result = await pool.request()
      .query("select t.fullname, p.plant_name, d.dept_name from trainee_apln t left join department d on t.dept_slno = d.dept_slno left join plant p on p.plant_code = t.plant_code where t.apln_slno = '"+user_name+"' ")
  }
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
}
);

//get plant code from plant table 
app.post('/getplantcode', async(req,res)=>{
  try{


  var pool = await db.poolPromise
  var username = req.body.username
  var result = await pool.request()
    .query("select plant_code from employees  where user_name = '"+username+"' ")
    res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/getpincode',  async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var pincode = req.body.pincode

  var pattern = /^\d+\.?\d*$/;

  let booln = pattern.test(pincode)
  if(booln == true)
  {
    var result = await pool.request()
        .query('SELECT * FROM [dbo].[pincodes] where pincode = '+pincode+' ')
      res.send(result['recordset'])
  }
  else
    res.send({message:'not a number'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.get('/getaadhar', async(req,res)=>{
  try
  {
  
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select mobile_no1, aadhar_no from trainee_apln")
    res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/basicforms', async(req,res,err)=>{
  
  try
  {
    var pool = await db.poolPromise;
    var title = req.body.title;
    var permanent = req.body.permanent;
    var present = req.body.present;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var father = req.body.ftname;
    var dob = req.body.bd;
    var height = req.body.height;
    var weight = req.body.weight;
 
    var dose1 = req.body.dd1;
    var dose2 = req.body.dd2;
    var gender = req.body.gender;
    var aadhar1 = req.body.aadhar1;
    var aadhar2 = req.body.aadhar2;
    var aadhar3 = req.body.aadhar3;
    var aadhar = ''
    aadhar = aadhar.concat(aadhar1,aadhar2,aadhar3)
    var nation = req.body.nation;
    var city = req.body.city
    var state = req.body.st
    var pc = req.body.pc
    var bp = req.body.bp
    var idm1 = req.body.idm1
    var idm2 = req.body.idm2
    var bg = req.body.bg
    var religion = req.body.reg;
    var martial = req.body.mar;
    var phy_disable = req.body.pd;
    var mobilenumber = req.body.mobilenumber
    var company = req.body.company
    var fullname = fname+' '+lname
    console.log(req.body)

    var title_col = "title = '"+title+"', "

    if(title == null)
      title_col = ''

    console.log("update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' , blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion_sl = (select slno from religion where religion_name = '"+religion+"') , religion= '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where sno = "+company+") ")
  var result = await pool.request()
    .query("update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,  blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion_sl = (select slno from religion where religion_name = '"+religion+"'),religion= '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where sno = "+company+")  ")
  res.send({message:'success'})
}

catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

}
);


app.post('/bankforms',async(req,res)=>{
  try{
    var pool = await db.poolPromise;
    var account = req.body.account;
    var ifsc = req.body.ifsc;
    var bankName = req.body.bankName;
    var mobileNumber = req.body.mobilenumber
    var company = req.body.company
    
    var result = await pool.request()
      .query("update trainee_apln set bank_account_number = '"+account+"', ifsc_code = '"+ifsc+"', bank_name = '"+bankName+"' where mobile_no1 = '"+mobileNumber+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    res.send({message: 'success'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
});


app.post('/plantcodelist', async(req,res)=>
{//
  try
  {
    var pool = await db.poolPromise;
  var company_name = req.body.company_name
  var result = await pool.request()
    .query("select plant_name from plant where company_code =  (select top 1 company_code from master_company where company_name = '"+company_name+"') and del_status= 0 ")
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
}) ;

app.post('/getall', verifyJWT, async(req,res)=>
{
  try{

    console.log(req.body)

  var pool =await db.poolPromise
  if(req.body.plantcode.search(':')>=0)
    var plantcode = req.body.plantcode
  else
    var plantcode = req.body.plantcode

  console.log(plantcode)
    var result = await pool.request()
    .query("select slno, desig_name from designation where plant_code = '"+plantcode+"' and del_status = 0   ")

    var result2 = await pool.request()
    .query("select dept_slno, dept_name from department where plant_code ='"+plantcode+"' and del_staus = 1  ")

    var result3 = await pool.request()
    .query("select line_code, line_name from mst_line where plant_code = '"+plantcode+"' and del_status = 'N'  ")
  
    var object = []
    object[0] = result['recordset']
    object[1] = result2['recordset']
    object[2] = result3['recordset']
    
  res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}) ;

app.post('/companycodelist', async(req,res)=>
{
  try
  {
    var pool = await db.poolPromise;
    var result = await pool.request()

     .query("select sno, company_name, company_code from master_company where del_status = 0 ")
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
}) ;

app.post('/traineeformdata', async(req,res)=>
{
  try{

  var plantname = req.body.plant
  var companyname = req.body.company
  var mobileNumber = req.body.mobileNumber;
  var count = [];

  var pass = req.body.pass;
  var status = {}
  console.log(req.body)
  var pool =await db.poolPromise

  var result = await pool.request()
  .query(`select * from trainee_apln where mobile_no1 = '${mobileNumber}' and company_code = (select company_code from master_company where sno = '${companyname}') `);
  
    if(result['recordset'].length == 0 )
      {
        console.log("adding form......")
        console.log("insert into trainee_apln (mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status, company_code) values('"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'NEW INCOMPLETE', (select company_code from master_company where sno = "+companyname+"))")
        var result2 =await pool.request()
        result2.query("insert into trainee_apln (mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status, company_code) values('"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'NEW INCOMPLETE', (select company_code from master_company where sno = "+companyname+"))");
        status.status = 'newform';
        res.send(status);  
      }
    else if(result['recordset'].length == 1)
    {

      if(result['recordset'][0]?.apln_status != 'NEW INCOMPLETE')
      {
      console.log("alreadyyyy.......")
      status.status = 'registered';
      res.send(status);
      }
      else if(result['recordset'][0]?.apln_status == 'NEW INCOMPLETE')
        {
          var update = await pool.request()
          .query("update trainee_apln set plant_code = (select plant_code from plant where plant_name = '"+plantname+"') where mobile_no1 = '"+mobileNumber+"' and apln_slno = "+result['recordset'][0].apln_slno+" ")
          status.status = 'incomplete';
          res.send(status);
        }
    }
    else
    {
      res.send({status:'registered'})
    }
  }

  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  
});

app.post('/emergency', async(req,res)=>{

  try{
    var pool = await db.poolPromise;
    var contactName = req.body.contactName;
    var contactNumber = req.body.contactNumber;
    var relations = req.body.relations;
    var mobilenumber = req.body.mobilenumber;
    var company = req.body.company
    var result = await pool.request()
      .query("  update trainee_apln set emergency_name='"+contactName+"',mobile_no2='"+contactNumber+"',emergency_rel='"+relations+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where sno = "+company+") ")
    res.send({message: 'success'})
    }
    catch(err)
    {
      console.log(err)
      res.send({message:'failure'})
    }
  });



app.get('/getbanknames', async(req,res)=>{

  try{
    var pool = await db.poolPromise; 
    var result = await pool.request()
      .query('SELECT TOP (1000)[bank_name] FROM [dbo].[Bank]')
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }


})

app.post('/lang', async(req,res)=>
{
try
  {
  var pool = await db.poolPromise
  var details = req.body;
  var lang1 = details[0]
  var lang2 = details[1]
  var lang3 = details[2]
  var lang4 = details[3]
  var lang5 = details[4]
  var lang6 = details[5]
  
  if(lang1.language === '')
  {
    console.log("no details")
    res.send({message: 'success'})

  }
  else
  {
  var result1 = await pool.request()
  .query("  update trainee_apln set lang1_name = '"+ lang1.language+"' , lang1_speak = '"+ lang1.speak +"', lang1_read = '"+ lang1.read +"', lang1_write = '"+ lang1.write +"', lang1_understand = '"+ lang1.understand +"', lang1_mothertounge = '"+ lang1.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' and company_code = (select company_code from master_company where sno = "+lang1.company+") ")
  var result2 = await pool.request()
  .query("  update trainee_apln set lang2_name = '"+ lang2.language+"' , lang2_speak = '"+ lang2.speak +"', lang2_read = '"+ lang2.read +"', lang2_write = '"+ lang2.write +"', lang2_understand = '"+ lang2.understand +"', lang2_mothertounge = '"+ lang2.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where sno = "+lang1.company+") ")
  var result3 = await pool.request()
  .query("  update trainee_apln set lang3_name = '"+ lang3.language+"' , lang3_speak = '"+ lang3.speak +"', lang3_read = '"+ lang3.read +"', lang3_write = '"+ lang3.write +"', lang3_understand = '"+ lang3.understand +"', lang3_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where sno = "+lang1.company+") ")
  var result4 = await pool.request()
  .query("  update trainee_apln set lang4_name = '"+ lang4.language+"' , lang4_speak = '"+ lang4.speak +"', lang4_read = '"+ lang4.read +"', lang4_write = '"+ lang4.write +"', lang4_understand = '"+ lang4.understand +"', lang4_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where sno = "+lang1.company+") ")
  var result5 = await pool.request()
  .query("  update trainee_apln set lang5_name = '"+ lang5.language+"' , lang5_speak = '"+ lang5.speak +"', lang5_read = '"+ lang5.read +"', lang5_write = '"+ lang5.write +"', lang5_understand = '"+ lang5.understand +"', lang5_mothertounge = '"+ lang5.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where sno = "+lang1.company+") ")
  var result6 = await pool.request()
  .query("  update trainee_apln set lang6_name = '"+ lang6.language+"' , lang6_speak = '"+ lang6.speak +"', lang6_read = '"+ lang6.read +"', lang6_write = '"+ lang6.write +"', lang6_understand = '"+ lang6.understand +"', lang6_mothertounge = '"+ lang6.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where sno = "+lang1.company+") ")

  res.send({message: 'success'})

  }
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})



app.post('/family',async(req,res)=>{

  try{
    var details = req.body;

  for(var i = 0 ; i<4 ;i++)
  {
    if(details[i].dependent == 'Dependent')
      details[i].dependent = 1
    else
      details[i].dependent = 0
    
    if(details[i].age == undefined)
      details[i].age = 0
  }

  var pool = await db.poolPromise

  var result = await pool.request()
      .query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+") )")

  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !='' && details[i].name != 'undefined' && details[i].name != null )
      {
        var result1 = await pool.request()
          .query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'  and company_code = (select company_code from master_company where sno = "+details[0].company+")),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
      }
  }
  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].name != '' && details[i].name != 'undefined' && details[i].name != null )
        {
          var result2 = await pool.request()
            .query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+")),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
          console.log('insert', i) 
        }
      }
      else if(result['recordset'][i] != undefined)
      {
        var result3 = await pool.request()
        .query("  update trainee_apln_family set relation_name = '"+details[i].name+"' ,relation_type = '"+details[i].relation+"', age = '"+details[i].age+"', occupation = '"+details[i].occupation+"', dependent = '"+details[i].dependent+"', contact_number = '"+details[i].contactnumber+"' where family_slno = (select min(family_slno) from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+")))+'"+i+"'  ")
        console.log("  update", i)
      }
    }
  }
  console.log('finished')
  res.send({message: 'success'})
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
} );



app.post('/edu', async(req,res)=>{

  try{
  var details = req.body;

  console.log(details)
  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+"))")
    console.log(result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].school !=''  && details[i].school != 'undefined' && details[i].school != null  )
      {
        var result1 = await pool.request()
        .query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+") ),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
      }
  }
  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].school != '' && details[i].school != 'undefined' && details[i].school != null )
        {
          var result2 = await pool.request()        
          .query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+")),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
        }
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
        var result3 = await pool.request()
        .query("  update trainee_apln_qualifn set school_name = '"+details[i].school+"' ,exam_passed = '"+details[i].passed+"', passing_yr = '"+details[i].year+"', subjects = '"+details[i].department+"', cert_number = '"+details[i].certificatenumber+"', cert_date = '"+details[i].certificatedate+"',percentage = '"+details[i].percentage+"' where qual_slno = (select min(qual_slno) from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+") ))+'"+i+"'  ") 
      }
    }
  }

  res.send({message: 'success'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
});


app.post('/prev', async(req,res)=>{

  try
  {
    var pool = await db.poolPromise;
    var details = req.body;

  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+") )")

  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !=''  && details[i].name != 'undefined' && details[i].name != null  )
      {
        var result1 = await pool.request()
        .query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+")),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
      }
  }

  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].name != ''  && details[i].name != 'undefined' && details[i].name != null )
        {    
          var result2 = await pool.request()
          .query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where sno = "+details[0].company+")),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
        }
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
        var result3 = await pool.request()
        .query("  update trainee_apln_career set company_name = '"+details[i].name+"' ,designation = '"+details[i].desig+"', period_from = '"+details[i].periodf+"', period_to = '"+details[i].periodt+"', last_salary = '"+details[i].sal+"', leaving_reason = '"+details[i].reason+"' where career_slno = (select min(career_slno) from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where son = "+details[0].company+") ))+'"+i+"'  ") 
      }
    }
  }
    res.send({message: 'success'})
    }
    catch(err)
    {
      console.log(err)
      res.send({message:'failure'})
    }  
});


app.post('/others', async(req,res)=>{
  try{
    var pool = await db.poolPromise;
    var known = req.body.known;
    var work = req.body.work;

    if(known == 'Yes')
      known = 'Y'
    else if (known == 'No')
      known = 'N'

    if(work == 'Yes')
    work = 'Y'
    else if (work == 'No')
    work = 'N'


    if(req.body.work == null)
    {
      work = ''
    }

    if(req.body.known == null)
    {
      known = ''
    }

    var names = req.body.names;
    var place = req.body.place;
    var com = req.body.com;
    var extra = req.body.extra;
    var mobilenumber = req.body.mobilenumber;
    var company = req.body.company
    var result = await pool.request()
      .query("  update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"' and company_code = (select company_code from master_company where sno = "+company+") ")
      res.send({message: 'success'})
    }
    catch(err)
    {
      console.log(err)
      res.send({message:'failure'})
    }
});

app.post('/filter',verifyJWT, async(req,res)=>{
  try
  {
  var pool = await db.poolPromise;
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate
  var plantcode = req.body.plantcode

  var result = await pool.request()
    .query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' ")
    res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/searchfilter', verifyJWT, async(req,res)=>
{
  try{
    var pool = await db.poolPromise;
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate
  var plantcode = req.body.plantcode
  var colname = req.body.colname
  var colvalue = req.body.colvalue
  colvalue = colvalue.trim()
  console.log("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND "+colname+" like '"+colvalue+"%' AND plant_code = '"+plantcode+"' ")

  var result = await pool.request()
    .query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND "+colname+" like '"+colvalue+"%' AND plant_code = '"+plantcode+"' ")
    res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/filterforapproval', verifyJWT, async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var status = req.body.status
  var plantcode = req.body.plantcode
  var result = await pool.request()
    .query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1,t.trainee_idno, t.aadhar_no, t.apln_status, m.sno from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"'AND plant_code = '"+plantcode+"' ")
    res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})


app.post('/submitted', verifyJWT, async(req,res)=>{
  try
  {
  var mob = req.body.mobile
  var company = req.body.company
  var id = ''
  var date = new Date()
  var year = date.getFullYear()
  year = year.toString()
  year = year.split('0')[1]

  var pool = await db.poolPromise
  var result =await pool.request()
  
  .query("select pl from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+")) ")
  
  var result2 = await pool.request()
    .query("select apln_slno from trainee_apln where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
  
  id = result['recordset'][0]?.pl+'/'+year+'/'+result2['recordset'][0]?.apln_slno
  var result3 = await pool.request()
    .query("  update trainee_apln set apln_status = 'SUBMITTED', trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
  console.log("..........", result3)
  res.send(result3)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/pending', async(req,res)=>{

  try{
    var pool = await db.poolPromise;  
    var mob = req.body.mobile
    var company = req.body.company

  var result = await pool.request()
  .query("update trainee_apln set apln_status = 'PENDING' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    res.send({message: 'success'})

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/approved', verifyJWT, async(req,res)=>{
  try{
    var pool = await db.poolPromise;  
    var mob = req.body.mobile
    var company = req.body.company

  var result = await pool.request()
  .query("update trainee_apln set apln_status = 'APPROVED' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    res.send({message: 'success'})

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/rejected',verifyJWT, async(req,res)=>{
  try{
    var pool = await db.poolPromise;  
    var mob = req.body.mobile
    var company = req.body.company

  var result = await pool.request()
  .query("update trainee_apln set apln_status = 'REJECTED' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    res.send({message: 'success'})

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/getdataforid', verifyJWT, async(req,res)=>{

  try
  {
  var mobile = req.body.mobile
  var company = req.body.company

  var r = await db.poolPromise
  var result = await r.request()
    .query("select addr from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ) ")
  var result2 = await r.request()
    .query("select fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel, other_files6, mobile_no2, plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    object = result2['recordset']
  var result3 = await r.request()
    .query("select plant_sign from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ) ")


    if(result2['recordset'].length !=0)
      object[0].addr = result['recordset'][0].addr
    if(result3['recordset'].length !=0)
    object[0].plant_sign = result3['recordset'][0].plant_sign
    res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})
app.post('/getdataforpermid', verifyJWT, async(req,res)=>{

  try
  {
  var apln_slno = req.body.apln_slno

  var r = await db.poolPromise
  var result = await r.request()
    .query("select addr from plant where plant_code = (select plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ) ")
  var result2 = await r.request()
    .query("select gen_id, mobile_no1, birthdate,blood_group ,fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel, other_files6, mobile_no2, plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ")
    object = result2['recordset']
  var result3 = await r.request()
    .query("select plant_sign from plant where plant_code = (select plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ) ")


    if(result2['recordset'].length !=0)
      object[0].addr = result['recordset'][0].addr
    if(result3['recordset'].length !=0)
    object[0].plant_sign = result3['recordset'][0].plant_sign
    res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})



app.post('/getdatabasic', async(req,res)=>{
try
{
  var mobile = req.body.mobile
  var company = req.body.company

  var r = await db.poolPromise
  var result2 = await r.request()
    .query("select plant_name from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+"))")
  var result3 = await r.request()
    .query("select * from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    object = result3['recordset']
  var result4 = await r.request()
    .query("select company_name from master_company where sno = "+company+" ")
    if(result3['recordset'].length !=0)
    {    
      object[0].company_name = result4['recordset'][0].company_name
      object[0].plant_name = result2['recordset'][0].plant_name
    }

    res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/getdatafamily', async(req,res)=>{
  try
  {
  var pool = await db.poolPromise
  var mobile = req.body.mobile
  var company = req.body.company

  console.log(req.body)
  var result = await pool.request()
    .query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"'  and company_code = (select company_code from master_company where sno = "+company+"))  ")
  res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/getdatacareer', async(req,res)=>{
  try
  {
  var mobile = req.body.mobile
  var company = req.body.company
  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"'  and company_code = (select company_code from master_company where sno = "+company+")) ")
  res.send(result['recordset'])

  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/getdataqualfn', async(req,res)=>{
  try
  {
  var mobile = req.body.mobile
  var company = req.body.company

  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 ='"+mobile+"'  and company_code = (select company_code from master_company where sno = "+company+")) ")
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/getQuestions',verifyJWT,async(req,res)=>
{
  try
  {
  var module = req.body.module
  module = module.split('.')[1]

  var username = req.body.username

  var pool = await db.poolPromise
  console.log("select question, correct_answer from question_bank2 where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') ")
  let result = await pool.request()
    .query("select * from question_bank2 where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') order by qslno ")
  
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})
app.post('/getQuestions_tnr', verifyJWT,async(req,res)=>
{
  try
  {
  var module = req.body.module
  var plant_code = req.body.plant_code

  console.log

  var pool = await db.poolPromise
  console.log("select * from question_bank2 where module_name = '"+module+"' and plant_code = '"+plant_code+"' order by qslno ")
  let result = await pool.request()
    .query("select * from question_bank2 where module_name = '"+module+"' and plant_code = '"+plant_code+"' order by qslno ")
  
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/getModules', verifyJWT, async(req,res)=>{
try
{

  let username = req.body.username

  var pool = await db.poolPromise
  console.log("select * from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') and del_status = 'N' order by priorityval ")
  if(isNaN(parseInt(username)))
  {
    var result = await pool.request()
    .query("select* from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') and del_status = 'N' order by priorityval ")
  }
  else
  {
    var result = await pool.request()
    .query("select* from trg_modules where plant_code = '"+username+"' and del_status= 'N' order by priorityval ") 
  }
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/getTest',verifyJWT,  async(req,res)=>{

  try
  {
  let username = req.body.username
  let module = req.body.module
  module = module.split('.')[1]

  var pool = await db.poolPromise
  let result = await pool.request()
    .query("select * from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+module+"' ")
  
  if(result['recordset'].length > 0)
    res.send({'test':'post-test'})
  else
    res.send({'test':'pre-test'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/Qualified', verifyJWT, async(req,res)=>{
  try
  {
  var pool = await db.poolPromise;

  let username = req.body.username;
  let m = req.body.module;
  let pass_mark

  let module = m.split('.')[1]

  let index = m.split('.')[0]

  const result = await pool.request()
  .query("select * from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+module+"' ")

  console.log(req.body)

  if(index == 1)
  {
    console.log("first module...............")
    if(result['recordset'].length == 0)
    {
      res.send({'message':'qualified'})
    }
    else if(result['recordset'].length > 0)
    {
      var pass_criteria = await pool.request()
        .query("select pass_criteria from trg_modules where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') ")
      pass_mark = pass_criteria['recordset'][0].pass_criteria
      console.log(pass_mark)
      var score = await pool.request()
        .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+module+"'")
      console.log(score['recordset'][0].sum)
      if(score['recordset'][0].sum == null) 
        res.send({'message':'post-test'})

      else if(score['recordset'][0].sum >= pass_mark)
        res.send({'message':'passed'})

      else
        res.send({'message':'failed'})
    }
  }

  else if(index > 1)
  {
    console.log("next module...............")
    if(result['recordset'].length == 0)
    {
      var prev_module = await pool.request()
        .query("select module_name from trg_modules where priorityval = ((select priorityval from trg_modules where module_name = '"+module+"')-1) and plant_code = (select plant_code from trg_modules where module_name = '"+module+"' ) ")

        // console.log("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+prev_module['recordset'][0].module_name+"'")
      
      var prev_score = await pool.request()
        .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+prev_module['recordset'][0].module_name+"'")

      var prev_pass_criteria = await pool.request()
        .query("select pass_criteria from trg_modules where module_name = '"+prev_module['recordset'][0].module_name+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') ")

      pass_mark = prev_pass_criteria['recordset'][0].pass_criteria
      console.log(pass_mark)

      if(prev_score['recordset'][0].sum == null || prev_score['recordset'][0].sum < pass_mark)
      {
        res.send({'message':'not qualified'})
      }
      else if(prev_score['recordset'][0].sum >= pass_mark)
      {
        res.send({'message':'qualified'})
      }
    }
    else if(result['recordset'].length > 0)
    {
      var score = await pool.request()
        .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+module+"'")

      var pass_criteria = await pool.request()
        .query("select pass_criteria from trg_modules where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') ")

      pass_mark = pass_criteria['recordset'][0].pass_criteria
      console.log(pass_mark)

      if(score['recordset'][0].sum == null) 
        res.send({'message':'post-test'})
      else if(score['recordset'][0].sum >= pass_mark)
        res.send({'message':'passed', 'marks':score['recordset'][0].sum})
      else
        res.send({'message':'failed', 'marks':score['recordset'][0].sum , 'pass' : pass_mark})
    }
  }

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

})

app.post('/pretest', verifyJWT,async(req,res)=>{

  try
  {
  console.log(req.body);
  details = req.body
  var username = req.body[0].username
  var apln_slno = req.body[0].apln_slno
  var module = req.body[0].module
  module = module.split('.')[1]

  var pool = await db.poolPromise
  var result =  await pool.request()
    .input('username', username)
    .input('module', module)
    .query("select * from question_bank2 where module_name = @module and plant_code = (select plant_code from trainee_apln where trainee_idno = @username) order by qslno")
  var plant_code = result['recordset'][0].plant_code
    for(i = 1;i< details.length;i++)
  {
    console.log(i)
    var insert_data = await pool.request()
     .query("insert into ontraining_evalation (trainee_idno , module_name , question, question_type, correct_answer, image_filename, plant_code, pretraining_date, pretraining_result, pretraining_score, pretrainingstat, priorityval , pretraining_pf, pretraining_percent,trainee_apln_slno, qslno) values('"+details[0].username+"','"+module+"',N'"+result['recordset'][i-1].question+"','"+result['recordset'][i-1].question_type+"','"+result['recordset'][i-1].correct_answer+"','"+result['recordset'][i-1].image_filename+"','"+result['recordset'][i-1].plant_code+"',CURRENT_TIMESTAMP,'"+details[i].result+"','"+details[i].score+"','SUBMITTED','"+details[0].priorityval+"','"+details[0].pf+"','"+details[0].percent+"', '"+apln_slno+"', '"+details[i].slno+"' )")

  }

  var summary = await pool.request()
  .query("insert into test_result_summary (fullname , trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ((select fullname from trainee_apln where trainee_idno = '"+details[0].username+"'),'"+details[0].username+"','"+module+"','"+details[0].min_percent+"','"+details[0].curr_total+"','"+details[0].percent+"','"+details[0].pf+"','"+plant_code+"' ) ")

  var training = await pool.request()
  .query("update trainee_apln set test_status = 'in_training' where apln_slno = '"+apln_slno+"' ")

  res.send({'message':'success'})
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/posttest',verifyJWT, async(req,res)=>
{
  try
  {
  details = req.body
  var username = req.body[0].username
  var apln_slno = username.split('.')[2]
  var module = req.body[0].module
  module = module.split('.')[1]
  var slno = req.body[0].module.split('.')[0]
  console.log(details)
  var pool = await db.poolPromise
  var i = 1

  for(var i = 1; i < details.length; i++)
  {
    var result =  await pool.request()
    .query("update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_result = '"+details[i].result+"' , posttraining_score = '"+details[i].score+"' , posttrainingstat = 'SUBMITTED', posttraining_pf = '"+details[0].pf+"', posttraining_percent = '"+details[0].percent+"' where qslno = '"+details[i].slno+"' ")
  }

  var summary = await pool.request()
  .query("update test_result_summary set submission_date = CURRENT_TIMESTAMP, posttraining_score = '"+details[0].curr_total+"', posttraining_pf = '"+details[0].pf+"', posttraining_percent = '"+details[0].percent+"'where trainee_idno = '"+details[0].username+"' and module_name = '"+module+"' ")

  var final = await pool.request()
    .query("select slno, pass_criteria from trg_modules where plant_code= (select plant_code from trainee_apln where trainee_idno = '"+username+"') order by priorityval ")

  console.log(final['recordset'].length,  slno)
  if(final['recordset'].length == slno)
  {
    if(details[0].curr_total >= final['recordset'][slno-1].pass_criteria)
    {
      var last = await pool.request()
      .query("update trainee_apln set test_status = 'COMPLETED' where trainee_idno = '"+username+"' ")
    }
  }

  res.send({'message':'success'})
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/questionbank' ,verifyJWT, async(req,res)=>
{
  try
  {
  var details = req.body
  console.log(req.body)
  var insert = details.slice(details.length-(details[details.length-1].inserted), details.length)
  var update = details.slice(0, details.length-(details[details.length-1].inserted))

  console.log("11", insert)
  console.log("22", update)

  var pool = await db.poolPromise
  for(var i = 0; i < insert.length-1 ; i++)
  {
    let image = insert[i].image_filename == undefined ? 'NULL' : insert[i].image_filename
    // console.log("insert into question_bank2(module_name, question, question_type, correct_answer, image_filename, plant_code) values('"+insert[insert.length-1].module.split('.')[1]+"',   N'"+insert[i].question+"' , 'O', '"+insert[i].correct_answer+"', '"+image+"', '"+insert[insert.length-1].plantcode+"')")

    var result1 = await pool.request()
    .query("insert into question_bank2(module_name, question, question_type, correct_answer, image_filename, plant_code) values('"+insert[insert.length-1].module.split('.')[1]+"',   N'"+insert[i].question+"' , 'O', '"+insert[i].correct_answer+"', '"+image+"', '"+insert[insert.length-1].plantcode+"')")
  }
  for(var i = 0; i < update.length ; i++)
  {
    // console.log("update question_bank2 set question = N'"+update[i].question+"', correct_answer = '"+update[i].correct_answer+"', image_filename = '"+update[i].image_filename+"' where qslno = "+update[i].qslno+" ")

    var result3 = await pool.request()
    .query("update question_bank2 set question = N'"+update[i].question+"', correct_answer = '"+update[i].correct_answer+"' , image_filename = '"+update[i].image_filename+"' where qslno = "+update[i].qslno+" ")
  }

  res.send({message: 'success'})
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

})

app.post('/questionBankDelete', verifyJWT,async(req, res)=>
{
  try
  {
    var qslno = req.body.qslno
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("delete from question_bank2 where qslno = '"+qslno+"' ")
    res.send({'message': 'success'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }  
})

app.post('/questionbankupload', qbank , verifyJWT,async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/plantupload', plant ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/offline_test_upload', offline_test ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/skill_dev_upload', skill_dev , verifyJWT,async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/filedrop', fileDrop ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})

app.post('/getTrainee',verifyJWT, async(req,res)=>
{
try
{
  var plantcode = req.body.plantcode

  var pool = await db.poolPromise

  var result =await pool.request()
    .query("select fullname ,trainee_idno from trainee_apln where plant_code = '"+plantcode+"' and apln_status = 'APPROVED' ")

res.send(result['recordset'])  

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
})

app.post('/get_test_status', verifyJWT,async(req,res)=>
{
  try
  {

    var pool = await db.poolPromise

    var idno = req.body.idno
    var module_name = req.body.module_name
    console.log(req.body)

    var r= await pool.request()
    .input('module_name', module_name)
    .query("select pass_criteria from trg_modules where module_name = @module_name")

    var result = await pool.request()
    .input('module_name', module_name)
    .input('idno', idno)
    .query("select posttraining_score from ontraining_evalation where module_name = @module_name and trainee_idno = @idno ")

  if(result['recordset'].length == 0)
  {
    res.send({status:'pre-test'})
  }
  else if(result['recordset'].length == 1)
  {
    if(result['recordset'][0].posttraining_score == null)
    {
      res.send({status:'post-test'})
    }
    else if(result['recordset'][0].posttraining_score < r['recordset'][0].pass_criteria)
    {
      res.send({status:'exam failed'})
    }
    else
    {
      res.send({status:'already'})
    }
  }
  else
  {
    res.send({status:'already'})
  }
  }
  catch(err)
  {
    console.log(err)
    res.send({'error':err})
  }
}
)

app.post('/getOfflineModule',verifyJWT, async(req,res)=>
{
  var plantcode = req.body.plantcode

  var pool = await db.poolPromise
  var result =await pool.request()
    .query("select * from trg_modules where plant_code = '"+plantcode+"' and category = 'OFFLINE' and del_status = 'N' order by priorityval ")

  res.send(result['recordset'])

})

app.post('/offlineUpload', verifyJWT,async(req,res)=>
{
  try{
  var test = req.body.test
  var module = req.body.module
  var username = req.body.trainee
  var apln_slno = req.body.trainee.split('/')
  apln_slno = apln_slno.pop() 
  username = username.trim()
  var file = req.body.file
  var score = req.body.score
  var priorityval = req.body.priorityval
  var percent = req.body.percent
  var pf = req.body.pf
  var min_percent = req.body.min_percent
  var plant_code = req.body.plant_code

  var pool = await db.poolPromise
  if(test == 'pre-test')
  {

    var r = await pool.request()
    .query("select module_name from trg_modules where plant_code = '"+plant_code+"' and category='OFFLINE' ")
    console.log(r['recordset'][0].module_name ,module)
    if(r['recordset'][0].module_name == module)
    {
      var last = await pool.request()
      .query("update trainee_apln set test_status = 'IN_TRAINING' where trainee_idno = '"+username+"' ")
    }

  var insert_data = await pool.request()
    .query("insert into ontraining_evalation(trainee_idno, module_name , plant_code ,pretraining_date, pretraining_score, uploadfile, pretrainingstat, priorityval, pretraining_pf, pretraining_percent, examattempt, trainee_apln_slno) values('"+username+"','"+module+"',(select plant_code from trainee_apln where trainee_idno = '"+username+"'),CURRENT_TIMESTAMP,'"+score+"','"+file+"','SUBMITTED','"+priorityval+"','"+pf+"','"+percent+"',1,'"+apln_slno+"' )")

  var summary = await pool.request()
  .query("insert into test_result_summary (fullname , trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ((select fullname from trainee_apln where trainee_idno = '"+username+"'),'"+username+"','"+module+"','"+min_percent+"','"+score+"','"+percent+"','"+pf+"','"+plant_code+"' ) ")

  res.send({'message': 'success'})
  }

  else if(test == 'post-test')
  {
    var update_data = await pool.request()
    .query("update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_score = '"+score+"' , posttrainingstat = 'SUBMITTED', posttraining_pf = '"+pf+"', posttraining_percent = '"+percent+"' where trainee_idno = '"+username+"' and module_name = '"+module+"' ")

    var summary = await pool.request()
    .query("update test_result_summary set submission_date = CURRENT_TIMESTAMP, posttraining_score = '"+score+"', posttraining_pf = '"+pf+"', posttraining_percent = '"+percent+"'where trainee_idno = '"+username+"' and module_name = '"+module+"' ")
  
    var final = await pool.request()
    .query(" select * from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') order by priorityval    ")

    console.log(final['recordset'][final['recordset'].length-1].module_name, module, score)

  if(final['recordset'][final['recordset'].length-1].module_name == module)
  {
    if(score >= final['recordset'][final['recordset'].length-1].pass_criteria)
    {
      var last = await pool.request()
      .query("update trainee_apln set test_status = 'COMPLETED' where trainee_idno = '"+username+"' ")
    }
  }

    res.send({'message': 'success'})
  }

}
catch(err)
{
  console.log(err)
  res.send({'error':err})
}
}
)

app.post('/addmodule' ,verifyJWT, async(req,res)=>
{
try
{
  console.log(req.body)
  var module_name = req.body.module_name
  var pass_criteria = req.body.pass_criteria
  var total_marks = req.body.total_marks
  var pass_percent = req.body.pass_percent
  var category = req.body.category
  var priorityval = req.body.priorityval
  var plantcode = req.body.plantcode

  var pool =await db.poolPromise

      var result = await pool.request()
        .query("insert into trg_modules values('"+module_name+"', "+total_marks+","+pass_criteria+", "+pass_percent+", '"+category+"', 'N', "+priorityval+", 0, '"+plantcode+"'  )")
        res.send({'message': 'inserted'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/deletemodule',verifyJWT, async(req,res)=>
{
  try
  {
  var slno = req.body.slno
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("  update trg_modules set del_status = 'Y' where slno = "+slno+" ")
  res.send({'message': 'success'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/updatemodule', verifyJWT,async(req,res)=>{

  try
  {
  var slno = req.body.slno
  var module_name = req.body.module_name
  var pass_criteria = req.body.pass_criteria
  var total_marks = req.body.total_marks
  var pass_percent = req.body.pass_percent
  var category = req.body.category
  var priorityval = req.body.priorityval
  var plantcode = req.body.plantcode

  var pool =await db.poolPromise
      var result = await pool.request()
        .query("update trg_modules set module_name = '"+module_name+"' , pass_criteria='"+pass_criteria+"', total_marks = '"+total_marks+"', pass_percent = '"+pass_percent+"', category = '"+category+"', priorityval = '"+priorityval+"' where slno = '"+slno+"' ")
        res.send({'message': 'updated'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
})

app.post('/testSummary',verifyJWT, async(req,res)=>{
  try
  {
      var details = req.body
      console.log(req.body)

  console.log("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as sum1,  sum(posttraining_percent)/count(*) as sum2 from test_result_summary where submission_date >= '"+details.start+"' and submission_date <= '"+details.end+"  23:59:59'  and plant_code = '"+details.plantcode+"' group by fullname, trainee_idno  ")

  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select fullname, trainee_idno,MAX(submission_date) as submission_date, sum(pretraining_percent)/count(*) as sum1,  sum(posttraining_percent)/count(*) as sum2 from test_result_summary where submission_date >= '"+details.start+"' and submission_date <= '"+details.end+"  23:59:59' and plant_code = '"+details.plantcode+"' group by fullname, trainee_idno  ")
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

})

app.post('/traineeScorecard',verifyJWT, async(req,res)=>{
  try
  {
  var idno = req.body.trainee_idno
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select * from test_result_summary where trainee_idno = '"+idno+"' ")
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

})

app.post('/traineeAnswers',verifyJWT, async(req,res)=>{
  try
  {
    console.log(req.body)
  var idno = req.body.idno
  var module = req.body.module
  var pool = await db.poolPromise
  
  var result2= await pool.request()
    .query("select category from trg_modules where module_name = '"+module+"' ")
  
  if(result2['recordset'][0].category == 'ONLINE')
  {
    var result = await pool.request()
    .query("select * from ontraining_evalation where trainee_idno = '"+idno+"' and module_name = '"+module+"' ")
    var object = []
    object[0] = result['recordset']
    object[1] = {status: 'ONLINE'}
    res.send(object)  }
  else if(result2['recordset'][0].category == 'OFFLINE')
  {
    var result = await pool.request()
    .query("select * from ontraining_evalation where trainee_idno = '"+idno+"' and module_name = '"+module+"' ")
    var object = []
    object[0] = result['recordset']
    object[1] = {status: 'OFFLINE'}
    res.send(object)
  }

}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}

})


app.post('/companyadd',verifyJWT,async(req,res)=>{
  try
  {
    var Code = req.body.company_code;
    var name = req.body.company_name;
    var active_status = req.body.status;
    var created_by = req.body.created_by;
    console.log(req.body)
    var stat = true;
    
    console.log("SELECT company_name FROM master_company WHERE company_code = "+Code+"")

    var pool = await db.poolPromise
    var result = await pool.request()
        .query("SELECT company_name FROM master_company WHERE company_code = "+Code+"")

       if(result['recordset'].length > 0)
       {
           res.send({message: 'already'});
       }
       else
       {
          console.log("insert into [dbo].[master_company](company_code,company_name,del_status,created_on,created_by) values("+Code+",'"+name+"',0,CURRENT_TIMESTAMP,'"+created_by+"')")
          var result2 = await pool.request()
            .query("insert into [dbo].[master_company](company_code,company_name,del_status,created_on,created_by) values("+Code+",'"+name+"',0,CURRENT_TIMESTAMP,'"+created_by+"')")
                   res.send({message: 'success'});

       }

  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
});

app.get('/companyshow',verifyJWT,async(req,res)=>{
  try
  {
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select * from master_company where del_status=0")
    let miu=result['recordset'];
       res.send(miu)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}); 

app.post('/companyedit',verifyJWT,async(req,res)=>{

try
{
  var company_code = req.body.company_code;
  var name = req.body.company_name;
  var modified_by = req.body.modified_by;

  var pool = await db.poolPromise
  var result = await pool.request()
    .query("update master_company set company_name= '"+name+"',modified_on= CURRENT_TIMESTAMP, modified_by ='"+modified_by+"' where company_code= '"+company_code+"' ")
      res.send({message: 'success'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
});

app.post('/companydel',verifyJWT,async(req,res)=>{
  try
  {
 var company_code = req.body.company_code;
 var pool = await db.poolPromise
 var result = await pool.request()
  .query("update master_company SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE company_code= '"+company_code+"' ")
       res.send({message: 'success'});
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
});

app.post('/addplant' , verifyJWT,async(req,res)=>
{
  try{
      var plant_code = req.body.plant_code
      var plant_name = req.body.plant_name
      var pl = req.body.pl
      var address = req.body.addr
      var location = req.body.locatn
      var personal_area = req.body.personal_area
      var payroll_area = req.body.payroll_area
      var plant_sign = req.body.plant_sign
      var company_code = req.body.company_code

      var pool =await db.poolPromise
      var result = await pool.request()
        .query("select * from plant where plant_code = '"+plant_code+"' and del_status = '0' ")
        console.log("select * from plant where plant_code = '"+plant_code+"' and del_status = '0' ")

      if(result['recordset'].length > 0)
        res.send({'message': 'already'})
      else
        {
          result = await pool.request()
        .query("select * from master_company where company_code = '"+company_code+"' and del_status = '0' ")
      if(result['recordset'].length == 0)
        res.send({'message': 'nocompanycode'})
        else{
          console.log("Insert into plant values('"+plant_code+"', '"+plant_name+"', 0, '"+pl+"', '"+address+"', '"+location+"', '"+plant_sign+"', '"+personal_area+"', '"+payroll_area+"', '"+company_code+"')")
          result = await pool.request()
                              .input("plant_code", plant_code)
                              .input("plant_name", plant_name)
                              .input("pl", pl)
                              .input("address", address)
                              .input("location", location)
                              .input("personal_area", personal_area)
                              .input("payroll_area", payroll_area)
                              .input("plant_sign", plant_sign)
                              .input("company_code", company_code)
                              .query("Insert into plant values(@plant_code, @plant_name, 0, @pl, @address, @location, @plant_sign, @personal_area, @payroll_area, @company_code)")
            res.send({'message': 'inserted'})
        }
        }
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteplant',verifyJWT, async(req,res)=>
{
  try{
  var plant_code = req.body.plant_code
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("update plant set del_status = '1' where plant_code = "+plant_code+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updateplant',verifyJWT, async(req,res)=>{
  try{
    var plant_code = req.body.plant_code
    var plant_name = req.body.plant_name
    var pl = req.body.pl
    var address = req.body.addr
    var location = req.body.locatn
    var personal_area = req.body.personal_area
    var payroll_area = req.body.payroll_area
    var plant_sign = req.body.plant_sign

    var pool =await db.poolPromise
    console.log("update plant set plant_name='"+plant_name+"', pl = '"+pl+"', addr = '"+address+"', locatn = '"+location+"', personal_area = "+personal_area+", payroll_area = "+payroll_area+" where  plant_code='"+plant_code+"'")
        var result = await pool.request()
          .query("update plant set plant_name='"+plant_name+"', pl = '"+pl+"',plant_sign = '"+plant_sign+"', addr = '"+address+"', locatn = '"+location+"', personal_area = "+personal_area+", payroll_area = "+payroll_area+" where  plant_code='"+plant_code+"'")
          res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getplant', verifyJWT,async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("SELECT p.plant_code, p.plant_name, p.pl, p.addr, p.locatn, p.personal_area, p.payroll_area, c.company_name,p.company_code FROM plant AS p JOIN master_company AS c ON p.company_code = c.company_code WHERE p.del_status = 0") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})




app.post('/adddepartment' ,verifyJWT, async(req,res)=>
{
  try{
      var plant_code = req.body.plant_name
      var department_name = req.body.dept_name
      var dept_group = req.body.dept_group
      var sap_code = req.body.sap_code
      var pool =await db.poolPromise

      // var result = await pool.request()
      //   .query("select plant_code from plant where plant_name = '"+plant_name+"'")
      // var plant_code = result['recordset'][0].plant_code

      result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("department_name", department_name)
                          .input("dept_group", dept_group)
                          .input("sap_code", sap_code)
                          .query("Insert into department values(@department_name, @plant_code, 1, @sap_code, @dept_group)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deletedepartment', verifyJWT,async(req,res)=>
{
  try{
  var dept_slno = req.body.slno
  var pool = await db.poolPromise
  console.log("update department set del_staus = '0' where dept_slno = "+dept_slno+" ")

  var result = await pool.request()
    .query("update department set del_staus = '0' where dept_slno = "+dept_slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updatedepartment',verifyJWT, async(req,res)=>{
  try{

    var plant_code = req.body.plant_name
    var department_name = req.body.dept_name
    var sap_code = req.body.sap_code
    var dept_slno = req.body.dept_slno
    var dept_group = req.body.dept_group

    var pool =await db.poolPromise

    var result = await pool.request()
      .query("update department set dept_name='"+department_name+"', sap_code = '"+sap_code+"', dept_group='"+dept_group+"' where  dept_slno='"+dept_slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getdepartment',verifyJWT, async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select department.dept_group, department.dept_slno, department.dept_name ,department.sap_code, plant.plant_name, department.plant_code from department join plant on department.plant_code = plant.plant_code where department.del_staus=1") 

  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/plantcode', verifyJWT,async(req,res)=>{
  console.log(req.body)
    var pool= await db.poolPromise
    var result =await pool.request()
      .query("select plant_name from plant where plant_code = '"+req.body.plantcode+"' ")
    res.send(result['recordset'])
})

app.post('/addline' ,verifyJWT, async(req,res)=>
{
  try{
    console.log(req.body)
      var line_name = req.body.Line_Name
      var dept_name = req.body.dept_name
      var personal_subarea = req.body.personal_subarea
      var created_by = req.body.created_by


      var pool =await db.poolPromise

      var plant_code = req.body.plant_name

      console.log(plant_code, req.body.plant_code)
      var result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("created_by", created_by)
                          .input("line_name", line_name)
                          .input("module_code", dept_name)
                          .input("personal_subarea", personal_subarea)
                          .query("Insert into mst_line values( @line_name, 1, @module_code, 'N', @plant_code,  @created_by, CURRENT_TIMESTAMP,null,null, @personal_subarea)")
        res.send({'message': 'inserted'})
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteline', verifyJWT,async(req,res)=>
{
  try{
  var line_code = req.body.slno
  var pool = await db.poolPromise
  console.log("update mst_line set del_status = 'Y' where line_code = "+line_code+" ")
  var result = await pool.request()
    .query("update mst_line set del_status = 'Y' where line_code = "+line_code+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/updateline',verifyJWT, async(req,res)=>{
  try{

    var line_code = req.body.Line_code
    var line_name = req.body.Line_Name
    var dept_name = req.body.dept_name
    var plant_code = req.body.plant_name
    var personal_subarea = req.body.personal_subarea
    var modified_by = req.body.modified_by

    var pool =await db.poolPromise

    console.log("  update mst_line set line_name='"+line_name+"' , shop_code=1  , personal_subarea='"+personal_subarea+"', modifiedby = '"+modified_by+"', modifieddt = CURRENT_TIMESTAMP where  line_code='"+line_code+"'")

    var result = await pool.request()
      .query("  update mst_line set line_name='"+line_name+"' , shop_code=1  , personal_subarea='"+personal_subarea+"', modifiedby = '"+modified_by+"', modifieddt = CURRENT_TIMESTAMP where  line_code='"+line_code+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getline',verifyJWT, async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("SELECT mst_line.Line_code, mst_line.module_code, plant.plant_name, plant.plant_code, department.dept_name, mst_line.Line_Name, mst_line.personal_subarea, CONVERT(varchar(10), mst_line.createddt, 120) AS Created_Date, mst_line.Created_By, CONVERT(varchar(10), mst_line.modifieddt, 120) AS Modified_Date, mst_line.modifiedby FROM mst_line JOIN plant ON mst_line.plant_code = plant.plant_code JOIN department ON mst_line.Module_code = department.dept_slno AND mst_line.del_status = 'N';")
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/adddesignation' , verifyJWT,async(req,res)=>
{
  try{
      var plant_code = req.body.plant_name
      var desig_name = req.body.desig_name

      var pool =await db.poolPromise

      // var result = await pool.request()
      //   .query("select plant_code from plant where plant_name = '"+plant_name+"'")
      // var plant_code = result['recordset'][0].plant_code

      result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("desig_name", desig_name)
                          .query("Insert into designation values(@desig_name, @plant_code, 0)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deletedesignation',verifyJWT, async(req,res)=>
{
  try{
  var slno = req.body.slno
  var pool = await db.poolPromise

  var result = await pool.request()
    .query("update designation set del_status = '1' where slno = "+slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updatedesignation',verifyJWT, async(req,res)=>{
  try{
    console.log(req.body)

    var plant_code = req.body.plant_name
    var desig_name = req.body.desig_name
    var slno = req.body.slno

    var pool =await db.poolPromise

    // var result = await pool.request()
    // .query("select plant_code from plant where plant_name = '"+plant_name+"'")
    // var plant_code = result['recordset'][0].plant_code

    var result = await pool.request()
      .query("  update designation set plant_code = '"+plant_code+"' , desig_name='"+desig_name+"' where  slno='"+slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getdesignation', verifyJWT,async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select designation.slno, designation.desig_name, plant.plant_name, plant.plant_code from designation join plant on designation.plant_code = plant.plant_code where designation.del_status = 0") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/addbank' ,verifyJWT, async(req,res)=>
{
  try{
      var bank_code = req.body.bank_code
      var bank_name = req.body.bank_name

      console.log(req.body)

      var pool =await db.poolPromise
      var result = pool.request()
                        .input("bank_code", bank_code)
                        .query("select * from bank where bank_code=@bank_code")
      if (result['recordset']?.length > 0)
      res.send({'message': 'already'})
    else
      {
      result = await pool.request()
                          .input("bank_code", bank_code)
                          .input("bank_name", bank_name)
                          .query("Insert into bank values(@bank_name, @bank_code, 1)")
        res.send({'message': 'inserted'})
      }
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deletebank', verifyJWT,async(req,res)=>
{
  try{
    console.log(req.body)
  var slno = req.body.Slno
  var pool = await db.poolPromise
  console.log("update bank set del_status = '0' where slno = "+slno+" ")
  var result = await pool.request()
    .query("update bank set del_status = '0' where slno = "+slno+" ")

  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updatebank',verifyJWT, async(req,res)=>{
  try{

    var bank_code = req.body.bank_code
    var bank_name = req.body.bank_name
    var slno = req.body.Slno

    var pool =await db.poolPromise
    console.log("update bank set bank_code = '"+bank_code+"' , bank_name='"+bank_name+"' where  slno= "+slno+" ")

    var result = await pool.request()
      .query("update bank set bank_code = '"+bank_code+"' , bank_name='"+bank_name+"' where  slno="+slno+" ")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getbank',verifyJWT, async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from bank where del_status = 1") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/addoperation' ,verifyJWT,async(req,res)=>
{
  try{
      var oprn_desc = req.body.oprn_desc
      var plant_code = req.body.plant_name
      var skill_level = req.body.skill_level
      var critical_oprn = req.body.critical_oprn

      if (critical_oprn== 'NO' ){
        critical_oprn = 0;
      }
      else{
        critical_oprn = 1;
      }
      var pool =await db.poolPromise

     console.log("Insert into operations values('"+plant_code+"', '"+req.body.oprn_desc+"','N', 0, '"+skill_level+"', '"+critical_oprn+"')")

      
      var result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("oprn_desc", oprn_desc)
                          .input("skill_level", skill_level)
                          .input("critical_oprn", critical_oprn)
                          .query("Insert into operations values(@plant_code, @oprn_desc,'N', 0, @skill_level, @critical_oprn)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/updateoperation', verifyJWT,async(req,res)=>{
  try{

    var oprn_desc = req.body.oprn_desc
    var plant_code = req.body.plant_name
    var skill_level = req.body.skill_level
    var critical_oprn = req.body.critical_oprn
    var oprn_slno = req.body.oprn_slno

    if (critical_oprn== 'NO' ){
      critical_oprn = 0;
    }
    else{
      critical_oprn = 1;
    }

    var pool =await db.poolPromise

      console.log(" update operations oprn_desc='"+oprn_desc+"' , skill_level='"+skill_level+"' , critical_oprn='"+critical_oprn +"' where  oprn_slno='"+oprn_slno+"'")

    var result = await pool.request()
      .query(" update operations set oprn_desc='"+oprn_desc+"' , skill_level='"+skill_level+"' , critical_oprn='"+critical_oprn +"' where  oprn_slno='"+oprn_slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getoperation',verifyJWT, async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("SELECT operations.oprn_slno, plant.plant_name, operations.oprn_desc, operations.del_status, operations.line_code, operations.skill_level, operations.critical_oprn, operations.plant_code FROM operations JOIN plant ON operations.plant_code = plant.plant_code WHERE operations.del_status = 'N';    ") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

///////////////////////////////////////////////////////////////////////////////////////plant admin


app.post('/getoperationPlant',verifyJWT, async(req,res)=>{
  try
  {
  var plant_code = req.body.plant_code
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select operations.*, plant.plant_name from operations join plant on operations.plant_code = plant.plant_code  where operations.del_status = 'N' and operations.plant_code = '"+plant_code+"' ") 
  res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})



///////////////////////////////////////////////////////////////////////////////////////

app.post('/deleteoperation',verifyJWT, async(req,res)=>
{
  try{
  var oprn_slno = req.body.slno
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("update operations set del_status = 'Y' where oprn_slno = "+oprn_slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/addemployee' ,verifyJWT, async(req,res)=>
{
  try{
    console.log(req.body)
    var gen_id = req.body.gen_id
    var emp_name = req.body.Emp_Name
    var department = req.body.dept_name
    var designation = req.body.desig_name
    var mail_id = req.body.Mail_Id
    var mobile_no = req.body.Mobile_No
    var user_name = req.body.User_Name
    var password = req.body.Password
    var is_hr = req.body.Is_HR
    var is_hrappr = req.body.Is_HRAppr
    var is_trainer = req.body.Is_Trainer
    var is_supervisor = req.body.Is_Supervisor
    var is_reportingauth = req.body.Is_ReportingAuth
    var is_admin = req.body.is_admin
    var is_tou = req.body.Is_TOU
    var access_master = req.body.access_master
    var plant_name = req.body.plant_name
    var line = req.body.Line_Name

      var pool =await db.poolPromise

    //   var result2 =await pool.request()
    //   .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
    //  var plant_code = result2['recordset'][0].plant_code

    //  var result3 =await pool.request()
    //  .query("select line_code from mst_line where line_name = '"+line+"' and plant_code = '"+plant_code+"' ")
    // var line_code = result3['recordset'][0].line_code

    // var result4 =await pool.request()
    // .query("select dept_slno from department where dept_name = '"+department+"' and plant_code = '"+plant_code+"' ")
    // var dept_slno = result4['recordset'][0].dept_slno
  
    // var result5 =await pool.request()
    // .query("select slno from designation where desig_name = '"+designation+"' and plant_code = '"+plant_code+"' ")
    // var slno = result5['recordset'][0].slno

      var result = await pool.request()
      .query("select user_name from employees where user_name = '"+user_name+"' ")
      
      if(result['recordset'].length > 0)
        res.send({'message': 'already'})
      else
      {
      result = await pool.request()
        .input("gen_id", gen_id)
        .input("emp_name", emp_name)
        .input("department", department)
        .input("designation", designation)
        .input("mail_id", mail_id)
        .input("mobile_no", mobile_no)
        .input("user_name", user_name)
        .input("password", password)
        .input("is_hr", is_hr)
        .input("is_hrappr", is_hrappr)
        .input("is_trainer", is_trainer)
        .input("is_supervisor", is_supervisor)
        .input("is_reportingauth", is_reportingauth)
        .input("is_tou", is_tou)
        .input("access_master", access_master)
        .input("plant_code", plant_name)
        .input("line_code", line)
        .input("is_admin", is_admin)

        .query("Insert into employees values(@gen_id, @emp_name,@department, @designation, @mail_id, @mobile_no, @user_name, @password,@is_admin,@access_master,0,@is_supervisor,0,@plant_code,0,'N', @is_hr,@is_trainer,@is_hrappr, @is_reportingauth, @is_tou,@line_code)")
      res.send({'message': 'inserted'})
      }

  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteemployee', verifyJWT,async(req,res)=>
{
  try{
  var empl_slno = req.body.empl_slno
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("update employees set del_status = 'Y' where empl_slno = "+empl_slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updateemployee',verifyJWT, async(req,res)=>{
  try{


    console.log("--------",req.body)

    var gen_id = req.body.gen_id
    var emp_name = req.body.Emp_Name
    var department = req.body.dept_name
    var designation = req.body.desig_name
    var mail_id = req.body.Mail_Id
    var mobile_no = req.body.Mobile_No
    var user_name = req.body.User_Name
    var password = req.body.Password
    var is_hr = req.body.Is_HR
    var is_hrappr = req.body.Is_HRAppr
    var is_trainer = req.body.Is_Trainer
    var is_supervisor = req.body.Is_Supervisor
    var is_reportingauth = req.body.Is_ReportingAuth
    var is_admin = req.body.is_admin
    var is_tou = req.body.Is_TOU
    var access_master = req.body.access_master
    var plant_name = req.body.plant_name
    var line = req.body.Line_Name


  var pool =await db.poolPromise

  //   var result2 =await pool.request()
  //   .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
  //  var plant_code = result2['recordset'][0].plant_code

  //  console.log("select line_code from mst_line where line_name = '"+line+"' ")

  //  var result3 =await pool.request()
  //  .query("select line_code from mst_line where line_name = '"+line+"' ")
  // var line_code = result3['recordset'][0].line_code

  // var result4 =await pool.request()
  // .query("select dept_slno from department where dept_name = '"+department+"' and plant_code = '"+plant_code+"' ")
  // var dept_slno = result4['recordset'][0].dept_slno

  // var result5 =await pool.request()
  // .query("select slno from designation where desig_name = '"+designation+"' ")
  // var slno = result5['recordset'][0].slno

  // console.log(plant_code, line_code, dept_slno, slno)

    var result = await pool.request()
      .query("update employees set line_code='"+line+"' , is_tou='"+is_tou+"' , access_master='"+access_master+"' ,is_admin = '"+is_admin+"' ,  is_reportingauth='"+is_reportingauth+"' , is_supervisor='"+is_supervisor+"' , is_trainer='"+is_trainer+"' , is_hrappr='"+is_hrappr+"' , is_hr='"+is_hr+"' , password='"+password+"' , user_name='"+user_name+"' , mobile_no='"+mobile_no+"' , mail_id='"+mail_id+"' , designation='"+designation+"' , emp_name='"+emp_name+"' , department='"+department+"' where  gen_id='"+gen_id+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getemployee', verifyJWT,async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("SELECT e.empl_slno, e.gen_id, e.Emp_Name, l.Line_Name, d.dept_name, p.plant_name, dd.desig_name, e.Mail_Id, e.Mobile_No, e.User_Name, e.Password, e.is_admin, e.access_master, e.Is_Operator, e.Is_Supervisor, e.Is_Inspector, e.plant_code, e.is_trainee, e.Del_Status, e.Is_HR, e.Is_Trainer, e.Is_HRAppr, e.Is_ReportingAuth, e.Is_TOU, e.line_code, e.Department, e.Designation FROM employees AS e JOIN plant AS p ON e.plant_code = p.plant_code JOIN mst_line AS l ON e.line_code = l.line_code JOIN department AS d ON e.Department = d.dept_slno JOIN designation AS dd ON e.Designation = dd.slno WHERE e.del_status = 'N';    ") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})



app.post('/addshift' ,verifyJWT, async(req,res)=>
{
  try{
      var shift_desc = req.body.shift_desc
      var in_tm_min = req.body.in_tm_min
      var act_tm_from = req.body.act_tm_from
      var in_tm_max = req.body.in_tm_max
      var act_tm_to = req.body.act_tm_to
      var type = req.body.type
      var shift_group = req.body.shift_group
      var security_shift = req.body.security_shift
      var plant_code = req.body.plant_code
      var plant_desc = req.body.plant_desc

      var pool =await db.poolPromise
      
      result = await pool.request()
                          .input("shift_desc", shift_desc)
                          .input("in_tm_min", in_tm_min)
                          .input("act_tm_from", act_tm_from)
                          .input("in_tm_max", in_tm_max)
                          .input("act_tm_to", act_tm_to)
                          .input("type", type)
                          .input("shift_group", shift_group)
                          .input("security_shift", security_shift)
                          .input("plant_code", plant_code)
                          .input("plant_desc", plant_desc)
                          .input("coff", req.body.coff_eligible_hours)
                          .query("Insert into mst_defaultshift values((SELECT max(shift_id) FROM mst_defaultshift) + 1, @shift_desc, @in_tm_min,@act_tm_from, @in_tm_max, @act_tm_to, @type, @shift_group, 1 ,@security_shift,@plant_code, @plant_desc, 'N', @coff)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteshift', verifyJWT,async(req,res)=>
{
  try{
  var shift_id = req.body.slno
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("update mst_defaultshift set del_status = 'Y' where shift_id = "+shift_id+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updateshift',verifyJWT, async(req,res)=>{
  try{
    var shift_desc = req.body.shift_desc
    var in_tm_min = req.body.in_tm_min
    var act_tm_from = req.body.act_tm_from
    var in_tm_max = req.body.in_tm_max
    var act_tm_to = req.body.act_tm_to
    var type = req.body.type
    var shift_group = req.body.shift_group
    var plant_id = req.body.plant_id
    var security_shift = req.body.security_shift
    var plant_code = req.body.plant_code
    var plant_desc = req.body.plant_desc
    var shift_id = req.body.shift_id
    var coff = req.body.coff_eligible_hours

    var pool =await db.poolPromise
    var result = await pool.request()
      .query("update mst_defaultshift set plant_code = '"+plant_code+"' , shift_desc='"+shift_desc+"' , in_tm_min='"+in_tm_min+"' , act_tm_from='"+act_tm_from+"' , in_tm_max='"+in_tm_max+"' , act_tm_to='"+act_tm_to+"' , type='"+type+"' , shift_group='"+shift_group+"' , plant_id=2 , security_shift='"+security_shift+"' , plant_desc='"+plant_desc+"' where  shift_id='"+shift_id+"' ")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getshift', verifyJWT,async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from mst_defaultshift where del_status = 'N'") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})
app.post('/eval_pending_approval', async(req,res)=>{
  try
  {
    console.log(req.body);
    var pool = await db.poolPromise
    var start = req.body.status.split('-')[0]
    var end = req.body.status.split('-')[1]
    var plant_code = req.body.plantcode

    if(end == 60)
      count = 1
    else if(end == 120)
      count = 2
    else if(end == 180)
      count = 3
    else if(end == 270)
      count = 4

    console.log(count)
    
    var result = await pool.request()
      .query("WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.*,e.Emp_Name, DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as diff,d.dept_name, l.line_name FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code JOIN employees e on t.reporting_to = e.empl_slno WHERE cte.record_count  = '"+count+"' and apln_status = 'APPOINTED' AND t.apln_slno IN (SELECT apln_slno FROM post_evaluation WHERE ra_entry = 'N') AND t.plant_code = '"+plant_code+"' ")  

    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/evaluationdays',verifyJWT, async(req,res)=>{
  try
  {
    var count;
  console.log(req.body);
  var pool = await db.poolPromise
  var start = req.body.status.split('-')[0]
  var end = req.body.status.split('-')[1]
  var id = req.body.id
  var emp_id = req.body.emp_id
  var filter = req.body.filter
  var plant_code = req.body.plantcode

  if(id==2 || (id==1 && filter == 'APPROVED'))
  {
    if(end == 60)
      count = 1
    else if(end == 120)
      count = 2
    else if(end == 180)
      count = 3
    else if(end == 270)
      count = 4
  }
  else if(id==3 | id==1)
  {
  {
    if(end == 60)
      count = 0
    else if(end == 120)
      count = 1
    else if(end == 180)
      count = 2
    else if(end == 270)
      count = 3
  }
  }
  if (id==2)
  {
    console.log(1)
    var result = await pool.request()
    .query("EXEC POST_EVALUATION_LIST_SUP @start= "+start+" , @end = "+end+" , @count = "+count+", @emp_id = '"+emp_id+"' ")

  }
  else if(id==1 && count == 0) 
  {
    console.log(2)
    if(filter == undefined || filter == 'undefined' || filter == 'PENDING')
    {
      var result = await pool.request()
      .query("EXEC POST_EVALUATION_LIST_HR_BASIC @plant_code = "+plant_code+" ")  
    }
    else if(filter == 'APPROVED')
    {
      var result = await pool.request()
      .query("exec POST_EVALUATION_LIST_HR_FILTER @start= "+start+" , @end = "+end+", @count="+count+", @plant_code = '"+plant_code+"' ")
    }
  }
  else if(id==3)
  {
    console.log(3)
    var result = await pool.request()
    .query(" EXEC POST_EVALUATION_LIST_DUE @plant_code = '"+plant_code+"' ")    

  }
  else
  {
    console.log(3, count)
    if(filter == undefined || filter == 'undefined' || filter == 'PENDING')
    {
      var result = await pool.request()
      .query(" EXEC POST_EVALUATION_LIST_HR @start= "+start+" , @end = "+end+" , @count = "+count+", @plant_code = '"+plant_code+"' ")    
    }
    else if(filter == 'APPROVED')
    {
      var result = await pool.request()
      .query(" EXEC POST_EVALUATION_LIST_HR_FILTER @start= "+start+" , @end = "+end+" , @count = "+count+", @plant_code = '"+plant_code+"' ")    
    }

  }
  
  res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.get('/evaluationDueSupervisor', verifyJWT, async(req, res)=>
{
  try
  {
    var pool = await db.poolPromise
    var plantcode = req.query.plantcode
    var dept_slno = req.query.dept_slno

    var result = await pool.request()
    .query(" EXEC POST_EVALUATION_LIST_SUP_DUE @plant_code = '"+plantcode+"', @dept_slno = "+dept_slno+" ")    
    res.send(result['recordset'])

  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"evaluationDueSupervisor_failure"})
  }
})


app.post('/depttransfer',verifyJWT, async(req, res)=>{
  try
  {
    var pl = req.body.plantcode

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select * from trainee_apln where apln_status = 'APPOINTED' and test_status = 'completed' and plant_code = '"+pl+"' and gen_id is not null ")
    
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})
app.post('/onboard',verifyJWT, async(req, res)=>{
  try
  {
    var pl = req.body.plantcode
    var select = req.body.select

    console.log("select * from trainee_apln where apln_status = 'APPROVED' and test_status = 'COMPLETED' and plant_code = '"+pl+"' ")


    var pool = await db.poolPromise
    if(select == 'TRAINING COMPLETED')
    {
      var result = await pool.request()
      .query("select * from trainee_apln where apln_status = 'APPROVED' and test_status = 'COMPLETED' and plant_code = '"+pl+"' order by apln_slno desc ")
    }
    else
    {
      var result = await pool.request()
      .query("select * from trainee_apln where apln_status = 'APPOINTED' and plant_code = '"+pl+"' order by apln_slno desc ")
    }

    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/dept-line',verifyJWT, async(req, res)=>{
  try
  {
    console.log(req.body)
    var line = req.body.line_code
    var dept = req.body.dept_slno
    var slno = req.body.apln_slno

    var pool = await db.poolPromise
    console.log("select emp_name from employees where empl_slno = (select reporting_to from trainee_apln where gen_id = "+slno+") ")

    var result = await pool.request()
      .query("select dept_name from department where dept_slno ="+dept+" ")
    var result1 = await pool.request()
      .query("select line_name from mst_line where line_code ="+line+" ")
    var result2 = await pool.request()
      .query("select emp_name from employees where empl_slno = (select reporting_to from trainee_apln where gen_id = '"+slno+"') ")
    
    var object = [];
    object[0] = result['recordset'][0]
    object[1] = result1['recordset'][0]
    object[2] = result2['recordset'][0]


    res.send(object)
  }
    catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/dept-line-report',verifyJWT, async(req,res)=>
{
  try
  {
  var pool =await db.poolPromise

  var plantcode = req.body.plantcode

  console.log(plantcode)

    var result = await pool.request()
    .query("select empl_slno, emp_name from employees where plant_code = '"+plantcode+"' and is_ReportingAuth = 1 ")

    var result2 = await pool.request()
    .query("select dept_slno, dept_name from department where plant_code = '"+plantcode+"' and del_staus = 1 ")

    var result3 = await pool.request()
    .query("select line_code,line_name from mst_line where plant_code = '"+plantcode+"' and del_status = 'N'  ")
  
    var object = []
    object[0] = result['recordset']
    object[1] = result2['recordset']
    object[2] = result3['recordset']
    
  res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}) ;

app.post('/getLineName', verifyJWT,async(req,res)=>
{
  try
  {
  var pool =await db.poolPromise

  var dept_slno = req.body.dept_slno
  console.log(req.body)
    var result2 = await pool.request()
    .query("select empl_slno, emp_name from employees where Department = '"+dept_slno+"'  and is_ReportingAuth = 1 ")

    var result = await pool.request()
    .query("select convert(INT, line_code) as line_code, line_name from mst_line where module_code = '"+dept_slno+"' and del_status = 'N'  ")
  
    var object = []
    object[0] = result['recordset']
    object[1] = result2['recordset']
    
  res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}) ;


app.post('/reporting',verifyJWT, async(req, res)=>{

  try{
    console.log(req.body)/dept
  var pool =await db.poolPromise
  var gen_id = req.body.apln_slno
  var dept = req.body.changedepartment
  var line = req.body.changeline
  var RA = req.body.reportingto
  var pl = req.body.plantcode

  console.log("update trainee_apln set dept_slno ='"+dept+"', line_code= '"+line+"', reporting_to = "+RA+" where gen_id ='"+gen_id+"'  ")


  var result = await pool.request()
    .query("update trainee_apln set dept_slno = '"+dept+"', line_code ='"+line+"', reporting_to = "+RA+" where gen_id ='"+gen_id+"'  ")

  res.send({message: 'success'})
  }
    catch(err)
    {
    console.log(err)
    res.send({"message":"failure"})
    }

})

app.post('/getonboard',verifyJWT, async(req,res)=>
{
  try
  {
  var pool =await db.poolPromise

  var apln_slno = req.body.apln_slno
  var readonly = req.body.readonly
  console.log(req.body)

  var plant = await pool.request()
    .query("select plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ")

  console.log("select  t.*, d.dept_name, l.line_name, e.emp_name from trainee_apln t join designation ds on t.desig_slno = ds.slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join employees e on t.reporting_to = e.empl_slno where apln_slno = '"+apln_slno+"' ")

  if(readonly)
  {
    var details = await pool.request()
    .query("select  t.*, d.dept_name, l.line_name, e.emp_name from trainee_apln t JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join employees e on t.reporting_to = e.empl_slno where apln_slno = '"+apln_slno+"' ")  
  }
  else
  {
    var details = await pool.request()
    .query("select fullname, trainee_idno, plant_code , ifsc_code, bank_name, bank_account_number, apln_slno from trainee_apln where apln_slno = '"+apln_slno+"' ")  

  }

  var details2 = await pool.request()
  .query("select o.oprn_desc from periodical_eval_operations p join operations o on p.oprn_slno = o.oprn_slno where apln_slno = '"+apln_slno+"' ")

  var plantcode = plant['recordset'][0].plant_code

  console.log(plantcode)

    var result = await pool.request()
    .query("select slno ,desig_name from designation where plant_code = '"+plantcode+"' and del_status = 0 ")

    var result2 = await pool.request()
    .query("select dept_slno, dept_name from department where plant_code = '"+plantcode+"' and del_staus = 1 ")

    var result3 = await pool.request()
    .query("select line_code, line_name from mst_line where plant_code = '"+plantcode+"' and del_status = 'N' ")
  
    var result4 = await pool.request()
    .query("select oprn_slno, oprn_desc from operations where plant_code = '"+plantcode+"' and del_status = 'N' ")

    var result5 = await pool.request()
    .query("select empl_slno, emp_name from employees where plant_code = '"+plantcode+"' and is_ReportingAuth = 1 ")

    var result6 = await pool.request()
    .query("select categorynm, file_drop from category")


    var object = []
    object[0] = details['recordset']
    object[1] = result['recordset']
    object[2] = result2['recordset']
    object[3] = result3['recordset']
    object[4] = result4['recordset']
    object[5] = result5['recordset']
    object[6] = result6['recordset']
    object[7] = details2['recordset']

  res.send(object)
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}) ;

app.post('/get_eval_form',verifyJWT, async(req,res)=>
{
  try{
  var pool =await db.poolPromise

  var apln_slno = req.body.apln_slno

  console.log("select t.*, d.dept_name, l.line_name, ds.desig_name, p.new_level from trainee_apln t join department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join designation ds on t.desig_slno = ds.slno join periodical_eval_level p on t.apln_slno = p.apln_slno where t.apln_slno = '"+apln_slno+"' ")

  var details = await pool.request()
    .query("select t.*, d.dept_name, l.line_name,p.new_level from trainee_apln t join department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join periodical_eval_level p on t.apln_slno = p.apln_slno where t.apln_slno = '"+apln_slno+"' ")

    
    var result1 = await pool.request()
    .query("select o.oprn_desc from periodical_eval_operations p join operations o on p.oprn_slno = o.oprn_slno where p.apln_slno = '"+apln_slno+"' ")

  var plantcode = details['recordset'][0].plant_code

  console.log("-------------------------------",plantcode)

    var result2 = await pool.request()
    .query("select dept_name, dept_slno from department where plant_code = '"+plantcode+"' and del_staus = 1")

    var result3 = await pool.request()
    .query("select line_name from mst_line where plant_code = '"+plantcode+"' and del_status = 'N' ")
  
    var result4 = await pool.request()
    .query("select oprn_desc from operations where plant_code = '"+plantcode+"' and del_status = 'N' ")
  
    var object = []
    object[0] = details['recordset']
    object[1] = result1['recordset']
    object[2] = result2['recordset']
    object[3] = result3['recordset']
    object[4] = result4['recordset']


  res.send(object)
  }
  catch(err)
  {
    res.send({message:'failure'})
    console.log(err)
  }

}) ;

app.post('/eval_form',verifyJWT, async(req, res)=>
{
  try{

    var department = req.body.department
    var evaluation_date = req.body.evaluation_date
    var line = req.body.line
    var new_skill = req.body.new_skill
    var percentage = req.body.percentage
    var process_trained = []
    process_trained = req.body.process_trained
    var score_for = req.body.score_for
    var score_obtained = req.body.score_obtained
    var apln_slno = req.body.apln_slno
    var plant_code = req.body.plantcode
    var eval_days = req.body.eval_days
    var emp_slno = req.body.emp_slno
    var emp_name = req.body.emp_name
    var line_name = req.body.line_name
    var upload_file = req.body.upload_file

    console.log(process_trained)


    console.log("update periodical_eval set tre_eval_date = '"+evaluation_date+"', tre_filename = '"+upload_file+"', tre_submitted = 1,tnr_name = '"+emp_name+"',tnr_eval_date = '"+evaluation_date+"', tnr_filename = '"+upload_file+"', tnr_submitted = 1, tnr_numerator = '"+score_obtained+"' , tnr_denominator= '"+score_for+"', tnr_new_skill= '"+percentage+"',sup_numerator = '"+score_obtained+"' , sup_denominator= '"+score_for+"', sup_new_skill= '"+percentage+"' where apln_slno = '"+apln_slno+"'  ")
    console.log("update periodical_eval_level set new_level = '"+new_skill+"' where apln_slno = '"+apln_slno+"'")
    console.log("insert into periodical_eval_operations values( (select top 1 peval_slno from periodical_eval where apln_slno = '"+apln_slno+"' and plant_code = '"+plant_code+"' ) , (select oprn_slno from operations where oprn_desc = '"+process_trained[i]+"' ) , 1, '"+apln_slno+"')  ")
    console.log("insert into post_evaluation(plant_code, evaluation_days, apln_slno, line_name, evaluator_slno, evaluation_datetime, total_marks, pass_fail, HR_Entry, HR, HR_Date) values('"+plant_code+"','"+eval_days+"','"+apln_slno+"','"+line_name+"','"+emp_slno+"','"+evaluation_date+"','"+score_obtained+"','pass','Y','"+emp_slno+"','"+evaluation_date+"') ")

    var pool = await db.poolPromise

    var result = await pool.request()
      .query("update periodical_eval set tre_eval_date = '"+evaluation_date+"', tre_filename = '"+upload_file+"', tre_submitted = 1,tnr_name = '"+emp_name+"',tnr_eval_date = '"+evaluation_date+"', tnr_filename = '"+upload_file+"', tnr_submitted = 1, tnr_numerator = '"+score_obtained+"' , tnr_denominator= '"+score_for+"', tnr_new_skill= '"+percentage+"',sup_numerator = '"+score_obtained+"' , sup_denominator= '"+score_for+"', sup_new_skill= '"+percentage+"' where apln_slno = '"+apln_slno+"'  ")

      var result3 = await pool.request()
      .query("update periodical_eval_level set new_level = '"+new_skill+"' where apln_slno = '"+apln_slno+"'")

      for(var i=0; i< process_trained.length; i++)
      {
        var result4 = await pool.request()
        .query("insert into periodical_eval_operations values( (select top 1 peval_slno from periodical_eval where apln_slno = '"+apln_slno+"') , (select oprn_slno from operations where oprn_desc = '"+process_trained[i]+"' ) , 1, '"+apln_slno+"')  ")
      }

    var insert = await pool.request()
      .query("insert into post_evaluation(plant_code, evaluation_days, apln_slno, line_name, evaluator_slno, evaluation_datetime, total_marks, pass_fail, HR_Entry, HR, HR_Date) values('"+plant_code+"','"+eval_days+"','"+apln_slno+"','"+line_name+"','"+emp_slno+"','"+evaluation_date+"','"+score_obtained+"','pass','Y','"+emp_slno+"','"+evaluation_date+"') ")
    res.send({message: "success"})
  }
  catch(err)
  {
    res.send({message: "failure"})
    console.log(err)
  }
})

app.post('/get_eval_sup',verifyJWT, async(req, res)=>
{
  try
  {
    var apln_slno = req.body.apln_slno
    console.log("select top 1 p.*, d.dept_name from periodical_eval_dept p join department d on p.new_dept_slno = d.dept_slno where apln_slno = '"+apln_slno+"'")


    var pool = await db.poolPromise
    var result1 = await pool.request()
      .query("select top 1 pe_slno, line_name from post_evaluation where apln_slno = '"+apln_slno+"' order by pe_slno desc ")
    var result2 = await pool.request()
      .query("select top 1 * from periodical_eval where apln_slno = '"+apln_slno+"' ")
    var result3 = await pool.request()
      .query("select top 1 d.dept_name from periodical_eval_dept p join department d on p.new_dept_slno = d.dept_slno where apln_slno = '"+apln_slno+"'")
    var result4 = await pool.request()
      .query("select o.oprn_desc from periodical_eval_operations p join operations o on p.oprn_slno = o.oprn_slno where apln_slno = '"+apln_slno+"' ")
    var result5 = await pool.request()
      .query("select top 1 new_level from periodical_eval_level where apln_slno = '"+apln_slno+"' ")

    var object = []
    object[0] = result2['recordset']
    object[1] = result1['recordset']
    object[2] = result3['recordset']
    object[3] = result4['recordset']
    object[4] = result5['recordset']

    res.send(object)

  }
  catch(err)
  {
    res.send({message: "failure"})
    console.log(err)
  }
})

app.post('/eval_form_sup',verifyJWT, async(req,res)=>
{
  try
  {
  var file = req.body.upload_file
  var pe_slno = req.body.upload_file
  var emp = req.body.emp_slno

  var pool = await db.poolPromise
  var result = await pool.request()
  .query("update periodical_eval set sup_filename = '"+file+"', eval_status = 'EVALUATION_COMPLETED' where apln_slno = '"+req.body.apln_slno+"' ")

  var result =  await pool.request()
  .query("update post_evaluation set RA_Entry = 'Y', RA = '"+emp+"', ra_date = CURRENT_TIMESTAMP where apln_slno = '"+req.body.apln_slno+"'")

  res.send({message: 'success'})
  }
  catch(err)
  {
    res.send({message: "failure"})
    console.log(err)
  }
})

app.post('/onboard_form', verifyJWT,async(req, res)=>{

  try{
    console.log(req.body)
  var plantcode = req.body.plantcode
  var grade = req.body.grade
  var dept= req.body.department
  var doj= req.body.doj
  var active_status= req.body.active_status
  var line= req.body.line
  var bio_id= req.body.bio_id
  var bio_no= req.body.bnum
  var process_trained = []
  process_trained= req.body.process_trained
  var uan = req.body.uan
  var id= req.body.trainee_id
  var reporting_to= req.body.reportingto
  var work_contract= req.body.wcontract
  var designation= req.body.designation
  var apln_slno = req.body.apln_slno
  var category = req.body.category
  var ifsc_code = req.body.ifsc_code
  var account_number = req.body.account_number
  var bank_name = req.body.bank_name


  if(active_status == undefined)
    active_status = 'ACTIVE'
  else
    active_status = 'INACTIVE'
    

  if(bio_id == 'true')
    bio_id = 1
  else
    bio_id= 0

    console.log("EXEC onboard @plantcode = '"+plantcode+"' ,  @grade = "+grade+" , @bio_id = 1 , @dept  = '"+dept+"', @doj = '"+doj+"', @active_status = '"+active_status+"', @line = '"+line+"', @bio_no = "+bio_no+", @uan = '"+uan+"', @gen_id  = '"+id+"', @reporting_to = '"+reporting_to+"', @apln_slno= "+apln_slno+", @category = '"+category+"' ")


  var pool = await db.poolPromise
  var result = await pool.request()
    .query("EXEC onboard @plantcode = '"+plantcode+"' ,  @grade = "+grade+" , @bio_id = 1 , @dept  = '"+dept+"', @doj = '"+doj+"', @active_status = '"+active_status+"', @line = '"+line+"', @bio_no = "+bio_no+", @uan = '"+uan+"', @gen_id  = '"+id+"', @reporting_to = '"+reporting_to+"', @apln_slno= "+apln_slno+", @category = '"+category+"', @ifsc_code = '"+ifsc_code+"', @account_number = '"+account_number+"', @bank_name = '"+bank_name+"' ")
    console.log(process_trained)
    for(var i =0; i<process_trained.length; i++)
    {
      var pt = await pool.request()
      .query("insert into periodical_eval_operations values( (select top 1 peval_slno from periodical_eval where apln_slno = "+apln_slno+" ), (select top 1 oprn_slno from operations where oprn_desc = '"+process_trained[i]+"'  and plant_code = '"+plantcode+"' ),1, "+apln_slno+"  ) ")  
    }

  res.send({message : "success"})
  }
  catch(err)
  {
    res.send({message: "failure"})
    console.log(err)
  }
})

app.post('/relieve',verifyJWT, async(req,res)=>
{

  try{
  var apln_slno = req.body.apln_slno
  var rfr = req.body.rfr
  var dol = req.body.dol
  var active_status = req.body.active_status

  var pool = await db.poolPromise
  var result = await pool.request()
    .query(" update trainee_apln set dol = '"+dol+"', apln_status ='RELIEVED', activestat = '"+active_status+"' where apln_slno = '"+apln_slno+"' ")
  res.send({message:'success'})
  }
  catch(err)
  {
    res.send({message: "failure"})
    console.log(err)
  }
})

app.post('/trainee-report',verifyJWT, async(req,res)=>
{
  try
  {

  var fromdate = req.body.fromDate
  var todate = req.body.toDate
  var plantcode = req.body.plantcode

  let pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from trainee_apln where created_dt >= '"+fromdate+"' and created_dt <= '"+todate+"' and plant_code = '"+plantcode+"' ")
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}
)
app.post('/test-summary',verifyJWT, async(req,res)=>
{
  try
  {
    var fromdate = req.body.fromDate
    var todate = req.body.toDate
    var plantcode = req.body.plantcode


    console.log("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as pretraining-percent, sum(posttraining_percent)/count(*) as sum2 from test_result_summary where submission_date >= '"+fromdate+"' and submission_date <= '"+todate+"' group by fullname, trainee_idno  ")

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as pre_training_percent, sum(posttraining_percent)/count(*) as post_training_percent from test_result_summary where submission_date >= '"+fromdate+"' and submission_date <= '"+todate+"' and plant_code = '"+plantcode+"'  group by fullname, trainee_idno  ")
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }

}
)
app.post('/evaluation-due-report', verifyJWT,async(req,res)=>
{
  try
  {
    var fromdate = req.body.fromDate
    var todate = req.body.toDate
    var plant_code = req.body.plant_code

    var pool = await db.poolPromise
    var result = await pool.request()
    .query(" WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.trainee_idno, t.fullname, d.dept_name, l.line_name , DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as Aging,cte.record_count as evaluation_completed FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code and apln_status = 'APPOINTED' AND t.apln_slno IN (SELECT distinct apln_slno FROM post_evaluation WHERE ra_entry = 'Y' and HR_Entry = 'Y') where t.plant_code = '"+plant_code+"' and t.doj >= '"+fromdate+"' and t.doj <= '"+todate+"' ")
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }

}
)

app.post('/getfiledrop',verifyJWT, async(req,res)=>{

  var apln_slno = req.body.apln_slno
  
  try
  {
  let pool = await db.poolPromise
  var result = await pool.request()
    .query("EXEC FILEDROP @apln_slno = '"+apln_slno+"' ")
  res.send(result['recordset'])
}
catch(err)
{
  console.log(err)
  res.send({message:'failure'})
}
}
)

app.post('/people_planning',verifyJWT, async(req,res)=>{


  var pool = await db.poolPromise
  var plantcode = req.body.plantcode
  var year = req.body.year
  var month = req.body.month

  console.log(req.body)

  var result = await pool.request()
  .query("select p.plan_slno, p.plan_month, p.plan_year ,d.dept_group, d.dept_name, m.line_name,p.shift1_reqd, p.shift2_reqd, p.shift3_reqd, p.genl_reqd, p.total_reqd from people_planning p join department d on p.dept_slno = d.dept_slno join mst_line m on m.line_code = p.line_code where p.plant_code = '"+plantcode+"' and plan_year = "+year+" and plan_month = "+month+" ")
  if(result['recordset'].length == 0)
  {
    var result2 = await pool.request()
    .query("select d.dept_slno, m.line_code, m.line_name,d.dept_name, d.dept_group  from mst_line m join department d on m.module_code = d.dept_slno where m.plant_code = '"+plantcode+"' ")

    res.send(result2['recordset'])
  }
  else
  {
    res.send(result['recordset'])
  }
})

app.post('/people_planning_save', verifyJWT,async(req,res)=>{
try
{
   var pool = await db.poolPromise
   
   var details = req.body
   console.log(details[0])

   for(var i =0; i<details.length; i++)
   {
      var result = await pool.request()
      .input("plan_month", details[0].plant_month)
      .input("plan_year", details[0].plant_year)
      .input("plant_code", details[0].plant_code)
      .input("dept_slno", details[i].dept_slno)
      .input("line_code", details[i].line_code)
      .input("shift1_reqd", details[i].shift1)
      .input("shift2_reqd", details[i].shift2)
      .input("shift3_reqd", details[i].shift3)
      .input("genl_reqd", details[i].genl)
      .input("total_reqd", details[i].total)
      .input("created_by", details[0].created_by)
      // .input("modified_by", details[0].modified_by)
      // .input("modified_dt", details[0].modified_dt)
      // console.log("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values('"+details[0].plant_month+"', '"+details[0].plant_year+"', '"+details[0].plant_code+"', '"+details[i].dept_slno+"','"+details[i].line_code+"', '"+details[i].shift1_reqd+"', '"+details[i].shift2_reqd+"', '"+details[i].shift3_reqd+"', '"+details[i].genl_reqd+"', '"+details[i].total_reqd+"', '"+details[0].created_by+"', CURRENT_TIMESTAMP) ")
      .query("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code,oprn_slno, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values(@plan_month, @plan_year, @plant_code, @dept_slno,@line_code,23, @shift1_reqd, @shift2_reqd, @shift3_reqd, @genl_reqd, @total_reqd, @created_by, CURRENT_TIMESTAMP) ")

   }
    res.send({message: 'inserted'})
}
catch(err)
{
  console.log(err)
  res.send({message: 'failure'})
}

})

app.post('/people_planning_update', verifyJWT,async(req,res)=>{
try
{
   var pool = await db.poolPromise
   
   var details = req.body
   console.log(details)

   for(var i =0; i<details.length; i++)
   {
    if(details[i].shift1_reqd == null || details[i].shift1_reqd == undefined)
    {

    }
    else
    {
      var result = await pool.request()
      .input("plan_month", details[0].plant_month)
      .input("plan_year", details[0].plant_year)
      // .input("plant_code", details[0].plant_code)
      // .input("dept_slno", details[i].dept_slno)
      // .input("line_code", details[i].line_code)
      .input("shift1_reqd", details[i].shift1_reqd)
      .input("shift2_reqd", details[i].shift2_reqd)
      .input("shift3_reqd", details[i].shift3_reqd)
      .input("genl_reqd", details[i].genl_reqd)
      .input("total_reqd", details[i].total_reqd)
      .input("modified_by", details[0].created_by)
      // .input("modified_by", details[0].modified_by)
      // .input("modified_dt", details[0].modified_dt)
      // console.log("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values('"+details[0].plant_month+"', '"+details[0].plant_year+"', '"+details[0].plant_code+"', '"+details[i].dept_slno+"','"+details[i].line_code+"', '"+details[i].shift1_reqd+"', '"+details[i].shift2_reqd+"', '"+details[i].shift3_reqd+"', '"+details[i].genl_reqd+"', '"+details[i].total_reqd+"', '"+details[0].created_by+"', CURRENT_TIMESTAMP) ")
      .query("update people_planning set plan_month = @plan_month, plan_year =  @plan_year, shift1_reqd =  @shift1_reqd, shift2_reqd =  @shift2_reqd, shift3_reqd= @shift3_reqd , genl_reqd = @genl_reqd, total_reqd =@total_reqd, modified_by =  @modified_by, modified_dt = CURRENT_TIMESTAMP where plan_slno = "+details[i].plan_slno+" ")
    }

   }
    res.send({message: 'updated'})
}
catch(err)
{
  console.log(err)
  res.send({message: 'failure'})
}

})

app.post('/people-planning-report', verifyJWT,async(req, res)=>{

  var pool = await db.poolPromise
  var year = req.body.year
  var month = req.body.month
  var plant_code = req.body.plant_code;

  var result = await pool.request()
    .query("select * from people_planning")

})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '201501004@rajalakshmi.edu.in',
    pass: 'REC20209003'
  }
});

app.post('/submitted_mail',verifyJWT, async(req,res)=>{


  try
  {
  var plant_code = req.body.plant_code
  var mobile = req.body.mobile
  var company = req.body.company
 
  var pool = await db.poolPromise;
  console.log("select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"' and company_code =(select company_code from master_company where sno = '"+company+"')  ")

  var apln = await pool.request()
  .query("select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"' and company_code =(select company_code from master_company where sno = '"+company+"') ")

  var result = await pool.request()
  .query("select mail_id from employees where plant_code = '"+plant_code+"' and Is_HRAppr = 1 ")

  var mail = result['recordset'].map((a)=>a.mail_id)

  const mailOptions = {
    from: '201501004@rajalakshmi.edu.in',
    to: mail.join(','),
    subject: 'Application Process - DHRM',
    text: 'The application has been submitted for the application Number :'+apln['recordset'][0].apln_slno+'.Kindly Update the Application Status. '
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    } else {
      console.log('Email sent: ' + info.response);
      res.send({message:'Email sent'});
    }
  });
}
catch(err)
{
  console.log(err)
  res.send({message: 'mail not sent'})
}

})
app.post('/approved_mail',verifyJWT, async(req,res)=>{

try
{
  var plant_code = req.body.plant_code
  var mobile = req.body.mobile
  var company = req.body.company
 
  var pool = await db.poolPromise;

  var apln = await pool.request()
  .query("select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"' and company_code =(select company_code from master_company where sno = '"+company+"') ")

  var result = await pool.request()
  .query("select mail_id from employees where plant_code = '"+plant_code+"' and Is_HR = 1 ")

  var mail = result['recordset'].map((a)=>a.mail_id)

  const mailOptions = {
    from: '201501004@rajalakshmi.edu.in',
    to: mail.join(','),
    subject: 'Application Process - DHRM',
    text: 'The application has been Approved for the application Number :'+apln['recordset'][0].apln_slno+'.Kindly Update the Application Status. '
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    } else {
      console.log('Email sent: ' + info.response);
      res.send({message:'Email sent'});
    }
  });

  
}
catch(err)
{
  console.log(err)
  res.send({message: 'mail not sent'})
}

})

app.post('/evaluation_mail',verifyJWT, async(req,res)=>{

try
{
  var plant_code = req.body.plant_code

  var idno = req.body.idno

  var pool = await db.poolPromise;
  var result = await pool.request()
  .query(" select mail_id from employees where plant_code = '"+plant_code+"' and department = (select dept_slno from trainee_apln where trainee_idno = '"+idno+"' ) and line_code = (select line_code from trainee_apln where trainee_idno = '"+idno+"' ) ")

  var mail = result['recordset'].map((a)=>a.mail_id)

  // var mail2 = ['ahamedrmdind@gmail.com']

  if(mail.length == 0 )
  {
    res.send({message:'No email Found'}); 
  }
  else
  {
    const mailOptions = {
      from: '201501004@rajalakshmi.edu.in',
      to: mail.join(','),
      subject: 'Post Evaluation Process - DHRM',
      text: 'The Employess with id :'+idno+' has been Evaluated. Kindly Complete the Evaluation Process. '
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Internal server error');
      } else {
        console.log('Email sent: ' + info.response);
        res.send({message:'Email sent'});
      }
    });
  }


}
catch(err)
{
  console.log(err)
  res.send({message: 'mail not sent'})
}

})

module.exports = app;
