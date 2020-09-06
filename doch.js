const csv = require("csv-parser");
const fetch = require("node-fetch");
const fs = require("fs");

//creates the debug.log
var log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });

//reads from the cookies csv;
fs.createReadStream("cookies.csv")
    .pipe(csv(["cookie", "name"]))
    //calls DochOne for each of the rows
    .on("data", (data) => fetchDochOne(data));

// CREDITS to Ilay Segev https://github.com/ilai23/fuck-doch-1/pulls
async function fetchDochOne(data) {
    //sets the cookie from the CSV
    const cookie = data.cookie;
    //gets the userName from the CSV
    const uName = data.name;

    const randomBoundary = generateBoundary();
    const mainCode = "01";
    const secondaryCode = "01";
    const reportBody = `------WebKitFormBoundary${randomBoundary}\r\nContent-Disposition: form-data; name=\"MainCode\"\r\n\r\n${mainCode}\r\n------WebKitFormBoundary${randomBoundary}\r\nContent-Disposition: form-data; name=\"SecondaryCode\"\r\n\r\n${secondaryCode}\r\n------WebKitFormBoundary${randomBoundary}--\r\n`;
    await fetch("https://one.prat.idf.il/api/Attendance/InsertPersonalReport", {
        headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
            "access-control-allow-origin": "*",
            "content-type": `multipart/form-data; boundary=----WebKitFormBoundary${randomBoundary}`,
            crossdomain: "true",
            pragma: "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: cookie,
            "user-agent": "Mozilla/5.0",
        },
        referrer: "https://one.prat.idf.il/finish",
        referrerPolicy: "no-referrer-when-downgrade",
        body: reportBody,
        method: "POST",
        mode: "cors",
    }).then((response) => {
        //writes the status to the log
        log_file.write(
            "responseStatus: " + response.status + " for " + uName + "\n"
        );
        //writes the text to the log
        log_file.write(
            "responseText: " + response.statusText + " for " + uName + "\n"
        );
    });
}

function generateBoundary() {
    const randomSize = 16;
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < randomSize; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}
