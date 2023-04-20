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
      .query(`select t.company_code as Company_Code,
              t.plant_code as Plant_Code,
              t.apln_slno as Application Slno,
              t.entrydt as entrydt ,
              t.fullname as full name ,
              t.fathername as father name,
              t.birthdate as birth date,
              t.gender  as gender,
              t.apprentice_type as apprentic type,
              t.aadhar_no as aadhar no,
              t.mobile_no1 as mobile no,
              t.doj as date of join,
              t.trainee_idno as trainee id no,
              t.dept_slno as dept slno,
              t.line_code as line code,
              t.reportingto as reportingto,
              t.gen_id as gen id,
              t.sap_number as sap number,
              t.biometricas as biometricas,
              t.biometric_no as biometric,
              t.activestat as activestat,
              t.temp_password as temp password,
              t.created_dt as created dt,
              t.reporting_to as reporting to,
              t.idno as id no,
              t.emergency_name as emergency name,
              t.emergency_rel as emergency rel,
              t.mobile_no2 as mobile no2,
              t.bank_name as bank name,
              t.bank_account_number as bank account number,
              t.ifsc_code as ifsc code,
              t.desig_slno as design slno,
              t.uan_number as uan number,
              t.dol as dol,
              t.remarks_rejd as remark rejd,
              t.blood_group as blood group,
              t.title as title,
              t.state_name as state name,
              t.city as city,
              t.pincode as pincode,
              t.workcontract as workcontract,
              t.emp_grade as emp grade,
              t.curr_skill as curr skill,
              t.test_status as test status ,
              t.religion as religion,
              t.apln_status as apln status,
              t.nationality as nationality,
              t.present_address as present address,
              t.height as height,
              t.weight as weight,
              t.permanent_address as permant address,
              t.physical_disability as physical disability,
              t.marital_status as martical status,
              t.any_empl_rane as any employe rane,
              t.existing_empl_name as existing empl name ,
              t.existing_empl_relation as existing empl relation,
              t.existing_empl_company as existing empl company,
              t.existing_empl_dept as existing empl dept,
              t.prev_rane_empl as prev rane empl,
              t.prev_rane_exp as prev rane exp,
              t.extra_curricular as extra curricular,
              t.lang1_name as lang1 name,
              t.lang1_speak as lang1 speak,
              t.lang1_read as lang1 read,
              t.lang1_write as lang1 write,
              t.lang1_mothertounge as lang1 mothertounge,
              t.lang2_name as lang2 name,
              t.lang2_speak as lang2 speak,
              t.lang2_read as lang2 read,
              t.lang2_write as lang2 write,
              t.lang2_mothertounge as lang2 mothertounge,
              t.lang3_name as lang3 name,
              t.lang3_speak as lang3 speak,
              t.lang3_read as lang3 read,
              t.lang3_write as lang3 write,
              t.lang3_mothertounge as lang3 mothertounge,
              t.lang4_name as lang4 name,
              t.lang4_speak as lang4 speak,
              t.lang4_read as lang4 read,
              t.lang4_write as lang4 write,
              t.lang4_mothertounge as lang4 mothertounge,
              t.lang5_name as lang5 name,
              t.lang5_speakas as lang5 speaker,
              t.lang5_read as lang5 read,
              t.lang5_write as lang5 write,
              t.lang5_mothertounge as lang5 mothertounge,
              t.details_confirmation as details confirmation,
              t.photo_filename as photo filename,
              t.other_files1,
              t.other_files2,
              t.other_files3,
              t.other_files4,
              t.other_files5,
              t.other_files6,
              t.other_files7,
              t.other_files8,
              t.other_files9,
              t.other_files10,
              t.other_files11,
              t.other_files12,
              t.other_files13,
              t.manpower,
              t.manpower_name,
              t.manpower_place,
              t.other_files14,
              t.isapproved,
              t.ischecked,
              t.rejectionreason,
              t.approved_dt,
              t.religion_sl,
              t.caste_name,
              t.collg_agency,
              t.for_quality,
              t.p_doj,
              t.lang6_name,
              t.lang6_speak,
              t.lang6_read,
              t.lang6_write,
              t.lang6_mothertounge,
              t.first_name,
              t.last_name,
              t.ident_mark1,
              t.ident_mark2,
              t.birth_place as Birth Place,
              t.pres_city,
              t.pres_state_name,
              t.pres_pincode,
              t.lang1_understand,
              t.lang2_understand,
              t.lang3_understand,
              t.lang4_understand,
              t.lang5_understand,
              t.lang6_understand,
              t.proc_lst,
              t.vaccine_name,
              t.dose1_dt as Dose-1 Result,
              dose2_dt as Dose-2 Result from trainee_apln t left join department d on t.dept_slno = d.dept_slno left join mst_line m on m.line_code = t.line_code left join employees e on t.reporting_to = e.empl_slno  where created_dt >= ${fromdate} and created_dt <= ${todate} and plant_code = ${plantcode} `)
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