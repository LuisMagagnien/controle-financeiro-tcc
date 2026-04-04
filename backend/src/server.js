require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth',       require('./routes/auth'))
app.use('/transacoes', require('./routes/transacoes'))
app.use('/metas',      require('./routes/metas'))
app.use('/carteiras',  require('./routes/carteiras'))

app.get('/', (req, res) => res.json({ status: 'API rodando!' }))

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))