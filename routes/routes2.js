const { Router } = require('express');
const { User, Appointment } = require('../models/appointment');
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

router.get('/new_Appointments', checkLogin, (req, res) => {
  const errors = req.flash('errors');
  res.render('newAppointments', {errors});
});

router.get('/', checkLogin, async (req, res) => {
  const user = await User.findAll(
    {include: [Appointment]}
  );
  const appo = await Appointment.findAll(
    {include: [User]}
  );
  res.render('mainPage',{
    users:user, 
    appo
  });
});

router.post('/addNewAppo', checkLogin, async (req, res) => {
  if(req.body.date==''||req.body.time==''||req.body.complain==''){
    return res.send('fail');
  }
  let dateCount = await Appointment.findAndCountAll({
    where:{
      date: req.body.date
    }
  })
  console.log(`la suma de los datos es ${dateCount.count}  la fecha es ${req.body.date}`)
  if(dateCount.count >= 3){
    req.flash('errors', 'ya esta el numero maximo de citas para ese dia');
    return res.redirect('/new_Appointments');
  }
  dateCount = 0;
  try {
    const appo = await Appointment.create({
      date: req.body.date,
      time: req.body.time,
      complain: req.body.complain,
      UserId: req.session.user.id 
    });
  } catch(err) {
    for (var key in err.errors) {
      req.flash('errors', err.errors[key].message);
    }
    return res.redirect('/new_Appointments');
  };
  res.redirect('/');
});

router.get('/:id', (req,res)=>{
  const id = req.params.id;
  if(id != undefined){
    res.render('error')
  }
});

router.get('/delete/:id' , async (req,res) => {
  const delAppointment = await Appointment.findByPk(req.params.id);
  await delAppointment.destroy();
  res.redirect('/');
});

router.get('/error',(req, res) => {
  res.render('error');
});

module.exports = router;