const { Router } = require('express');
const { User } = require('../models/triviaDB');
const bcrypt = require('bcrypt');
const router = Router();

// 1. Cargar los formularios para login y register
router.get('/login', async (req, res) => {
  const errors = req.flash('errors');
  res.render('login', {errors: errors});
});

// 2. Ruta para registrar nuevos usuarios (formulario de registro)
router.post('/register', async (req, res) => {
  // Primero encriptamos la contraseña
  if(req.body.password != req.body.password_confirm){
    req.flash('errors', "las contraseñas tienen que ser iguales");
    return res.redirect('/login');
  }
  const password_encrypted = await bcrypt.hash(req.body.password, 10);
  try {
    console.log('pass', password_encrypted);
    // Después intentamos ingresar el nuevo usuario
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: password_encrypted
    });
    // guardamos el usuario creado en session
    req.session.user = user;
  } catch(err) {
    // En el caso de algún error, guardamos los errores en "errors", y redirigimos al formulario
    for (var key in err.errors) {
      req.flash('errors', err.errors[key].message);
    }
    return res.redirect('/login');
  };
  // si la validación es correcta, redirigimos al usuario al HOME
  res.redirect('/');
});

// 3. Ruta para que los usuarios que ya existen, entren a la plataforma (formulario de login)
router.post('/login', async (req, res) => {
  // Primero intentamos recuperar el usuario por su email
  const user = await User.findOne({where: {email: req.body.email}});
  if (user == null) {
    // en caso de que ese email no exista
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta');
    return res.redirect('/login');
  }
  // Después comparamos contraseñas
  var isCorrect = await bcrypt.compare(req.body.password, user.password);
  if (isCorrect == false) {
    // en caso de que ese email no exista
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta');
    return res.redirect('/login');
  }
  // Finalmente redirigimos al home
  req.session.user = user;
  res.redirect('/')
});

// 4. Ruta para cerrar sesión
router.get('/logout', async (req, res) => {
  req.session.user = null;
  res.redirect('/login');
});

module.exports = router;