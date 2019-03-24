/**
 * Created by X on 2019/3/18
 */

let qs = require("querystring");
let NS = require("./NameSpace");
let fs = require("fs");

function Auth() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnAuth = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        switch (handle) {
            case 'login': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, function (param) {
                    let phone = param["phone"], pwd = param["pwd"];
                    let sql = `SELECT _id, name, level, avatar, phone FROM member WHERE phone=? and pwd=md5(?)`;
                    let paramArr = [phone, pwd];
                    MySQL.Query(sql, paramArr, (err, memberInfo) => {
                        if (err) throw err;
                        let data;
                        if (memberInfo && memberInfo[0]) {
                            data = NS.Build(200, "登录成功");
                            let option = {
                                dc_uid: memberInfo[0]["_id"],
                                dc_name: memberInfo[0]["name"],
                                dc_level: memberInfo[0]["level"],
                                dc_avatar: memberInfo[0]["avatar"],
                                dc_phone: memberInfo[0]["phone"]
                            }
                            let session_id = NS.sessionMap.save(option);
                            res.setHeader('Set-Cookie', `session_id=${session_id};httpOnly=true;path=/`);
                            // console.log(NS.sessionMap.get(session_id));
                        } else {
                            data = NS.Build(400, "用户名或密码错误");
                        }
                        NS.Send(res, data);
                    });
                });
            } break;
            case 'checklogin': {
                if (!NS.MethodFilter(req, res, "post")) return;
                let CookieParam = NS.GetCookieParam(req);
                let rspData;
                if (CookieParam) {
                    let session_id = CookieParam["session_id"];
                    if (session_id) {
                        let userInfo = NS.sessionMap.get(session_id);
                        if (userInfo) {
                            userInfo = JSON.parse(JSON.stringify(userInfo));
                            let avatar = userInfo["dc_avatar"];
                            if (avatar) {
                                fs.readFile(`./res/${avatar}`, "base64", (err, data) => {
                                    if (err) throw err;
                                    if (data) {
                                        data = "data:image/jpg;base64," + data;
                                        userInfo["dc_avatar"] = data;
                                    } else {
                                        data = "data:image/jpg;base64," + fs.readFileSync(`./res/avatar/default/default_001.jpg`, "base64");
                                        userInfo["dc_avatar"] = data;
                                    }
                                    rspData = NS.Build(200, "已登录", userInfo);
                                    NS.Send(res, rspData);
                                })
                            } else {
                                userInfo["dc_avatar"] = "data:image/jpg;base64," + fs.readFileSync(`./res/avatar/default/default_001.jpg`, "base64");
                                rspData = NS.Build(200, "已登录", userInfo);
                                NS.Send(res, rspData);
                            }
                        } else {
                            rspData = NS.Build(406, "未登录");
                            NS.Send(res, rspData);
                        }
                    } else {
                        rspData = NS.Build(406, "未登录");
                        NS.Send(res, rspData);
                    }
                } else {
                    rspData = NS.Build(406, "未登录");
                    NS.Send(res, rspData);
                }
            } break;
            case 'logout': {
                if (!NS.MethodFilter(req, res, "post")) return;
                let CookieParam = NS.GetCookieParam(req);
                let data;
                if (CookieParam) {
                    let session_id = CookieParam["session_id"];
                    if (session_id) {
                        NS.sessionMap.clean(session_id);
                        data = NS.Build(200, "注销成功")
                    } else {
                        data = NS.Build(200, "注销成功2")
                    }
                } else {
                    data = NS.Build(200, "注销成功3")
                }
                NS.Send(res, data);
            } break;
            case 'getselfinfo': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let cookieParam = NS.GetCookieParam(req);
                // console.log(cookieParam);
                if (!cookieParam) {
                    NS.Send(res, NS.Build(403, "未登录"));
                    return;
                }
                let session_id = cookieParam["session_id"];
                if (session_id && NS.sessionMap.get(session_id)) {
                    let userInfo = NS.sessionMap.get(session_id);
                    userInfo = JSON.parse(JSON.stringify(userInfo));
                    let uid = userInfo["dc_uid"];
                    let sql = `SELECT gender, phone, email, store, intro, rgt FROM member WHERE _id=?`
                    MySQL.Query(sql, [uid], (err, memberInfo) => {
                        if (err) throw err;
                        let rspData = null;
                        if (memberInfo && memberInfo[0]) {
                            Object.assign(userInfo, memberInfo[0]);
                            if (userInfo["dc_avatar"]) {
                                userInfo["dc_avatar"] = "data:image/jpg;base64," + fs.readFileSync(`./res/${userInfo["dc_avatar"]}`, "base64");
                            }
                            rspData = NS.Build(200, "查询成功", userInfo);
                        } else {
                            rspData = NS.Build(404, "未知用户");
                        }
                        NS.Send(res, rspData);
                    });
                } else {
                    NS.Send(res, NS.Build(403, "未登录"));
                }
            } break;
            case 'updselfinfo': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, (postParam) => {
                    let name = postParam["dc_name"], phone = postParam["dc_phone"], email = postParam["email"] || "", gender = postParam["gender"] || 0, intro = postParam["intro"] || "", pwd = postParam["pwd"] || "";
                    let session_id = NS.GetCookieParam(req)["session_id"];
                    let sess_name = NS.sessionMap.get(session_id)["dc_name"];
                    let sess_phone = NS.sessionMap.get(session_id)["dc_phone"];
                    let sess_uid = NS.sessionMap.get(session_id)["dc_uid"];

                    if ((name && name != sess_name) || (name && phone != sess_phone)) {
                        let sql = `SELECT _id FROM member WHERE name=?`;
                        let pg = 0;
                        MySQL.Query(sql, [name], (err, result) => {
                            if (err) throw err;
                            if (result && result.length) {
                                return NS.Send(res, NS.Build(400, "名称已存在"))
                            } else {
                                pg += 50;
                                if (pg == 100) {
                                    doNext(true, name, phone);
                                }
                            }
                        })

                        let sql2 = `SELECT _id FROM member WHERE phone=?`;
                        MySQL.Query(sql2, [phone], (err, result) => {
                            if (err) throw err;
                            if (result && result.length) {
                                return NS.Send(res, NS.Build(400, "手机号已存在"))
                            } else {
                                pg += 50;
                                if (pg == 100) {
                                    doNext(true, name, phone);
                                }
                            }
                        })
                    } else {
                        doNext();
                    }
                    
                    function doNext(hasName, name, phone) {
                        let flagStr = hasName ? ` name=${name}, phone=${phone},`: ""
                        let sql = "";
                        let queryArr = [];
                        if (!pwd) {
                            sql = `UPDATE member SET${flagStr} email=?, gender=?, intro=? WHERE _id=?`;
                            queryArr = [email, gender, intro, sess_uid];
                        } else {
                            sql = `UPDATE member SET${flagStr} email=?, gender=?, intro=?, pwd=md5(?) WHERE _id=?`;
                            queryArr = [email, gender, intro, pwd, sess_uid];
                        }
                        MySQL.Query(sql, queryArr, (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows == 1) {
                                NS.Send(res, NS.Build(200, "修改成功"))
                            } else {
                                NS.Send(res, NS.Build(400, "修改失败"))
                            }
                        })
                    }
                })
            } break;
            case 'uploadavt': {
                let formidable = require("formidable");
                let form = new formidable.IncomingForm();
                form.encoding = "utf-8";
                form.uploadDir = "";
                form.keepExtensions = true;
                form.maxFieldsSize = 2 * 1024 * 1024;
                form.parse(req, (err, fields, files) => {
                    // console.log(files.file);
                    if (err) throw err;
                    let extName = "";
                    switch (files.file.type) {
                        case 'image/pjpeg':
                            extName = 'jpg';
                            break;
                        case 'image/jpeg':
                            extName = 'jpg';
                            break;
                        case 'image/png':
                            extName = 'png';
                        case 'image/x-png':
                            extName = 'png';
                            break;
                    }

                    if (!extName) {
                        return NS.Send(res, NS.Build(403, "后缀错误"))
                    }

                    let avtName = new Date().getTime() + parseInt(Math.random() * 9000 + 1000) + "." + extName;
                    let path = './res/avatar/upload/'
                    fs.renameSync(files.file.path, path + avtName);

                    let sqlPath = 'avatar/upload/' + avtName;
                    let session_id = NS.GetCookieParam(req)["session_id"];
                    let sessionInfo = NS.sessionMap.get(session_id);
                    let uid = sessionInfo["dc_uid"];
                    MySQL.Query(`UPDATE member SET avatar=? WHERE _id=?`, [sqlPath, uid], (err, result) => {
                        if (err) throw err;
                        if (result && result.affectedRows == 1) {
                            sessionInfo["dc_avatar"] = sqlPath;
                            // console.log(sessionInfo);
                            NS.Send(res, NS.Build(200, "更新成功"))
                        }
                    });
                })
            } break;
            default:
                break;
        }
    }
}

module.exports = new Auth();