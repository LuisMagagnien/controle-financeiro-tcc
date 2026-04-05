const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function enviarEmailRecuperacao(email, nome, token) {
  const link = `${process.env.FRONTEND_URL}/recuperar-senha?token=${token}`

  await transporter.sendMail({
    from: `"FinanControl" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperação de senha — FinanControl',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Recuperação de senha</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
        <a href="${link}" style="
          display: inline-block;
          background-color: #4ade80;
          color: #1a1a2e;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        ">Redefinir senha</a>
        <p style="color: #888; font-size: 13px;">
          Este link expira em 1 hora. Se você não solicitou a recuperação, ignore este e-mail.
        </p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #aaa; font-size: 12px;">FinanControl — Controle financeiro inteligente</p>
      </div>
    `,
  })
}

module.exports = { enviarEmailRecuperacao }