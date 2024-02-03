const { updateList, getIPs, getLists } = require("./cloudflare-service.js");

const dns = require("dns");

const lodash = require("lodash");

const settings = require("./settings.json");

async function resolveIPAddress(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        reject(err);
      } else {
        resolve(addresses);
      }
    });
  });
}

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
    return await updateList(listId, body);
  }

  return null;
}

async function resolveNewIps() {
  const userPromises = [];
  settings.users.forEach((user) => {
    user.dnsNames.forEach(async (dns) => {
      userPromises.push(
        new Promise(async (resolve, reject) => {
          let ip;
          try {
            user.ips = [...(await resolveIPAddress(dns))];
          } catch (error) {
            console.error(
              `${user.name}'s dns ${dns} couldn't be resolved.`,
              error
            );
            reject();
          }
          user.ips.push(ip);
          resolve();
        })
      );
    });
  });
  return Promise.all(userPromises);
}

async function getIpNameListId() {
  const lists = await getLists();
  const ipList = lists.result.find((list) => list.name === settings.ipListName);
  return ipList.id;
}

(async () => {
  setInterval(async () => {
    // storing the old IPs to compare with the new ones
    const oldIps = lodash.cloneDeep(lodash.flatten(settings.users.map((user) => user.ips)));
   
    // resolving the new IPs
    await resolveNewIps();
    const newIps = lodash.flatten(settings.users.map((user) => user.ips));
    
    // comparing the old and new IPs
    let shouldUpdate = false;
    lodash.difference(newIps, oldIps).forEach((ip) => {
      shouldUpdate = true; 
    });

    // if there are new IPs, update the list
    if(shouldUpdate) {
        const listId = await getIpNameListId();
        await updateIps(listId);
        console.log("IPs updated at ", new Date().toLocaleString());
    }
    
  }, (settings.interval * 1000 * 60));
})();
