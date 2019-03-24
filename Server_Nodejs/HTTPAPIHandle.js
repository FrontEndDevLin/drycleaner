/**
 * Created by X on 2019/3/18
 */

function HTTPAPIHandle() {
    const url = require("url");

    let Auth = require("./APIAuth");
    let Statist = require("./APIStatist");
    let Cloth = require("./APICloth");
    let Vip = require("./APIVip");
    let Store = require("./APIStore");
    let Staff = require("./APIStaff");
    let Orderform = require("./APIOrderform");
    let Inform = require("./APIInform");

    let ConfParser = require("./ConfigParser");
    let NS = require("./NameSpace");

    this.OnParse = function (req, res) {
        let path = url.parse(req.url).pathname.toLowerCase();
        let pathArr = path.split("/");
        let router = pathArr[1], handle = pathArr[2];
        if (!(router && handle)) {
            return;
        }
        // res.setHeader('Access-Control-Allow-Origin', ConfParser.Parse("cors", "acc-host"));
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Credentials', true);

        handle = handle.toLowerCase();

        // 过滤未登录的请求
        if (!(router == "auth" && (handle == "login" || handle == "checklogin" || handle == "logout"))) {
            // console.log(router, handle);
            let cookieParams = NS.GetCookieParam(req);
            if (!cookieParams) {
                return NS.Send(res, NS.Build(403, "拒绝访问"))
            }
            let session_id = cookieParams["session_id"];
            if (!NS.sessionMap.get(session_id)) {
                return NS.Send(res, NS.Build(403, "拒绝访问"))
            }
        }

        switch (router) {
            case "auth": {
                Auth.OnAuth(req, res, handle);
            } break;
            case "statist": {
                Statist.OnStatist(req, res, handle);
            } break;
            case "cloth": {
                Cloth.OnCloth(req, res, handle);
            } break;
            case "vip": {
                Vip.OnVip(req, res, handle);
            } break;
            case "store": {
                Store.OnStore(req, res, handle);
            } break;
            case "staff": {
                Staff.OnStaff(req, res, handle);
            } break;
            case "orderform": {
                Orderform.OnOrderform(req, res, handle);
            } break;
            case "inform": {
                Inform.OnInform(req, res, handle);
            } break;
            default:
                break;
        }
    }
}

module.exports = new HTTPAPIHandle();