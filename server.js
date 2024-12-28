const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Carregar variáveis de ambiente
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Configuração do Pool de Conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER, // Use variável de ambiente para segurança
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Pode ser necessário para conexões SSL em bancos de dados na nuvem
  },
});

// Configuração CORS para permitir todas as origens
const corsOptions = {
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Aplica o middleware CORS
app.use(express.json()); // Middleware para parsing de JSON

// Endpoint para enviar PIX
app.post('/send-pix', async (req, res) => {
  const { pixAddressKey, pixAddressKeyType, value } = req.body;

  if (!pixAddressKey || !pixAddressKeyType || !value) {
    return res.status(400).json({ error: 'Pix address key, type, and value are required' });
  }

  const url = 'https://www.asaas.com/api/v3/transfers';
  const data = { value, pixAddressKey, pixAddressKeyType };

  const options = {
    method: 'POST',
    url,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: process.env.ASAAS_ACCESS_TOKEN, // Use o token da variável de ambiente
    },
    data,
  };

  try {
    const response = await axios.request(options);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error processing the Pix transfer:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error processing the Pix transfer' });
  }
});

// Endpoint para receber PIX
app.post('/receive-pix', async (req, res) => {
  const { value, description } = req.body;

  if (!description || !value) {
    return res.status(400).json({ error: 'Empty Pix value and description' });
  }

  const url = 'https://www.asaas.com/api/v3/paymentLinks';
  const data = {
    billingType: 'UNDEFINED',
    chargeType: 'DETACHED',
    name: 'Convite Perfeito',
    value,
    dueDateLimitDays: 2,
    description,
  };

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: process.env.ASAAS_ACCESS_TOKEN, // Use o token da variável de ambiente
    },
    data,
  };

  try {
    const response = await axios.request(options);
    if (response.data && response.data.url) {
      return res.status(200).json({ url: response.data.url });
    } else {
      return res.status(500).json({ error: 'Failed to retrieve payment URL' });
    }
  } catch (error) {
    console.error('Error processing Pix payment link:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
