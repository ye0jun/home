var express = require('express');
var router = express.Router();

const password = '0419mm';
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.password == password)
    res.redirect('/airconditional');
  else
    res.render('index', { title: 'Express' });
});

router.get('/airconditional', function(req, res, next) {
  if(req.session.password != password)
    res.redirect('/');
  else
    res.render('airconditional', { title: 'Express' });
});

router.post('/enterance',function(req, res, next) {
  req.session.password = req.body.password;
  res.redirect('/airconditional');
});


router.post('/', function(req, res, next){
});

module.exports = router;
