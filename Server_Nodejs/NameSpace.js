/**
 * Created by X on 2019/3/19
 * 全局存储空间, 复用方法
 */

let NameSpace = {
    sessionMap: null,

    GetPostData: function (req, callback) {
        let qs = require("querystring");
        let str = "";
        req.on("data", res => {
            str += res;
        });
        req.on("end", () => {
            return callback(qs.parse(str.toString()));
        });
    },

    Build: function (code, msg, data) {
        if (data && typeof data == "object") {
            return { "code": code, "msg": msg, "data": data }
        } else {
            return { "code": code, "msg": msg }
        }
    },

    Send: function (res, data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    },

    GetCookieParam: function (req) {
        let cookie = req.headers.cookie;
        if (!cookie) return null;
        let CookieParam = {};
        cookie.split(';').forEach(l => {
            let parts = l.split('=');
            CookieParam[parts[0].trim()] = (parts[1] || '').trim();
        });
        return CookieParam;
    },

    MethodFilter: function (req, res, method) {
        if (req.method != method.toUpperCase()) {
            this.Send(res, this.Build(403, "请求方法错误"));
            return false;
        } else {
            return true;
        }
    },

    Base64ToImg: function (base64String, imgType) {
        imgType = imgType || "jpg";
        return "data:image/" + imgType + ";base64," + base64String;
    },

    GetRandomStr: function () {
        let arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        let str = "";
        let length = arr.length
        for (let i = 0; i < 6; i++) {
            str += arr[parseInt(Math.random() * length)];
        }
        return (new Date().getTime() + str).toUpperCase();
    },

    Compare: function (property, num) {
		return function (obj1, obj2) {
			let value1 = obj1[property];
            let value2 = obj2[property];
            if(!num || num == -1) {
                return value2 - value1;     // 降序
            } else if(num == 1){
                return value1 - value2;
            }
		}
	},
}

module.exports = NameSpace;