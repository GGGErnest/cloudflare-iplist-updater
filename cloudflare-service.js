const { request } = require("./http-client.js");
const settings = require("./settings.json");

const headers = {
  "Content-Type": "application/json",
  "X-Auth-Key": settings.authToken,
  Authorization: `Bearer ${settings.apiKey}`,
};

async function getLists() {
  let url = `https://api.cloudflare.com/client/v4/accounts/${settings.accountId}/rules/lists`;

  return await request(url, "GET", null, {
    "Content-Type": "application/json",
    "X-Auth-Key": settings.authToken,
    Authorization: `Bearer ${"fC0SYeYm-rqcuNORgbyUvZfX8nL8L5xT83fCkglA"}`,
  });
}

async function getListItems(listId) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${settings.accountId}/rules/lists/${listId}/items`;

  return await request(url, "GET", null, {
    "Content-Type": "application/json",
    "X-Auth-Key": settings.authToken,
    Authorization: `Bearer ${"fC0SYeYm-rqcuNORgbyUvZfX8nL8L5xT83fCkglA"}`,
  });
}

async function updateList(listId, body) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${settings.accountId}/rules/lists/${listId}/items`;
  return await request(url, "PUT", body, headers);
}

module.exports = {
  getLists,
  getListItems,
  updateList,
};
