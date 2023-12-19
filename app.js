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

// 정적 파일 (이미지)
app.use(express.static(__dirname + '/public'));

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

  // 자료 데이터베이스에 삽입
    let sql = `INSERT INTO contact(name, phone, email, memo, regdate) VALUES (?, ?, ?, ?, NOW())`;

    connection.query(sql, [name, phone, email, memo], function(err, result) {
        if (err) throw err;
        console.log('자료 1개를 삽입하였습니다.');
        res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/contactList'; </script>");
    });


  })

  // 값 출력
  const moment = require('moment-timezone');

  app.get('/contactList', (req, res) => {
    let sql = `SELECT * FROM contact ORDER BY id DESC`;
    connection.query(sql, function(err, results, fields){
      if (err) throw err;
      
      const formattedResults = results.map(item => {
        item.regdate = moment(item.regdate).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
  
      res.render('contactList', {lists: formattedResults});
    });
  });
  

  // 값 삭제
  app.get('/contactDelete', (req, res) => {
    let idx = req.query.idx
    let sql = `DELETE FROM contact WHERE id = ?`;
    connection.query(sql, [idx], function(err, result) {
      if (err) throw err;
      res.send("<script> alert('삭제되었습니다.'); location.href='/contactList'; </script>");
    });
  });

  // 로그인
  app.get('/login', (req, res) => {
    res.render('login')
  })

  app.post('/loginProc', (req, res) => {
    
    const user_id = req.body.user_id;
    const pw = req.body.pw;


  let sql = `SELECT * FROM member where user_id=? and pw=?`;

  let values = [user_id, pw];

    connection.query(sql, values, function(err, result) {
        if (err) throw err;
        if(result.length == 0){
          res.send("<script> alert('존재하지 않는 아이디입니다.'); location.href='/login'; </script>");
        }else{
          res.send(result);
        }
        
    });


  })


app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소 : http://localhost: ${port}`)
})