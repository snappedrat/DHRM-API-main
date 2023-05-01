const express = require('express')
const masterRouter = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
masterRouter.use(cors())
masterRouter.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
masterRouter.options('*', cors(corsOptions));

masterRouter.use(bodyParser.urlencoded({ extended: false }));
masterRouter.use(bodyParser.json());

masterRouter.post('/companyadd',verifyJWT,async(req,res)=>{
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
  
  masterRouter.get('/companyshow',verifyJWT,async(req,res)=>{
    try
    {
      var pool = await db.poolPromise
      var result = await pool.request()
        .query("select sno, company_code, company_name, status, CONVERT(varchar(10),CAST(created_on AS datetime), 103) as created_on, created_by, CONVERT(varchar(10),CAST(modified_on AS date), 103) as modified_on, modified_by, del_status from master_company where del_status=0")
      let miu=result['recordset'];
         res.send(miu)
  }
  catch(err)
  {
    console.log(err)
    res.send({message:'failure'})
  }
  }); 
  
  masterRouter.put('/companyedit',verifyJWT,async(req,res)=>{
  
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
  
  masterRouter.put('/companydel',verifyJWT,async(req,res)=>{
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
  
  masterRouter.post('/addplant' , verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/deleteplant',verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/updateplant',verifyJWT, async(req,res)=>{
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
  
  masterRouter.get('/getplant', verifyJWT,async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("SELECT p.plant_code, p.plant_name, p.pl, p.addr, p.locatn, p.personal_area, p.payroll_area, c.company_name,p.company_code, p.plant_sign FROM plant AS p JOIN master_company AS c ON p.company_code = c.company_code WHERE p.del_status = 0") 
    res.send(result['recordset'])
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  
  
  
  masterRouter.post('/adddepartment' ,verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/deletedepartment', verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updatedepartment',verifyJWT, async(req,res)=>{
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
  
  masterRouter.get('/getdepartment',verifyJWT, async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select department.dept_slno, department.dept_group, department.dept_name ,department.sap_code, plant.plant_name, department.plant_code from department join plant on department.plant_code = plant.plant_code where department.del_staus=1") 
  
    res.send(result['recordset'])
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  masterRouter.post('/plantcode', verifyJWT,async(req,res)=>{
    console.log(req.body)
      var pool= await db.poolPromise
      var result =await pool.request()
        .query("select plant_name from plant where plant_code = '"+req.body.plantcode+"' ")
      res.send(result['recordset'])
  })
  
  masterRouter.post('/addline' ,verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/deleteline', verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updateline',verifyJWT, async(req,res)=>{
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
  
  masterRouter.get('/getline',verifyJWT, async(req,res)=>{
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
  
  
  masterRouter.post('/adddesignation' , verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/deletedesignation',verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/updatedesignation',verifyJWT, async(req,res)=>{
    try{
      console.log(req.body)
  
      var plant_code = req.body.plant_name
      var desig_name = req.body.desig_name
      var slno = req.body.slno
  
      var pool =await db.poolPromise
  
      var result = await pool.request()
        .query("  update designation set plant_code = '"+plant_code+"' , desig_name='"+desig_name+"' where  slno='"+slno+"'")
        res.send({'message': 'updated'})
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  masterRouter.get('/getdesignation', verifyJWT,async(req,res)=>{
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
  
  
  masterRouter.post('/addbank' ,verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/deletebank', verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updatebank',verifyJWT, async(req,res)=>{
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
  
  masterRouter.get('/getbank',verifyJWT, async(req,res)=>{
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
  
  
  masterRouter.post('/addoperation' ,verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updateoperation', verifyJWT,async(req,res)=>{
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
  
  masterRouter.get('/getoperation',verifyJWT, async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("SELECT operations.oprn_slno, plant.plant_name, operations.plant_code, operations.oprn_desc , operations.critical_oprn, operations.line_code, operations.skill_level, operations.del_status FROM operations JOIN plant ON operations.plant_code = plant.plant_code WHERE operations.del_status = 'N';    ") 
    res.send(result['recordset'])
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  
  masterRouter.put('/deleteoperation',verifyJWT, async(req,res)=>
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
  
  masterRouter.post('/addemployee' ,verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/deleteemployee', verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updateemployee',verifyJWT, async(req,res)=>{
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
  
      var result = await pool.request()
        .query("update employees set line_code='"+line+"' , is_tou='"+is_tou+"' , access_master='"+access_master+"' ,is_admin = '"+is_admin+"' ,  is_reportingauth='"+is_reportingauth+"' , is_supervisor='"+is_supervisor+"' , is_trainer='"+is_trainer+"' , is_hrappr='"+is_hrappr+"' , is_hr='"+is_hr+"' , password='"+password+"' , user_name='"+user_name+"' , mobile_no='"+mobile_no+"' , mail_id='"+mail_id+"' , designation='"+designation+"' , emp_name='"+emp_name+"' , department='"+department+"' where  gen_id='"+gen_id+"'")
        res.send({'message': 'updated'})
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })
  
  masterRouter.get('/getemployee', verifyJWT,async(req,res)=>{
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
  
  
  
  masterRouter.post('/addshift' ,verifyJWT, async(req,res)=>
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
  
  masterRouter.put('/deleteshift', verifyJWT,async(req,res)=>
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
  
  masterRouter.put('/updateshift',verifyJWT, async(req,res)=>{
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
  
  masterRouter.get('/getshift', verifyJWT,async(req,res)=>{
    try{
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select shift_id,plant_code, plant_desc, shift_desc, CONVERT(varchar(8), act_tm_from, 108) as Shift_Start, CONVERT(varchar(8), act_tm_to, 108) as Shift_End , CONVERT(varchar(8), in_tm_min, 108) as Min_Time , CONVERT(varchar(8),in_tm_max , 108) as Max_Time, type,shift_group,security_shift,coff_eligible_hours from mst_defaultshift where del_status = 'N'") 
    res.send(result['recordset'])
    }catch(err){
      console.log(err)
      res.send({"message":"failure"})
    }
  })

masterRouter.get('/getLineName', verifyJWT,async(req,res)=>
{
  try
  {
  var pool =await db.poolPromise
  var dept_slno = req.query.dept_slno
  console.log(req.query)
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

masterRouter.get('/getall', verifyJWT, async(req,res)=>
{
  try{

    console.log(req.body)

  var pool =await db.poolPromise
  if(req.query.plantcode.search(':')>=0)
    var plantcode = req.query.plantcode
  else
    var plantcode = req.query.plantcode

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



module.exports = masterRouter