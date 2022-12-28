const MinercraftClass = require("../classes/minercraft_class");

module.exports = class Plugin extends MinercraftClass {
  constructor(params) {
    const url = "https://mapi.gorillapool.io";
    super({ ...params, url, name: "gorillapool" });
  }

  static getName() {
    return "gorillapool";
  }
};
