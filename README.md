# @perdido/plugins-aoi
An package dedicated to aoi.js v6 which loads functions to simplify bot development
# Disclaimer
This package (`@perdido/plugins-aoi`) is not made by official aoi.js developers, and so therefore, do not request support for the package's function in their official support server.
# What is this
An package for aoi.js v6 as a plugin that loads some of the custom functions it has, for example `$country`!
# Why does this exist?
Back in the old days of custom functions in 2022, it was simple and such. However, considering that breaking changes were pushed to aoi in the past for custom functions, people got annoyed and generally being confused on what's being changed which honestly used to apply to custom functions with djs mode. 

One day i decided that instead of being having to suffer to fix broken custom functions in the future over an breaking change (for multiple bots of mine at least), i said to myself, why not just add them into an package for easier process? And that's how `@perdido/plugins-aoi` was created as an simple project that loads custom functions it includes to aoi.

# Setup
```js
npm i @perdido/plugins-aoi
```


You then load the package with the following
```js
// Define clients
const { Plugins } = require("@perdido/plugins-aoi")
const { AoiClient } = require("aoi.js");
// Setup aoi.js first
const bot = new AoiClient({
    token: "DISCORD BOT TOKEN",
    prefix: "DISCORD BOT PREFIX",
    intents: ["MessageContent", "Guilds", "GuildMessages"],
    events: ["onMessage", "onInteractionCreate"],
 database: {
        type: "aoi.db",
        db: require("@akarui/aoi.db"),
        tables: ["main"],
        path: "./database/",
        extraOptions: {
            dbType: "KeyValue"
        }
    }
});

// Loading the package
const plugins = new Plugins({ bot:bot }); 
plugins.loadPlugins(); 
```
This will enable all custom functions that were created in the package.

# Credits
This is a copy of [dodogames.js](https://github.com/dodoGames-s-Studios/dodoplugins.js), all the credit to him, the only diference are the custom functions.

