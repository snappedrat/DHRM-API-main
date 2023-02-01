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
    res.send({'Message':req.body,"file": req.file})

    var name = req.file.path
    var mobile = req.body.mobile
    var company = req.body.company
    var fileno = req.body.fileno
    user.query("  update trainee_apln set other_files"+fileno+" = '"+name+"' where mobile_no1= '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"')  "  )

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

app.post('/traineelogin', async(req, res)=>{
  console.log(req.body)

  let secret = 'boooooo'

  var User_Name = req.body.username
  var Password = req.body.pass
  var pool =await db.poolPromise
  var result = await pool.request()
    .input('trainee_idno', User_Name)
    .input('pass', Password)
    .query("select apln_slno from trainee_apln where trainee_idno=@trainee_idno and temp_password=@pass and apln_status = 'APPROVED' ")
    console.log("select apln_slno from trainee_apln where trainee_idno='"+User_Name+"' and temp_password='"+Password+"' and apln_status = 'APPROVED' ")
  var result2 = await pool.request()
    .input('trainee_idno', User_Name)
    .query("select apln_slno from trainee_apln where trainee_idno=@trainee_idno and apln_status ='APPROVED' ")

  var result3 = await pool.request()
    .input('trainee_idno', User_Name)
    .query("select apln_slno from trainee_apln where trainee_idno=@trainee_idno and apln_status <> 'APPROVED' ")

  if(result['recordset'].length > 0)
  {
    let token = jwt.sign(User_Name, secret)
    res.send({'token': token, 'status': 'success' })
  }
  else
  {
    
    if(result2['recordset'].length == 0 && result['recordset'].length == 0)
    {
      res.send({'status': 'wrong_user'})
    }
    else if(result3['recordset'].length > 0)
    {
      res.send({'status': 'wrong_apln'})
    }
    else
    {
      res.send({'status': 'wrong_pass'})
    }
  }
})


app.post('/gethr', async(req,res)=>{
  var user = await getpool()

  var user_name = req.body.username;

  user.query("select Is_HR from employees where User_Name = '"+user_name+"'").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'} )
}
);

app.post('/gethrappr', async(req,res)=>{
  var user_name = req.body.username;

  var user = await db.poolPromise
  var result = await user.request()
      .query("select employees.Emp_name,employees.plant_code, employees.Is_HR, employees.Is_HRAppr,employees.Is_Trainer,employees.Is_Trainee, employees.User_Name,employees.department, department.dept_name, plant.plant_name from employees left join department on employees.department = department.dept_slno left join plant on plant.plant_code = employees.plant_code where employees.User_Name = '"+user_name+"' ")
    res.send(result['recordset'])
},   function(err){if(err) return 'error incoming'}
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

  var pattern = /^\d+\.?\d*$/;

  let booln = pattern.test(pincode)
  if(booln == true)
  {
    console.log('SELECT * FROM [dbo].[pincodes] where pincode = '+pincode+'')
    user.query('SELECT * FROM [dbo].[pincodes] where pincode = '+pincode+' ').then(function(datas){
      res.send(datas['recordset'])
    })
  }
  else
    res.send('not a number')

})

app.get('/getaadhar', async(req,res)=>{
  var user = await getpool()
  user.query("select mobile_no1, aadhar_no from trainee_apln").then(function(datas){
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

    console.log("  update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' , blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where company_name = '"+company+"') ")
  
    user.query("  update trainee_apln set "+title_col+" fullname = '"+fullname+"', permanent_address = '"+permanent+"' ,present_address = '"+permanent+"' ,first_name = '"+fname+"' ,last_name = '"+lname+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,  blood_group = '" +bg+"' , dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',  city = '"+city+"', state_name = '"+state+"', birth_place = '"+bp+"', pincode = '"+pc+"', ident_mark1 = '"+idm1+"', ident_mark2 = '"+idm2+"',  marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where company_name = '"+company+"')  ").then(function (datas) {
        res.send(datas['recordset']);
    },  )
}
);
}
catch(e)
{
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
    var company = req.body.company
    
    user.query("  update trainee_apln set bank_account_number = '"+account+"', ifsc_code = '"+ifsc+"', bank_name = '"+bankName+"' where mobile_no1 = '"+mobileNumber+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function (datas) {
      console.log("bank",req.body)
        res.send(datas);
    },function(err){if(err) return 'error incoming'} )
});

app.post('/plantcodelist', async(req,res)=>
{
  var user = await getpool();
  var company_name = req.body.company_name
  user.query("select plant_name from plant where company_code =  (select top 1 company_code from master_company where company_name = '"+company_name+"')  ").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  }, )
}) ;

app.post('/getall', async(req,res)=>
{
  var pool =await db.poolPromise
  if(req.body.plantcode.search(':')>=0)
    var plantcode = req.body.plantcode.split(' ')[1]
  else
    var plantcode = req.body.plantcode

  console.log(plantcode)
    var result = await pool.request()
    .query("select desig_name from designation where plant_code = (select plant_code from plant where plant_name = '"+plantcode+"' )")

    var result2 = await pool.request()
    .query("select dept_name from department where plant_code = (select plant_code from plant where plant_name = '"+plantcode+"' ) ")

    var result3 = await pool.request()
    .query("select line_name from mst_line where plant_code = (select plant_code from plant where plant_name = '"+plantcode+"' ) ")
  
    var object = []
    object[0] = result['recordset']
    object[1] = result2['recordset']
    object[2] = result3['recordset']
    
  res.send(object)
}) ;

app.post('/companycodelist', async(req,res)=>
{
  var user = await getpool();
  user.query("select company_name from master_company where del_status = 1 ").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  },function(err){if(err) return 'error incoming'} )
}) ;

app.post('/traineeformdata', async(req,res)=>
{

  var plantname = req.body.plant
  var companyname = req.body.company
  var mobileNumber = req.body.mobileNumber;
  var count = [];

  var pass = req.body.pass;
  var status = {}
  console.log(req.body)
  var pool =await db.poolPromise

  var result = await pool.request()

    .query("select * from trainee_apln where mobile_no1 = '"+mobileNumber+"' and company_code = (select company_code from master_company where company_name = '"+companyname+"') ");
  console.log("record from db",result['recordset'].length)
  
    if(result['recordset'].length == 0 )
      {
        console.log("adding form......")
        console.log("insert into trainee_apln (mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status, company_code) values('"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'NEW INCOMPLETE', (select company_code from master_company where company_name = '"+companyname+"'))")
        var result2 =await pool.request()
        result2.query("insert into trainee_apln (mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status, company_code) values('"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'NEW INCOMPLETE', (select company_code from master_company where company_name = '"+companyname+"'))");
        status.status = 'newform';
        res.send(status);  
      }
    else if(result['recordset'].length > 0)
    {

      if(result['recordset'][0]?.apln_status == 'PENDING' ||result['recordset'][0]?.apln_status == 'SUBMITTED' ||result['recordset'][0]?.apln_status == 'APPROVED'||result['recordset'][0]?.apln_status == 'REJECTED'||result['recordset'][0]?.apln_status == 'APPOINTED')
      {
      console.log("alreadyyyy.......")
      status.status = 'registered';
      res.send(status);
      }
      else if((result['recordset'][0]?.apln_status == 'NEW INCOMPLETE'))
        {
          status.status = 'incomplete';
          res.send(status);
        }
    }
  
});

app.post('/emergency',async(req,res)=>{
    var user = await getpool();
    var contactName = req.body.contactName;
    var contactNumber = req.body.contactNumber;
    var relations = req.body.relations;
    var mobilenumber = req.body.mobilenumber;
    var company = req.body.company
    
    user.query("  update trainee_apln set emergency_name='"+contactName+"',mobile_no2='"+contactNumber+"',emergency_rel='"+relations+"' where mobile_no1 = '"+mobilenumber+"'  and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas){
      console.log("emer",req.body)
        res.send(datas['recordset']);
    }, function(err){if(err) return 'error incoming'})
});



app.get('/getbanknames', async(req,res)=>{

  var user = await getpool()
  user.query('SELECT TOP (1000)[bank_name] FROM [dbo].[Bank]').then(function(datas){
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
  user.query("  update trainee_apln set lang1_name = '"+ lang1.language+"' , lang1_speak = '"+ lang1.speak +"', lang1_read = '"+ lang1.read +"', lang1_write = '"+ lang1.write +"', lang1_understand = '"+ lang1.understand +"', lang1_mothertounge = '"+ lang1.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"' and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ").then(function(datas){
    console.log(datas)
    res.send(datas['recordset'])
  })
  user.query("  update trainee_apln set lang2_name = '"+ lang2.language+"' , lang2_speak = '"+ lang2.speak +"', lang2_read = '"+ lang2.read +"', lang2_write = '"+ lang2.write +"', lang2_understand = '"+ lang2.understand +"', lang2_mothertounge = '"+ lang2.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ")
  user.query("  update trainee_apln set lang3_name = '"+ lang3.language+"' , lang3_speak = '"+ lang3.speak +"', lang3_read = '"+ lang3.read +"', lang3_write = '"+ lang3.write +"', lang3_understand = '"+ lang3.understand +"', lang3_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ")
  user.query("  update trainee_apln set lang4_name = '"+ lang4.language+"' , lang4_speak = '"+ lang4.speak +"', lang4_read = '"+ lang4.read +"', lang4_write = '"+ lang4.write +"', lang4_understand = '"+ lang4.understand +"', lang4_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ")
  user.query("  update trainee_apln set lang5_name = '"+ lang5.language+"' , lang5_speak = '"+ lang5.speak +"', lang5_read = '"+ lang5.read +"', lang5_write = '"+ lang5.write +"', lang5_understand = '"+ lang5.understand +"', lang5_mothertounge = '"+ lang5.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ")
  user.query("  update trainee_apln set lang6_name = '"+ lang6.language+"' , lang6_speak = '"+ lang6.speak +"', lang6_read = '"+ lang6.read +"', lang6_write = '"+ lang6.write +"', lang6_understand = '"+ lang6.understand +"', lang6_mothertounge = '"+ lang6.mothertongue +"' where mobile_no1 = '"+ lang1.mobile+"'  and company_code = (select company_code from master_company where company_name = '"+lang1.company+"') ")
}
  console.log(req.body)
}, function(err){if(err) return 'error incoming'})



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
      .query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"') )")
    console.log("len",result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !='' && details[i].name != 'undefined' && details[i].name != null )
        user.query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'  and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')").then(function(datas){console.log(datas)})
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
          user.query("insert into trainee_apln_family(apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')").then(function(datas){console.log(datas)})
          console.log('insert', i) 
        }
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log("  update", i)
        user.query("  update trainee_apln_family set relation_name = '"+details[i].name+"' ,relation_type = '"+details[i].relation+"', age = '"+details[i].age+"', occupation = '"+details[i].occupation+"', dependent = '"+details[i].dependent+"', contact_number = '"+details[i].contactnumber+"' where family_slno = (select min(family_slno) from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')))+'"+i+"'  ").then(function(datas){console.log(datas)})
      }
    }
  }
  console.log('finished')
  res.send(result['recordset'])
},function(err){if(err) return 'error incoming'}  );



app.post('/edu',async(req,res)=>{

  var user = await getpool() 
  var details = req.body;

  console.log(details)
  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"'))")
    console.log(result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].school !=''  && details[i].school != 'undefined' && details[i].school != null  )
        user.query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"') ),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
  }
  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].school != '' && details[i].school != 'undefined' && details[i].school != null )
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
        user.query("insert into trainee_apln_qualifn (apln_slno,school_name ,exam_passed, passing_yr, subjects, cert_number, cert_date, percentage) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')),'"+details[i].school+"', '"+details[i].passed+"', '"+details[i].year+"', '"+details[i].department+"', '"+details[i].certificatenumber+"', '"+details[i].certificatedate+"', '"+details[i].percentage+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
        user.query("  update trainee_apln_qualifn set school_name = '"+details[i].school+"' ,exam_passed = '"+details[i].passed+"', passing_yr = '"+details[i].year+"', subjects = '"+details[i].department+"', cert_number = '"+details[i].certificatenumber+"', cert_date = '"+details[i].certificatedate+"',percentage = '"+details[i].percentage+"' where qual_slno = (select min(qual_slno) from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"') ))+'"+i+"'  ") 
      }
    }
  }
  res.send(result['recordset'])
},function(err){if(err) return 'error incoming'} );


app.post('/prev',async(req,res)=>{

  var user = await getpool() 
  var details = req.body;

  var pool = await db.poolPromise
  var result = await pool.request()
      .query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"') )")
    console.log(result['recordset'].length)
  if(result['recordset'].length == 0 )
  {
    console.log('1')
    for(var i = 0; i< details.length ; i++)
      if(details[i].name !=''  && details[i].name != 'undefined' && details[i].name != null  )
        user.query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
  }

  else if(result['recordset'].length > 0)
  {
    console.log('2')
    for(var i = 0;i<4; i++)
    {
      if(result['recordset'][i] == undefined)
      {
        if(details[i].name != ''  && details[i].name != 'undefined' && details[i].name != null )
        // console.log("insert into trainee_apln_family(family_slno, apln_slno,relation_name ,relation_type, age, occupation, dependent, contact_number) values((select max(family_slno) from trainee_apln_family)+1,(select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"'),'"+details[i].name+"', '"+details[i].relation+"', '"+details[i].age+"', '"+details[i].occupation+"', '"+details[i].dependent+"', '"+details[i].contactnumber+"')")
          user.query("insert into trainee_apln_career (apln_slno,company_name ,designation, period_from,period_to, last_salary, leaving_reason) values((select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"')),'"+details[i].name+"', '"+details[i].desig+"', '"+details[i].periodf+"', '"+details[i].periodt+"', '"+details[i].sal+"', '"+details[i].reason+"')")
      }
      
      else if(result['recordset'][i] != undefined)
      {
        console.log('4')
          user.query("  update trainee_apln_career set company_name = '"+details[i].name+"' ,designation = '"+details[i].desig+"', period_from = '"+details[i].periodf+"', period_to = '"+details[i].periodt+"', last_salary = '"+details[i].sal+"', leaving_reason = '"+details[i].reason+"' where career_slno = (select min(career_slno) from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"' and company_code = (select company_code from master_company where company_name = '"+details[0].company+"') ))+'"+i+"'  ") 
      }
    }
  }
  res.send(result['recordset'])
}, function(err){if(err) return 'error incoming'});


app.post('/others',async(req,res)=>{
    var user = await getpool();
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

    console.log("  update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ")
    user.query("  update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function (datas) {
      console.log("other",req.body)
        res.send(datas['recordset']);
    console.log(req.body);
    }, function(err){if(err) return 'error incoming'})
});

app.post('/filter', async(req,res)=>{
  var user = await getpool();
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate
  var plantcode = req.body.plantcode
  console.log(req.body)
  console.log("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.company_name from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' ")
    user.query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.company_name from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND plant_code = '"+plantcode+"' ").then(function(datas){
    res.send(datas['recordset'])
  },function(err){if(err) return 'error incoming'} )
})

app.post('/searchfilter', async(req,res)=>
{
  var user = await getpool();
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate
  var plantcode = req.body.plantcode
  var colname = req.body.colname
  var colvalue = req.body.colvalue
  colvalue = colvalue.trim()

  console.log("----------select created_dt, first_name, fathername, birthdate, mobile_no1, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND "+colname+"= '"+colvalue+"' "  )
  user.query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1, t.aadhar_no, t.apln_status, m.company_name from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"') AND "+colname+"= '"+colvalue+"' AND plant_code = '"+plantcode+"' ").then(function(datas){
    res.send(datas['recordset'])
  }, function(err){if(err) return 'error incoming'})
})

app.post('/filterforapproval', async(req,res)=>{

  var user = await getpool();
  var status = req.body.status
  var plantcode = req.body.plantcode

  user.query("select t.created_dt, t.fullname, t.fathername, t.birthdate, t.mobile_no1,t.trainee_idno, t.aadhar_no, t.apln_status, m.company_name from trainee_apln as t left join master_company as m on t.company_code = m.company_code where apln_status = '"+status+"'AND plant_code = '"+plantcode+"' ").then(function(datas){
    res.send(datas['recordset'])
  }, )
})


app.post('/submitted', async(req,res)=>{
  var mob = req.body.mobile
  var company = req.body.company
  var id = ''
  var date = new Date()
  var year = date.getFullYear()
  year = year.toString()
  year = year.split('0')[1]

  var pool = await db.poolPromise
  var result =await pool.request()
  
  .query("select pl from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"')) ")
  
  var result2 = await pool.request()
    .query("select apln_slno from trainee_apln where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ")
  
  id = result['recordset'][0]?.pl+'/'+year+'/'+result2['recordset'][0]?.apln_slno
  var result3 = await pool.request()
    .query("  update trainee_apln set apln_status = 'SUBMITTED', trainee_idno = '"+id+"' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ")
  console.log("..........", result3)
  res.send(result3)
})

app.post('/pending', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  var company = req.body.company
  console.log(mob)
  user.query("  update trainee_apln set apln_status = 'PENDING' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas){
    console.log(datas)
    res.send(datas)
  },function(err){if(err) return 'error incoming'} )
})

app.post('/approved', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  var company = req.body.company

  console.log(mob)
  user.query("  update trainee_apln set apln_status = 'APPROVED' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas){
    console.log("approved : ",datas)
    res.send(datas)
  },function(err){if(err) return 'error incoming'} )
})

app.post('/rejected', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  var company = req.body.company

  console.log(mob)
  user.query("  update trainee_apln set apln_status = 'REJECTED' where mobile_no1 = '"+mob+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas){
    console.log(datas)
    res.send(datas)
  },function(err){if(err) return 'error incoming'} )
})

app.post('/getdataforid', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  var company = req.body.company

  var r = await db.poolPromise
  var result = await r.request()
    .query("select addr from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ) ")
  console.log("select addr from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ) ")
  console.log(mobile)
  user.query("select fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel, other_files6 from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas1){
    object = datas1['recordset']
    if(datas1['recordset'].length !=0)
      object[0].addr = result['recordset'][0].addr
    res.send(object)
  },function(err){if(err) return 'error incoming'} )
})



app.post('/getdatabasic', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  var company = req.body.company
  console.log(req.body)

  var r = await db.poolPromise
  var result2 = await r.request()
    .query("select plant_name from plant where plant_code = (select plant_code from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"'))")
  console.log("select * from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ")
  user.query("select * from trainee_apln where mobile_no1 = '"+mobile+"' and company_code = (select company_code from master_company where company_name = '"+company+"') ").then(function(datas){
    object = datas['recordset']

    if(datas['recordset'].length !=0)
    {    object[0].company_name = company

      object[0].plant_name = result2['recordset'][0].plant_name

    }

    res.send(object)
  }, function(err){if(err) return 'error incoming'})
})

app.post('/getdatafamily', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  var company = req.body.company

  console.log(req.body)
  user.query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"'  and company_code = (select company_code from master_company where company_name = '"+company+"'))  ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'} )
})

app.post('/getdatacareer', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  var company = req.body.company
  console.log(mobile)
  user.query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"'  and company_code = (select company_code from master_company where company_name = '"+company+"')) ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'} )
})

app.post('/getdataqualfn', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  var company = req.body.company

  console.log(mobile)
  user.query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 ='"+mobile+"'  and company_code = (select company_code from master_company where company_name = '"+company+"')) ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  },function(err){if(err) return 'error incoming'} )
})

app.post('/getQuestions',async(req,res)=>
{
  var module = req.body.module
  module = module.split('.')[1]

  var username = req.body.username

  var pool = await db.poolPromise
  console.log("select question, correct_answer from question_bank2 where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') ")
  let result = await pool.request()
    .query("select * from question_bank2 where module_name = '"+module+"' and plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') order by qslno ")
  
  res.send(result['recordset'])
})

app.post('/getModules', async(req,res)=>{

  let username = req.body.username

  var pool = await db.poolPromise
  console.log("select * from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') and del_status = 'N' order by priorityval ")
  if(isNaN(parseInt(username)))
  {
    var result = await pool.request()
    .query("select* from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '"+username+"') order by priorityval ")
  }
  else
  {
    var result = await pool.request()
    .query("select* from trg_modules where plant_code = '"+username+"' and del_status= 'N' order by priorityval ") 
  }
  res.send(result['recordset'])
})

app.post('/getTest', async(req,res)=>{

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
})

app.post('/Qualified', async(req,res)=>{

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

      else if(score['recordset'][0].sum > pass_mark)
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

        console.log("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+prev_module['recordset'][0].module_name+"'")
      
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
      else if(prev_score['recordset'][0].sum > pass_mark)
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
      else if(score['recordset'][0].sum > pass_mark)
        res.send({'message':'passed', 'marks':score['recordset'][0].sum})
      else
        res.send({'message':'failed', 'marks':score['recordset'][0].sum , 'pass' : pass_mark})
    }
  }

})

app.post('/pretest', async(req,res)=>{

  details = req.body
  var username = req.body[0].username
  var apln_slno = username.split('/')[2]
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
  // console.log('-----------------------------------')
  // console.log("insert into test_result_summary (trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ('"+details[0].username+"','"+module+"','"+details[0].min_percent+"','"+details[0].curr_total+"','"+details[0].percent+"','"+details[0].pf+"','"+plant_code+"' ) ")
  .query("insert into test_result_summary (fullname , trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ((select fullname from trainee_apln where trainee_idno = '"+details[0].username+"'),'"+details[0].username+"','"+module+"','"+details[0].min_percent+"','"+details[0].curr_total+"','"+details[0].percent+"','"+details[0].pf+"','"+plant_code+"' ) ")

  var training = await pool.request()
  .query(" update trainee_apln set test_status = 'in_training' where apln_slno = '"+apln_slno+"' ")

  res.send({'message':'success'})
})

app.post('/posttest', async(req,res)=>
{
  details = req.body
  var username = req.body[0].username
  var apln_slno = username.split('.')[2]
  var module = req.body[0].module
  module = module.split('.')[1]
  console.log(details)
  var pool = await db.poolPromise
  var i = 1

  for(var i = 1; i < details.length; i++)
  {
    var result =  await pool.request()
    .query("update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_result = '"+details[i].result+"' , posttraining_score = '"+details[i].score+"' , posttrainingstat = 'SUBMITTED', posttraining_pf = '"+details[0].pf+"', posttraining_percent = '"+details[0].percent+"' where qslno = '"+details[i].slno+"' ")
  }

  var summary = await pool.request()
  .query("update test_result_summary set submission_date = CURRENT_TIMESTAMP, posttraining_score = '"+details[0].curr_total+"', posttraining_pf = '"+details[0].pf+"', posttraining_percent = '"+details[0].percent+"'where trainee_idno = '"+details[0].username+"' ")

  res.send({'message':'success'})
})

app.post('/questionbank' , async(req,res)=>
{
  var details = req.body

  var pool = await db.poolPromise
  for(var i = 1; i < details.length ; i++)
  {
    let image = details[i].file == undefined ? 'NULL' : details[i].file
    var result = await pool.request()
    .query("insert into question_bank2(module_name, question, question_type, correct_answer, image_filename, plant_code) values('"+details[0].module.split('.')[1]+"', '"+details[i].question+"' , 'O', '"+details[i].answer+"', '"+image+"', '"+details[0].plantcode+"')")
  }

  var result2 = await pool.request()
    .query("select top("+details.length+") image_filename from question_bank2 order by qslno desc ")
  res.send(result2['recordset'])
})

app.post('/questionbankupload', upload , async(req,res)=>
{
  res.send({'message':'success'})
})

app.post('/getTrainee', async(req,res)=>
{

  var plantcode = req.body.plantcode

  var pool = await db.poolPromise
  var result =await pool.request()
    .query("select fullname ,trainee_idno from trainee_apln where plant_code = '"+plantcode+"' ")

res.send(result['recordset'])  
})

app.post('/getOfflineModule', async(req,res)=>
{
  var plantcode = req.body.plantcode

  var pool = await db.poolPromise
  var result =await pool.request()
    .query("select * from trg_modules where plant_code = '"+plantcode+"' and category = 'OFFLINE' and del_status = 'N' ")

  res.send(result['recordset'])

})

app.post('/offlineUpload', async(req,res)=>
{
  try{
  var test = req.body.test
  var module = req.body.module.split('.')[1]
  var username = req.body.trainee.split('-')[1]
  var apln_slno = req.body.trainee.split('/')
  apln_slno = apln_slno.pop() 
  username = username.trim()
  var file = req.body.file
  var score = req.body.score
  var priorityval = req.body.priorityval
  var percent = req.body.percent
  var pf = req.body.pf


  var pool = await db.poolPromise
  if(test == 'pre-test')
  {
  console.log("insert into ontraining_evalation(trainee_idno, module_name , plant_code ,pretraining_date, pretraining_score, upload_file, pretrainingstat, priorityval, pretraining_pf, pretraining_percent, exam_attempt, trainee_apln_slno) values('"+username+"','"+module+"',(select plant_code from trainee_apln where trainee_idno = '"+username+"'),CURRENT_TIMESTAMP,'"+score+"','"+file+"','SUBMITTED','"+priorityval+"','"+pf+"','"+percent+"',1,'"+apln_slno+"' )")
  var insert_data = await pool.request()
    .query("insert into ontraining_evalation(trainee_idno, module_name , plant_code ,pretraining_date, pretraining_score, uploadfile, pretrainingstat, priorityval, pretraining_pf, pretraining_percent, examattempt, trainee_apln_slno) values('"+username+"','"+module+"',(select plant_code from trainee_apln where trainee_idno = '"+username+"'),CURRENT_TIMESTAMP,'"+score+"','"+file+"','SUBMITTED','"+priorityval+"','"+pf+"','"+percent+"',1,'"+apln_slno+"' )")
  res.send({'message': 'success'})
  }

  else if(test == 'post-test')
  {
    var update_data = await pool.request()
    .query("  update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_score = '"+score+"' , posttrainingstat = 'SUBMITTED', posttraining_pf = '"+pf+"', posttraining_percent = '"+percent+"' where trainee_idno = '"+username+"' and module_name = '"+module+"' ")
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

app.post('/addmodule' , async(req,res)=>
{

  var module_name = req.body.module_name
  var pass_criteria = req.body.pass_criteria
  var total_marks = req.body.total_marks
  var pass_percent = req.body.pass_percent
  var category = req.body.category
  var priorityval = req.body.priorityval
  var plantcode = req.body.plantcode

  var pool =await db.poolPromise
  var result = await pool.request()
    .query("select * from trg_modules where priorityval = '"+priorityval+"' and del_status = 'N' ")
  if(result['recordset'].length > 0)
    res.send({'message': 'already'})
  else
    {
      var user = await pool.request()
        .query("insert into trg_modules values('"+module_name+"', "+total_marks+","+pass_criteria+", "+pass_percent+", '"+category+"', 'N', "+priorityval+", 0, '"+plantcode+"'  )")
        res.send({'message': 'inserted'})
    }
})

app.post('/deletemodule', async(req,res)=>
{
  var priorityval = req.body.priorityval
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("  update trg_modules set del_status = 'Y' where priorityval = "+priorityval+" ")
  res.send({'message': 'success'})
})

app.post('/updatemodule', async(req,res)=>{

  var slno = req.body.sno
  slno = slno+1
  var module_name = req.body.module_name
  var pass_criteria = req.body.pass_criteria
  var total_marks = req.body.total_marks
  var pass_percent = req.body.pass_percent
  var category = req.body.category
  var priorityval = req.body.priorityval
  var plantcode = req.body.plantcode

  var pool =await db.poolPromise
  // var result = await pool.request()
  //   .query("select * from trg_modules where priorityval = '"+priorityval+"' and del_status = 'N' ")
  // if(result['recordset'].length > 0)
  //   res.send({'message': 'already'})
  // else
  //   {
      var user = await pool.request()
        .query("update trg_modules set module_name = '"+module_name+"' , pass_criteria='"+pass_criteria+"', total_marks = '"+total_marks+"', pass_percent = '"+pass_percent+"', category = '"+category+"', priorityval = '"+priorityval+"' where slno = '"+slno+"' ")
        res.send({'message': 'updated'})
    // }
})

app.post('/testSummary', async(req,res)=>{
  details = req.body
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select fullname, trainee_idno,submission_date, sum(pretraining_score)/count(*) as sum1,  sum(posttraining_score)/count(*) as sum2 from test_result_summary where submission_date between '"+details.start+"' and '"+details.end+"' and plant_code = '"+details.plantcode+"' group by fullname, trainee_idno, submission_date  ")

  res.send(result['recordset'])

})

app.post('/traineeScorecard', async(req,res)=>{
  var idno = req.body.trainee_idno
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select * from test_result_summary where trainee_idno = '"+idno+"' ")
  res.send(result['recordset'])

})

app.post('/traineeAnswers', async(req,res)=>{
  var idno = req.body.idno
  var module = req.body.module
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select * from ontraining_evalation where trainee_idno = '"+idno+"' and module_name = '"+module+"' ")
  res.send(result['recordset'])

})


app.post('/companyadd',async(req,res)=>{
    var user = await getpool();
    var Code = req.body.company_code;
    var name = req.body.company_name;
    var active_status = req.body.status;
    var created_by = req.body.created_by;
    console.log(req.body)
    var stat = true;
    
    console.log("SELECT company_name FROM master_company WHERE company_code = "+Code+"")

    user.query("SELECT company_name FROM master_company WHERE company_code = "+Code+"")
        .then(function (x){
       if(x.recordset.length!==0){
           res.send({message: 'already'});
       }
       else
       {
          console.log("insert into [dbo].[master_company](company_code,company_name,del_status,created_on,created_by) values("+Code+",'"+name+"',0,CURRENT_TIMESTAMP,'"+created_by+"')")
           user.query("insert into [dbo].[master_company](company_code,company_name,del_status,created_on,created_by) values("+Code+",'"+name+"',0,CURRENT_TIMESTAMP,'"+created_by+"')")
               .then(function (datas) {
                   res.send({message: 'success'});
                  })
       }
    }, );
});

app.get('/companyshow',async(req,res)=>{
  var user = await getpool();
  user.query("select * from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
    console.log(miu)
       res.send(miu)
  }, )
}); 

app.post('/companyedit',async(req,res)=>{
  var user = await getpool();
  var company_code = req.body.company_code;
  var name = req.body.company_name;
  var modified_by = req.body.modified_by;

  user.query("update master_company set company_name= '"+name+"',modified_on= CURRENT_TIMESTAMP, modified_by ='"+modified_by+"' where company_code= '"+company_code+"' ").then(function (datas) {
      res.send({message: 'success'})
    }, )
});

app.post('/companydel',async(req,res)=>{
  var user = await getpool();
 var company_code = req.body.company_code;

 user.query("update master_company SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE company_code= '"+company_code+"' ").then(function (datas) {
       res.send({message: 'success'});
  }, )
});


app.get('/bankshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,bank_name,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,active_status,del_status from bank where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu);
  }, )
});
app.get('/dropdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_code from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  }, )
});
app.get('/compnamedown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_name from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  }, )
});
app.get('/depdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  dept_name from dept where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  }, )
});
app.get('/desigdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  desig_name from desigination where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)  
  }, )
});


app.post('/addplant' , async(req,res)=>
{
  // try{
      var plant_code = req.body.plant_code
      var plant_name = req.body.plant_name
      var pl = req.body.pl
      var address = req.body.address
      var location = req.body.location
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
  // }catch(err){
  //   console.log(err);
  //   res.send({"message":'failure'})
  // }
})

app.post('/deleteplant', async(req,res)=>
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

app.post('/updateplant', async(req,res)=>{
  try{

    var plant_code = req.body.plant_code
    var plant_name = req.body.plant_name
    var pl = req.body.pl
    var address = req.body.addr
    var location = req.body.locatn
    var personal_area = req.body.personal_area
    var payroll_area = req.body.payroll_area
    var company_code = req.body.company_code

    var pool =await db.poolPromise
    console.log("update plant set plant_code = '"+plant_code+"' , plant_name='"+plant_name+"', pl = '"+pl+"', addr = '"+address+"', locatn = '"+location+"', personal_area = "+personal_area+", payroll_area = "+payroll_area+", company_code = '"+company_code+"' where  plant_code='"+plant_code+"'")
        var user = await pool.request()

          .query("update plant set plant_code = '"+plant_code+"' , plant_name='"+plant_name+"', pl = '"+pl+"', addr = '"+address+"', locatn = '"+location+"', personal_area = "+personal_area+", payroll_area = "+payroll_area+", company_code = '"+company_code+"' where  plant_code='"+plant_code+"'")
          res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getplant', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from plant where del_status = 0") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})




app.post('/adddepartment' , async(req,res)=>
{
  try{
      var plant_name = req.body.plant_name
      var department_name = req.body.dept_name
      var sap_code = req.body.sap_code
      var pool =await db.poolPromise

      var result = await pool.request()
        .query("select plant_code from plant where plant_name = '"+plant_name+"'")
      var plant_code = result['recordset'][0].plant_code

      result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("department_name", department_name)
                          .input("sap_code", sap_code)
                          .query("Insert into department values(@department_name, @plant_code, 1, @sap_code)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deletedepartment', async(req,res)=>
{
  try{
  var dept_slno = req.body.slno
  var pool = await db.poolPromise
  console.log("update department set del_status = '0' where dept_slno = "+dept_slno+" ")

  var result = await pool.request()
    .query("update department set del_status = '0' where dept_slno = "+dept_slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updatedepartment', async(req,res)=>{
  try{

    var plant_name = req.body.plant_name
    var department_name = req.body.dept_name
    var sap_code = req.body.sap_code
    var dept_slno = req.body.dept_slno

    var pool =await db.poolPromise
    var result = await pool.request()
    .query("select plant_code from plant where plant_name = '"+plant_name+"'")
    var plant_code = result['recordset'][0].plant_code
    var user = await pool.request()
      .query("update department set plant_code = '"+plant_code+"' , dept_name='"+department_name+"', sap_code = '"+sap_code+"' where  dept_slno='"+dept_slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getdepartment', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select department.dept_slno, department.dept_name, department.plant_code,department.sap_code, plant.plant_name from department join plant on department.plant_code = plant.plant_code where department.del_staus=1") 

  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/plantcode', async(req,res)=>{
  console.log(req.body)
    var pool= await db.poolPromise
    var result =await pool.request()
      .query("select plant_name from plant where plant_code = '"+req.body.plantcode+"' ")
    res.send(result['recordset'])
})

app.post('/addline' , async(req,res)=>
{
  try{
      var line_name = req.body.Line_Name
      var dept_name = req.body.dept_name
      var personal_subarea = req.body.personal_subarea
      var created_by = req.body.created_by


      var pool =await db.poolPromise

      var result3 =await pool.request()
      .query("select dept_slno from department where dept_name = '"+dept_name+"' ")
      var module_code = result3['recordset'][0].dept_slno

      var result2 =await pool.request()
       .query("select plant_code from plant where plant_name = '"+req.body.plant_name+"' ")
      var plant_code = result2['recordset'][0].plant_code

      console.log(plant_code, req.body.plant_code)
      var result = await pool.request()
                          .input("plant_code", plant_code)
                          // .input("shop_code", shop_code)
                          .input("created_by", created_by)
                          .input("line_name", line_name)
                          .input("module_code", module_code)
                          .input("personal_subarea", personal_subarea)
                          .query("Insert into mst_line values( @line_name, 1, @module_code, 'N', @plant_code,  @created_by, CURRENT_TIMESTAMP,null,null, @personal_subarea)")
        res.send({'message': 'inserted'})
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteline', async(req,res)=>
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

app.post('/updateline', async(req,res)=>{
  try{

    var line_code = req.body.Line_code
    var line_name = req.body.Line_Name
    var dept_name = req.body.dept_name
    var plant_name = req.body.plant_name
    var personal_subarea = req.body.personal_subarea
    var modified_by = req.body.modified_by

    var pool =await db.poolPromise

    var result3 =await pool.request()
    .query("select dept_slno from department where dept_name = '"+dept_name+"' ")
    var module_code = result3['recordset'][0].dept_slno

    var result2 =await pool.request()
     .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
    var plant_code = result2['recordset'][0].plant_code
    
    console.log("  update mst_line set plant_code = '"+plant_code+"' , line_name='"+line_name+"' , shop_code=1 , module_code='"+module_code+"' , personal_subarea='"+personal_subarea+"', modified_by = '"+modified_by+"', modified_on = CURRENT_TIMESTAMP where  line_code='"+line_code+"'")

    var user = await pool.request()
      .query("  update mst_line set plant_code = '"+plant_code+"' , line_name='"+line_name+"' , shop_code=1 , module_code='"+module_code+"' , personal_subarea='"+personal_subarea+"', modified_by = '"+modified_by+"', modified_on = CURRENT_TIMESTAMP where  line_code='"+line_code+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getline', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
  .query("select mst_line.Line_code,plant.plant_name, department.dept_name, mst_line.Line_Name, mst_line.personal_subarea, mst_line.createddt, mst_line.Created_By, mst_line.modifieddt, mst_line.modifiedby from mst_line join plant on mst_line.plant_code = plant.plant_code join department on mst_line.Module_code = department.dept_slno where mst_line.plant_code = '"+req.body.plantcode+"' and mst_line.del_status = 'N' ")
  console.log("select mst_line.Line_Name, mst_line.Line_code, plant.plant_name ,mst_line.personal_subarea, mst_line.created_on, mst_line.Created_By, mst_line.modified_on, mst_line.modified_by from mst_line join plant on Mst_Line.Plant_code = plant.plant_code where mst_line.del_status = 'N' and Mst_Line.Plant_code = '"+req.body.plantcode+"' ")
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/adddesignation' , async(req,res)=>
{
  try{
      var plant_name = req.body.plant_name
      var desig_name = req.body.desig_name

      var pool =await db.poolPromise

      var result = await pool.request()
        .query("select plant_code from plant where plant_name = '"+plant_name+"'")
      var plant_code = result['recordset'][0].plant_code

      result = await pool.request()
                          .input("plant_code", plant_code)
                          .input("desig_name", desig_name)
                          .query("Insert into designation values(@desig_name, @plant_code, 1)")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deletedesignation', async(req,res)=>
{
  try{
  var slno = req.body.slno
  var pool = await db.poolPromise

  var result = await pool.request()
    .query("update designation set del_status = '0' where slno = "+slno+" ")
  res.send({'message': 'success'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }

  
})

app.post('/updatedesignation', async(req,res)=>{
  try{

    var plant_name = req.body.plant_name
    var desig_name = req.body.desig_name
    var slno = req.body.slno

    var pool =await db.poolPromise

    var result = await pool.request()
    .query("select plant_code from plant where plant_name = '"+plant_name+"'")
    var plant_code = result['recordset'][0].plant_code

    var user = await pool.request()
      .query("  update designation set plant_code = '"+plant_code+"' , desig_name='"+desig_name+"' where  slno='"+slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getdesignation', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select designation.slno, designation.desig_name, plant.plant_name from designation join plant on designation.plant_code = plant.plant_code where designation.del_status = 1") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/addbank' , async(req,res)=>
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

app.post('/deletebank', async(req,res)=>
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

app.post('/updatebank', async(req,res)=>{
  try{

    var bank_code = req.body.bank_code
    var bank_name = req.body.bank_name
    var slno = req.body.Slno+1

    var pool =await db.poolPromise
    console.log("update bank set bank_code = '"+bank_code+"' , bank_name='"+bank_name+"' where  slno= "+slno+" ")

    var user = await pool.request()
      .query("update bank set bank_code = '"+bank_code+"' , bank_name='"+bank_name+"' where  slno="+slno+" ")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getbank', async(req,res)=>{
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


app.post('/addoperation' , async(req,res)=>
{
  try{
      var oprn_desc = req.body.oprn_desc
      var plant_name = req.body.plant_name
      var skill_level = req.body.skill_level
      var critical_oprn = req.body.critical_oprn

      if (critical_oprn== 'NO' ){
        critical_oprn = 0;
      }
      else{
        critical_oprn = 1;
      }
      var pool =await db.poolPromise

      var result2 =await pool.request()
      .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
     var plant_code = result2['recordset'][0].plant_code

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

app.post('/deleteoperation', async(req,res)=>
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

app.post('/updateoperation', async(req,res)=>{
  try{

    var oprn_desc = req.body.oprn_desc
    var plant_name = req.body.plant_name
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

    var result2 =await pool.request()
    .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
   var plant_code = result2['recordset'][0].plant_code

      console.log(" update operations set plant_code = '"+plant_code+"' , oprn_desc='"+oprn_desc+"' , skill_level='"+skill_level+"' , critical_oprn='"+critical_oprn +"' where  oprn_slno='"+oprn_slno+"'")

    var user = await pool.request()
      .query(" update operations set plant_code = '"+plant_code+"' , oprn_desc='"+oprn_desc+"' , skill_level='"+skill_level+"' , critical_oprn='"+critical_oprn +"' where  oprn_slno='"+oprn_slno+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getoperation', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from operations join plant on operations.plant_code = plant.plant_code  where operations.del_status = 'N'") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})


app.post('/addemployee' , async(req,res)=>
{
  try{
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
    var is_tou = req.body.Is_TOU
    var plant_name = req.body.plant_name
    var line = req.body.Line_Name

      var pool =await db.poolPromise

      var result2 =await pool.request()
      .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
     var plant_code = result2['recordset'][0].plant_code

     var result3 =await pool.request()
     .query("select line_code from mst_line where line_name = '"+line+"' ")
    var line_code = result2['recordset'][0].line_code

    var result3 =await pool.request()
    .query("select dept_slno from department where dept_name = '"+department+"' ")
    var dept_slno = result2['recordset'][0].dept_slno
  
    var result3 =await pool.request()
    .query("select slno from designation where desig_name = '"+designation+"' ")
    var slno = result2['recordset'][0].slno

      var result = await pool.request()
      .query("select user_name from employees where user_name = '"+user_name+"'")
      
      if(result['recordset'].length > 0)
        res.send({'message': 'already'})
      else
      {
      result = await pool.request()
        .input("gen_id", gen_id)
        .input("emp_name", emp_name)
        .input("department", dept_slno)
        .input("designation", slno)
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
        .input("plant_code", plant_code)
        .input("line_code", line_code)
        .query("Insert into employees values(@gen_id, @emp_name,@department, @designation, @mail_id, @mobile_no, @user_name, @password,0,0,0,@is_supervisor,0,@plant_code,0,'N', @is_hr,@is_trainer,@is_hrappr, @is_reportingauth, @is_tou, @line_code)")
      res.send({'message': 'inserted'})
      }

  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteemployee', async(req,res)=>
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

app.post('/updateemployee', async(req,res)=>{
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
    var is_tou = req.body.Is_TOU
    var plant_name = req.body.plant_name
    var line = req.body.Line_Name


  var pool =await db.poolPromise

    var result2 =await pool.request()
    .query("select plant_code from plant where plant_name = '"+plant_name+"' ")
   var plant_code = result2['recordset'][0].plant_code

   console.log("select line_code from mst_line where line_name = '"+line+"' ")

   var result3 =await pool.request()
   .query("select line_code from mst_line where line_name = '"+line+"' ")
  var line_code = result3['recordset'][0].line_code

  var result4 =await pool.request()
  .query("select dept_slno from department where dept_name = '"+department+"' and plant_code = '"+plant_code+"' ")
  var dept_slno = result4['recordset'][0].dept_slno

  var result5 =await pool.request()
  .query("select slno from designation where desig_name = '"+designation+"' ")
  var slno = result5['recordset'][0].slno

  console.log(plant_code, line_code, dept_slno, slno)

    var user = await pool.request()
      .query("  update employees set plant_code = '"+plant_code+"' , gen_id='"+gen_id+"' , line_code='"+line_code+"' , is_tou='"+is_tou+"' , is_reportingauth='"+is_reportingauth+"' , is_supervisor='"+is_supervisor+"' , is_trainer='"+is_trainer+"' , is_hrappr='"+is_hrappr+"' , is_hr='"+is_hr+"' , password='"+password+"' , user_name='"+user_name+"' , mobile_no='"+mobile_no+"' , mail_id='"+mail_id+"' , designation='"+slno+"' , emp_name='"+emp_name+"' , department='"+dept_slno +"' where  user_name='"+user_name+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getemployee', async(req,res)=>{
  try{
  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select e.*,p.plant_name, l.Line_Name, d.dept_name, dd.desig_name  from employees as e join plant as p on e.plant_code = p.plant_code join mst_line as l on e.line_code = l.line_code  join department as d on e.Department = d.dept_slno join designation as dd on e.Designation = dd.slno where e.del_status = 'N'") 
  res.send(result['recordset'])
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})



app.post('/addshift' , async(req,res)=>
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
                          .query("Insert into mst_defaultshift values((SELECT max(shift_id) FROM mst_defaultshift) + 1, @shift_desc, @in_tm_min,@act_tm_from, @in_tm_max, @act_tm_to, @type, @shift_group, 1 ,@security_shift,@plant_code, @plant_desc, 'N')")
        res.send({'message': 'inserted'})
        
        
  }catch(err){
    console.log(err);
    res.send({"message":'failure'})
  }
})

app.post('/deleteshift', async(req,res)=>
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

app.post('/updateshift', async(req,res)=>{
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

    var pool =await db.poolPromise
    var user = await pool.request()
      .query("  update mst_defaultshift set plant_code = '"+plant_code+"' , shift_desc='"+shift_desc+"' , in_tm_min='"+in_tm_min+"' , act_tm_from='"+act_tm_from+"' , in_tm_max='"+in_tm_max+"' , act_tm_to='"+act_tm_to+"' , type='"+type+"' , shift_group='"+shift_group+"' , plant_id=2 , security_shift='"+security_shift+"' , plant_desc='"+plant_desc+"' where  shift_id='"+shift_id+"'")
      res.send({'message': 'updated'})
  }catch(err){
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/getshift', async(req,res)=>{
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

app.post('/evaluationdays', async(req,res)=>{
  try
  {
    var count;
  console.log(req.body);
  var pool = await db.poolPromise
  var start = req.body.status.split('-')[0]
  var end = req.body.status.split('-')[1]
  var id = req.body.id

  if(id==2)
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

  console.log("WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.*,DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) as diff FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno WHERE cte.record_count ='"+count+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) < '"+end+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) > '"+start+"' and apln_status = 'APPOINTED' ") 
     console.log("select *,DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) as diff from trainee_apln where  apln_status = 'APPOINTED'  and doj > '2022-09-05' and test_status = 'completed' and apln_slno not in (select apln_slno from post_evaluation)")

  if (id==2)
  {
    var result = await pool.request()
    .query("WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.*, DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as diff, d.dept_name, l.line_name FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code WHERE cte.record_count  = '"+count+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) < '"+end+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) > '"+start+"' and apln_status = 'APPOINTED' ") 
  }
  else if ((id==3 && count == 0) | (id==1 && count == 0) )
  {
    var result = await pool.request()
    .query("select t.*,DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as diff, d.dept_name, l.line_name from trainee_apln t JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code  where  apln_status = 'APPOINTED'  and doj > '2022-09-05' and test_status = 'completed' and apln_slno not in (select apln_slno from post_evaluation)")
  }
  else
  {
    var result = await pool.request()
    .query("WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.*, DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as diff, d.dept_name, l.line_name FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code WHERE cte.record_count  <= '"+count+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) < '"+end+"' and DATEDIFF(day, TRY_PARSE(doj AS DATE USING 'en-US'), GETDATE()) > '"+start+"' and apln_status = 'APPOINTED' ") 
  }

  res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/depttransfer', async(req, res)=>{
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
app.post('/onboard', async(req, res)=>{
  try
  {
    var pl = req.body.plantcode

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select * from trainee_apln where apln_status = 'APPROVED' and test_status = 'completed' and plant_code = '"+pl+"' ")
    
    res.send(result['recordset'])
  }
  catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/dept-line', async(req, res)=>{
  try
  {
    var line = req.body.line_code
    var dept = req.body.dept_slno

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select dept_name from department where dept_slno ="+dept+" ")
    var result1 = await pool.request()
      .query("select line_name from mst_line where line_code ="+line+" ")
    
    var object = [];
    object[0] = result['recordset'][0]
    object[1] = result1['recordset'][0]

    res.send(object)
  }
    catch(err)
  {
    console.log(err)
    res.send({"message":"failure"})
  }
})

app.post('/dept-line-report', async(req,res)=>
{
  var pool =await db.poolPromise

  var plantcode = req.body.plantcode

  console.log(plantcode)

    var result = await pool.request()
    .query("select emp_name from employees where plant_code = '"+plantcode+"' and is_ReportingAuth = 1 ")

    var result2 = await pool.request()
    .query("select dept_name from department where plant_code = '"+plantcode+"' and del_staus = 0 ")

    var result3 = await pool.request()
    .query("select line_name from mst_line where plant_code = '"+plantcode+"' and del_status = 'N'  ")
  
    var object = []
    object[0] = result['recordset']
    object[1] = result2['recordset']
    object[2] = result3['recordset']
    
  res.send(object)
}) ;

app.post('/reporting', async(req, res)=>{

  try{
  var pool =await db.poolPromise
  var gen_id = req.body.gen_id
  var dept = req.body.changedepartment
  var line = req.body.changeline
  var RA = req.body.reportingto
  var pl = req.body.plantcode

  console.log("update trainee_apln set dept_slno = (select top 1 dept_slno from department where dept_name = '"+dept+"' and plant_code = '"+pl+"'), line_code = (select top 1 line_code from mst_line where line_name = '"+line+"' and plant_code = '"+pl+"'), reporting_to = 1 where gen_id ='"+gen_id+"'  ")


  var result = await pool.request()
    .query("update trainee_apln set dept_slno = (select top 1 dept_slno from department where dept_name = '"+dept+"' and plant_code = '"+pl+"'), line_code = (select top 1 line_code from mst_line where line_name = '"+line+"' and plant_code = '"+pl+"'), reporting_to = 1 where gen_id ='"+gen_id+"'  ")

  res.send({message: 'success'})
  }
    catch(err)
    {
    console.log(err)
    res.send({"message":"failure"})
    }

})

app.post('/getonboard', async(req,res)=>
{
  var pool =await db.poolPromise

  var apln_slno = req.body.apln_slno

  console.log("select * from trainee_apln where apln_slno = '"+apln_slno+"' ")

  var details = await pool.request()
    .query("select * from trainee_apln where apln_slno = '"+apln_slno+"' ")

  var plantcode = details['recordset'][0].plant_code

  console.log(plantcode)

    var result = await pool.request()
    .query("select desig_name from designation where plant_code = '"+plantcode+"' ")

    var result2 = await pool.request()
    .query("select dept_name from department where plant_code = '"+plantcode+"'  ")

    var result3 = await pool.request()
    .query("select line_name from mst_line where plant_code = '"+plantcode+"'  ")
  
    var result4 = await pool.request()
    .query("select oprn_desc from operations where plant_code = '"+plantcode+"'  ")

    var result5 = await pool.request()
    .query("select emp_name from employees where plant_code = '"+plantcode+"' and is_ReportingAuth = 1 ")

    var object = []
    object[0] = details['recordset']
    object[1] = result['recordset']
    object[2] = result2['recordset']
    object[3] = result3['recordset']
    object[4] = result4['recordset']
    object[5] = result5['recordset']

  res.send(object)
}) ;

app.post('/get_eval_form', async(req,res)=>
{
  try{
  var pool =await db.poolPromise

  var apln_slno = req.body.apln_slno

  console.log("select t.*, d.dept_name, l.line_name, ds.desig_name from trainee_apln t join department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join designation ds on t.desig_slno = d.desig_slno where apln_slno = '"+apln_slno+"' ")

  var details = await pool.request()
    .query("select t.*, d.dept_name, l.line_name, ds.desig_name, p.new_level from trainee_apln t join department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code join designation ds on t.desig_slno = ds.slno join periodical_eval_level p on t.apln_slno = p.apln_slno where t.apln_slno = '"+apln_slno+"' ")

    var result1 = await pool.request()
    .query("select o.oprn_desc from periodical_eval_operations p join operations o on p.oprn_slno = o.oprn_slno where p.apln_slno = '"+apln_slno+"' ")

  var plantcode = details['recordset'][0].plant_code

  console.log(plantcode)

    var result2 = await pool.request()
    .query("select dept_name from department where plant_code = '"+plantcode+"'  ")

    var result3 = await pool.request()
    .query("select line_name from mst_line where plant_code = '"+plantcode+"'  ")
  
    var object = []
    object[0] = details['recordset']
    object[1] = result1['recordset']
    object[2] = result2['recordset']
    object[3] = result3['recordset']


  res.send(object)
  }
  catch(err)
  {
    res.send({message:'failure'})
    console.log(err)
  }

}) ;

module.exports = app;
