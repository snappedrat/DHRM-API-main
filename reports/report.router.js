const express = require('express')
const reportRouter = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
reportRouter.use(cors())
reportRouter.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
reportRouter.options('*', cors(corsOptions));

reportRouter.use(bodyParser.urlencoded({ extended: false }));
reportRouter.use(bodyParser.json());

reportRouter.post('/trainee-report',verifyJWT, async(req,res)=>
{
  try
  {
  console.log(req.query);
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
reportRouter.post('/test-summary-report',verifyJWT, async(req,res)=>
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
reportRouter.post('/evaluation-due-report', verifyJWT,async(req,res)=>
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


module.exports = reportRouter