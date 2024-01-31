const https = require('https');
const querystring = require('querystring');

class PaytweakWrapper {
  constructor(keyPublic = '', keyPrivate = '') {
    this.keyPublic = keyPublic;
    this.keyPrivate = keyPrivate;
    this.api = 'https://api.paytweak.dev/v1/';
    this.message = {};
    this.workToken = null;
  }

  apiConnect() {
    this.message = {};
    const options = {
      hostname: 'api.paytweak.dev',
      path: '/v1/hello',
      method: 'GET',
      headers: {
        'Paytweak-API-KEY': this.keyPublic,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const parsedData = JSON.parse(data);
        console.log(parsedData);

        if (parsedData['Paytweak-Security-Token']) {
          const token = parsedData['Paytweak-Security-Token'];
          const rToken = Buffer.from(`${token}${this.keyPrivate}`).toString('base64');
          this.verifyToken(rToken);
        } else {
          this.addMessage('code', parsedData.code);
          this.addMessage('message', parsedData.message);
        }
      });
    });

    request.on('error', (error) => {
      this.addMessage('code', 'ERROR');
      this.addMessage('message', error.message);
    });

    request.end();
  }

  verifyToken(rToken) {
    const options = {
      hostname: 'api.paytweak.dev',
      path: '/v1/verify',
      method: 'GET',
      headers: {
        'Paytweak-USER-TOKEN': rToken,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const parsedData = JSON.parse(data);

        if (parsedData['Paytweak-Work-Token']) {
          this.workToken = parsedData['Paytweak-Work-Token'];
          this.addMessage('code', 'OK');
          this.addMessage('message', 'CONNECTION DONE: API connection successful');
        } else {
          this.addMessage('code', parsedData.code);
          this.addMessage('message', parsedData.message);
        }
      });
    });

    request.on('error', (error) => {
      this.addMessage('code', 'ERROR');
      this.addMessage('message', error.message);
    });

    request.end();
  }

  apiGet(ref, args) {
    const url = `${this.api}${ref}?${querystring.stringify(args)}`;
    const options = {
      hostname: 'api.paytweak.dev',
      path: url,
      method: 'GET',
      headers: {
        'Paytweak-Token': this.workToken,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        this.addResponse(data);
      });
    });

    request.on('error', (error) => {
      this.addMessage('code', 'ERROR');
      this.addMessage('message', error.message);
    });

    request.end();
  }

  apiPost(ref, args) {
    const url = `${this.api}${ref}`;
    const options = {
      hostname: 'api.paytweak.dev',
      path: url,
      method: 'POST',
      headers: {
        'Paytweak-Token': this.workToken,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        this.addResponse(data);
      });
    });

    request.on('error', (error) => {
      this.addMessage('code', 'ERROR');
      this.addMessage('message', error.message);
    });

    const query = querystring.stringify(args);
    request.write(query);
    request.end();
  }

  apiCustomMethod(ref, type) {
    const url = `${this.api}${ref}`;
    const options = {
      hostname: 'api.paytweak.dev',
      path: url,
      method: type,
      headers: {
        'Paytweak-Token': this.workToken,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        this.addResponse(data);
      });
    });

    request.on('error', (error) => {
      this.addMessage('code', 'ERROR');
      this.addMessage('message', error.message);
    });

    request.end();
  }

  apiPut(ref, id) {
    this.apiCustomMethod(`${ref}/${id}`, 'PUT');
  }

  apiDelete(ref, id) {
    this.apiCustomMethod(`${ref}/${id}`, 'DELETE');
  }

  apiPatch(ref, id, args) {
    const url = `${ref}/${id}?${querystring.stringify(args)}`;
    this.apiCustomMethod(url, 'PATCH');
  }

  addResponse(resp) {
    this.message = JSON.parse(resp);
  }

  addMessage(arg1, arg2) {
    this.message[arg1] = arg2;
  }

  showMessage() {
    console.log(JSON.stringify(this.message, null, 2));
  }

  getMessage() {
    return JSON.stringify(this.message, null, 2);
  }
}

module.exports = PaytweakWrapper;