/**
 * This tool fixes various issues with the csv files from JORE.
 * The delimiter is a comma (,) and cannot be configured as of now.
 *
 * Usage: node fix_rows.js path/to/data_file.csv
 * (Used in sanitize.sh)
 *
 * Note that it will overwrite the file instead of creating a new one.
 *
 * It does the following:
 *
 * - Remove lines that contain no delimiters (,)
 * - Remove lines that start with a delimiter
 * - Convert values that are only whitespace into null (empty) values
 * - Remove errant quotes
 * - Pad the row if it contains less columns than the header row
 */

const { once } = require("events");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

const args = process.argv.slice(2);

if (!args[0]) {
  process.exit(1);
}

(async function processFile(filePath) {
  const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

  const outPath = path.join(
    path.dirname(filePath),
    path.basename(filePath, ".csv") + "-out.csv"
  );

  const writeStream = fs.createWriteStream(outPath, { encoding: "utf8" });

  let lineNum = 0;
  let columnsCount = 0;

  try {
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
      terminal: false
    });

    rl.on("line", line => {
      let currentLine = line;

      if (lineNum === 0) {
        // This is the header row, so count how many columns each row should have.
        columnsCount = currentLine.split(",").length;
      } else {
        // Skip lines without any commas or lines that start with a comma, these are faulty.
        if (!/,/g.test(currentLine) || /^,/g.test(currentLine)) {
          lineNum++;
          return;
        }

        // Remove values that are only white space
        currentLine = currentLine.replace(/,\s+,/g, ",,");
        // Remove errant quotes
        currentLine = currentLine.replace(/"|'/g, "");

        // Pad the row until it has as many columns as the header row
        while (currentLine.split(",").length < columnsCount) {
          currentLine += ",";
        }
      }

      writeStream.write(currentLine.trim() + "\n");
      lineNum++;
    });

    await once(rl, "close");

    fs.unlinkSync(filePath);
    fs.renameSync(outPath, filePath);

    console.log("File processed.");
  } catch (err) {
    console.error(err);
  }
})(args[0]);
