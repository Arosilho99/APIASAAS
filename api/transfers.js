const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { pixAddressKey, pixAddressKeyType, value } = req.body;

      const response = await fetch('https://www.asaas.com/api/v3/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': '$aact_MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmVlMmE2ZjQwLWQ4YjktNDI4My04NjIxLTkyZmNhNTk5ZjRhNTo6JGFhY2hfZTRkYzY4YjMtZDgyNS00Mzc5LWJhY2UtOTNlZjFhNTVkZTA5', // Variável de ambiente para o token
        },
        body: JSON.stringify({ pixAddressKey, pixAddressKeyType, value }),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao processar a requisição.' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};