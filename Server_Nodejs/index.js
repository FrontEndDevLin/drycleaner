/**
 * Created by X on 2019/3/17
 */

process.on('uncaughtException', function (e) {
    // console.log(e.toString());
    console.log(e);
});

const HttpAPIServ = require("./HTTPAPIServEntry");
const HttpWEBServ = require("./HTTPWebServEntry");

HttpAPIServ.NetStart();
HttpWEBServ.NetStart();