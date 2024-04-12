const { Database } = require("quickmongo");
const { dbEnsure, delay } = require("./functions");
module.exports = async (client) => {
  return new Promise(async (res) => {
    const connectionOptions = {
      useUnifiedTopology: true,
      maxPoolSize: 100,
      minPoolSize: 50,
      writeConcern: "majority",
    };
    let mongoUri = process.env.mongoUri;
    // CACHE DURATION OPTIONS
    process.env.DB_cache_ping = 10_000; // Delete the cache after X ms | < 0 === never delete [DEFAULT: 60_000]
    process.env.DB_cache_get = 0; // Delete the cache after X ms | < 0 === never delete [DEFAULT: 300_000]
    process.env.DB_cache_all = 0; // Delete the cache after X ms | < 0 === never delete [DEFAULT: 600_000]
    // You can also add: db.get(key, true) // to force-fetch the db

    /*
            if you have several Pools, mongo can use them to send data to them without "blocking" the sending from other datas
            Aka it will be faster, but needs more ram...
        */
    let dateNow = Date.now();
    console.log(
      `${String("[x] :: ".magenta)}Now loading the Database ...`.brightGreen,
    );
    client.database = new Database(mongoUri, connectionOptions);
    // when the db is ready
    client.database.on("ready", async () => {
      const DbPing = await client.database.ping();
      console.log(
        `[x] :: `.magenta +
          `LOADED THE DATABASE after: `.brightGreen +
          `${Date.now() - dateNow}ms\n       Database got a ${DbPing}ms ping`
            .green,
      );
      // Creating the Tables
      client.notes = new client.database.table("notes");

      client.economy = new client.database.table("economy");

      client.invitesdb = new client.database.table("InviteData");

      client.tiktok = new client.database.table("tiktok");

      client.youtube_log = new client.database.table("youtube_log");

      client.mutes = new client.database.table("mutes");

      client.snipes = new client.database.table("snipes");

      client.stats = new client.database.table("stats");

      client.afkDB = new client.database.table("afkDB");

      client.musicsettings = new client.database.table("musicsettings");

      client.settings = new client.database.table("settings");

      client.jointocreatemap = new client.database.table("jointocreatemap");

      client.joinvc = new client.database.table("joinvc");

      client.setups = new client.database.table("setups");

      client.queuesaves = new client.database.table("queuesaves");

      client.modActions = new client.database.table("actions");

      client.userProfiles = new client.database.table("userProfiles");

      client.jtcsettings = new client.database.table("jtcsettings");

      client.roster = new client.database.table("roster");

      client.autosupport = new client.database.table("autosupport");

      client.menuticket = new client.database.table("menuticket");

      client.menuapply = new client.database.table("menuapply");

      client.apply = new client.database.table("apply");

      client.modal = new client.database.table("modal");

      client.points = new client.database.table("points");

      client.premkeyDB = new client.database.table("premkey");

      client.premiumDB = new client.database.table("premiumlist");

      client.voicepoints = new client.database.table("voicepoints");

      client.reactionrole = new client.database.table("reactionrole");

      client.social_log = new client.database.table("social_log");

      client.blacklist = new client.database.table("blacklist");

      client.customcommands = new client.database.table("customcommands");

      client.keyword = new client.database.table("keyword");

      client.premium = new client.database.table("premium");

      client.epicgamesDB = new client.database.table("epicgamesDB");

      client.Anti_Nuke_System = new client.database.table("Anti_Nuke_System");

      client.backupDB = new client.database.table("backupDB");

      client.bugreport = new client.database.table("bugID");

      client.giveawayDB = new client.database.table("giveawayDB");

      client.blacklistedUser = new client.database.table("blacklistedUser");

      client.dailymsgCountdb = new client.database.table("dailymsgCount");

      client.weeklymsgCountdb = new client.database.table("weeklymsgCount");

      client.ownersettingsdb = new client.database.table("ownersettings");
      
      client.starboardsettings = new client.database.table("starboard");
      await dbEnsure(client.stats, "global", {
        commands: 0,
        songs: 0,
      });
      await dbEnsure(client.afkDB, "REMIND", {
        REMIND: [],
      });
      await dbEnsure(client.mutes, "MUTES", {
        MUTES: [],
      });
      let obj = {};
      for (let i = 0; i <= 100; i++) {
        obj[`tickets${i != 0 ? i : ""}`] = [];
        obj[`menutickets${i != 0 ? i : ""}`] = [];
        obj[`applytickets${i != 0 ? i : ""}`] = [];
      }

      await dbEnsure(client.setups, "TICKETS", obj);
      manageGiveaways();
      res(true);
    });

    var errortrys = 0;
    client.database.on("error", async () => {
      console.log("DB ERRORED".bgRed);
      errortrys++;
      if (errortrys == 5)
        return console.log(`Can't reconnect, it's above try limimt`.bgRed);
      await delay(2_000);
      await client.database.connect();
    });

    var closetrys = 0;
    client.database.on("close", async () => {
      console.log("DB CLOSED".bgRed);
      closetrys++;
      if (closetrys == 5)
        return console.log(`Can't reconnect, it's above try limimt`.bgRed);
      await delay(2_000);
      await client.database.connect();
    });

    var disconnecttrys = 0;
    client.database.on("disconnected", async () => {
      console.log("DB DISCONNECTED".bgRed);
      disconnecttrys++;
      if (disconnecttrys == 5)
        return console.log(`Can't reconnect, it's above try limimt`.bgRed);
      await delay(2_000);
      await client.database.connect();
    });

    // top-level awaits
    await client.database.connect();
  });
};
