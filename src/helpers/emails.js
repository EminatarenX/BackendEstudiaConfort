const nodemailer = require('nodemailer')

const emailRegistro = async (datos) => {

  const { correo, nombre, token } = datos


  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eminataren2002@gmail.com",
      pass: "mllyxowmntwaberp"
    }
  });


  //informacion del email
  const info = await transport.sendMail({
    from: '"EstudiaConfort - Conoce tu nueva habitación" <cuentas@estudiaconfort.com>',
    to: correo,
    subject: 'EstudiaConfort - Confirma tu cuenta!',
    text: 'Bienvenido a Estudia Confort, confirma tu cuenta',
    html: `
        <div style="padding: 40px 30px; background: linear-gradient(135deg, rgba(41,73,94,1) 0%, rgba(0,21,74,1) 100%);">
          <h1 style="font-weight: 700; font-size: 30px; color: white; margin-bottom: 20px;">Tu cuenta está casi lista. ¡Solo debes comprobarla haciendo clic en el siguiente enlace:</h1>
        
          <div style="display: flex; flex-direction: column; gap: 10px;">
              <a style="color: white;" href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>

                <p style="color: white; margin: 0;">Si no creaste esta cuenta, ignora este mensaje.</p>
          </div>
        </div>
        `

  })
}

module.exports = {
  emailRegistro
}