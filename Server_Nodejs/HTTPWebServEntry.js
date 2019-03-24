/**
 * Created by X on 2019/3/17
 */

function HTTPWebServEntry() {
    this.NetStart = function () {
        const http = require("http");
        const express = require("express");

        let app = express();
        let port = require("./ConfigParser").Parse("port", "http-Web");

        http.createServer(app).listen(port, () => {
            console.log(`HTTP-Web server is listening on ${port}`);
        });

        app.use(express.static(__dirname + '/src'));
    }
}

module.exports = new HTTPWebServEntry();