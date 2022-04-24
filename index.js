const csv = require("csv-parser");
const fs = require("fs");

let records = [];

function parseMinutes(val) {
  return Math.abs(parseInt(val.split(":")[1]));
}
function parseColumn(name) {
  return name.replaceAll("\r", " ").replaceAll("\n", "");
}
function removeNulls(v) {
  return v !== null;
}
function calcDevMin([col, val]) {
  return parseMinutes(val) >= 15 && parseMinutes(val) < 30
    ? { colonna: parseColumn(col), val }
    : null;
}
function calcDevMax([col, val]) {
  return parseMinutes(val) >= 30 ? { colonna: parseColumn(col), val } : null;
}

fs.createReadStream("deviazioni.csv")
  .pipe(csv())
  .on("data", (row) => {
    const { SUBJECTID, Period, ipAdministration, ...others } = row;

    let obj = {
      SUBJECTID,
      Period,
      ipAdministration,
      devmin: Object.entries(others).map(calcDevMin).filter(removeNulls),
      devmax: Object.entries(others).map(calcDevMax).filter(removeNulls),
    };

    records = [...records, obj];
  })
  .on("end", () => {
    fs.writeFileSync("output.json", JSON.stringify(records, null, 2), "utf8");
  });
