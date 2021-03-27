const { Router } = require('express');
const { User, Score, Quest } = require('../models/triviaDB');
const router = Router();

function checkLogin(req, res, next) {
  if (req.session.user == null){
    res.redirect('login');
  }
  res.locals.user = req.session.user;
  next();
}

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/lets_a_play',checkLogin, async (req, res) => {
  const quest = await Quest.findAll();
  let questCount = await Quest.findAndCountAll();
  if(questCount > 3){
    res.redirect('new_quest')
  }
  const errors = req.flash('errors');
  let n1 = Math.floor(Math.random()*questCount.count);
  let n2 = Math.floor(Math.random()*questCount.count);
  let n3 = Math.floor(Math.random()*questCount.count);
  if(n1==n2||n2==n3||n3==n1){
    n1=Math.floor(Math.random()*questCount.count),
    n2=Math.floor(Math.random()*questCount.count),
    n3=Math.floor(Math.random()*questCount.count)
  }
  res.render('inGame', {
    quest,
    n1,
    n2,
    n3,
    errors
  });
});

router.post('/lets_a_play',checkLogin, async (req, res) => {
  if(req.body.quest1==undefined||req.body.quest2==undefined||req.body.quest3==undefined){
    req.flash('errors', 'tienes que seleccionar una opcion por pregunta');
    return res.redirect('/lets_a_play');
  }
  const r1 = await Quest.findOne({where: {answer_correct: req.body.quest1}});
  const r2 = await Quest.findOne({where: {answer_correct: req.body.quest2}});
  const r3 = await Quest.findOne({where: {answer_correct: req.body.quest3}});
  let a = 3;
  if(r1 == null){
    a--
  }
  if(r2 == null){
    a--
  }
  if(r3 == null){
    a--
  }
  const b = a * 100 / 3;
  const score = await Score.create({
    score: a,
    percentage: b,
    UserId: req.session.user.id
  })
  res.redirect('/');
});

router.get('/', checkLogin, async (req, res) => {
  let scoreCount = await Score.findAndCountAll();
  const ultimo = await Score.findOne({where: {id: scoreCount.count}});
  let ul = ultimo.score;
  let ulp = ultimo.percentage
  const user = await User.findAll(
    {include: [Score]}
  );
  const score = await Score.findAll(
    {include: [User]}
  );
  res.render('mainPage',{
    users:user, 
    score:score,
    ul,
    ulp
  });
});

router.get('/addNewQuest', checkLogin, (req, res) => {
  const errors = req.flash('errors');
  res.render('new_quest', {errors});
});

router.post('/addNewQuest', checkLogin, async (req, res) => {
  if(req.body.question==''||req.body.answer_correct==''||req.body.answer_fake_1==''||req.body.answer_fake_2==''){
    return res.send('fail');
  }
  try {
    const questions = await Quest.create({
      question: req.body.question,
      answer_correct: req.body.answer_correct,
      answer_fake_1: req.body.answer_fake_1,
      answer_fake_2: req.body.answer_fake_2
    });
  } catch(err) {
    for (var key in err.errors) {
      req.flash('errors', err.errors[key].message);
    }
    return res.redirect('/addNewQuest');
  };
  res.redirect('/');
});

router.get('/:id', (req,res)=>{
  const id = req.params.id;
  if(id != undefined){
    res.render('error')
  }
});

router.get('/error',(req, res) => {
  res.render('error');
});

module.exports = router;