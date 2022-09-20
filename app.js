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

app.post('/basicforms',async(req,res)=>{
    var user = await getpool();
    var  mobileNumber = req.body.mobileNumber;
    var permanent = req.body.permanent;
    var present = req.body.present;
    var name = req.body.name;
    var father = req.body.fname;
    var dob = req.body.bd;
    var height = req.body.height;
    var perm_as_pres = req.body.checkbox;
    var weight = req.body.weight;
    var dose1 = req.body.dd1;
    var dose2 = req.body.dd2;
    var gender = req.body.gender;
    var aadhar1 = req.body.aadhar1;
    var nation = req.body.nation;
    var religion = req.body.reg;
    var martial = req.body.mar;
    var phy_disable = req.body.pd;
    console.log(req.body)
    user.query("insert into basicforms(mobileNumber,permanent,present,name,father,dob,height,perm_as_pres,weight,dose1,dose2,gender,aadhar,nation,religion,martial,phy_disable) values('"+mobileNumber+"','"+permanent+"','"+present+"','"+name+"','"+father+"','"+dob+"','"+height+"','"+perm_as_pres+"','"+weight+"','"+dose1+"','"+dose2+"','"+gender+"','"+aadhar1+"','"+nation+"','"+religion+"','"+martial+"','"+phy_disable+"')").then(function (datas) {
        console.log()
        res.send(datas);
    })
});

app.post('/bankforms',async(req,res)=>{
    var user = await getpool();
    var account = req.body.account;
    var ifsc = req.body.ifsc;
    var bankName = req.body.bankName;
    var sno = req.body.sno;
    console.log(req.body)
    user.query("insert into bankforms(acc_num,ifsc,bank_name)values('"+account+"','"+ifsc+"','"+bankName+"')").then(function (datas) {
        console.log()
        res.send(datas);
    })
});


app.post('/emergency',async(req,res)=>{
    var user = await getpool();
    var contactName = req.body.contactName;
    var contactNumber = req.body.contactNumber;
    var relations = req.body.relations;
    console.log(req.body)
    user.query("insert into emergency(name,ph_num,relation)values('"+contactName+"','"+contactNumber+"','"+relations+"')").then(function (datas) {
        console.log()
        res.send(datas);
    })
});

app.post('/family',async(req,res)=>{
    var user = await getpool();
    var details = req.body;
    let append="";
    for(var i=0;i<details.length;i++)
    {
        user.query("insert into family(name,relation,age,occupation,ph_no,dep_self)values('"+details[i].name+"','"+details[i].relation+"','"+details[i].age+"','"+details[i].occupation+"','"+details[i].contactNumber+"','"+details[i].dependant_self+"')").then(function (datas) {
            console.log()
            res.send();
        })

    }
});

app.post('/edu',async(req,res)=>{
    var user = await getpool();
    var details = req.body;
    let append="";
    for(var i=0;i<details.length;i++)
    {
        user.query("insert into edu(s_c,exampassed,YOP,mainsub,certificateno,certifieddate,percentage)values('"+details[i].s_c+"','"+details[i].examPassed+"','"+details[i].YOP+"','"+details[i].mainSub+"','"+details[i].certificateNo+"','"+details[i].certifiedDate+"','"+details[i].percentage+"')").then(function (datas) {
            console.log()
            res.send();
        })

    }
});

app.post('/prev',async(req,res)=>{
    var user = await getpool();
    var details = req.body;
    let append="";
    for(var i=0;i<details.length;i++)
    {
        user.query("insert into prev(nameofcompany,desig,pof,pot,sld,rfl)values('"+details[i].nameofcompany+"','"+details[i].desig+"','"+details[i].pof+"','"+details[i].pot+"','"+details[i].sld+"','"+details[i].rfl+"')").then(function (datas) {
            console.log()
            res.send();
        })

    }
});

app.post('/others',async(req,res)=>{
    var user = await getpool();
    var known = req.body.known;
    var work = req.body.work;
    var names = req.body.names;
    var place = req.body.place;
    var com = req.body.com;
    var extra = req.body.extra;
    console.log(req.body)
    user.query("insert into others(known,worked,name_rel,place,company_name,extra_activites)values('"+known+"','"+work+"','"+names+"','"+place+"','"+com+"','"+extra+"')").then(function (datas) {
        console.log()
        res.send(datas);
    console.log(req.body);
    })
});

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
     console.log()
       res.send(datas);
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
