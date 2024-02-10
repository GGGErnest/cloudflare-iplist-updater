const fetch = require('node-fetch');
const LOGGER = require("./logger.js");

async function request(url, method, body, headers) {
        const options = {
            method,
            headers,
          }

        if (body) {
            options.body = JSON.stringify(body);
        }

        return (await fetch(url, options)).json();
}

module.exports = {request};