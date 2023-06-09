const nodemailer = require('nodemailer')

const emailRegistro = async(datos) => {
  
  const {correo, nombre, token} = datos


  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5c73a16264e257",
      pass: "b0b35da0d73cce"
    }
  });


  //informacion del email
  const info = await transport.sendMail({
    from: '"EstudiaConfort - Conoce tu nueva habitacion" <cuentas@estudiaconfort.com>',
    to: correo,
    subject: 'EstudiaConfort - Confirma tu cuenta!',
    text: 'Bienvenido a Estudia Confort, confirma tu cuenta',
    html: ` <div style="padding: 40px 30px; display: flex; flex-direction: column; justify-content: center;gap: 20px; background: linear-gradient(135deg, rgba(41,73,94,1) 0%, rgba(0,21,74,1) 100%);">
    <h1 style="font-weigth: 700; font-size: 30px; color: white;">Tu cuenta esta casi lista! solo debes de comprobarla dando click en el siguiente enlace:</h1>

    <a style="color: white;" href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>

    <p style="color: white" >Si no creaste esta cuenta ignora este mensaje</p>
    </div>
    `
  })
}

module.exports = {
  emailRegistro
}