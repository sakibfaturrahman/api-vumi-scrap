const UserAgent = require("user-agents");

const getHeaders = () => {
  return {
    "User-Agent": new UserAgent().toString(),
    Referer: "https://09.shinigami.asia/",
    "Accept-Language": "en-US,en;q=0.9",
  };
};

module.exports = { getHeaders };
