const https = require('https');

const createPayment = (req, res) => {
    const { order_id, amount } = req.body;
    const apiUrl = 'https://api.paytweak.dev/v1/links';
    const workToken = process.env.PAYTWEAK_SECRET_KEY;

    const postData = JSON.stringify({
        order_id: order_id,
        amount: amount,
        lang: 'FR',
        cur: 'EUR',
    });

    const options = {
        hostname: 'api.paytweak.dev',
        port: 443,
        path: '/v1/links',
        method: 'POST',
        headers: {
            'Paytweak-Token': workToken,
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
        },
        rejectUnauthorized: true,
    };

    const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            if (response.statusCode === 403) {
                res.status(403).json({ status: 'error', message: 'Accesso non autorizzato' });
            } else {
                res.status(200).json({ status: 'ok', data });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ status: 'error', error: error.message });
    });

    request.write(postData);
    request.end();
};

module.exports = {
    createPayment,
};
