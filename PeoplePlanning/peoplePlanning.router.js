const express = require('express')
const peoplePlanningRouter = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const verifyJWT = require('../Middleware/auth');

const cors = require('cors');
peoplePlanningRouter.use(cors())
peoplePlanningRouter.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
peoplePlanningRouter.options('*', cors(corsOptions));

peoplePlanningRouter.use(bodyParser.urlencoded({ extended: false }));
peoplePlanningRouter.use(bodyParser.json());

peoplePlanningRouter.get('/people_planning',verifyJWT, async(req,res)=>{

    var pool = await db.poolPromise
    var plantcode = req.query.plantcode
    var year = req.query.year
    var month = req.query.month
  
    console.log(req.body)
  
    var result = await pool.request()
    .query("select p.plan_slno, p.plan_month, p.plan_year ,d.dept_group, d.dept_name, m.line_name,p.shift1_reqd, p.shift2_reqd, p.shift3_reqd, p.genl_reqd, p.total_reqd from people_planning p join department d on p.dept_slno = d.dept_slno join mst_line m on m.line_code = p.line_code where p.plant_code = '"+plantcode+"' and plan_year = "+year+" and plan_month = "+month+" ")
    if(result['recordset'].length == 0)
    {
      var result2 = await pool.request()
      .query("select d.dept_slno, m.line_code, m.line_name,d.dept_name, d.dept_group  from mst_line m join department d on m.module_code = d.dept_slno where m.plant_code = '"+plantcode+"' and d.del_staus = 1 and m.del_status = 'N' ")
  
      res.send(result2['recordset'])
    }
    else
    {
      res.send(result['recordset'])
    }
  })
  
  peoplePlanningRouter.post('/people_planning_save', verifyJWT,async(req,res)=>{
  try
  {
     var pool = await db.poolPromise
     
     var details = req.body
     console.log(details[0])
  
     for(var i =0; i<details.length; i++)
     {
        var result = await pool.request()
        .input("plan_month", details[0].plant_month)
        .input("plan_year", details[0].plant_year)
        .input("plant_code", details[0].plant_code)
        .input("dept_slno", details[i].dept_slno)
        .input("line_code", details[i].line_code)
        .input("shift1_reqd", details[i].shift1)
        .input("shift2_reqd", details[i].shift2)
        .input("shift3_reqd", details[i].shift3)
        .input("genl_reqd", details[i].genl)
        .input("total_reqd", details[i].total)
        .input("created_by", details[0].created_by)
        // .input("modified_by", details[0].modified_by)
        // .input("modified_dt", details[0].modified_dt)
        // console.log("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values('"+details[0].plant_month+"', '"+details[0].plant_year+"', '"+details[0].plant_code+"', '"+details[i].dept_slno+"','"+details[i].line_code+"', '"+details[i].shift1_reqd+"', '"+details[i].shift2_reqd+"', '"+details[i].shift3_reqd+"', '"+details[i].genl_reqd+"', '"+details[i].total_reqd+"', '"+details[0].created_by+"', CURRENT_TIMESTAMP) ")
        .query("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code,oprn_slno, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values(@plan_month, @plan_year, @plant_code, @dept_slno,@line_code,23, @shift1_reqd, @shift2_reqd, @shift3_reqd, @genl_reqd, @total_reqd, @created_by, CURRENT_TIMESTAMP) ")
  
     }
      res.send({message: 'inserted'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message: 'failure'})
  }
  
  })
  
  peoplePlanningRouter.put('/people_planning_update', verifyJWT,async(req,res)=>{
  try
  {
     var pool = await db.poolPromise
     
     var details = req.body
     console.log(details)
  
     for(var i =0; i<details.length; i++)
     {
      if(details[i].shift1_reqd == null || details[i].shift1_reqd == undefined)
      {
  
      }
      else
      {
        var result = await pool.request()
        .input("plan_month", details[0].plant_month)
        .input("plan_year", details[0].plant_year)
        // .input("plant_code", details[0].plant_code)
        // .input("dept_slno", details[i].dept_slno)
        // .input("line_code", details[i].line_code)
        .input("shift1_reqd", details[i].shift1_reqd)
        .input("shift2_reqd", details[i].shift2_reqd)
        .input("shift3_reqd", details[i].shift3_reqd)
        .input("genl_reqd", details[i].genl_reqd)
        .input("total_reqd", details[i].total_reqd)
        .input("modified_by", details[0].created_by)
        // .input("modified_by", details[0].modified_by)
        // .input("modified_dt", details[0].modified_dt)
        // console.log("insert into people_planning(plan_month, plan_year, plant_code, dept_slno, line_code, shift1_reqd, shift2_reqd, shift3_reqd, genl_reqd, total_reqd, created_by, created_dt) values('"+details[0].plant_month+"', '"+details[0].plant_year+"', '"+details[0].plant_code+"', '"+details[i].dept_slno+"','"+details[i].line_code+"', '"+details[i].shift1_reqd+"', '"+details[i].shift2_reqd+"', '"+details[i].shift3_reqd+"', '"+details[i].genl_reqd+"', '"+details[i].total_reqd+"', '"+details[0].created_by+"', CURRENT_TIMESTAMP) ")
        .query("update people_planning set plan_month = @plan_month, plan_year =  @plan_year, shift1_reqd =  @shift1_reqd, shift2_reqd =  @shift2_reqd, shift3_reqd= @shift3_reqd , genl_reqd = @genl_reqd, total_reqd =@total_reqd, modified_by =  @modified_by, modified_dt = CURRENT_TIMESTAMP where plan_slno = "+details[i].plan_slno+" ")
      }
  
     }
      res.send({message: 'updated'})
  }
  catch(err)
  {
    console.log(err)
    res.send({message: 'failure'})
  }
  
  })
  
  peoplePlanningRouter.post('/people-planning-report', verifyJWT,async(req, res)=>{
  
    var pool = await db.poolPromise
    var year = req.body.year
    var month = req.body.month
    var plant_code = req.body.plant_code;
  
    var result = await pool.request()
      .query("select * from people_planning")
  
  })

  module.exports = peoplePlanningRouter