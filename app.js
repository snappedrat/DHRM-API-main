const express = require('express')
const app = express()
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('./db');
const multer = require('multer');
const fs = require("fs");
const nodemailer = require('nodemailer');
const verifyJWT = require('./Middleware/auth');
const jwt = require('jsonwebtoken')
const cors = require('cors');
app.use(cors())
app.use(morgan('dev'));

const corsOptions = {
    origin: true,
    credentials: true
}
app.options('*', cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function getpool() {
    const pool = await db.poolPromise;
    const result = await pool.request();
    return result;
  }

const masterRouter = require('./Masters/master.router')
const hrOperation = require('./HROperation/hrOperation.router')
const training = require('./Training/training.router')
const skillDev = require('./SkillDevelopement/skillDevelopement.router')
const peoplePlanning = require('./PeoplePlanning/peoplePlanning.router')
const report = require('./reports/report.router')
const login = require('./Login/login.router')

app.use('/master', masterRouter)
app.use('/hrOperation', hrOperation)
app.use('/training', training)
app.use('/skilldev', skillDev)
app.use('/peopleplanning', peoplePlanning)
app.use('/report', report)
app.use('/login', login)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var q_bank = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "qbank";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var plant_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "plant";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var offline_test_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "offline_test";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var skill_dev_ = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "skill_dev";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var storage = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
     cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

var filedrop1 = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
    const folder = "filedrop";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    cb(null, folder); 
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});
var filedrop2 = multer.diskStorage({ 
  
  destination: function(req, file, cb) { 
      cb(null, process.env.FILEDROP);    
  }, 
  filename: function (req, file, cb) { 
     cb(null ,file.originalname);   
  }
});

const destA = multer({ storage: filedrop1 })
const destB = multer({ storage: filedrop2 })

function fileDrop(req, res, next) {
  destA.single('file')(req, res, next);
  destB.single('file')(req, res, next);
  next();
}

const qbank = multer({storage: q_bank}).single('file')
const upload = multer({storage: storage}).single('file')
const plant = multer({storage: plant_}).single('file')
const offline_test = multer({storage: offline_test_}).single('file')
const skill_dev = multer({storage: skill_dev_}).single('file')

app.use('/uploads',express.static('uploads'))
app.use('/qbank',express.static('qbank'))
app.use('/plant',express.static('plant'))
app.use('/skill_dev',express.static('skill_dev'))
app.use('/offline_test',express.static('offline_test'))
app.use('/filedrop',express.static('filedrop'))

app.post('/questionbankupload', qbank , verifyJWT,async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/plantupload', plant ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/offline_test_upload', offline_test ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/skill_dev_upload', skill_dev , verifyJWT,async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})
app.post('/filedrop', fileDrop ,verifyJWT, async(req,res)=>
{
  console.log(req.body)
  res.send({'message':'success'})
})


app.post("/image", upload , verifyJWT, async(req, res) => {
  
  var user = await getpool()
    res.send({'Message':req.body,"file": req.file})

    var name = req.file.path
    var mobile = req.body.mobile
    var company = req.body.company
    var fileno = req.body.fileno
    user.query("update trainee_apln set other_files"+fileno+" = '"+name+"' where mobile_no1= '"+mobile+"' and company_code = (select company_code from master_company where sno = "+company+")  "  )

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = app;
