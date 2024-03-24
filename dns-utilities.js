const dns = require("dns");
const LOGGER = require("./logger.js");

async function resolveIP4Address(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        LOGGER.log("Dns ipv4 not found");
        resolve(null);
      } else {
        LOGGER.log(`Dns ipv4 ${addresses}`);
        resolve(addresses);
      }
    });
  });
}
async function resolveIP6Address(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve6(domain, (err, addresses) => {
      if (err) {
        resolve(null);
        LOGGER.log("Dns ipv6 not found");
      } else {
        LOGGER.log(`Dns ipv6 ${addresses}`);
        resolve(addresses);
      }
    });
  });
}

function processIpv6(ips) {
  return ips
    ? ips
        .filter((ip) => ip !== null)
        .map((ip) => {
          const subnets = ip.split(":");
          return `${subnets.slice(0, 4).join(":")}::/64`;
        })
    : [];
}

async function resolveIPs(users) {
  const userPromises = [];

  users.forEach(async (user) => {
    user.ips = [];
    user.dnsNames.forEach(async (dns) => {
      userPromises.push(
        new Promise(async (resolve) => {
          let ipsV6 = await resolveIP6Address(dns);
          ipsV6 = processIpv6(ipsV6).filter((ip) => ip !== null) || [];

          let ipv4 = await resolveIP4Address(dns);
          ipv4 = ipv4 ? ipv4.filter((ip) => ip !== null) : [];

          user.ips.push(...ipsV6, ...ipv4);
          console.log(user.name, user.ips);
          resolve();
        }),
      );
    });
  });
  return Promise.allSettled(userPromises);
}
module.exports = {
  resolveIPs,
};
