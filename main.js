const { updateList, getIPs, getLists } = require("./cloudflare-service.js");
const lodash = require("lodash");
const settings = require("./settings.json");
const LOGGER = require("./logger.js");
LOGGER.setLogFilePath("logs.txt");
const { resolveIPs } = require("./dns-utilities.js");

async function updateIps(listId) {
  const body = [];

  settings.users.forEach(async (user) => {
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
      await updateList(listId, body);
    } catch (error) {
      LOGGER.log(error);
    }
  }

  return null;
}

async function getIpNameListId() {
  const lists = await getLists();
  const ipList = lists.result.find((list) => list.name === settings.ipListName);
  return ipList.id;
}

(async () => {
  setInterval(
    async () => {
      // storing the old IPs to compare with the new ones
      const oldIps = lodash.cloneDeep(
        lodash.flatten(settings.users.map((user) => user.ips)),
      );

      // resolving the new IPs
      await resolveIPs(settings.users);
      const newIps = lodash.flatten(settings.users.map((user) => user.ips));

      // comparing the old and new IPs
      let shouldUpdate = false;
      lodash.difference(newIps, oldIps).forEach((ip) => {
        shouldUpdate = true;
      });

      // if there are new IPs, update the list
      if (shouldUpdate) {
        try {
          const listId = await getIpNameListId();
          const response = await updateIps(listId);

          if (response && response.result) {
            LOGGER.log("IPs updated");
            return;
          }

          LOGGER.error(JSON.stringify(response));
        } catch (error) {
          LOGGER.error(error.message);
        }
      }
    },
    settings.interval * 1000 * 60,
  );
})();
