/**
 * Created by X on 2019/3/22
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Store() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnStore = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        let session_id = NS.GetCookieParam(req)["session_id"];
        let level = NS.sessionMap.get(session_id)["dc_level"];
        if (level != 99) {
            return NS.Send(res, NS.Build(403, "拒绝访问"))
        }
        switch (handle) {
            case 'addstore': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, (postParam) => {
                    let name = postParam["storeName"], intro = postParam["intro"] || "";
                    if (!name) {
                        return NS.Send(res, NS.Build(403, "缺少参数"))
                    }

                    let selSql = `SELECT _id FROM store WHERE name=? and del=?`;
                    MySQL.Query(selSql, [name, 1], (err, result) => {
                        if (err) throw err;
                        if (result && result.length >= 1) {
                            return NS.Send(res, NS.Build(400, "店铺名重复"))
                        } else {
                            let sql = `INSERT INTO store VALUES(NULL, ?, ?, ?, DEFAULT, DEFAULT)`;
                            MySQL.Query(sql, [name, intro, new Date().getTime()], (err, result) => {
                                if (err) throw err;
                                let data;
                                if (result && result.affectedRows == 1) {
                                    data = NS.Build(200, "添加成功");
                                } else {
                                    data = NS.Build(400, "添加失败");
                                }
                                NS.Send(res, data);
                            })
                        }
                    })
                })
            } break;
            case 'getstorelist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param.pno || 1;
                let isAll = param.all || null;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, storeCount: '', pCount: '', items: [] };
                let sqlCnt = `SELECT count(_id) AS storeCount FROM store WHERE del=?`;
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0]["storeCount"] >= 0) {
                        let count = result[0]["storeCount"];
                        Object.assign(rspData, {
                            storeCount: count,
                            pCount: Math.ceil(count / pageSize)
                        });
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                });


                let sqlSel = `SELECT _id, name, intro, own, (SELECT name FROM member WHERE _id = own and del=1 ) AS owname, rgt FROM store WHERE del=? ORDER BY rgt`;
                if (!isAll) {
                    sqlSel += ` LIMIT ${(pno - 1) * pageSize}, ${pageSize}`;
                }
                MySQL.Query(sqlSel, [1], (err, result) => {
                    if (err) throw err;
                    if (result) {
                        rspData["items"] = result;
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                });
            } break;
            case 'editstore': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, (postParam) => {
                    let store = postParam["storeId"], name = postParam["storeName"], intro = postParam["intro"];
                    MySQL.Query(`SELECT _id FROM store WHERE name=?`, [name], (err, result) => {
                        if (err) throw err;
                        if (result && result.length) {
                            if (result[0]["_id"] == store) {
                                NS.Send(res, NS.Build(406, "店铺名已存在"))
                            } else {
                                doNext();
                            }
                        } else {
                            doNext();
                        }
                    })

                    function doNext() {
                        let sql = `UPDATE store SET name=? AND intro=?`;
                        MySQL.Query(sql, [name, intro], (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows >= 0) {
                                NS.Send(res, NS.Build(200, "修改成功"))
                            } else {
                                NS.Send(res, NS.Build(406, "修改失败"))
                            }
                        })
                    }
                });
            } break;
            default:
                break;
        }
    }
}

module.exports = new Store();