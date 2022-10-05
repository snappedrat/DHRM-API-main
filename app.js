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
let glob = 0;
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

});

app.post('/gethr', async(req,res)=>{
  var user = await getpool()

  var user_name = req.body.username;
  user.query("select Is_HR from employees where User_Name = '"+user_name+"'").then(function(datas){
    res.send(datas['recordset'])
  })
}
);

app.post('/gethrappr', async(req,res)=>{
  var user = await getpool()
  var user_name = req.body.username;
  user.query("select Is_HRAppr from employees where User_Name = '"+user_name+"'").then(function(datas){
    console.log('test', datas);
    res.send(datas['recordset'])
  })
}
);

app.post('/basicforms',async(req,res)=>{
    var user = await getpool();
    var  mobileNumber = req.body.mobileNumber;
    var permanent = req.body.permanent;
    var present = req.body.present;
    var name = req.body.fname;
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
    var religion = req.body.reg;
    var martial = req.body.mar;
    var phy_disable = req.body.pd;
    var mobilenumber = req.body.mobilenumber
    console.log('====================================');
    console.log("update trainee_apln set permanent_address = '"+permanent+"' ,present_address = '"+present+"' ,fullname = '"+name+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"' ");
    console.log('====================================');
    user.query("update trainee_apln set permanent_address = '"+permanent+"' ,present_address = '"+present+"' ,fullname = '"+name+"',fathername = '"+father+"', aadhar_no = '"+aadhar+"', birthdate = '"+dob+"' ,height = '"+height+"',weight = '"+weight+"' ,dose1_dt = '"+dose1+"',dose2_dt = '"+dose2+"' ,gender = '"+gender+"',nationality = '"+nation+"',religion = '"+religion+"',marital_status = '"+martial+"',physical_disability = '"+phy_disable+"' where mobile_no1 = '"+mobilenumber+"' ").then(function (datas) {
       console.log(req.body)
        res.send(datas['recordset']);
    })
});

app.post('/bankforms',async(req,res)=>{
    var user = await getpool();
    var account = req.body.account;
    var ifsc = req.body.ifsc;
    var bankName = req.body.bankName;
    var mobileNumber = req.body.mobilenumber
    
    user.query("update trainee_apln set bank_account_number = '"+account+"', ifsc_code = '"+ifsc+"', bank_name = '"+bankName+"' where mobile_no1 = '"+mobileNumber+"'").then(function (datas) {
      console.log("bank",req.body)
        res.send(datas);
    })
});

app.post('/plantcodelist', async(req,res)=>
{
  var user = await getpool();
  user.query("select plant_name from plant").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  })
}) ;

app.post('/companycodelist', async(req,res)=>
{
  var user = await getpool();
  user.query("select company_name from master_company").then(function(datas){
    miu = datas['recordset']
    res.send(miu)
  })
}) ;

app.post('/traineeformdata', async(req,res)=>
{
  var user = await getpool();
  var plantname = req.body.plant
  var companycode = req.body.company
  var mobileNumber = req.body.mobileNumber;
  var pass = req.body.pass;
  user.query("insert into trainee_apln(apln_slno,mobile_no1, plant_code, created_dt, for_quality, temp_password, apln_status) values((select max(apln_slno) from trainee_apln)+1,'"+mobileNumber+"' ,(select plant_code from plant where plant_name = '"+plantname+"'), CAST(getdate() AS date), 0, '"+pass+"', 'PENDING')").then(function(datas){
    let miu = datas['recordset']
    res.send(miu)
    console.log(req.body)
  })
  user.query("insert into trainee_apln_career(career_slno, apln_slno) values((select max(career_slno) from trainee_apln_career)+1,(select max(apln_slno) from trainee_apln)+1)")
  user.query("insert into trainee_apln_family(family_slno, apln_slno) values((select max(family_slno) from trainee_apln_family)+1,(select max(apln_slno) from trainee_apln))")
  user.query("insert into trainee_apln_qualifn(qual_slno, apln_slno) values((select max(qual_slno) from trainee_apln_qualifn)+1,(select max(apln_slno) from trainee_apln))")

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
    })
});

app.post('/family',async(req,res)=>{
  var user = await getpool();
  var details = req.body;
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  
  let append="";
      user.query("update trainee_apln_family set relation_name1= '"+details[0].name+"',relation_type1='"+details[0].relation+"',age1= '"+details[0].age+"',occupation1='"+details[0].occupation+"',contact_number1='"+details[0].contactnumber+"', dependent1= 0,  relation_name2= '"+details[1].name+"',relation_type2='"+details[1].relation+"',age2= '"+details[1].age+"',occupation2='"+details[1].occupation+"',contact_number2='"+details[1].contactnumber+"', dependent2= 0 , relation_name3= '"+details[2].name+"',relation_type3='"+details[2].relation+"',age3= '"+details[2].age+"',occupation3='"+details[2].occupation+"',contact_number3='"+details[2].contactnumber+"', dependent3= 0 , relation_name4= '"+details[3].name+"',relation_type4='"+details[3].relation+"',age4= '"+details[3].age+"',occupation4='"+details[3].occupation+"',contact_number4='"+details[3].contactnumber+"', dependent4= 0  where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')").then(function (datas) {
        console.log("family",details)
      })
});

app.post('/edu',async(req,res)=>{
  var user = await getpool();
  var details = req.body;
  let append="";
  console.log("test data", req.body)

  user.query("update trainee_apln_qualifn set school_name1='"+details[0].school+"',exam_passed1='"+details[0].passed+"',passing_yr1='"+details[0].year+"',subjects1='"+details[0].department+"',cert_number1='"+details[0].certificatenumber+"',cert_date1='"+details[0].certificatedate+"',percentage1='"+details[0].percentage+"', school_name2='"+details[1].school+"',exam_passed2='"+details[1].passed+"',passing_yr2='"+details[1].year+"',subjects2='"+details[1].department+"',cert_number2='"+details[1].certificatenumber+"',cert_date2='"+details[1].certificatedate+"',percentage2='"+details[1].percentage+"', school_name3='"+details[2].school+"',exam_passed3='"+details[2].passed+"',passing_yr3='"+details[2].year+"',subjects3='"+details[2].department+"',cert_number3='"+details[2].certificatenumber+"',cert_date3='"+details[2].certificatedate+"',percentage3='"+details[2].percentage+"', school_name4='"+details[3].school+"',exam_passed4='"+details[3].passed+"',passing_yr4='"+details[3].year+"',subjects4='"+details[3].department+"',cert_number4='"+details[3].certificatenumber+"',cert_date4='"+details[3].certificatedate+"',percentage4='"+details[3].percentage+"' where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')").then(function (datas) {
        console.log("education",details)
          res.send(datas['recordset']);
      })

  
});

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
  user.query("update trainee_apln set lang1_name = '"+ lang1.language+"' , lang1_speak = '"+ lang1.speak +"', lang1_read = '"+ lang1.read +"', lang1_write = '"+ lang1.write +"', lang1_understand = '"+ lang1.understand +"', lang1_mothertounge = '"+ lang1.mothertongue +"' where mobile_no1 = '7200292101' ").then(function(datas){
    console.log(datas)
    res.send(datas['recordset'])
  })
  user.query("update trainee_apln set lang2_name = '"+ lang2.language+"' , lang2_speak = '"+ lang2.speak +"', lang2_read = '"+ lang2.read +"', lang2_write = '"+ lang2.write +"', lang2_understand = '"+ lang2.understand +"', lang2_mothertounge = '"+ lang2.mothertongue +"' where mobile_no1 = '7200292101' ")
  user.query("update trainee_apln set lang3_name = '"+ lang3.language+"' , lang3_speak = '"+ lang3.speak +"', lang3_read = '"+ lang3.read +"', lang3_write = '"+ lang3.write +"', lang3_understand = '"+ lang3.understand +"', lang3_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '7200292101' ")
  user.query("update trainee_apln set lang4_name = '"+ lang4.language+"' , lang4_speak = '"+ lang4.speak +"', lang4_read = '"+ lang4.read +"', lang4_write = '"+ lang4.write +"', lang4_understand = '"+ lang4.understand +"', lang4_mothertounge = '"+ lang4.mothertongue +"' where mobile_no1 = '7200292101'")
  user.query("update trainee_apln set lang5_name = '"+ lang5.language+"' , lang5_speak = '"+ lang5.speak +"', lang5_read = '"+ lang5.read +"', lang5_write = '"+ lang5.write +"', lang5_understand = '"+ lang5.understand +"', lang5_mothertounge = '"+ lang5.mothertongue +"' where mobile_no1 = '7200292101' ")
  user.query("update trainee_apln set lang6_name = '"+ lang6.language+"' , lang6_speak = '"+ lang6.speak +"', lang6_read = '"+ lang6.read +"', lang6_write = '"+ lang6.write +"', lang6_understand = '"+ lang6.understand +"', lang6_mothertounge = '"+ lang6.mothertongue +"' where mobile_no1 = '7200292101'")
}
  console.log(details[0])
})



app.post('/prev',async(req,res)=>{
  var user = await getpool();
  var details = req.body;
  let append="";
      user.query("update trainee_apln_career set company_name1='"+details[0].name+"',designation1='"+details[0].desig+"',period_from1 ='"+details[0].periodof+"',period_to1='"+details[0].periodt+"',last_salary1='"+details[0].sal+"',leaving_reason1='"+details[0].reason+"', company_name2='"+details[1].name+"',designation2='"+details[1].desig+"',period_from2 ='"+details[1].periodf+"',period_to2='"+details[1].periodt+"',last_salary2='"+details[1].sal+"',leaving_reason2='"+details[1].reason+"',company_name3='"+details[2].name+"',designation3='"+details[2].desig+"',period_from3 ='"+details[2].periodf+"',period_to3='"+details[2].periodt+"',last_salary3 = '"+details[2].sal+"',leaving_reason3='"+details[2].reason+"', company_name4='"+details[3].name+"',designation4='"+details[3].desig+"',period_from4 ='"+details[3].periodf+"',period_to4='"+details[3].periodt+"',last_salary4='"+details[3].sal+"',leaving_reason4='"+details[3].reason+"' where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+details[0].mobile+"')").then(function (datas) {
        console.log("prev",details)
          res.send(datas['recordset']);
      })
  
});

app.post('/others',async(req,res)=>{
    var user = await getpool();
    var known = req.body.known;
    var work = req.body.work;
    var names = req.body.names;
    var place = req.body.place;
    var com = req.body.com;
    var extra = req.body.extra;
    var mobilenumber = req.body.mobilenumber;
    
    user.query("update trainee_apln set any_empl_rane='"+known+"',prev_rane_empl='"+work+"',existing_empl_name='"+names+"',existing_empl_company='"+place+"',prev_rane_exp='"+com+"',extra_curricular='"+extra+"' where mobile_no1 = '"+mobilenumber+"'  ").then(function (datas) {
      console.log("other",req.body)
        res.send(datas['recordset']);
    console.log(req.body);
    })
});

app.post('/filter', async(req,res)=>{
  var user = await getpool();
  var status = req.body.status
  var fromdate = req.body.fromdate
  var todate = req.body.todate

  user.query("select doj, fullname, fathername, birthdate, mobile_no1, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"' AND (created_dt between '"+fromdate+"' AND '"+todate+"')").then(function(datas){
    res.send(datas['recordset'])
  })
})

app.post('/filterforapproval', async(req,res)=>{
  var user = await getpool();
  var status = req.body.status

  user.query("select doj, fullname, fathername, birthdate, mobile_no1,trainee_idno, aadhar_no, apln_status from trainee_apln where apln_status = '"+status+"'").then(function(datas){
    res.send(datas['recordset'])
  })
})

app.post('/submitted', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'SUBMITTED' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log(datas)
    res.send(datas)
  })
})


app.post('/approved', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'APPROVED' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log(datas)
  })
})

app.post('/rejected', async(req,res)=>{
  var user = await getpool()
  var mob = req.body.mobile
  console.log(mob)
  user.query("update trainee_apln set apln_status = 'REJECTED' where mobile_no1 = '"+mob+"'").then(function(datas){
    console.log(datas)
  })
})

app.post('/getdataforid', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select fullname,fathername, trainee_idno,dept_slno, permanent_address, emergency_name, emergency_rel from trainee_apln where mobile_no1 = '"+mobile+"' ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  })

})

app.post('/getdatabasic', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln where mobile_no1 = '"+mobile+"' ").then(function(datas){
    console.log("one", datas['recordset']);
    res.send(datas['recordset'])
  })
})

app.post('/getdatafamily', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_family where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  })
})

app.post('/getdatacareer', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_career where apln_slno = (select apln_slno from trainee_apln where mobile_no1 = '"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  })
})

app.post('/getdataqualfn', async(req,res)=>{
  var user = await getpool()
  var mobile = req.body.mobile
  console.log(mobile)
  user.query("select * from trainee_apln_qualifn where apln_slno = (select apln_slno from trainee_apln where mobile_no1 ='"+mobile+"') ").then(function(datas1){
    console.log("one", datas1['recordset']);
    res.send(datas1['recordset'])
  })
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
    });
});

app.post('/desig',async(req,res)=>{
  var user = await getpool();
  var desig_name = req.body.desig_name;
  var company_code = req.body.company_code;
  console.log(req.body)
  user.query("insert into desigination(company_code,desig_name,del_status) values('"+company_code+"','"+desig_name+"',0)").then(function (datas) {
     console.log()
       res.send(datas);
  })
});

app.post('/bank',async(req,res)=>{
  var user = await getpool();
  var bank_name = req.body.bank_name;
  var active_status = req.body.active_status;
  console.log(req.body)
  user.query("insert into bank(bank_name,active_status,del_status,created_on) values('"+bank_name+"','"+active_status+"',0,CURRENT_TIMESTAMP)").then(function (datas) {
     console.log()
       res.send(datas);
  })
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
  })
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
  })
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
  })
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
  })
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
  })
});

app.post('/userdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE master_company SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  })
});

app.post('/desigdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE desigination SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  })
});

app.post('/deptdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE dept SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  })
});

app.post('/oprdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE operation SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  })
});

app.post('/bankdel',async(req,res)=>{
  var user = await getpool();
 var sno = req.body.user;
  console.log(req.body)
  user.query("UPDATE  bank SET del_status = 1,modified_on=CURRENT_TIMESTAMP WHERE sno="+sno).then(function (datas) {
     console.log()
       res.send(datas);
  })
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
  })
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
  })
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
  })
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

  })
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
  })
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
  })
});

app.get('/usershow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,company_code,company_name,status,CONVERT(varchar,created_on,105)as created_on,created_by, CONVERT(varchar,modified_on,105)as modified_on, modified_by from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
}); 

app.get('/deptshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,dept_name,plant_code,sap_code,CONVERT(varchar,created_on,105)as created_on,creted_by,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from dept where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});

app.get('/lineshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_name,dept_name,line_name,per_subarea,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from line where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});

app.get('/plantshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_code,plant_name,del_status,pl,addr,locatn,plant_sign,personal_area,payroll_area,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on from plant where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});

app.get('/oprshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,plant_code,opr_desc,skill_level,critical_opr,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,del_status,active_status from operation where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});

app.get('/desigshow',async(req,res)=>{
  var user = await getpool();
  user.query("select * from desigination where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu);
  })
});

app.get('/bankshow',async(req,res)=>{
  var user = await getpool();
  user.query("select sno,bank_name,CONVERT(varchar,created_on,105)as created_on,CONVERT(varchar,modified_on,105)as modified_on,modified_by,active_status,del_status from bank where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu);
  })
});
app.get('/dropdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_code from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});
app.get('/compnamedown',async(req,res)=>{
  var user = await getpool();
  user.query("select  company_name from master_company where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});
app.get('/depdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  dept_name from dept where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)
  })
});
app.get('/desigdown',async(req,res)=>{
  var user = await getpool();
  user.query("select  desig_name from desigination where del_status=0").then(function (datas) {
    let miu=datas['recordset'];
       res.send(miu)  
  })
});


module.exports = app;
