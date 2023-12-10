const fetch = require('node-fetch');  // Import the 'node-fetch' library

const createPayment = (req, res) => {
    const {order_id, amount} = req.body;
    const apiUrl = 'https://api.paytweak.dev/v1/links/';

    const requestBody = {
        order_id: order_id,
        amount: amount,
        lang: 'FR',
        cur: 'EUR',
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        res('ok', data);
    })
    .catch(error => {
        res('error', error);
    });
};

module.exports = {
    createPayment,
  };
