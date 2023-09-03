import fs from "fs";

interface KeyConfig {
  [key: string]: KeyConfig | string;
}

const getLocales = () => {
  let locales: {
    [key: string]: KeyConfig;
  } = {};
  fs.readdirSync(__dirname)
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fileData = require(`./${file}`);
      const language = file.replace(".json", "");
      locales = { ...locales, [language]: fileData };
    });
  return locales;
};

const locales = getLocales();

console.log(locales);
export default locales;
