const _ = require("lodash");

module.exports = {
  escapeRegex,
  delay,
  dbEnsure,
  ensure_datas,
};

async function delay(delayInms) {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  } catch (e) {
    console.log(String(e.stack));
  }
}

function escapeRegex(str) {
  try {
    if (!str || typeof str != "string") return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch (e) {
    console.log(String(e.stack));
  }
}

async function dbEnsure(db, key, data, debug = false) {
  return new Promise(async (res) => {
    const extraDelay = 5; //ms

    try {
      debug ? console.log(``) : null;
      if (db) {
        let path = null;
        if (key.includes(".")) {
          path = key.split(".").slice(1).join(".");
          key = key.split(".")[0];
        }
        if (_.isNil(data)) {
          return rej("No default value provided");
        }
        const masterData = (await db.get(key)) || {};
        // if there is a path do this
        if (!_.isNil(path)) {
          // dbEnsure(db, key, {}); // Make sure there is an object
          if (_.has(masterData, path)) {
            const pathData = _.get(masterData, path);
            const newPathData = checkObjectDeep(pathData, data);
            // something has changed
            if (newPathData) {
              _.set(masterData, path, newPathData);
              await db.set(key, masterData);
              await delay(extraDelay);
            }
            return res(true);
          }
          _.set(masterData, path, data);
          await db.set(key, masterData);
          await delay(extraDelay);
          return res(true);
        }
        // if its not an object
        if (!_.isObject(masterData)) {
          debug ? console.log("Masterdata not an object") : null;
          return res(true);
        }

        const newData = checkObjectDeep(masterData, data);
        // something has changed
        if (newData) {
          Object.assign(masterData, newData);
          await db.set(key, masterData);
          await delay(extraDelay);
        }

        return res(true);

        function checkObjectDeep(dd, data) {
          let changed = false;
          // Layer 1
          for (const [Okey_1, value_1] of Object.entries(data)) {
            debug && !dd[Okey_1] ? console.log(dd[Okey_1]) : null;
            if (!dd[Okey_1] && dd[Okey_1] === undefined) {
              debug
                ? console.log(
                    `Does not include ${Okey_1} for the value: ${value_1}`,
                  )
                : null;
              dd[Okey_1] = value_1;
              changed = true;
            } else if (value_1 && typeof value_1 == "object") {
              // Layer 2
              for (const [Okey_2, value_2] of Object.entries(value_1)) {
                if (!dd[Okey_1][Okey_2] && dd[Okey_1][Okey_2] === undefined) {
                  debug
                    ? console.log(
                        `Does not include ${Okey_1}.${Okey_2} for the value: ${value_2}`,
                      )
                    : null;
                  dd[Okey_1][Okey_2] = value_2;
                  changed = true;
                } else if (value_2 && typeof value_2 == "object") {
                  // Layer 3
                  for (const [Okey_3, value_3] of Object.entries(value_2)) {
                    if (
                      !dd[Okey_1][Okey_2][Okey_3] &&
                      dd[Okey_1][Okey_2][Okey_3] === undefined
                    ) {
                      debug
                        ? console.log(
                            `Does not include ${Okey_1}.${Okey_2}.${Okey_3} for the value: ${value_3}`,
                          )
                        : null;
                      dd[Okey_1][Okey_2][Okey_3] = value_3;
                      changed = true;
                    } else if (value_3 === "object") {
                      // Layer 4
                      for (const [Okey_4, value_4] of Object.entries(value_3)) {
                        if (
                          !dd[Okey_1][Okey_2][Okey_3][Okey_4] &&
                          dd[Okey_1][Okey_2][Okey_3][Okey_4] === undefined
                        ) {
                          debug
                            ? console.log(
                                `Does not include ${Okey_1}.${Okey_2}.${Okey_3}.${Okey_4} for the value: ${value_4}`,
                              )
                            : null;
                          dd[Okey_1][Okey_2][Okey_3][Okey_4] = value_4;
                          changed = true;
                        } else if (value_4 === "object") {
                          continue;
                        } else continue;
                      }
                      // End of layer 4
                    } else continue;
                  }
                  // End of layer 3
                } else continue;
              }
              // End of layer 2
            } else continue;
          }
          if (changed) return dd;
          else return false;
        }
      } else {
        console.error(`DB_ENSURE ERROR, no db provided`);
        res(true);
      }
    } catch (e) {
      console.error("DB_ENSURE ERROR", key, e);
      res(true);
    }
  });
}

async function ensure_datas(client, userid) {
  await dbEnsure(client.user_data, `${userid}`, {
    wins: 0,
  });
}

Object.defineProperty(module.exports, "__esModule", {
  value: true,
});
