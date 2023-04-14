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

reportRouter.post('/trainee-report', verifyJWT, async (req, res) => {
  try {
    console.log(req.query);
    var fromdate = req.body.fromDate
    var todate = req.body.toDate
    var plantcode = req.body.plantcode


    let pool = await db.poolPromise
    var result = await pool.request()
      .query("select company_code,plant_code,apln_slno,entrydt,fullname,fathername,birthdate,gender,apprentice_type,aadhar_no,mobile_no1,doj,trainee_idno,dept_slno,line_code,reportingto,gen_id,sap_number,biometric,biometric_no,activestat,temp_password,created_dt,reporting_to,idno,emergency_name,emergency_rel,mobile_no2,bank_name,bank_account_number,ifsc_code,desig_slno,uan_number,dol,remarks_rejd,blood_group,title,state_name,city,pincode,workcontract,emp_grade,curr_skill,test_status,religion,apln_status,nationality,present_address,height,weight,permanent_address,physical_disability,marital_status,any_empl_rane,existing_empl_name,existing_empl_relation,existing_empl_company,existing_empl_dept,prev_rane_empl,prev_rane_exp,extra_curricular,lang1_name,lang1_speak,lang1_read,lang1_write,lang1_mothertounge,lang2_name,lang2_speak,lang2_read,lang2_write,lang2_mothertounge,lang3_name,lang3_speak,lang3_read,lang3_write,lang3_mothertounge,lang4_name,lang4_speak,lang4_read,lang4_write,lang4_mothertounge,lang5_name,lang5_speak,lang5_read,lang5_write,lang5_mothertounge,details_confirmation,photo_filename,other_files1,other_files2,other_files3,other_files4,other_files5,other_files6,other_files7,other_files8,other_files9,other_files10,other_files11,other_files12,other_files13,manpower,manpower_name,manpower_place,other_files14,isapproved,ischecked,rejectionreason,approved_dt,religion_sl,caste_name,collg_agency,for_quality,p_doj,lang6_name,lang6_speak,lang6_read,lang6_write,lang6_mothertounge,first_name,last_name,ident_mark1,ident_mark2,birth_place,pres_city,pres_state_name,pres_pincode,lang1_understand,lang2_understand,lang3_understand,lang4_understand,lang5_understand,lang6_understand,proc_lst,vaccine_name,dose1_dt,dose2_dt  from trainee_apln where created_dt >= '" + fromdate + "' and created_dt <= '" + todate + "' and plant_code = '" + plantcode + "' ")
    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
}
)
reportRouter.post('/test-summary-report', verifyJWT, async (req, res) => {
  try {
    var fromdate = req.body.fromDate
    var todate = req.body.toDate
    var plantcode = req.body.plantcode

    console.log("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as pretraining-percent, sum(posttraining_percent)/count(*) as sum2 from test_result_summary where submission_date >= '" + fromdate + "' and submission_date <= '" + todate + "' group by fullname, trainee_idno  ")

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as pre_training_percent, sum(posttraining_percent)/count(*) as post_training_percent from test_result_summary where submission_date >= '" + fromdate + "' and submission_date <= '" + todate + "' and plant_code = '" + plantcode + "'  group by fullname, trainee_idno  ")
    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

}
)
reportRouter.post('/evaluation-due-report', verifyJWT, async (req, res) => {
  try {
    var fromdate = req.body.fromDate
    var todate = req.body.toDate
    var plant_code = req.body.plant_code

    var pool = await db.poolPromise
    var result = await pool.request()
      .query(" WITH cte AS (SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) SELECT t.trainee_idno, t.fullname, d.dept_name, l.line_name , DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as Aging,cte.record_count as evaluation_completed FROM trainee_apln t INNER JOIN cte ON t.apln_slno = cte.apln_slno JOIN department d on t.dept_slno = d.dept_slno join mst_line l on t.line_code = l.line_code and apln_status = 'APPOINTED' AND t.apln_slno IN (SELECT distinct apln_slno FROM post_evaluation WHERE ra_entry = 'Y' and HR_Entry = 'Y') where t.plant_code = '" + plant_code + "' and t.doj >= '" + fromdate + "' and t.doj <= '" + todate + "' ")
    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

}
)


module.exports = reportRouter