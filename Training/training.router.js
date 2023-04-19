const express = require('express')
const trainingRouter = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
trainingRouter.use(cors())
trainingRouter.use(morgan('dev'));

const corsOptions = {
  origin: true,
  credentials: true
}
trainingRouter.options('*', cors(corsOptions));

trainingRouter.use(bodyParser.urlencoded({ extended: false }));
trainingRouter.use(bodyParser.json());

trainingRouter.get('/getQuestions', verifyJWT, async (req, res) => {
  try {
    var module = req.query.module
    module = module.split('.')[1]
    var username = req.query.username

    var pool = await db.poolPromise
    console.log("select question, correct_answer from question_bank2 where module_name = '" + module + "' and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') ")
    let result = await pool.request()
      .query("select * from question_bank2 where module_name = '" + module + "' and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') order by qslno ")

    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})
trainingRouter.get('/getQuestions_tnr', verifyJWT, async (req, res) => {
  try {
    var module = req.query.module
    var plant_code = req.query.plant_code

    var pool = await db.poolPromise
    let result = await pool.request()
      .query("select * from question_bank2 where module_name = '" + module + "' and plant_code = '" + plant_code + "' order by qslno ")

    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/getModules', verifyJWT, async (req, res) => {
  try {

    let username = req.query.username

    var pool = await db.poolPromise
    console.log("select * from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') and del_status = 'N' order by priorityval ")
    if (isNaN(parseInt(username))) {
      var result = await pool.request()
        .query("select* from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') and del_status = 'N' order by priorityval ")
    }
    else {
      var result = await pool.request()
        .query("select* from trg_modules where plant_code = '" + username + "' and del_status= 'N' order by priorityval ")
    }
    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/getTest', verifyJWT, async (req, res) => {

  try {
    let username = req.query.username
    let module = req.query.module
    module = module.split('.')[1]

    var pool = await db.poolPromise
    let result = await pool.request()
      .query("select * from ontraining_evalation where trainee_idno = '" + username + "' and module_name = '" + module + "' ")

    if (result['recordset'].length > 0)
      res.send({ 'test': 'post-test' })
    else
      res.send({ 'test': 'pre-test' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/Qualified', verifyJWT, async (req, res) => {
  try {
    var pool = await db.poolPromise;

    let username = req.query.username;
    let m = req.query.module;
    let pass_mark

    let module = m.split('.')[1]

    let index = m.split('.')[0]

    const result = await pool.request()
      .query("select * from ontraining_evalation where trainee_idno = '" + username + "' and module_name = '" + module + "' ")

    console.log(req.body)

    if (index == 1) {
      console.log("first module...............")
      if (result['recordset'].length == 0) {
        res.send({ 'message': 'qualified' })
      }
      else if (result['recordset'].length > 0) {
        var pass_criteria = await pool.request()
          .query("select pass_criteria from trg_modules where module_name = '" + module + "' and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "')  and del_status = 'N'")
        pass_mark = pass_criteria['recordset'][0].pass_criteria
        console.log(pass_mark)
        var score = await pool.request()
          .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '" + username + "' and module_name = '" + module + "'")
        console.log(score['recordset'][0].sum)
        if (score['recordset'][0].sum == null)
          res.send({ 'message': 'post-test' })

        else if (score['recordset'][0].sum >= pass_mark)
          res.send({ 'message': 'passed' })

        else
          res.send({ 'message': 'failed' })
      }
    }

    else if (index > 1) {
      console.log("next module...............")
      if (result['recordset'].length == 0) {
        var prev_module = await pool.request()
          .query(`select module_name from trg_modules where priorityval = ((select priorityval from trg_modules where module_name = '${module}'  and plant_code=(select plant_code from trainee_apln where trainee_idno='${username}'))-1) and plant_code = (select plant_code from trainee_apln where trainee_idno='${username}') `)

        // console.log("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '"+username+"' and module_name = '"+prev_module['recordset'][0].module_name+"'")

        var prev_score = await pool.request()
          .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '" + username + "' and module_name = '" + prev_module['recordset'][0].module_name + "'")

        var prev_pass_criteria = await pool.request()
          .query("select pass_criteria from trg_modules where module_name = '" + prev_module['recordset'][0].module_name + "' and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') ")

        pass_mark = prev_pass_criteria['recordset'][0].pass_criteria
        console.log(pass_mark)

        if (prev_score['recordset'][0].sum == null || prev_score['recordset'][0].sum < pass_mark) {
          res.send({ 'message': 'not qualified' })
        }
        else if (prev_score['recordset'][0].sum >= pass_mark) {
          res.send({ 'message': 'qualified' })
        }
      }
      else if (result['recordset'].length > 0) {
        var score = await pool.request()
          .query("select sum(posttraining_score) as sum from ontraining_evalation where trainee_idno = '" + username + "' and module_name = '" + module + "'")

        var pass_criteria = await pool.request()
          .query("select pass_criteria from trg_modules where module_name = '" + module + "' and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') ")

        pass_mark = pass_criteria['recordset'][0].pass_criteria
        console.log(pass_mark)

        if (score['recordset'][0].sum == null)
          res.send({ 'message': 'post-test' })
        else if (score['recordset'][0].sum >= pass_mark)
          res.send({ 'message': 'passed', 'marks': score['recordset'][0].sum })
        else
          res.send({ 'message': 'failed', 'marks': score['recordset'][0].sum, 'pass': pass_mark })
      }
    }

  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

})

trainingRouter.post('/pretest', verifyJWT, async (req, res) => {

  try {
    console.log(req.body);
    details = req.body
    var username = req.body[0].username
    var apln_slno = req.body[0].apln_slno
    var module = req.body[0].module
    module = module.split('.')[1]

    var pool = await db.poolPromise
    var result = await pool.request()
      .input('username', username)
      .input('module', module)
      .query("select * from question_bank2 where module_name = @module and plant_code = (select plant_code from trainee_apln where trainee_idno = @username) order by qslno")
    var plant_code = result['recordset'][0].plant_code
    for (i = 1; i < details.length; i++) {
      console.log(i)
      var insert_data = await pool.request()
        .query("insert into ontraining_evalation (trainee_idno , module_name , question, question_type, correct_answer, image_filename, plant_code, pretraining_date, pretraining_result, pretraining_score, pretrainingstat, priorityval , pretraining_pf, pretraining_percent,trainee_apln_slno, qslno) values('" + details[0].username + "','" + module + "',N'" + result['recordset'][i - 1].question + "','" + result['recordset'][i - 1].question_type + "','" + result['recordset'][i - 1].correct_answer + "','" + result['recordset'][i - 1].image_filename + "','" + result['recordset'][i - 1].plant_code + "',CURRENT_TIMESTAMP,'" + details[i].result + "','" + details[i].score + "','SUBMITTED','" + details[0].priorityval + "','" + details[0].pf + "','" + details[0].percent + "', '" + apln_slno + "', '" + details[i].slno + "' )")

    }

    var summary = await pool.request()
      .query("insert into test_result_summary (fullname , trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ((select fullname from trainee_apln where trainee_idno = '" + details[0].username + "'),'" + details[0].username + "','" + module + "','" + details[0].min_percent + "','" + details[0].curr_total + "','" + details[0].percent + "','" + details[0].pf + "','" + plant_code + "' ) ")

    var training = await pool.request()
      .query("update trainee_apln set test_status = 'in_training' where apln_slno = '" + apln_slno + "' ")

    res.send({ 'message': 'success' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.post('/posttest', verifyJWT, async (req, res) => {
  try {
    details = req.body
    var username = req.body[0].username
    var apln_slno = username.split('.')[2]
    var module = req.body[0].module
    module = module.split('.')[1]
    var slno = req.body[0].module.split('.')[0]
    console.log(details)
    var pool = await db.poolPromise
    var i = 1

    for (var i = 1; i < details.length; i++) {
      var result = await pool.request()
        .query("update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_result = '" + details[i].result + "' , posttraining_score = '" + details[i].score + "' , posttrainingstat = 'SUBMITTED', posttraining_pf = '" + details[0].pf + "', posttraining_percent = '" + details[0].percent + "' where qslno = '" + details[i].slno + "' ")
    }

    var summary = await pool.request()
      .query("update test_result_summary set submission_date = CURRENT_TIMESTAMP, posttraining_score = '" + details[0].curr_total + "', posttraining_pf = '" + details[0].pf + "', posttraining_percent = '" + details[0].percent + "'where trainee_idno = '" + details[0].username + "' and module_name = '" + module + "' ")

    var final = await pool.request()
      .query("select slno, pass_criteria from trg_modules where plant_code= (select plant_code from trainee_apln where trainee_idno = '" + username + "') and del_status = 'N' order by priorityval ")

    console.log(final['recordset'].length, slno)
    if (final['recordset'].length == slno) {
      if (details[0].curr_total >= final['recordset'][slno - 1].pass_criteria) {
        var last = await pool.request()
          .query("update trainee_apln set test_status = 'COMPLETED' where trainee_idno = '" + username + "' ")
      }
    }

    res.send({ 'message': 'success' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.post('/questionbank', verifyJWT, async (req, res) => {
  try {
    var details = req.body
    console.log(req.body)
    var insert = details.slice(details.length - (details[details.length - 1].inserted), details.length)
    var update = details.slice(0, details.length - (details[details.length - 1].inserted))

    console.log("11", insert)
    console.log("22", update)

    var pool = await db.poolPromise
    for (var i = 0; i < insert.length - 1; i++) {
      let image = insert[i].image_filename == undefined ? 'NULL' : insert[i].image_filename

      var result1 = await pool.request()
        .query("insert into question_bank2(module_name, question, question_type, correct_answer, image_filename, plant_code) values('" + insert[insert.length - 1].module.split('.')[1] + "',   N'" + insert[i].question + "' , 'O', '" + insert[i].correct_answer + "', '" + image + "', '" + insert[insert.length - 1].plantcode + "')")
    }
    for (var i = 0; i < update.length; i++) {

      var result3 = await pool.request()
        .query("update question_bank2 set question = N'" + update[i].question + "', correct_answer = '" + update[i].correct_answer + "' , image_filename = '" + update[i].image_filename + "' where qslno = " + update[i].qslno + " ")
    }

    res.send({ message: 'success' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

})

trainingRouter.post('/questionBankDelete', verifyJWT, async (req, res) => {
  try {
    var qslno = req.body.qslno
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("delete from question_bank2 where qslno = '" + qslno + "' ")
    res.send({ 'message': 'success' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/getTrainee', verifyJWT, async (req, res) => {
  try {
    var plantcode = req.query.plantcode

    var pool = await db.poolPromise

    var result = await pool.request()
      .query("select fullname ,trainee_idno from trainee_apln where plant_code = '" + plantcode + "' and apln_status = 'APPROVED' and (test_status IS NULL OR  test_status='IN_TRAINING')")
    res.send(result['recordset'])

  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/get_test_status', verifyJWT, async (req, res) => {
  try {

    var pool = await db.poolPromise

    var idno = req.query.idno
    var module_name = req.query.module_name
    console.log(req.query)

    var r = await pool.request()
      .input('module_name', module_name)
      .query("select pass_criteria from trg_modules where module_name = @module_name and plant_code = (select plant_code from trainee_apln where trainee_idno = '" + idno + "' )")

    var result = await pool.request()
      .input('module_name', module_name)
      .input('idno', idno)
      .query("select posttraining_score from ontraining_evalation where module_name = @module_name and trainee_idno = @idno ")

    if (result['recordset'].length == 0) {
      res.send({ status: 'pre-test' })
    }
    else if (result['recordset'].length == 1) {
      if (result['recordset'][0].posttraining_score == null) {
        res.send({ status: 'post-test' })
      }
      else if (result['recordset'][0].posttraining_score < r['recordset'][0].pass_criteria) {
        res.send({ status: 'exam failed' })
      }
      else {
        res.send({ status: 'already' })
      }
    }
    else {
      res.send({ status: 'already' })
    }
  }
  catch (err) {
    console.log(err)
    res.send({ 'error': err })
  }
}
)

trainingRouter.get('/getOfflineModule', verifyJWT, async (req, res) => {
  var plantcode = req.query.plantcode

  var pool = await db.poolPromise
  var result = await pool.request()
    .query("select * from trg_modules where plant_code = '" + plantcode + "' and category = 'OFFLINE' and del_status = 'N' order by priorityval ")

  res.send(result['recordset'])

})

trainingRouter.post('/offlineUpload', verifyJWT, async (req, res) => {
  try {
    console.log(req.body);
    var test = req.body.test
    var module = req.body.module
    var username = req.body.trainee
    username = username.trim()
    var file = req.body.file
    var score = req.body.score
    var priorityval = req.body.priorityval
    var percent = req.body.percent
    var pf = req.body.pf
    var min_percent = req.body.min_percent
    var plant_code = req.body.plant_code

    var pool = await db.poolPromise
    var apln = await pool.request()
      .query("select apln_slno from trainee_apln where trainee_idno = '" + username + "' ")

    let apln_slno = apln['recordset'][0].apln_slno
    if (test == 'pre-test') {
      var r = await pool.request()
        .query("select module_name from trg_modules where plant_code = '" + plant_code + "' and category='OFFLINE' ")
      console.log(r['recordset'][0].module_name, module)
      if (r['recordset'][0].module_name == module) {
        var last = await pool.request()
          .query("update trainee_apln set test_status = 'IN_TRAINING' where trainee_idno = '" + username + "' ")
      }

      var insert_data = await pool.request()
        .query("insert into ontraining_evalation(trainee_idno, module_name , plant_code ,pretraining_date, pretraining_score, uploadfile, pretrainingstat, priorityval, pretraining_pf, pretraining_percent, examattempt, trainee_apln_slno) values('" + username + "','" + module + "',(select plant_code from trainee_apln where trainee_idno = '" + username + "'),CURRENT_TIMESTAMP,'" + score + "','" + file + "','SUBMITTED','" + priorityval + "','" + pf + "','" + percent + "',1,'" + apln_slno + "' )")

      var summary = await pool.request()
        .query("insert into test_result_summary (fullname , trainee_idno, module_name, pass_percent, pretraining_score, pretraining_percent, pretraining_pf, plant_code) values ((select fullname from trainee_apln where trainee_idno = '" + username + "'),'" + username + "','" + module + "','" + min_percent + "','" + score + "','" + percent + "','" + pf + "','" + plant_code + "' ) ")

      res.send({ 'message': 'success' })
    }

    else if (test == 'post-test') {
      var update_data = await pool.request()
        .query("update ontraining_evalation set posttraining_date = CURRENT_TIMESTAMP, posttraining_score = '" + score + "' , posttrainingstat = 'SUBMITTED', posttraining_pf = '" + pf + "', posttraining_percent = '" + percent + "' where trainee_idno = '" + username + "' and module_name = '" + module + "' ")

      var summary = await pool.request()
        .query("update test_result_summary set submission_date = CURRENT_TIMESTAMP, posttraining_score = '" + score + "', posttraining_pf = '" + pf + "', posttraining_percent = '" + percent + "'where trainee_idno = '" + username + "' and module_name = '" + module + "' ")

      var final = await pool.request()
        .query(" select * from trg_modules where plant_code = (select plant_code from trainee_apln where trainee_idno = '" + username + "') and del_status = 'N' order by priorityval    ")

      console.log(final['recordset'][final['recordset'].length - 1].module_name, module, score)

      if (final['recordset'][final['recordset'].length - 1].module_name == module) {
        if (score >= final['recordset'][final['recordset'].length - 1].pass_criteria) {
          var last = await pool.request()
            .query("update trainee_apln set test_status = 'COMPLETED' where trainee_idno = '" + username + "' ")
        }
      }

      res.send({ 'message': 'success' })
    }

  }
  catch (err) {
    console.log(err)
    res.send({ 'error': err })
  }
}
)

trainingRouter.post('/addmodule', verifyJWT, async (req, res) => {
  try {
    console.log(req.body)
    var module_name = req.body.module_name
    var pass_criteria = req.body.pass_criteria
    var total_marks = req.body.total_marks
    var pass_percent = req.body.pass_percent
    var category = req.body.category
    var priorityval = req.body.priorityval
    var plantcode = req.body.plantcode

    var pool = await db.poolPromise

    var result = await pool.request()
      .query("insert into trg_modules values(N'" + module_name + "', " + total_marks + "," + pass_criteria + ", " + pass_percent + ", '" + category + "', 'N', " + priorityval + ", 0, '" + plantcode + "'  )")
    res.send({ 'message': 'inserted' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.put('/deletemodule', verifyJWT, async (req, res) => {
  try {
    var slno = req.body.slno
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("update trg_modules set del_status = 'Y' where slno = " + slno + " ")
    res.send({ 'message': 'success' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.put('/updatemodule', verifyJWT, async (req, res) => {

  try {
    var slno = req.body.slno
    var module_name = req.body.module_name
    var pass_criteria = req.body.pass_criteria
    var total_marks = req.body.total_marks
    var pass_percent = req.body.pass_percent
    var category = req.body.category
    var priorityval = req.body.priorityval
    var plantcode = req.body.plantcode

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("update trg_modules set module_name = N'" + module_name + "' , pass_criteria='" + pass_criteria + "', total_marks = '" + total_marks + "', pass_percent = '" + pass_percent + "', category = '" + category + "', priorityval = '" + priorityval + "' where slno = '" + slno + "' ")
    res.send({ 'message': 'updated' })
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }
})

trainingRouter.get('/testSummary', verifyJWT, async (req, res) => {
  try {
    var details = req.query
    console.log(req.query)

    console.log("select fullname, trainee_idno,MAX(submission_date)  as submission_date, sum(pretraining_percent)/count(*) as sum1,  sum(posttraining_percent)/count(*) as sum2 from test_result_summary where submission_date >= '" + details.start + "' and submission_date <= '" + details.end + "  23:59:59'  and plant_code = '" + details.plantcode + "' group by fullname, trainee_idno  ")

    var pool = await db.poolPromise
    var result = await pool.request()
      .query("EXEC filterevalation @frmdt = '" + details.start + "', @todt = '" + details.end + "', @plant_code = '" + details.plantcode + "' ")
    // .query("select ts.fullname, ts.trainee_idno,MAX(ts.submission_date) as submission_date, sum(ts.pretraining_percent)/count(*) as sum1,  sum(ts.posttraining_percent)/count(*) as sum2 from test_result_summary ts join trainee_apln t on ts.trainee_idno = t.trainee_idno where ts.submission_date >= '"+details.start+"' and ts.submission_date <= '"+details.end+"  23:59:59' and ts.plant_code = '"+details.plantcode+"' group by ts.fullname, ts.trainee_idno  ")
    res.send(result['recordset'])

  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

})

trainingRouter.get('/traineeScorecard', verifyJWT, async (req, res) => {
  try {
    var idno = req.query.trainee_idno
    var pool = await db.poolPromise
    var result = await pool.request()
      .query("EXEC filterevalation_trainee @trainee_idno = '" + idno + "' ")
    res.send(result['recordset'])
  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

})

trainingRouter.get('/traineeAnswers', verifyJWT, async (req, res) => {
  try {
    console.log(req.query)
    var idno = req.query.idno
    var module = req.query.module
    var pool = await db.poolPromise

    var result2 = await pool.request()
      .query("select category from trg_modules where module_name = '" + module + "'  ")
    console.log(result2.recordset);
    if (result2['recordset'][0].category == 'ONLINE') {
      var result = await pool.request()
        .query("select * from ontraining_evalation where trainee_idno = '" + idno + "' and module_name = '" + module + "' ")
      var object = []
      object[0] = result['recordset']
      object[1] = { status: 'ONLINE' }
      res.send(object)
    }
    else if (result2['recordset'][0].category == 'OFFLINE') {
      var result = await pool.request()
        .query("select * from ontraining_evalation where trainee_idno = '" + idno + "' and module_name = '" + module + "' ")
      var object = []
      object[0] = result['recordset']
      object[1] = { status: 'OFFLINE' }
      res.send(object)
    }

  }
  catch (err) {
    console.log(err)
    res.send({ message: 'failure' })
  }

})

module.exports = trainingRouter