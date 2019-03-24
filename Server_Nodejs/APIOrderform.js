/**
 * Created by X on 2019/3/23
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Orderform() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnOrderform = function (req, res, handle) {
        let session_id = NS.GetCookieParam(req)["session_id"];
        let uid = NS.sessionMap.get(session_id)["dc_uid"];
        let level = NS.sessionMap.get(session_id)["dc_level"];

        let query = url.parse(req.url).query;

        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        switch (handle) {
            case 'createform': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, (postParam) => {
                    let mark = postParam["mark"], phone = postParam["vipPhone"], color = postParam["color"], type = postParam["typeId"];
                    if (!mark || !phone || !color || !type) {
                        return NS.Send(res, NS.Build(400, "缺少参数"))
                    }
                    let vname, vid;
                    let vipSql = `SELECT _id, name FROM vip WHERE phone=?`;
                    MySQL.Query(vipSql, [phone], (err, result) => {
                        if (err) throw err;
                        if (result && result.length) {
                            vname = result[0]["name"];
                            vid = result[0]["_id"];

                            let priceSql = "SELECT price, title FROM commodit WHERE _id=?";
                            MySQL.Query(priceSql, [type], (err, result) => {
                                if (err) throw err;
                                if (result && result[0]) {
                                    let price = result[0]["price"], title = result[0]["title"];

                                    let clothSql = "INSERT INTO clothes VALUES(NULL, ?, ?, ?, ?,DEFAULT, DEFAULT)";
                                    MySQL.Query(clothSql, [type, mark, color, vid], (err, result) => {
                                        if (err) throw err;
                                        if (result && result.affectedRows == 1) {
                                            let storeSql = "SELECT store FROM member WHERE _id=?";
                                            let clothId = result.insertId;
                                            MySQL.Query(storeSql, [uid], (err, result) => {
                                                if (err) throw err;
                                                if (result && result[0]) {
                                                    let storeId = result[0]["store"];
                                                    let formSql = "INSERT INTO orderform VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT)";
                                                    MySQL.Query(formSql, [NS.GetRandomStr(), vname, phone, uid, storeId, new Date().getTime(), clothId, price, title], (err, result) => {
                                                        if (err) throw err;
                                                        if (result.affectedRows == 1) {
                                                            NS.Send(res, NS.Build(200, "订单创建成功"))
                                                        } else {
                                                            NS.Send(res, NS.Build(406, "未知错误3"))
                                                        }
                                                    })
                                                } else {
                                                    NS.Send(res, NS.Build(406, "未知错误2"))
                                                }
                                            })
                                        } else {
                                            NS.Send(res, NS.Build(406, "未知错误1"))
                                        }
                                    })
                                } else {
                                    NS.Send(res, NS.Build(403, "请先添加价格表"))
                                }
                            })
                        } else {
                            NS.Send(res, NS.Build(400, "会员不存在，请先添加该会员"))
                        }
                    })
                })
            } break;
            case 'getform': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1, field = param.field || "accepttime", sort = param.sort || "-1";
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, formCount: '', pCount: '', items: [] };

                let sqlCnt = `SELECT count(_id) AS formCount FROM orderform WHERE del=?`;
                if (level != 99) {
                    sqlCnt += ` AND acceptStore=(SELECT store FROM member WHERE _id=${uid})`;
                }
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0]["formCount"] >= 0) {
                        let count = result[0]["formCount"];
                        Object.assign(rspData, {
                            formCount: count,
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

                switch (field) {
                    case 'acceptStore': 
                    break;
                    case 'price': 
                    break;
                    case 'complete': 
                    break;
                    case 'cpltime': 
                    break;
                    default: {
                        field = 'accepttime';
                    } break;
                }
                sort = sort == "1" ? "" : "DESC";
                let sqlSel = `SELECT _id, ordernum, user, phone, (SELECT name FROM member WHERE _id=accept) AS accept, (SELECT name FROM store WHERE _id=acceptStore) AS acceptStore, accepttime, (SELECT mark FROM clothes WHERE _id=cloth) AS mark, (SELECT color FROM clothes WHERE _id=cloth) AS color, price, complete, cpltime, (SELECT name FROM member WHERE _id=cpler) AS cpler FROM orderform WHERE del=?`;
                if (level != 99) {
                    sqlCnt += ` AND acceptStore=(SELECT store FROM member WHERE _id=${uid})`;
                }
                sqlSel += ` ORDER BY ${field} ${sort} LIMIT ?, ?`;
                MySQL.Query(sqlSel, [1, (pno - 1) * pageSize, pageSize], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        rspData["items"] = result;
                        NS.Send(res, NS.Build(200, "查询成功", rspData));
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"));
                    }
                })
            } break;
            case 'endform': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let id = param["id"];
                if (!id) return;
                let progress = 0;
                let sql = `UPDATE orderform SET complete=?, cpltime=?, cpler=? WHERE _id=?`;
                MySQL.Query(sql, [1, new Date().getTime(), uid, id], (err, result) => {
                    if (err) throw err;
                    // console.log(result);
                    if (result && result.affectedRows == 1) {
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "处理成功"));
                            MySQL.Query(`UPDATE vip SET count=count+20 WHERE name=(SELECT user FROM orderform WHERE _id=${id}) AND phone=(SELECT phone FROM orderform WHERE _id=${id})`);
                        }
                    } else {
                        NS.Send(res, NS.Build(400, "处理失败"));
                    }
                });


                let delSql = `UPDATE clothes SET complete=? WHERE _id=(SELECT cloth FROM orderform WHERE _id=?)`;
                MySQL.Query(delSql, [0, id], (err, result) => {
                    if (err) throw err;
                    // console.log(result);
                    if (result && result.affectedRows == 1) {
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "处理成功"));
                            MySQL.Query(`UPDATE vip SET count=count+20 WHERE name=(SELECT user FROM orderform WHERE _id=?) AND phone=(SELECT phone FROM orderform WHERE _id=?)`);
                        }
                    } else {
                        NS.Send(res, NS.Build(400, "处理失败"));
                    }
                });

                
            } break;
            default:
                break;
        }
    }
}

module.exports = new Orderform();