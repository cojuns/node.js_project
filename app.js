const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000

var bodyParser = require('body-parser')

// 환경 변수 로드
require('dotenv').config();

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(bodyParser.urlencoded({ extended: false }))

// 라우터
app.get('/', (req, res) => {
  res.render('index') // ./view/index.ejs
})

app.get('/profile', (req, res) => {
    res.render('profile')
  })

  app.get('/map', (req, res) => {
    res.render('map')
  })

  app.get('/contact', (req, res) => {
    res.render('contact')
  })

  // npm install body-parser 설치 필요(미들웨어)
  app.post('/contactProc', (req, res) => {
    
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const memo = req.body.memo;

    let sql = `INSERT INTO contact(name, phone, email, memo, regdate) VALUES (?, ?, ?, ?, NOW())`;

    connection.query(sql, [name, phone, email, memo], function(err, result) {
        if (err) throw err;
        console.log('자료 1개를 삽입하였습니다.');
        res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/'; </script>");
    });


  })

app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소 : http://localhost: ${port}`)
})