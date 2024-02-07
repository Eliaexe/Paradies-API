const https = require('https');
const querystring = require('querystring');

class PaytweakWrapper {
  constructor(keyPublic = '', keyPrivate = '') {
    this.keyPublic = keyPublic;
    this.keyPrivate = keyPrivate;
    this.api = 'https://api.paytweak.dev/v1/';
    this.message = {};
    this.workToken = '';
  }

  async apiConnect() {
    this.message = {};
    const options = {
      hostname: 'api.paytweak.dev',
      path: '/v1/hello',
      method: 'GET',
      headers: {
        'Paytweak-API-KEY': this.keyPublic,
      },
    };

    try {
      const response = await this.makeRequest(options);

      if (response['Paytweak-Security-Token']) {
        const token = response['Paytweak-Security-Token'];
        const rToken = Buffer.from(`${token}${this.keyPrivate}`).toString('base64');
        const verificationResults = await this.verifyToken(rToken);

        if (verificationResults.workToken) {
          this.workToken = verificationResults.workToken;
        }

        return verificationResults;
      } else {
        this.addMessage('code', response.code);
        this.addMessage('message', response.message);
        return {
          code: response.code,
          message: response.message,
          workToken: null,
        };
      }
    } catch (error) {
      return {
        code: 'ERROR',
        message: error.message,
        workToken: null,
      };
    }
  }

  async verifyToken(rToken) {
    const options = {
      hostname: 'api.paytweak.dev',
      path: '/v1/verify',
      method: 'GET',
      headers: {
        'Paytweak-USER-TOKEN': rToken,
      },
    };

    try {
      const response = await this.makeRequest(options);

      if (response['Paytweak-Work-Token']) {
        this.workToken = response['Paytweak-Work-Token'];
        this.addMessage('code', 'OK');
        this.addMessage('message', 'CONNECTION DONE: API connection successful');
        return {
          code: response.code,
          message: response.message,
          workToken: this.workToken,
          birthToken: new Date(),
        };
      } else {
        this.addMessage('code', response.code);
        this.addMessage('message', response.message);
        return {
          code: response.code,
          message: response.message,
          workToken: null,
        };
      }
    } catch (error) {
      return {
        code: 'ERROR',
        message: error.message,
        workToken: null,
      };
    }
  }

  async apiPost(ref, args) {
    const url = `${this.api}${ref}`;
    const options = {
      hostname: 'api.paytweak.dev',
      path: url,
      method: 'POST',
      headers: {
        'Paytweak-Token': this.workToken,
      }
    };

    try {
      const response = await this.makeRequest(options, args);
      return {
        code: response.code,
        message: response.message,
        workToken: this.workToken,
        responseData: response,
      };
    } catch (error) {
      return {
        code: 'ERROR',
        message: error.message,
        workToken: this.workToken,
        responseData: null,
      };
    }
  }

  makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let responseData = '';

        response.on('data', (chunk) => {
          responseData += chunk;
        });

        response.on('end', () => {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      if (data) {
        const query = querystring.stringify(data);
        request.write(query);
      }

      request.end();
    });
  }

  makePayments(data) {
    const options = {
      hostname: 'api.paytweak.dev',
      path: '/v1/links',
      method: 'POST',
      headers: {
        'Paytweak-TOKEN': this.workToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    return new Promise((resolve, reject) => {
      if (!data) {
        resolve(null);
        return;
      }

      const requestData = querystring.stringify(data);

      const request = https.request(options, (response) => {
        let responseData = '';

        response.on('data', (chunk) => {
          responseData += chunk;
        });

        response.on('end', () => {
          resolve(responseData);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.write(requestData);

      request.end();
    });
  }

  addResponse(resp) {
    this.message = JSON.parse(resp);
  }

  addMessage(arg1, arg2) {
    this.message[arg1] = arg2;
  }
}

module.exports = PaytweakWrapper;
