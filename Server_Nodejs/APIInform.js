/**
 * Created by X on 2019/3/24
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Inform() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");
    
    this.OnInform = function (req, res, handle) {
        let session_id = NS.GetCookieParam(req)["session_id"];
        let uid = NS.sessionMap.get(session_id)["dc_uid"];
        let level = NS.sessionMap.get(session_id)["dc_level"];

        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        switch (handle) {
            case 'noticeofall': {
                if (!NS.MethodFilter(req, res, "get")) return;
                if (level != 99) return;
                let content = param["content"], title = param["title"];
                if (!content || !title) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }
                let sql = `SELECT _id FROM member WHERE del=? AND level=? OR level=?`;
                MySQL.Query(sql, [1, 9, 0], (err, result) => {
                    if (err) throw err;
                    if (result && result.length) {
                        let insSql = `INSERT INTO inform VALUES `;
                        for (let tmp of result) {
                            insSql += `(NULL,${uid},${tmp["_id"]},'全体通知','${title}','${content}',${new Date().getTime()}, DEFAULT),`;
                        }
                        insSql = insSql.substr(0, insSql.length - 1);
                        MySQL.Query(insSql, [], (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows >= 0) {
                                NS.Send(res, NS.Build(200, "通知成功"))
                            } else {
                                NS.Send(res, NS.Build(407, "发布时出现错误"))
                            }
                        })
                    } else {
                        NS.Send(res, NS.Build(403, "该店铺没有员工"))
                    }
                })
            } break;
            case 'noticeofmanager': {
                if (!NS.MethodFilter(req, res, "get")) return;
                if (level != 99) return;
                let content = param["content"], title = param["title"];
                if (!content || !title) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }
                let target = param["managerId"] || "";
                let sql = `SELECT _id FROM member WHERE del=? AND level=?`;
                if (target) {
                    sql += ` AND _id=${target}`;
                }
                MySQL.Query(sql, [1, 9], (err, result) => {
                    if (err) throw err;
                    if (result && result.length) {
                        let insSql = `INSERT INTO inform VALUES `;
                        for (let tmp of result) {
                            insSql += `(NULL,${uid},${tmp["_id"]},'老板通知','${title}','${content}',${new Date().getTime()}, DEFAULT),`;
                        }
                        insSql = insSql.substr(0, insSql.length - 1);
                        MySQL.Query(insSql, [], (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows >= 0) {
                                NS.Send(res, NS.Build(200, "通知成功"))
                            } else {
                                NS.Send(res, NS.Build(407, "发布时出现错误"))
                            }
                        })
                    } else {
                        NS.Send(res, NS.Build(403, "该店铺没有员工"))
                    }
                })
            } break;
            case 'noticeofstore': {
                if (!NS.MethodFilter(req, res, "get")) return;
                if (level != 99) return;
                let content = param["content"], title = param["title"], store = param["storeId"];
                if (!content || !title || !store) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }
                let sql = `SELECT _id FROM member WHERE del=? AND store=?`;
                MySQL.Query(sql, [1, store], (err, result) => {
                    if (err) throw err;
                    if (result && result.length) {
                        let insSql = `INSERT INTO inform VALUES `;
                        for (let tmp of result) {
                            insSql += `(NULL,${uid},${tmp["_id"]},'店铺通知','${title}','${content}',${new Date().getTime()}, DEFAULT),`;
                        }
                        insSql = insSql.substr(0, insSql.length - 1);
                        MySQL.Query(insSql, [], (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows >= 0) {
                                NS.Send(res, NS.Build(200, "通知成功"))
                            } else {
                                NS.Send(res, NS.Build(407, "发布时出现错误"))
                            }
                        })
                    } else {
                        NS.Send(res, NS.Build(403, "该店铺没有员工"))
                    }
                })
            } break;
            case 'noticeofstaff': {
                if (!NS.MethodFilter(req, res, "get")) return;
                if (level != 9) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }
                let content = param["content"], title = param["title"];
                if (!content || !title) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }

                let sql = `SELECT _id FROM member WHERE del=? AND store=(SELECT store FROM member WHERE _id=${uid}) AND level=?`;
                MySQL.Query(sql, [1, 0], (err, result) => {
                    if (err) throw err;
                    if (result && result.length) {
                        let insSql = `INSERT INTO inform VALUES `;
                        for (let tmp of result) {
                            insSql += `(NULL,${uid},${tmp["_id"]},'本店通知','${title}','${content}',${new Date().getTime()}, DEFAULT),`;
                        }
                        insSql = insSql.substr(0, insSql.length - 1);
                        MySQL.Query(insSql, [], (err, result) => {
                            if (err) throw err;
                            if (result && result.affectedRows >= 0) {
                                NS.Send(res, NS.Build(200, "通知成功"))
                            } else {
                                NS.Send(res, NS.Build(407, "发布时出现错误"))
                            }
                        })
                    } else {
                        NS.Send(res, NS.Build(403, "该店铺没有员工"))
                    }
                })
            } break;
            case 'getnoticecount': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let unReadCountSql = `SELECT count(_id) AS unreadCount FROM inform WHERE readed=? AND tar=?`;
                MySQL.Query(unReadCountSql, [0, uid], (err, result) => {
                    if (err) throw err;
                    if (result && result[0].unreadCount >= 0) {
                        NS.Send(res, NS.Build(200, "查询成功", {count: result[0].unreadCount}))
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                });
            } break;
            case 'getnoticelist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, formCount: '', pCount: '', items: [], unreadCount: '' };
                let unReadCountSql = `SELECT count(_id) AS unreadCount FROM inform WHERE readed=? AND tar=?`;
                MySQL.Query(unReadCountSql, [0, uid], (err, result) => {
                    if (err) throw err;
                    if (result && result[0].unreadCount >= 0) {
                        let count = result[0].unreadCount;
                        rspData["unreadCount"] = count;
                        progress += 30;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                });

                let countSql = `SELECT count(_id) AS count FROM inform WHERE tar=?`;
                MySQL.Query(countSql, [uid], (err, result) => {
                    if (err) throw err;
                    if (result && result[0].count >= 0) {
                        let count = result[0].count;
                        Object.assign(rspData, {
                            informCount: count,
                            pCount: Math.ceil(count / pageSize)
                        });
                        progress += 40;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                });

                let selSql = `SELECT _id, (SELECT name FROM member WHERE _id=tar) AS sender, type, title, content, readed, stime FROM inform WHERE tar=? ORDER BY readed LIMIT ?, ?`;
                MySQL.Query(selSql, [uid, (pno - 1) * pageSize, pageSize], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        rspData["items"] = result;
                        progress += 30;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"));
                    }
                })
            } break;
            case 'readnotice': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let id = param["nid"];
                if (!id) return;
                let sql = `UPDATE inform SET readed=? WHERE _id=?`;
                MySQL.Query(sql, (1, id), (err, result) => { 
                    if (err) throw err;
                    if (result && result.affectedRows == 1) {
                        NS.Send(res, NS.Build(200, "阅读成功"))
                    } else {
                        NS.Send(res, NS.Build(400, "阅读失败，未知原因"))
                    }
                })
            } break;
        }
    }
}

module.exports = new Inform();