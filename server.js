const express = require('express');
const cors = require('cors');
const axios = require('axios');

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
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: '$aact_MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmVlMmE2ZjQwLWQ4YjktNDI4My04NjIxLTkyZmNhNTk5ZjRhNTo6JGFhY2hfZTRkYzY4YjMtZDgyNS00Mzc5LWJhY2UtOTNlZjFhNTVkZTA5',
    },
    data,
    url,
  };

  try {
    const response = await axios(options);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing the Pix transfer' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
