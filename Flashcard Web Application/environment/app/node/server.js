"use strict";

const settings = require("./settings.js");
const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;

// Read all pages and store to variable
const index_html = fs.readFileSync("../html/index.html", "utf-8");
const questions_html = fs.readFileSync("../html/questions.ejs", "utf-8");
let words_html = fs.readFileSync("../html/words.ejs", "utf-8");
const successed_html = fs.readFileSync("../html/successed.html", "utf-8");
const normalize_css = fs.readFileSync("../css/normalize.css", "utf-8");
const style_css = fs.readFileSync("../css/style.css", "utf-8");
const switching_the_display = fs.readFileSync("../js/switching_the_display.js", "utf-8");

const returnResponse = (response, status, data, contentType) => {
    response.writeHead(status, { "Content-Type": contentType });
    response.write(data);
    return response.end();
};

const server = http.createServer();
server.on("request", (request, response) => {
    request.data = "";

    MongoClient.connect("mongodb://" + settings.host + "/" + settings.dbname, function(mongoErr, client) {
        if (mongoErr) { return console.dir(mongoErr); }

        // POST
        if (request.method === "POST") {
            request.on("readable", function() {

                let streamData = request.read();
                if (streamData !== null) request.data += streamData;
            });
            request.on("end", function() {
                const postedData = qs.parse(request.data);

                const flashcardDB = client.db(settings.dbname);
                const wordList = flashcardDB.collection("wordList");
                wordList.insertOne(postedData, (err, result) => {
                    if (err) {
                        console.log(err);
                        client.close();
                    }
                    console.log(`A document was inserted with the _id: ${result.insertedId}`);
                    response.writeHead(303, { 'Location': '/successed.html' });

                    response.end();

                });

            });
        }
        // GET
        else {
            const flashcardDB = client.db(settings.dbname);
            const wordList = flashcardDB.collection("wordList");

            switch (request.url) {
                case "/_staticlocalhost:8080":
                case "/":
                case "/index.html":
                    returnResponse(response, 200, index_html, "text/html");
                    break;
                case "/questions.html":
                    wordList.find().toArray((err, documents) => {
                        if (err) return console.log(err);
                        // shuffle and render
                        for (let i = documents.length - 1; i >= 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [documents[i], documents[j]] = [documents[j], documents[i]];
                        }
                        const rendered_questions_html = ejs.render(questions_html, { documents: documents });
                        returnResponse(response, 200, rendered_questions_html, "text/html");

                    });
                    break;
                case "/words.html":
                    wordList.find().toArray((err, documents) => {
                        if (err) return console.log(err);
                        const rendered_words_html = ejs.render(words_html, { documents: documents });
                        returnResponse(response, 200, rendered_words_html, "text/html");
                    });
                    break;
                case "/successed.html":
                    returnResponse(response, 200, successed_html, "text/html");
                    break;

                case "/css/normalize.css":
                    returnResponse(response, 200, normalize_css, "text/css");
                    break;
                case "/css/style.css":
                    returnResponse(response, 200, style_css, "text/css");
                    break;
                case "/js/switching_the_display.js":
                    returnResponse(response, 200, switching_the_display, "text/plain");
                    break;
                default:
                    returnResponse(response, 404, "Error 404! Not found.", "text/plain");
                    break;
            }
        }
    });
});
server.listen(settings.port, settings.host);
console.log("Listen ...");
