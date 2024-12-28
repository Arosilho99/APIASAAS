const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração CORS para permitir todas as origens
const corsOptions = {
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Aplica o middleware CORS com a configuração
app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json());

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
      access_token: process.env.ASAAS_ACCESS_TOKEN || 'SEU_ACCESS_TOKEN',
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
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: process.env.ASAAS_ACCESS_TOKEN || 'SEU_ACCESS_TOKEN',
    },
      body: JSON.stringify({
        billingType: 'UNDEFINED',
        chargeType: 'DETACHED',
        name: 'Convite Perfeito',
        value,
        dueDateLimitDays: 2,
        description,
      }),
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();
  
      // Verifica se a API retornou o campo `url`
      if (data && data.url) {
        return res.status(200).json({ url: data.url });
      } else {
        return res.status(500).json({ error: 'Failed to retrieve payment URL' });
      }
    } catch (error) {
      console.error('Error processing Pix payment link:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Iniciar o servidor
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
  