const fetch = require('node-fetch');

async function request(url, method, body, headers) {
      try {
        
        const options = {
            method,
            headers,
          }

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response =  await fetch(url, options);
        const json = await response.json();
        return json;
      } catch (error) {
        console.error('error:' + error);
      }
}

module.exports = {request};