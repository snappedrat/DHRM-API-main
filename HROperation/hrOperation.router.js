const express = require('express')
const hrOperation = express.Router();
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
hrOperation.use(cors())
hrOperation.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
hrOperation.options('*', cors(corsOptions));

hrOperation.use(bodyParser.urlencoded({ extended: false }));
hrOperation.use(bodyParser.json());

//Get user details like access control for employees and department, plant details for trainee.
//Tables Used : employees, trainee_apln.
hrOperation.get('/gethrappr', async(req,res)=>{
    try{
    var user_name = req.query.username;
    var usertype = req.query.user;
  
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
  
  
  hrOperation.get('/getpincode',  async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var pincode = req.query.pincode
  
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
  
  hrOperation.get('/getaadhar', async(req,res)=>{
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
  
  hrOperation.get('/checkAadhar', async(req,res)=>{
    try
    {
    var aadhar = req.query.aadhar
    var mobile = req.query.mobile
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select mobile_no1 from trainee_apln where aadhar_no = '"+aadhar+"' ")
    
    if(result['recordset'].length == 0)
      res.send({mobile: 'null'})
    else
      res.send(result['recordset'][0])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })
  
  hrOperation.put('/basicforms', async(req,res,err)=>{
    
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
      var pres_city = req.body.pres_city
      var pres_state = req.body.pres_st
      var pres_pc = req.body.pres_pc
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
  
      console.log("update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+present+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' , blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion_sl = (select slno from religion where religion_name = '"+religion+"') , religion= '"+religion+"',  city = '"+city+"', state_name = '"+state+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', pres_pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where sno = "+company+") ")
    var result = await pool.request()
      .query("update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+present+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,  blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion_sl = (select slno from religion where religion_name = '"+religion+"'),religion= '"+religion+"',  city = '"+city+"', state_name = '"+state+"',  pres_city = '"+pres_city+"', pres_state_name = '"+pres_state+"', birth_place = '"+bp+"', pincode = '"+pc+"', pres_pincode = '"+pres_pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where sno = "+company+")  ")
    res.send({message:'success'})
  }
  
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  
  }
  );
  
  
  hrOperation.put('/bankforms',async(req,res)=>{
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
  
  
  hrOperation.get('/plantcodelist', async(req,res)=>
  {
    try
    {
      var pool = await db.poolPromise;
    var company_name = req.query.company_name
    var result = await pool.request()
      .query("select plant_name from plant where company_code =  (select top 1 company_code from master_company where sno = '"+company_name+"') and del_status= 0 ")
      res.send(result['recordset'])
    }
    catch(err)
    {
      console.log(err)
      res.send({message:'failure'})
    }
  }) ;

  hrOperation.get('/companycodelist', async(req,res)=>
{
  try
  {
    console.log(req.body);
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

hrOperation.post('/traineeformdata', async(req,res)=>
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

hrOperation.put('/emergency', async(req,res)=>{

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



hrOperation.get('/getbanknames', async(req,res)=>{

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

hrOperation.put('/lang', async(req,res)=>
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



hrOperation.put('/family',async(req,res)=>{

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



hrOperation.put('/edu', async(req,res)=>{

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


hrOperation.put('/prev', async(req,res)=>{

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


hrOperation.put('/others', async(req,res)=>{
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
    console.log(req.body);

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

hrOperation.get('/filter',verifyJWT, async(req,res)=>{
    try
    {
    var pool = await db.poolPromise;
    var status = req.query.status
    var fromdate = req.query.fromdate
    var todate = req.query.todate
    var plantcode = req.query.plantcode
    var date; 

    if(status == 'appointed')
      date = 'doj'
    else if(status == 'relieved')
      date = 'dol'
    else
      date = 'created_dt'

    console.log("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno, t.doj, t.dol from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND ("+date+" between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' ")

    var result = await pool.request()
      .query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno, t.doj, t.dol from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND ("+date+" between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' ")
      res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })
  
  hrOperation.post('/searchfilter', verifyJWT, async(req,res)=>
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
    var date; 

    if(status == 'appointed')
      date = 'doj'
    else if(status == 'relieved')
      date = 'dol'
    else
      date = 'created_dt'

  
    var result = await pool.request()
      .query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.sno from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND ("+date+" between '"+fromdate+"' AND '"+todate+"') AND "+colname+" like '"+colvalue+"%' AND plant_code = '"+plantcode+"' ")
      res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })
  
  hrOperation.get('/filterforapproval', verifyJWT, async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var status = req.query.status
    var plantcode = req.query.plantcode
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
  
  
  hrOperation.put('/submitted', verifyJWT, async(req,res)=>{
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
      .query("update trainee_apln set apln_status = 'SUBMITTED', trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
    console.log("..........", result3)
    res.send(result3)
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })
  
  hrOperation.put('/pending', async(req,res)=>{
  
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
  
  hrOperation.put('/approved', verifyJWT, async(req,res)=>{
    try{
      var pool = await db.poolPromise;  
      var mob = req.body.mobile
      var company = req.body.company
  
    var result = await pool.request()
    .query("update trainee_apln set apln_status = 'APPROVED', biometric_no = apln_slno where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where sno = "+company+") ")
      res.send({message: 'success'})
  
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  })
  
  hrOperation.put('/rejected',verifyJWT, async(req,res)=>{
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
  
  hrOperation.get('/getdataforid', verifyJWT, async(req,res)=>{
  
    try
    {
    var mobile = req.query.mobile
    var company = req.query.company
  
    var r = await db.poolPromise
    var result = await r.request()
      .query("select addr from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ) ")
    var result2 = await r.request()
      .query("select fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel, other_files6, mobile_no2, plant_code, biometric_no from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+") ")
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
  hrOperation.get('/getdataforpermid', verifyJWT, async(req,res)=>{
  
    try
    {
    var apln_slno = req.query.apln_slno
  
    var r = await db.poolPromise
    var result = await r.request()
      .query("select addr from plant where plant_code = (select plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ) ")
    var result2 = await r.request()
      .query("select t.gen_id, t.mobile_no1, t.birthdate, t.blood_group , t.fullname,t.fathername,t.trainee_idno, t.dept_slno, t.permanent_address, t.emergency_name, t.emergency_rel, t.other_files6, t.mobile_no2, t.plant_code,t.biometric_no, d.dept_name from trainee_apln t left join department d on t.dept_slno = d.dept_slno where apln_slno = '"+apln_slno+"' ")
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
  
  
  
  hrOperation.get('/getdatabasic', async(req,res)=>{
  try
  {
    var mobile = req.query.mobile
    var company = req.query.company
  
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
  
  hrOperation.get('/getdatafamily', async(req,res)=>{
    try
    {
    var pool = await db.poolPromise
    var mobile = req.query.mobile
    var company = req.query.company
  
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
  
  hrOperation.get('/getdatacareer', async(req,res)=>{
    try
    {
    var mobile = req.query.mobile
    var company = req.query.company
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
  
  hrOperation.get('/getdataqualfn', async(req,res)=>{
    try
    {
    var mobile = req.query.mobile
    var company = req.query.company
  
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

  hrOperation.get('/depttransfer',verifyJWT, async(req, res)=>{
    try
    {
      var pl = req.query.plantcode
  
      var pool = await db.poolPromise
      var result = await pool.request()
        .query("select t.apln_slno, t.fullname, t.trainee_idno, t.fathername, t.birthdate, t.mobile_no1, t.gen_id, t.aadhar_no, t.apln_status, t.doj, d.dept_name, t.dept_slno, t.line_code from trainee_apln t join department d on t.dept_slno = d.dept_slno where t.apln_status = 'APPOINTED' and t.test_status = 'completed' and t.plant_code = '"+pl+"' and gen_id is not null ")
      
      res.send(result['recordset'])
    }
    catch(err)
    {
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  hrOperation.get('/onboard',verifyJWT, async(req, res)=>{
    try
    {
      var pl = req.query.plantcode
      var select = req.query.select
  
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
  
  hrOperation.get('/dept-line',verifyJWT, async(req, res)=>{
    try
    {
      console.log(req.body)
      var line = req.query.line_code
      var dept = req.query.dept_slno
      var slno = req.query.apln_slno
  
      var pool = await db.poolPromise
      console.log("select emp_name from employees where empl_slno = (select reporting_to from trainee_apln where apln_slno = "+slno+") ")
  
      var result = await pool.request()
        .query("select dept_name from department where dept_slno ="+dept+" ")
      var result1 = await pool.request()
        .query("select line_name from mst_line where line_code ="+line+" ")
      var result2 = await pool.request()
        .query("select emp_name from employees where empl_slno = (select reporting_to from trainee_apln where apln_slno = '"+slno+"') ")
        var result3 = await pool.request()
        .query("select trainee_idno, fullname from trainee_apln where apln_slno = '"+slno+"' ")

      var object = [];
      object[0] = result['recordset'][0]
      object[1] = result1['recordset'][0]
      object[2] = result2['recordset'][0]
      object[3] = result3['recordset'][0]
  
  
      res.send(object)
    }
      catch(err)
    {
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  hrOperation.get('/dept-line-report',verifyJWT, async(req,res)=>
  {
    try
    {
    var pool =await db.poolPromise
  
    var plantcode = req.query.plantcode
  
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
  
  
  
  hrOperation.put('/transfer',verifyJWT, async(req, res)=>{
  
    try{
      console.log(req.body)
    var pool =await db.poolPromise
    var apln_slno = req.body.apln_slno
    var dept = req.body.changedepartment
    var line = req.body.changeline
    var RA = req.body.reportingto
    var pl = req.body.plantcode
  
    console.log("update trainee_apln set dept_slno ='"+dept+"', line_code= '"+line+"', reporting_to = "+RA+" where apln_slno ='"+apln_slno+"'  ")
  
  
    var result = await pool.request()
      .query("update trainee_apln set dept_slno = '"+dept+"', line_code ='"+line+"', reporting_to = "+RA+" where apln_slno ='"+apln_slno+"' ")
  
    res.send({message: 'success'})
    }
      catch(err)
      {
      console.log(err)
      res.send({"message":"failure"})
      }
  
  })
  
  hrOperation.get('/getonboard',verifyJWT, async(req,res)=>
  {
    try
    {
    var pool =await db.poolPromise
  
    var apln_slno = req.query.apln_slno
    var readonly = req.query.readonly
    console.log(req.query)
  
    var plant = await pool.request()
      .query("select plant_code from trainee_apln where apln_slno = '"+apln_slno+"' ")
  
    console.log("select  t.*, d.dept_name, l.line_name, e.emp_name from trainee_apln t join designation ds on t.desig_slno = ds.slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join employees e on t.reporting_to = e.empl_slno where apln_slno = '"+apln_slno+"' ")
  
    if(readonly == 'true')
    {
      var details = await pool.request()
      .query("select  t.*, d.dept_name, l.line_name, e.emp_name from trainee_apln t JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join employees e on t.reporting_to = e.empl_slno where apln_slno = '"+apln_slno+"' ")  
    }
    else if(readonly == 'false')
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

  hrOperation.post('/getfiledrop',verifyJWT, async(req,res)=>{

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
  })

  hrOperation.post('/onboard_form', verifyJWT,async(req, res)=>{

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

    if(work_contract == 'DIRECT')
      work_contract = '01'
    else(work_contract == 'INDIRECT')
    work_contract = '02'
      
  
    if(bio_id == 'true')
      bio_id = 1
    else
      bio_id= 0
  
      console.log("EXEC onboard @plantcode = '"+plantcode+"' ,  @grade = "+grade+" , @bio_id = 1 , @dept  = '"+dept+"', @doj = '"+doj+"', @active_status = '"+active_status+"', @line = '"+line+"', @bio_no = "+bio_no+", @uan = '"+uan+"', @gen_id  = '"+id+"', @reporting_to = '"+reporting_to+"', @apln_slno= "+apln_slno+", @category = '"+category+"' , @workcontract= '"+work_contract+"' ")
  
  
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("EXEC onboard @plantcode = '"+plantcode+"' ,  @grade = "+grade+" , @bio_id = 1 , @dept  = '"+dept+"', @doj = '"+doj+"', @active_status = '"+active_status+"', @line = '"+line+"', @bio_no = "+bio_no+", @uan = '"+uan+"', @gen_id  = '"+id+"', @reporting_to = '"+reporting_to+"', @apln_slno= "+apln_slno+", @category = '"+category+"', @ifsc_code = '"+ifsc_code+"', @account_number = '"+account_number+"', @bank_name = '"+bank_name+"', @workcontract= '"+work_contract+"' ")
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
  
  hrOperation.put('/relieve',verifyJWT, async(req,res)=>
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


  const transporter = nodemailer.createTransport({
      host: "3.109.243.162",
      port: 25,
      secure: false,
      auth: {
        user: "noreplyrml@ranegroup.com",
        pass: "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
  
  hrOperation.post('/submitted_mail',verifyJWT, async(req,res)=>{
  
  
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
      from: "noreplyrml@ranegroup.com",
      to: mail.join(','),
      bcc: "sayed.saifu@ranegroup.com",
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
  hrOperation.post('/approved_mail',verifyJWT, async(req,res)=>{
  
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
  
  hrOperation.post('/evaluation_mail',verifyJWT, async(req,res)=>{
  
  try
  {
    var plant_code = req.body.plant_code
  
    var idno = req.body.idno
  
    var pool = await db.poolPromise;
    var result = await pool.request()
    .query(" select mail_id from employees where plant_code = '"+plant_code+"' and department = (select dept_slno from trainee_apln where trainee_idno = '"+idno+"' ) and line_code = (select line_code from trainee_apln where trainee_idno = '"+idno+"' ) ")
  
    var mail = result['recordset'].map((a)=>a.mail_id)
  
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

  hrOperation.get('/getValidDate', async(req, res)=>{
    try
    {
      const cat = req.query.cat
      var pool = await db.poolPromise
      var result = await pool.request()
        .query(`select sap_p2 from category where categorynm = '${cat}' `)
      res.send(result['recordset'])
    }
    catch(err)
    {
      console.log(err)
      res.send({message: 'failed to fetch valid date'})
    }
  })

  module.exports = hrOperation