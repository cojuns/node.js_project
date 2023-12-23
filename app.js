const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000

var bodyParser = require('body-parser')

var session = require('express-session')

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

// 세션
app.use(session({secret: 'cojun', cookie:{maxAge: 60000}, resave:true, saveUninitialized:true}))

// locals 미들웨어 (변수 공유) (로그인 정보) 
app.use(function (req, res, next) {

  res.locals.user_id = ""
  res.locals.name = ""

  if(req.session.member){
  res.locals.user_id = req.session.member.user_id
  res.locals.name = req.session.member.name
  }
  next()
})

// 라우터
app.get('/', (req, res) => {

  // 로그인 정보 확인
  console.log(req.session.member);

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
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = 10;
    let searchTerm = req.query.searchTerm || ''; // 검색어 추가
    let sqlCount = `SELECT COUNT(*) AS total FROM contact WHERE name LIKE ?`;
    let sql = `SELECT * FROM contact WHERE name LIKE ? ORDER BY id DESC LIMIT ?, ?`;
  
    let likeTerm = `%${searchTerm}%`;
  
    connection.query(sqlCount, [likeTerm], function(err, data) {
      if (err) throw err;
  
      let total = data[0].total;
      let pageCount = Math.ceil(total / pageSize);
      let start = (page - 1) * pageSize;
  
      connection.query(sql, [likeTerm, start, pageSize], function(err, results, fields){
        if (err) throw err;
        
        const formattedResults = results.map(item => {
          item.regdate = moment(item.regdate).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
          return item;
        });
        
        res.render('contactList', {
          lists: formattedResults,
          currentPage: page,
          pageCount: pageCount,
          pageSize: pageSize,
          total: total,
          searchTerm: searchTerm
        });
      });
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
          console.log(result[0]);

          req.session.member = result[0]
          
          res.send("<script> alert('로그인 되었습니다.'); location.href='/'; </script>");
            
        }
        
    });

  })

  // 로그아웃 ( destroy 세션 파기 )
  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        // 오류 처리
        return res.status(500).send({ error: '로그아웃 중 오류 발생' });
      }
      // 성공 응답 전송
      res.send({ success: true });
    });
  });
  


app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소 : http://localhost: ${port}`)
})