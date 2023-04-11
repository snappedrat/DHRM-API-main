const express = require('express')
const skillDevRouter = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
skillDevRouter.use(cors())
skillDevRouter.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
skillDevRouter.options('*', cors(corsOptions));

skillDevRouter.use(bodyParser.urlencoded({ extended: false }));
skillDevRouter.use(bodyParser.json());

skillDevRouter.get('/eval_pending_approval', async(req,res)=>{
    try
    {
      console.log(req.query);
      var pool = await db.poolPromise
      var start = req.query.status.split('-')[0]
      var end = req.query.status.split('-')[1]
      var plant_code = req.query.plantcode
  
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
  
  skillDevRouter.post('/evaluationdays',verifyJWT, async(req,res)=>{
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
    var year = req.body.year
  
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
        .query("EXEC POST_EVALUATION_LIST_HR_BASIC @plant_code = "+plant_code+", @year = "+year+" ")  
      }
      else if(filter == 'APPROVED')
      {
        var result = await pool.request()
        .query("exec POST_EVALUATION_LIST_HR_FILTER @start= "+start+" , @end = "+end+", @count="+count+", @plant_code = '"+plant_code+"', @year = "+year+" ")
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
        .query(" EXEC POST_EVALUATION_LIST_HR @start= "+start+" , @end = "+end+" , @count = "+count+", @plant_code = '"+plant_code+"', @year = "+year+" ")    
      }
      else if(filter == 'APPROVED')
      {
        var result = await pool.request()
        .query(" EXEC POST_EVALUATION_LIST_HR_FILTER @start= "+start+" , @end = "+end+" , @count = "+count+", @plant_code = '"+plant_code+"', @year = "+year+" ")    
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
  
  skillDevRouter.get('/evaluationDueSupervisor', verifyJWT, async(req, res)=>
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
  
  
  
  
  skillDevRouter.get('/get_eval_form',verifyJWT, async(req,res)=>
  {
    try{
    var pool =await db.poolPromise
  
    var apln_slno = req.query.apln_slno
  
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
  
  skillDevRouter.post('/eval_form',verifyJWT, async(req, res)=>
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
  
  skillDevRouter.get('/get_eval_sup',verifyJWT, async(req, res)=>
  {
    try
    {
      var apln_slno = req.query.apln_slno
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
  
  skillDevRouter.put('/eval_form_sup',verifyJWT, async(req,res)=>
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

module.exports = skillDevRouter