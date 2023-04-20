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

    console.log(`select t.company_code as "Company Code",
              t.plant_code as "Plant Code",
              t.apln_slno as "Application Slno",
              t.entrydt as "Entry Date" ,
              t.fullname as "Full Name" ,
              t.fathername as "Father Name",
              t.birthdate as "Date of Birth",
              t.gender  as "Gender",
              t.apprentice_type as "Apprentic Type",
              t.aadhar_no as "Aaadhar Number",
              t.mobile_no1 as "Mobile Number",
              t.doj as "Date of Join",
              t.trainee_idno as "Trainee ID No",
              t.dept_slno as "Department Slno",
              t.line_code as "Line Code",
              t.reporting_to as "Reporting to Officer",
              t.gen_id as "Gen ID",
              t.sap_number as "Sap Number",
              t.any_empl_rane as "employee rane",
              t.existing_empl_name as "existing empl name",
              t.existing_empl_relation as "existing empl relation",
              t.existing_empl_company as "existing empl company",
              t.existing_empl_dept as "existing empl dept",
              t.prev_rane_empl as "prev rane empl",
              t.prev_rane_exp as "prev rane exp",
              t.extra_curricular as "extra curricular",
              t.lang1_name as "lang1 name",
              t.lang1_speak as "lang1 speak",
              t.lang1_read as "lang1 read",
              t.lang1_write as "lang1 write",
              t.lang1_mothertounge as "lang1 mothertounge",
              t.lang2_name as "lang2 name",
              t.lang2_speak as "lang2 speak",
              t.lang2_read as "lang2 read",
              t.lang2_write as "lang2 write",
              t.lang2_mothertounge as "lang2 mothertounge",
              t.lang3_name as "lang3 name",
              t.lang3_speak as "lang3 speak",
              t.lang3_read as "lang3 read",
              t.lang3_write as "lang3 write",
              t.lang3_mothertounge as "lang3 mothertounge",
              t.lang4_name as "lang4 name",
              t.lang4_speak as "lang4 speak",
              t.lang4_read as "lang4 read",
              t.lang4_write as "lang4 write",
              t.lang4_mothertounge as "lang4 mothertounge",
              t.lang5_name as "lang5 name",
              t.lang5_speakas as "lang5 speaker",
              t.lang5_read as "lang5 read",
              t.lang5_write as "lang5 write",
              t.lang5_mothertounge as "lang5 mothertounge",
              t.details_confirmation as "details confirmation",
              t.photo_filename as "photo filename",
              t.other_files1 as "other files1",
              t.other_files2 as "other files2",
              t.other_files3 as "other files3",
              t.other_files4 as "other files4",
              t.other_files5 as "other files5",
              t.other_files6 as "other files6",
              t.other_files7 as "other files7",
              t.other_files8 as "other files8",
              t.other_files9 as "other files9",
              t.other_files10 as "other files10",
              t.other_files11 as "other files11",
              t.other_files12 as "other files12",
              t.other_files13 as "other files13",
              t.manpower as "manpower",
              t.manpower_name as "manpower name",
              t.manpower_place as "manpower place",
              t.other_files14 as "other files14",
              t.isapproved as "isapproved",
              t.ischecked as "ischecked",
              t.rejectionreason as "rejectionreason",
              t.approved_dt as "approved dt",
              t.religion_sl as "religion sl",
              t.caste_name as "caste name",
              t.collg_agency as "collg agency",
              t.for_quality as "for quality",
              t.p_doj as "p doj",
              t.lang6_name as "lang6 name",
              t.lang6_speak as "lang6 speak",
              t.lang6_read as "lang6 read",
              t.lang6_write as "lang6 write",
              t.lang6_mothertounge as "lang6 mothertounge",
              t.first_name as "first name",
              t.last_name as "last name",
              t.ident_mark1 as "ident mark1",
              t.ident_mark2 as "ident mark2",
              t.birth_place as "Birth Place",
              t.pres_city as "pres city",              
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
              t.dose1_dt as "Dose-1 Result",
              dose2_dt as "Dose-2 Result" from trainee_apln t left join department d on t.dept_slno = d.dept_slno left join mst_line m on m.line_code = t.line_code left join employees e on t.reporting_to = e.empl_slno  where created_dt >= `+fromdate+` and created_dt <= `+todate+` and plant_code = `+plantcode+` `)

    let pool = await db.poolPromise
    var result = await pool.request()
      .query(`select t.company_code as "Company Code",
              t.plant_code as "Plant Code",
              t.apln_slno as "Application Slno",
              t.entrydt as "Entry Date" ,
              t.fullname as "Full Name" ,
              t.fathername as "Father Name",
              t.birthdate as "Date of Birth",
              t.gender  as "Gender",
              t.apprentice_type as "Apprentic Type",
              t.aadhar_no as "Aaadhar Number",
              t.mobile_no1 as "Mobile Number",
              t.doj as "Date of Join",
              t.trainee_idno as "Trainee ID No",
              d.dept_name as "Department Name",
              m.line_name as "Line Name",
              e.emp_name as "Reporting to Officer",
              t.dept_slno as "Department Slno",
              t.line_code as "Line Code",
              t.gen_id as "Gen ID",
              t.sap_number as "Sap Number",
              t.any_empl_rane as "employee rane",
              t.existing_empl_name as "existing empl name",
              t.existing_empl_relation as "existing empl relation",
              t.existing_empl_company as "existing empl company",
              t.existing_empl_dept as "existing empl dept",
              t.prev_rane_empl as "prev rane empl",
              t.prev_rane_exp as "prev rane exp",
              t.extra_curricular as "extra curricular",
              t.lang1_name as "lang1 name",
              t.lang1_speak as "lang1 speak",
              t.lang1_read as "lang1 read",
              t.lang1_write as "lang1 write",
              t.lang1_mothertounge as "lang1 mothertounge",
              t.lang2_name as "lang2 name",
              t.lang2_speak as "lang2 speak",
              t.lang2_read as "lang2 read",
              t.lang2_write as "lang2 write",
              t.lang2_mothertounge as "lang2 mothertounge",
              t.lang3_name as "lang3 name",
              t.lang3_speak as "lang3 speak",
              t.lang3_read as "lang3 read",
              t.lang3_write as "lang3 write",
              t.lang3_mothertounge as "lang3 mothertounge",
              t.lang4_name as "lang4 name",
              t.lang4_speak as "lang4 speak",
              t.lang4_read as "lang4 read",
              t.lang4_write as "lang4 write",
              t.lang4_mothertounge as "lang4 mothertounge",
              t.lang5_name as "lang5 name",
              t.lang5_speak as "lang5 speaker",
              t.lang5_read as "lang5 read",
              t.lang5_write as "lang5 write",
              t.lang5_mothertounge as "lang5 mothertounge",
              t.details_confirmation as "details confirmation",
              t.photo_filename as "photo filename",
              t.other_files1 as "other files1",
              t.other_files2 as "other files2",
              t.other_files3 as "other files3",
              t.other_files4 as "other files4",
              t.other_files5 as "other files5",
              t.other_files6 as "other files6",
              t.other_files7 as "other files7",
              t.other_files8 as "other files8",
              t.other_files9 as "other files9",
              t.other_files10 as "other files10",
              t.other_files11 as "other files11",
              t.other_files12 as "other files12",
              t.other_files13 as "other files13",
              t.manpower as "manpower",
              t.manpower_name as "manpower name",
              t.manpower_place as "manpower place",
              t.other_files14 as "other files14",
              t.isapproved as "isapproved",
              t.ischecked as "ischecked",
              t.rejectionreason as "rejectionreason",
              t.approved_dt as "approved dt",
              t.religion_sl as "religion sl",
              t.caste_name as "caste name",
              t.collg_agency as "collg agency",
              t.for_quality as "for quality",
              t.p_doj as "p doj",
              t.lang6_name as "lang6 name",
              t.lang6_speak as "lang6 speak",
              t.lang6_read as "lang6 read",
              t.lang6_write as "lang6 write",
              t.lang6_mothertounge as "lang6 mothertounge",
              t.first_name as "first name",
              t.last_name as "last name",
              t.ident_mark1 as "ident mark1",
              t.ident_mark2 as "ident mark2",
              t.birth_place as "Birth Place",
              t.pres_city as "pres city",              
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
              t.dose1_dt as "Dose-1 Result",
              dose2_dt as "Dose-2 Result" from trainee_apln t left join department d on t.dept_slno = d.dept_slno left join mst_line m on m.line_code = t.line_code left join employees e on t.reporting_to = e.empl_slno  where created_dt >= '`+fromdate+`' and created_dt <= '`+todate+`' and t.plant_code = '`+plantcode+`' `)
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