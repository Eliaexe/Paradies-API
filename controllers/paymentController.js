const createPayment = (req, res) => {
    const { order_id, amount } = req.body;
    const apiUrl = 'https://api.paytweak.dev/v1/links/';

    const requestBody = {
        order_id: order_id,
        amount: amount,
        lang: 'FR',
        cur: 'EUR',
    };

    if (typeof fetch !== 'undefined') {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            res.status(200).json({ status: 'ok', data });
        })
        .catch(error => {
            res.status(500).json({ status: 'error', error: error.message });
        });
    } else {
        res.status(500).json({ status: 'error', error: 'Ambiente non supporta l\'API fetch' });
    }
};

module.exports = {
    createPayment,
};
