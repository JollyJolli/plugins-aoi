const chalk = require('chalk');
class Plugins {
  constructor(args) {
    this.args = args;
    if (!args.bot) {
      console.log("You have not inputted your aoi client! Exiting Code!");
      process.exit(0);
    }
  } loadPlugins() {
    const bot = this.args.bot;

    // Kawaii#7615 plugin example
    bot.functionManager.createFunction({
      name: '$ignore',
      type: 'djs',
      code: async d => {
        const data = d.util.aoiFunc(d);
        const [text] = data.inside.splits;
        if (!text) return d.aoiError.fnError(d, 'custom', {}, 'No Text was Provided');
        //nothing here, it's comment
        return {
          code: d.util.setCode(data)
        }
      }
    });


     // FILE NAMES
bot.functionManager.createFunction({
  name: "$fileNames",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [category, separator = ", "] = data.inside.splits;
    
    const fs = require('fs');
    const path = require('path');
    const folderPath = path.join(__dirname, 'CMDS', category);
    
    let files = [];
    let output = '';
    
    try {
      files = fs.readdirSync(folderPath);
      output = files
        .filter((file) => file !== '$alwaysExecute.js')
        .map((file) => path.parse(file).name)
        .join(separator);
    } catch (err) {
      output = `Error reading folder ${folderPath}: ${err}`;
    }
    
    data.result = output;
    
    return { code: d.util.setCode(data) };
  }
});

// PREFIX
bot.functionManager.createFunction({
    name: "$prefix",
    type: "djs",
    async code(d) {
        const data = d.util.aoiFunc(d);
        const Interpreter = require("aoi.js/src/interpreter.js");
        const prefixes = Array.isArray(d.client.aoiOptions.prefix) ? d.client.aoiOptions.prefix : [d.client.aoiOptions.prefix];
        const prefix = d.message.content.split(/ +/g).shift().trim();
        const interpreted = [];
        for (const pr of prefixes) {
            const result = (await Interpreter(d.client, d.message, d.args, { name: "PrefixParser", code: pr }, d.client.db, true)).code;
            interpreted.push(result)
        }
        data.result = interpreted.filter(pr => prefix.startsWith(pr));
        return {
            code: d.util.setCode(data)
        }
    }
});

// REVERSEPHRASE
bot.functionManager.createFunction({
  name: "$phraseReverse",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [phrase] = data.inside.splits;
    
    const reversedPhrase = phrase.split("").reverse().join("");
    
    data.result = reversedPhrase;
    
    return { code: d.util.setCode(data) };
  }
});

// TRUNCATE DATE
bot.functionManager.createFunction({
  name: "$truncateDate",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    
    const currentDate = Date.now();
    const truncatedDate = Math.trunc(currentDate / 1000);
    
    data.result = truncatedDate;
    
    return {
      code: d.util.setCode(data)
    };
  }
});

// GET WEATHER
bot.functionManager.createFunction({
  name: "$getWeather",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [location, format = "{temperature}°C, {condition}, Humidity: {humidity}%, Wind Speed: {windSpeed} km/h"] = data.inside.splits;

    if (!location) {
      data.result = "Error: Please provide a location.";
      return { code: d.util.setCode(data) };
    }

    try {
      const weatherData = await fetchWeatherData(location);

      if (weatherData.error) {
        throw new Error(weatherData.error.message);
      }

      const temperature = weatherData.current.temp_c;
      const condition = weatherData.current.condition.text;
      const humidity = weatherData.current.humidity;
      const windSpeed = weatherData.current.wind_kph;

      let message = format;
      message = message.replace(/{temperature}/g, temperature);
      message = message.replace(/{condition}/g, condition);
      message = message.replace(/{humidity}/g, humidity);
      message = message.replace(/{windSpeed}/g, windSpeed);

      data.result = message;
    } catch (error) {
      data.result = `Error: ${error.message}`;
    }

    return {
      code: d.util.setCode(data)
    };
  }
});
async function fetchWeatherData(location) {
  const apiKey = "9a352bc57c98423dab6190924230207";
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}


//COUNTRY
const fetch = require("node-fetch");

async function getCountryData(country) {
  const response = await fetch("https://www.jsonkeeper.com/b/L23E");
  const data = await response.json();

  const countryData = data.countries.find(
    (c) => c.name_en.toLowerCase() === country.toLowerCase() || c.name_es.toLowerCase() === country.toLowerCase()
  );

  return countryData;
}

bot.functionManager.createFunction({
  name: "$country",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [country, format, imageValue] = data.inside.splits;

    const countryData = await getCountryData(country);

    if (!countryData) {
      return d.aoiError.fnError(d, "custom", {}, "country");
    }

    let result = format;

    const placeholders = {
      "{name_en}": countryData.name_en,
      "{name_es}": countryData.name_es,
      "{continent_en}": countryData.continent_en,
      "{continent_es}": countryData.continent_es,
      "{capital_en}": countryData.capital_en,
      "{capital_es}": countryData.capital_es,
      "{dial_code}": countryData.dial_code,
      "{code_2}": countryData.code_2,
      "{code_3}": countryData.code_3,
      "{tld}": countryData.tld,
      "{km2}": countryData.km2,
      "{flag}": `:flag_${countryData.code_2.toLowerCase()}:`
    };

    let imageUrl = "";

    if (imageValue === "width" || imageValue === "w") {
      imageUrl = `https://flagcdn.com/w2560/${countryData.code_2.toLowerCase()}.jpg`;
    } else if (imageValue === "height" || imageValue === "h") {
      imageUrl = `https://flagcdn.com/h240/${countryData.code_2.toLowerCase()}.jpg`;
    }

    placeholders["{image}"] = imageUrl;

    for (const placeholder in placeholders) {
      result = result.replace(new RegExp(placeholder, "g"), placeholders[placeholder]);
    }

    data.result = result;

    return {
      code: d.util.setCode(data),
    };
  },
});

// $progressBar
bot.functionManager.createFunction({
  name: '$progressBar',
  type: 'djs',
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [current, total, style = 'filled', mainCharacter = style === 'split' ? '📍' : '◼', secondaryCharacter = style === 'split' ? '─' : '◻', scale = 30] = data.inside.splits;

    if (!current) {
      return d.aoiError.fnError(d, 'custom', {}, 'Current number is missing.');
    }

    if (!total) {
      return d.aoiError.fnError(d, 'custom', {}, 'Total number is missing.');
    }

    if (parseFloat(current) > parseFloat(total)) {
      return d.aoiError.fnError(d, 'custom', {}, 'Current cannot be greater than total.');
    }

    if (isNaN(parseFloat(current)) || isNaN(parseFloat(total))) {
      return d.aoiError.fnError(d, 'custom', {}, 'Current and total values must be numbers.');
    }

    if (style !== 'filled' && style !== 'split') {
      return d.aoiError.fnError(d, 'custom', {}, 'Invalid style. Supported styles are "filled" and "split".');    }

    try {
      const percentage = (parseFloat(current) / parseFloat(total)) * 100;
      const filledCount = Math.round((percentage / 100) * scale);
      const emptyCount = scale - filledCount;

      let progressBar = '';
      if (style === 'filled') {
        progressBar = mainCharacter.repeat(filledCount) + secondaryCharacter.repeat(emptyCount);
      } else if (style === 'split') {
        const markerIndex = Math.round((filledCount / scale) * (scale) - 1);
        for (let i = 0; i < scale; i++) {
          if (i === markerIndex) {
            progressBar += mainCharacter;
          } else {
            progressBar += secondaryCharacter;
          }
        }
      }

      data.result = progressBar;
      return {
        code: d.util.setCode(data),
      };
    } catch (error) {
      return d.aoiError.fnError(d, 'custom', {}, 'An error occurred while generating the progress bar.');
    }
  },
});

// RANDOM COUNTRY
bot.functionManager.createFunction({
  name: "$countryRandom",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [format] = data.inside.splits;

    const countries = await getCountriesData();

    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    if (!randomCountry) {
      data.result = "No country found!";
      return { code: d.util.setCode(data) };
    }

    if (!format) {
      data.result = "No format specified!";
      return { code: d.util.setCode(data) };
    }

    const placeholders = {
      "{name_en}": randomCountry.name_en,
      "{name_es}": randomCountry.name_es,
      "{continent_en}": randomCountry.continent_en,
      "{continent_es}": randomCountry.continent_es,
      "{capital_en}": randomCountry.capital_en,
      "{capital_es}": randomCountry.capital_es,
      "{dial_code}": randomCountry.dial_code,
      "{code_2}": randomCountry.code_2,
      "{code_3}": randomCountry.code_3,
      "{tld}": randomCountry.tld,
      "{km2}": randomCountry.km2,
      "{flag}": `:flag_${randomCountry.code_2.toLowerCase()}:`,
      "{image}": `https://flagcdn.com/w2560/${randomCountry.code_2.toLowerCase()}.jpg`,
    };

    let result = format;
    for (const placeholder in placeholders) {
      result = result.replace(
        new RegExp(placeholder, "g"),
        placeholders[placeholder]
      );
    }

    data.result = result;

    return { code: d.util.setCode(data) };
  },
});

async function getCryptoValue(cryptoName) {
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=usd`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data[cryptoName] && data[cryptoName].usd) {
      return data[cryptoName].usd;
    } else {
      return null;
    }
  } catch (error) {
    console.error("An error occurred while fetching crypto value:", error);
    return null;
  }
}

bot.functionManager.createFunction({
  name: "$cryptoValue",
  type: "djs",
  code: async (d) => {
    const data = d.util.aoiFunc(d);
    const [cryptoName] = data.inside.splits;

    const value = await getCryptoValue(cryptoName);

    if (value !== null) {
      data.result = value.toString();
    } else {
      data.result = "N/A";
    }

    return { code: d.util.setCode(data) };
  },
});
    
    bot.functionManager.createFunction({
  name: "$isboostmessage", 
  params: ["messageid"],
  type: "aoi.js", 
  code: ` 
    $checkContains[$messageType[$get[messageidchecker]];8;9;10;11]


$let[messageidchecker;$replaceText[$replaceText[$checkCondition[$messageExists[{messageid}]==true];true;{messageid}];false;$messageID]]
  ` 
     
})
    
    bot.functionManager.createFunction({
    name : '$jollyAvatar',
    type : 'djs',
    code : async d => {
      let data = d.util.aoiFunc(d);

    const Dodo = await d.util.getUser(d, "632607624742961153");

    data.result = Dodo.avatarURL({format: 'png', size: 4096, dynamic: true});
    return {
        code: d.util.setCode(data)
    }}
   }); 
  }
}
module.exports = {
  Plugins
}
