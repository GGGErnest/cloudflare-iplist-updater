const { updateList, getLists } = require("./cloudflare-service.js");
const lodash = require("lodash");
const settings = require("./settings.json");
const LOGGER = require("./logger.js");
LOGGER.setLogFilePath("logs.txt");
const { resolveIPs } = require("./dns-utilities.js");

let oldIps = [];

async function updateIps(listId, users) {
  const body = [];

  users.forEach((user) => {
    user.ips.forEach((ip) => {
      if (ip) {
        body.push({
          comment: `Private IP address of ${user.name}`,
          ip,
        });
      }
    });
  });

  if (body.length > 0) {
    try {
      return await updateList(listId, body);
    } catch (error) {
      LOGGER.log(error);
    }
  }

  return null;
}

async function getIpNameListId(accountId) {
  const lists = await getLists(accountId);
  const ipList = lists.result.find((list) => list.name === settings.ipListName);
  return ipList.id;
}

(async () => {
  setInterval(
    async () => {
      // resolving the new IPs
      await resolveIPs(settings.users);
      const newIps = lodash.flattenDeep(settings.users.map((user) => user.ips));

      // comparing the old and new IPs
      let shouldUpdate = false;
      lodash.difference(newIps, oldIps).forEach((ip) => {
        shouldUpdate = true;
      });

      // if there are new IPs, update the list
      if (shouldUpdate) {
        try {
          const listId = await getIpNameListId(settings.accountId);
          const response = await updateIps(listId, settings.users);

          if (response && response.result) {
            LOGGER.log("IPs updated");
            oldIps = newIps;
            return;
          }

          LOGGER.error(JSON.stringify(response));
        } catch (error) {
          LOGGER.error(error.message);
        }
      } else {
        LOGGER.log("No new IPs found");
      }
    },
    settings.interval * 1000 * 60,
  );
})();
