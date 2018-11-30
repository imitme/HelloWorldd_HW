var express = require('express');
var util = require('../util');
const {ObjectID}  = require('mongodb');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var ResponseType = {
  INVALID_USERNAME: 0,
  INVALID_PASSWORD: 1,
  SUCCESS: 2
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//userInfo
router.get('/info', util.isLogined, function(req,res,next)
{
  res.json({
    username: req.session.username,
    nickname: req.session.nickname
  });
});

// 로그인
router.post('/signin', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var database = req.app.get('database');
  var users = database.collection('users');

  if (username !== undefined && password !== undefined) 
  {
    users.findOne({ username: username }, function(err,result){
      if(result){
        var compareResult = bcrypt.compareSync(password, result.password);
        if(compareResult){  //if (password === result.password){
          req.session.isAuthenticated = true;
          req.session.userid = result._id.toString();
          req.session.username = result.username;
          req.session.nickname = result.nickname;
          
          res.json({result: ResponseType.SUCCESS});
        }else{
          res.json( {result: ResponseType.INVALID_PASSWORD} );  //'failure');
        }
      } else{
        res.json( {result: ResponseType.INVALID_USERNAME} );   //'failure');
      }
    });
  }
});


//Nickname 보내기2
router.post('/SendNickname', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var nickname;
  var database = req.app.get('database');
  var users = database.collection('users');

  if (username !== undefined && password !== undefined) 
  {
    users.findOne({ username: username }, function(err,result){
      if(result){
        if (username === result.username){
          res.json({
            nickname: result.nickname,
            result:ResponseType.SUCCESS
          });   //'success');
          
        }else{
          res.json( {result: ResponseType.INVALID_PASSWORD} );  //'failure');
        }
      } else{
        res.json( {result: ResponseType.INVALID_USERNAME} );   //'failure');
      }
    });
  }

});

/*
//Nickname 보내기
router.post('/SendNickname', function(req, res, next) {
  var username = req.body.username;

  var database = req.app.get('database');
  var users = database.collection('users');

  if(username !== undefined){
    users.findOne( {username: username }, function(err,result) {
      if(result){
        res.send('respond with a resource');
        res.json( {result: nickname } );
      }
      else{
        res.send('failure');
      }
    });
  }
});
*/



//사용자 등록
router.post('/add', function(req, res, next){
  
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  //var score = req.body.score;

  var salt = bcrypt.genSaltSync(saltRounds);  //추가
  var hash = bcrypt.hashSync(password,salt);  //추가

  var database = req.app.get("database");
  var users = database.collection('users');

  if(username !== undefined && password !== undefined && nickname !== undefined)
  {
    users.insert([ {"username" : username, 
                  "password" : hash,  //hash 넣어주기
                  "nickname" : nickname} ], 
                  function(err, result){
                    res.status(200).send("success");
                  });
  }
/*
  if(username !== undefined && password !== undefined && 
    nickname !== undefined && score !== undefined){
                 users.insert([ {"username" : username, 
                 "password" : password, 
                 "nickname" : nickname,  
                 "score" : score} ], 
                 function(err, result){
                   res.status(200).send("success");
                 });
 }
 */
});

//score 추가
router.get('/addscore/:score', util.isLogined, function(req, res, next){
  var database = req.app.get("database");
  var users = database.collection('users');

  var score = req.params.score;
  var userid = req.session.userid;   //var username = req.session.username;

  if(userid != undefined)
  {
    result = users.updateOne( 
      { _id : ObjectID(userid) },   //{username : username},
      { $set: {score: Number(score) , updateAt: Date.now()} }, 
      { upsert: true},
      function(err) 
      {
        if(err)
        {
          res.status(200).send("failure");
        }
        res.status(200).send("success");
      }
    ); 
  }
});

//score 불러오기
router.get('/score', util.isLogined, function(req, res, next){
  var database = req.app.get("database");
  var users = database.collection('users');

  var userid = req.session.userid;  //var username = req.session.username;

  users.findOne( {_id : ObjectID(userid)}, function(err, result) {
    if (err) throw err;

    var resultObj = {
      id : result._id.toString(),
      score: result.score
    };
    res.json(resultObj);
  });
});


module.exports = router;
