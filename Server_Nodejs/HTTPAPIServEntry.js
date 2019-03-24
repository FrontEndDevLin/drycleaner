/**
 * Created by X on 2019/3/17
 */

function HttpAPIServEntry() {
    this.NetStart = function () {
        const http = require("http");
        let port = require("./ConfigParser").Parse("port", "http-API");
        
        require("./NameSpace").sessionMap = require("./SessionLinked");
        // console.log(require("./NameSpace").sessionMap);

        http.createServer((req, res) => {
            let HTTPAPIHandle = require("./HTTPAPIHandle");
            HTTPAPIHandle.OnParse(req, res);
        }).listen(port, () => {
            console.log(`HTTP-API server is listening on ${port}`);
        });
    }
}

module.exports = new HttpAPIServEntry();