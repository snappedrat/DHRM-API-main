const express = require('express')
    , cors = require('cors');
const jwt = require('jsonwebtoken');
// const authorize = require('./auth');
const app = express();
const request = require('request');
app.use(cors())
var expressJWT = require('express-jwt');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('./db');
const { json } = require('express/lib/response');
const { pool, rows } = require('mssql');
const { response } = require('express');
const res = require('express/lib/response');
let glob = 0;
const multer = require('multer');

var storage = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
     cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

const upload = multer({storage: storage}).single('file')

app.use('/uploads',express.static('uploads'))

app.post("/image", upload , async(req, res) => {
  
  var user = await getpool()
    res.send("images sucess")
    // console.log('====================================');
    // console.log(req.file.originalname);
    // console.log('====================================');
    var name = req.file.path
    var mobile = req.body.mobile
    var fileno = req.body.fileno
    console.log(req.body)
    console.log('====================================');
    console.log("update trainee_apln set other_files"+fileno+" = '"+name+"' where mobile_no1= '"+mobile+"' ")
    user.query("update trainee_apln set other_files"+fileno+" = '"+name+"' where mobile_no1= '"+mobile+"' ", function(err){if(err) return 'error incoming'})
    console.log('====================================');
    console.log(req.file);
    console.log('====================================');
});


app.use(morgan('dev'));
const corsOptions = {
    origin: true,
    credentials: true
}
app.options('*', cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let secret = 'some_secret';
async function getpool() {
    const pool = await db.poolPromise;
    const result = await pool.request();
    return result;
  }
app.post('/logins', async(request, response)=> {
  try{
    let User_Name =request.body.User_Name;
    let Password =request.body.Password;

    console.log(User_Name, Password)
    const pool = await db.poolPromise;
    const result = await pool.request()
        .input('User_Name',User_Name)
        .input('Password',Password)
        .query("select * from employees where User_Name=@User_Name AND Password=@Password")
    console.log(result);
    const result2 = await pool.request()
        .input('User_Name',User_Name)
        .query("select * from employees where User_Name=@User_Name")
    console.log(result2);
    if (result['recordset'].length > 0) {
        this.glob = 1;
        var userData = {
            "User_Name": User_Name,
            "Password": Password
        }
        let token = jwt.sign(userData, secret, { expiresIn: '15s'})
        response.status(200).json({"token": token, "message":"Success"});
        // response.send([{"message":"Success"}]);
        console.log("true");
    } else if((result['recordset'].length == 0)&&(result2['recordset'].length == 0) ){
        this.glob = 0;
        response.send([{"message":"User"}]);
    } else {
        this.glob = 0;
        response.send([{"message":"Failure"}]);
    }
  }catch(err){
    console.log(err)
    response.send({"message":"Failure"})
  }

});

app.post('/gethr', async(req,res)=>{
  var user = await getpool()

  var user_name = req.body.username;

  user.query("select Is_HR from employees where User_Name = '"+user_name+"'").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
}
);

app.post('/gethrappr', async(req,res)=>{
  var user = await getpool()
  var user_name = req.body.username;
  user.query("select Is_HRAppr, plant_code, Emp_name from employees where User_Name = '"+user_name+"'").then(function(datas){
    console.log('test', datas);
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
}
);

app.post('/getplantcode', async(req,res)=>{
  var user = await getpool()
  var username = req.body.username
  user.query("select plant_code from employees  where user_name = '"+username+"' ").then(function(data){
    res.send(data['recordset'])
  }) 
})

app.post('/getpincode', async(req,res)=>{
  var user = await getpool()
  var pincode = req.body.pincode
  console.log('SELECT * FROM [DHRM_PRD_DB].[dbo].[pincodes] where pincode = '+pincode+'')
  user.query('SELECT * FROM [DHRM_PRD_DB].[dbo].[pincodes] where pincode = '+pincode+' ').then(function(datas){
    res.send(datas['recordset'])
  })
})

try{
app.post('/basicforms', async(req,res,err)=>{
  
    var user = await getpool();
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
    var aadhar4 = req.body.aadhar4;
    var aadhar = ''
    aadhar = aadhar.concat(aadhar1,aadhar2,aadhar3,aadhar4 )
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
    var fullname = fname+' '+lname
    console.log(req.body)
    // console.log('====================================');
    // console.log("update trainee_apln set permanent_address = '"+permanent+"' ,present_address = '"+present+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"', city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"',   marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"' ");
    // console.log('====================================');
    console.log("update trainee_apln set title = '"+title+"',fullname = '"+fullname+"', fullname = '' permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' , blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"' ")

    user.query("update trainee_apln set title = '"+title+"',fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,  blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"' ").then(function (datas) {
        res.send(datas['recordset']);
    }, function(err){if(err) return 'error incoming'})

}

);
}
catch(e){
  console.log(e);
  res.write("Basic form failed");
  res.send(e);

}

app.post('/bankforms',async(req,res)=>{
    var user = await getpool();
    var account = req.body.account;
    var ifsc = req.body.ifsc;
    var bankName = req.body.bankName;
    var mobileNumber = req.body.mobilenumber
    
    user.query("update trainee_apln set bank_account_number = '"+account+"', ifsc_code = '"+ifsc+"', bank_name = '"+bankName+"' where mobile_no1 = '"+mobileNumber+"'").then(function (datas) {
      console.log("bank",req.body)
        res.send(datas);
    },function(err){if(err) return 'error incoming'})
});

app.post('/plantcodelist', async(req,res)=>
{
  var user = await getpool();
  user.query("select plant_name from plant").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  },function(err){if(err) return 'error incoming'})
}) ;

app.post('/companycodelist', async(req,res)=>
{
  var user = await getpool();
  user.query("select company_name from master_company").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  },function(err){if(err) return 'error incoming'})
}) ;

app.post('/traineeformdata', async(req,res)=>
{

  var plantname = req.body.plant
  var companycode = req.body.company
  var mobileNumber = req.body.mobileNumber;
  var pass = req.body.pass;
  var status = {}

  var pool =await db.poolPromise
  var result =await pool.request()
    .query("select * from trainee_apln where mobile_no1 = '"+mobileNumber+"' ");
    if(result['recordset'].length > 0)
      {
        if(result['recordset'][0]?.apln_status == 'PENDING' ||result['recordset'][0]?.apln_status == 'SUBMITTED' ||result['recordset'][0]?.apln_status == 'APPROVED')
        {
        status.status = 'registered';
        res.send(status);
        }
        else if((result['recordset'][0]?.apln_status == 'NEW INCOMPLETE'))
          {
            status.status = 'incomplete';
            res.send(status);
          }
      }
    else if(result['recordset'].length == 0)
    {
      var result2 =await pool.request()
      result2.query("insert into trainee_apln(apln_slno,mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status) values((select max(apln_slno) from trainee_apln)+1,'"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'NEW INCOMPLETE')");
      status.status = 'newform';
      res.send(status);
    }
   
  // user.query("insert into trainee_apln(apln_slno,mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status) values((select max(apln_slno) from trainee_apln)+1,'"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'PENDING')").then(function(datas){
  //   let miu = datas['recordset']
  //   res.send(miu)
  //   console.log(req.body)
  // })
  // user.query("insert into trainee_apln_career(career_slno, apln_slno) values((select max(career_slno) from trainee_apln_career),(select max(apln_slno) from trainee_apln)+1)")
  // user.query("insert into trainee_apln_family(family_slno, apln_slno) values((select max(family_slno) from trainee_apln_family)+1,(select max(apln_slno) from trainee_apln))")
  // user.query("insert into trainee_apln_qualifn(qual_slno, apln_slno) values((select max(qual_slno) from trainee_apln_qualifn)+1,(select max(apln_slno) from trainee_apln))")

});

app.post('/emergency',async(req,res)=>{
    var user = await getpool();
    var contactName = req.body.contactName;
    var contactNumber = req.body.contactNumber;
    var relations = req.body.relations;
    var mobilenumber = req.body.mobilenumber;
    
    user.query("update trainee_apln set emergency_name='"+contactName+"',mobile_no2='"+contactNumber+"',emergency_rel='"+relations+"' where mobile_no1 = '"+mobilenumber+"' ").then(function(datas){
      console.log("emer",req.body)
        res.send(datas['recordset']);
    },function(err){if(err) return 'error incoming'})
});



app.get('/getbanknames', async(req,res)=>{

  var user = await getpool()
  user.query('SELECT TOP (1000)[bank_name] FROM [DHRM_PRD_DB].[dbo].[Bank]').then(function(datas){
    res.send(datas['recordset'])
    })
})

app.post('/lang', async(req,res)=>
{
  var user = await getpool()
  var details = req.body;
  var lang1 = details[0]
  var lang2 = details[1]
  var lang3 = details[2]
  var lang4 = details[3]
  var lang5 = details[4]
  var lang6 = details[5]
  
  if(lang1.language === ''){
    console.log("no details")
  }
  else
{
  user.query("update trainee_apln set lang1_name = '"+ lang1.language+"' , lang1_speak = '"+ lang1.speak +"', lang1_read = '"+ lang1.read +"', lang1_write = '"+ lang1.write +"', lang1_understand = '"+ lang1.understand +"', lang1_mothertounge = '"+ lang1.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ").then(function(datas){
    console.log(datas)
    res.send(datas['recordset'])
  })
  user.query("update trainee_apln set lang2_name = '"+ lang2.language+"' , lang2_speak = '"+ lang2.speak +"', lang2_read = '"+ lang2.read +"', lang2_write = '"+ lang2.write +"', lang2_understand = '"+ lang2.understand +"', lang2_mothertounge = '"+ lang2.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ")
  user.query("update trainee_apln set lang3_name = '"+ lang3.language+"' , lang3_speak = '"+ lang3.speak +"', lang3_read = '"+ lang3.read +"', lang3_write = '"+ lang3.write +"', lang3_understand = '"+ lang3.understand +"', lang3_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ")
  user.query("update trainee_apln set lang4_name = '"+ lang4.language+"' , lang4_speak = '"+ lang4.speak +"', lang4_read = '"+ lang4.read +"', lang4_write = '"+ lang4.write +"', lang4_understand = '"+ lang4.understand +"', lang4_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ")
  user.query("update trainee_apln set lang5_name = '"+ lang5.language+"' , lang5_speak = '"+ lang5.speak +"', lang5_read = '"+ lang5.read +"', lang5_write = '"+ lang5.write +"', lang5_understand = '"+ lang5.understand +"', lang5_mothertounge = '"+ lang5.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ")
  user.query("update trainee_apln set lang6_name = '"+ lang6.language+"' , lang6_speak = '"+ lang6.speak +"', lang6_read = '"+ lang6.read +"', lang6_write = '"+ lang6.write +"', lang6_understand = '"+ lang6.understand +"', lang6_mothertounge = '"+ lang6.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' ")
}
  console.log(details[0])
},function(err){if(err) return 'error incoming'})



app.post('/family',async(req,res)=>{

  var user = await getpool() 
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
  console.log(details)
  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')")
    console.log("len",result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !='' &&details[i].name != 'undefined')
        user.query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
  }
  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].name != '' && details[i].name != 'undefined')
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
          user.query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
        user.query("update trainee_apln_family set relation_name = '"+details[i].name+"' ,relation_type = '"+details[i].relation+"', age = '"+details[i].age+"', occupation = '"+details[i].occupation+"', dependent = '"+details[i].dependent+"', contact_number = '"+details[i].contactnumber+"' where family_slno = (select min(family_slno) from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'))+'"+i+"'  ") 
      }
    }
  }
},function(err){if(err) return 'error incoming'});



app.post('/edu',async(req,res)=>{

  var user = await getpool() 
  var details = req.body;

  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')")
    console.log(result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].school !='' || undefined )
        user.query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
  }
  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].school != '')
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
        user.query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
        user.query("update trainee_apln_qualifn set school_name = '"+details[i].school+"' ,exam_passed = '"+details[i].passed+"', passing_yr = '"+details[i].year+"', subjects = '"+details[i].department+"', cert_number = '"+details[i].certificatenumber+"', cert_date = '"+details[i].certificatedate+"',percentage = '"+details[i].percentage+"' where qual_slno = (select min(qual_slno) from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'))+'"+i+"'  ") 
      }
    }
  }
},function(err){if(err) return 'error incoming'});


app.post('/prev',async(req,res)=>{

  var user = await getpool() 
  var details = req.body;

  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')")
    console.log(result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !='' || undefined )
        user.query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
  }

  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].name != '')
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
          user.query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
          user.query("update trainee_apln_career set company_name = '"+details[i].name+"' ,designation = '"+details[i].desig+"', period_from = '"+details[i].periodf+"', period_to = '"+details[i].periodt+"', last_salary = '"+details[i].sal+"', leaving_reason = '"+details[i].reason+"' where career_slno = (select min(career_slno) from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'))+'"+i+"'  ") 
      }
    }
  }
},function(err){if(err) return 'error incoming'});


app.post('/others',async(req,res)=>{
    var user = await getpool();
    var known = req.body.known;

    if(known == 'Yes')
      known = 'Y'
    else if (known == 'No')
      known = 'N'

    var work = req.body.work;

    if(work == 'Yes')
    work = 'Y'
    else if (work == 'No')
    work = 'N'

    var names = req.body.names;
    var place = req.body.place;
    var com = req.body.com;
    var extra = req.body.extra;
    var mobilenumber = req.body.mobilenumber;
    console.log("update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"'  ")
    user.query("update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"'  ").then(function (datas) {
      console.log("other",req.body)
        res.send(datas['recordset']);
    console.log(req.body);
    },function(err){if(err) return 'error incoming'})
});

app.post('/filter', async(req,res)=>{
  var user = await getpool();
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate
  var plantcode = req.body.plantcode

  console.log("select created_dt, first_name, fathername, birthdate, mobile_no1, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' "  )
  user.query("select created_dt, first_name, fathername, birthdate, mobile_no1, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"')  ").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/searchfilter', async(req,res)=>{
  var user = await getpool();
  var input = req.body.input
  var value = req.body.value
  console.log("select * from trainee_apln where "+value+" like '%"+input+"%'")
  user.query("select * from trainee_apln where "+value+" like '%"+input+"%'").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/filterforapproval', async(req,res)=>{
  var user = await getpool();
  var status = req.body.status
  user.query("select doj, first_name, fathername, birthdate, mobile_no1,trainee_idno, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"'").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/submitted', async(req,res)=>{
  var mob = req.body.mobile
  var id = ''
  var date = new Date()
  var year = date.getFullYear()
  year = year.toString()
  year = year.split('0')[1]

  var pool = await db.poolPromise
  var result =await pool.request()
  
  .query("select pl from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mob+"') ")

  var result2 = await pool.request()
    .query("select apln_slno from trainee_apln where mobile_no1 = '"+mob+"' ")
  
  id = result['recordset'][0]?.pl+'/'+year+'/'+result2['recordset'][0]?.apln_slno
  var result3 = await pool.request()
    .query("update trainee_apln set apln_status = 'SUBMITTED', trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' ")
  console.log("..........", result3)
  res.send(result3)
})

// app.post('/dummy',async(req,res)=>{
//   var mob = req.body.mobile
//   var id = ''
//   var date = new Date()
//   var year = date.getFullYear()
//   year = year.toString()
//   year = year.split('0')[1]
//   var pool = await db.poolPromise
//   var result =await pool.request()
//       .query("select pl from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mob+"') ")
//   // res.send(result['recordset'][0]?.pl)

//   var result2 = await pool.request()
//     .query("select apln_slno from trainee_apln where mobile_no1 = '"+mob+"' ")
  
//   id = result['recordset'][0]?.pl+'/'+year+'/'+result2['recordset'][0]?.apln_slno
//   var result3 = await pool.request()
//     .query("update trainee_apln set trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' ")
//     // console.log("upate trainee_apln set trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' ")
//   res.send(result3)
// })

app.post('/pending', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'PENDING' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log(datas)
  },function(err){if(err) return 'error incoming'})
})

app.post('/approved', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'APPROVED' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log("approved : ",datas)
  },function(err){if(err) return 'error incoming'})
})

app.post('/rejected', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'REJECTED' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log(datas)
  },function(err){if(err) return 'error incoming'})
})

app.post('/getdataforid', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel from trainee_apln where mobile_no1 = '"+mobile+"' ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/getdatabasic', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln where mobile_no1 = '"+mobile+"' ").then(function(datas){

    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/getdatafamily', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/getdatacareer', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/getdataqualfn', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 ='"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'})
})

app.post('/getfiles' , async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  user.query("select other_files7 from trainee_apln where mobile_no1 = '72002929101' ").then(function(datas){
    console.log('filenames', datas['recordset'])
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'})
})



app.post('/user',async(req,res)=>{
    var user = await getpool();
    var Code = req.body.Code;
    var name = req.body.Name;
    var active_status = req.body.active_status;
    var created_by = req.body.created_by;
    console.log(req.body)
    var stat = true;

    user.query("SELECT TOP 1 company_name FROM master_company WHERE company_code = "+Code+"")
        .then(function (x){
       if(x.recordset.length!==0){
           console.log("Record Exists");
           console.log(stat);
           res.send(stat);
       }
       else
       {

           user.query("insert into [dbo].[master_company](company_code,company_name,status,del_status,created_on,created_by) values("+Code+",'"+name+"','"+active_status+"',0,CURRENT_TIMESTAMP,'"+created_by+"')")
               .then(function (datas) {
                   console.log("Record Inserted code="+Code);
                   stat = false;
                   res.send(stat);
               })
       }
    },function(err){if(err) return 'error incoming'});
});

app.post('/desig',async(req,res)=>{
  var user = await getpool();
  var desig_name = req.body.desig_name;
  var company_code = req.body.company_code;
  console.log(req.body)
  user.query("insert into desigination(company_code,desig_name,del_status) values('"+company_code+"','"+desig_name+"',0)").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/bank',async(req,res)=>{
  var user = await getpool();
  var bank_name = req.body.bank_name;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("insert into bank(bank_name,active_status,del_status,created_on) values('"+bank_name+"','"+active_status+"',0,CURRENT_TIMESTAMP)").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/line',async(req,res)=>{
  var user = await getpool();
  var dept_name = req.body.dept_name;
  var line_name = req.body.line_name;
  var per_subarea= req.body.per_subarea;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("insert into line(plant_name,dept_name,line_name,per_subarea,active_status,created_on,del_status) values('VARANAVASI','"+dept_name+"','"+line_name+"','"+per_subarea+"','"+active_status+"',CURRENT_TIMESTAMP,0)").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/plant',async(req,res)=>{
  var user = await getpool();
  var plant_code = req.body.plant_code;
  var pl = req.body.pl;
  var plant_name = req.body.plant_name;
  var address=req.body.address;
  var location = req.body.aocation;
  var plant_sign = req.body.plant_sign;
  var personal_area= req.body.personal;
  var payroll_area = req.body.payroll;
  var created_by = req.body.created_by;
  console.log(req.body)
  user.query("insert into [dbo].[plant] (company_code,plant_code,plant_name,del_status,pl,addr,locatn,plant_sign,personal_area,payroll_area,created_on,created_by) values('a','"+plant_code+"','"+plant_name+"',0,'"+pl+"','"+address+"','"+location+"','"+plant_sign+"',"+personal_area+","+payroll_area+",CURRENT_TIMESTAMP,'admin')  SET ANSI_WARNINGS ON").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});
app.post('/excelline',async(req,res)=>{
  var user = await getpool();
  var details = req.body.details;
  let append="";
  for(var i=0;i<details.length;i++)
  {
        append+="('"+'VARANAVASI'+"','"+details[i].DEPTNAME+"','"+details[i].LineName+"','"+details[i].PersonalSubAreas+"','"+"1'"+","+"CURRENT_TIMESTAMP"+","+"'0'"+"),"

  }
 append=append.slice(0,append.length-1);
  var line_name = req.body.line_name;
  var per_subarea= req.body.per_subarea;
  var active_status = req.body.active_status;
  console.log("insert into line(plant_name,dept_name,line_name,per_subarea,active_status,created_on,del_status) values"+append)
  var query="insert into line(plant_name,dept_name,line_name,per_subarea,active_status,created_on,del_status) values"+append;
  user.query(query).then(function (datas) {
    let miu=datas['recordset'];
    res.send(miu)
  }),function(err){if(err) return 'error incoming'}
});

app.post('/dept',async(req,res)=>{
  var user = await getpool();
  var dept_name = req.body.dept_name;
  var plant_code = req.body.plant_code;
  var sap_code = req.body.sap_code;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("insert into dept(dept_name,plant_code,sap_code,active_status,del_status,created_on) values('"+dept_name+"','"+plant_code+"','"+sap_code+"',"+active_status+",0,CURRENT_TIMESTAMP)").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/opr',async(req,res)=>{
  var user = await getpool();
  var opr_desc = req.body.opr_desc;
  var skill_level = req.body.skill_level;
  var critical_opr = req.body.critical_opr;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("insert into operation(plant_code,opr_desc,skill_level,critical_opr,active_status,del_status,created_on) values(1150,'"+opr_desc+"','"+skill_level+"','"+critical_opr+"',"+active_status+",0,CURRENT_TIMESTAMP)").then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/userdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE master_company SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/desigdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE desigination SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/deptdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE dept SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/oprdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE operation SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/bankdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE  bank SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/useredit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var name = req.body.Name;
  var active_status = req.body.active_status;
  var modified_by = req.body.modified_by;
  console.log(req.body)
    console.log(sno,name,active_status)
  
  user.query("update master_company set company_name= '"+name+"',status= '"+active_status+"',modified_on= CURRENT_TIMESTAMP, modified_by ='"+modified_by+"' where sno=" +sno).then(function (datas) {
     console.log()
     res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/lineedit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var plant_name= req.body.plant_name;
  var dept_name = req.body.dept_name;
  var line_name = req.body.line_name;
  var per_subarea= req.body.per_subarea;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("update line set plant_name='VARANAVASI',dept_name= '"+dept_name+"',line_name='"+line_name+"',per_subarea='"+per_subarea+"',active_status= '"+active_status+"',modified_on=CURRENT_TIMESTAMP where sno=" +sno).then(function (datas) {
     console.log()
     res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/deptedit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var plant_code= req.body.plant_code;
  var sap_code= req.body.sap_code;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("update dept set plant_code='"+plant_code+"',sap_code='"+sap_code+"',active_status= '"+active_status+"',modified_on=CURRENT_TIMESTAMP where sno=" +sno).then(function (datas) {
     console.log()
     res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/opredit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var opr_desc= req.body.opr_desc;
  var skill_level= req.body.skill_level;
  var critical_opr= req.body.critical_opr;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("update operation set opr_desc='"+opr_desc+"',skill_level='"+skill_level+"',critical_opr='"+critical_opr+"',active_status= '"+active_status+"',modified_on=CURRENT_TIMESTAMP where sno=" +sno).then(function (datas) {
     console.log()
     res.send(datas);

  },function(err){if(err) return 'error incoming'})
});

app.post('/desigedit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var desig_name = req.body.desig_name;
  var status = req.body.status;
  console.log(req.body)
  user.query("update desigination set desig_name= '"+desig_name+"',del_status= '"+status+"'where sno="+sno).then(function (datas) {
     console.log()
     res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.post('/bankedit',async(req,res)=>{
  var user = await getpool();
  var sno = req.body.sno;
  var bank_name = req.body.bank_name;
  var active_status = req.body.active_status;
  var modified_on = req.body.modified_on;
  console.log(req.body)
  console.log()
  user.query("update bank set bank_name='"+bank_name+"',active_status='"+active_status+"',modified_on=CURRENT_TIMESTAMP where sno="+sno).then(function (datas) {
     console.log()
     res.send(datas);
  },function(err){if(err) return 'error incoming'})
});

app.get('/usershow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,company_code,company_name,status,CONVERT(varchar,created_on,105)as created_on,created_by, CONVERT(varchar,modified_on,105)as modified_on, modified_by from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
}); 

app.get('/deptshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,dept_name,plant_code,sap_code,CONVERT(varchar,created_on,105)as created_on,creted_by,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from dept where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});

app.get('/lineshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_name,dept_name,line_name,per_subarea,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from line where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});

app.get('/plantshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_code,plant_name,del_status,pl,addr,locatn,plant_sign,personal_area,payroll_area,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on from plant where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});

app.get('/oprshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_code,opr_desc,skill_level,critical_opr,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from operation where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});

app.get('/desigshow',async(req,res)=>{
  var user = await getpool();
  user.query("select * from desigination where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu);
  },function(err){if(err) return 'error incoming'})
});

app.get('/bankshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,bank_name,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,active_status,del_status from bank where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu);
  },function(err){if(err) return 'error incoming'})
});
app.get('/dropdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_code from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});
app.get('/compnamedown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_name from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});
app.get('/depdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  dept_name from dept where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  },function(err){if(err) return 'error incoming'})
});
app.get('/desigdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  desig_name from desigination where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)  
  },function(err){if(err) return 'error incoming'})
});


module.exports = app;
