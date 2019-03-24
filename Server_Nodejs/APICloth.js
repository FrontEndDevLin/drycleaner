/**
 * Created by X on 2019/3/18
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Cloth() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnCloth = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        switch (handle) {
            case 'getpricelist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1, field = param["field"] || "type", sort = param["sort"] || "-1";
                let all = param["all"] || false;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, listCount: '', pCount: '', items: [] };
                let sqlCnt = `SELECT count(_id) AS listCount FROM commodit WHERE del=?`;
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0]["listCount"] >= 0) {
                        let count = result[0]["listCount"];
                        Object.assign(rspData, {
                            listCount: count,
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

                field = field == "type" ? "type" : "price";
                sort = sort == "1" ? "" : "DESC";
                let sqlSel = `SELECT _id, title, price, type FROM Commodit WHERE del=? 
                ORDER BY ${field} ${sort}`;
                if (!all) {
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
                        NS.Send(res, NS.Build(406, "参数错误"));
                    }
                });
            } break;
            case 'addcommodit': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let title = param["title"], price = parseInt(param["price"]) || 10, 
                    type = parseInt(param["type"]) || 0;
                MySQL.Query(`SELECT _id FROM commodit WHERE title=?`, [title], (err, result) => {
                    if (err) throw err;
                    if (result && result.length > 0) {
                        NS.Send(res, NS.Build(400, "标题已存在"))
                    } else {
                        let sql = `INSERT INTO commodit VALUES(NULL, ?, ?, ?, DEFAULT)`;
                        MySQL.Query(sql, [title, price, type], (err, result) => {
                            if (err) throw err;
                            let data = {};
                            if (result && result.affectedRows == 1) {
                                data = NS.Build(200, "添加成功");
                            } else {
                                data = NS.Build(400, "添加失败");
                            }
                            NS.Send(res, data);
                        })
                    }
                })
                
            } break;
            case 'editcommodit': {
                
            } break;
            case 'delcommodit': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, (postParam) => {
                    let id = postParam["id"];
                    let sql = `UPDATE commodit SET del=? WHERE _id=?`;
                    MySQL.Query(sql, [0, id], (err, result) => {
                        if (err) throw err;
                        if (result && result.affectedRows == 1) {
                            NS.Send(res, NS.Build(200, "删除成功"));
                        } else {
                            NS.Send(res, NS.Build(400, "删除失败"));
                        }
                    })
                })
            } break;
            case 'getstocklist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, clothCount: '', pCount: '', items: [] };

                let sqlCnt = `SELECT count(_id) AS clothCount FROM clothes WHERE del=?`;
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0].clothCount >= 0) {
                        let count = result[0]["clothCount"];
                        Object.assign(rspData, {
                            clothCount: count,
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

                let sqlSel = `SELECT _id AS __id, mark, type AS ty, color, (SELECT name FROM vip WHERE _id=vipId) AS vipName, (SELECT title FROM commodit WHERE _id=ty) AS title, (SELECT accepttime FROM orderform WHERE cloth=__id) AS time FROM clothes WHERE del=? AND complete=? ORDER BY _id DESC LIMIT ?,?`;
                MySQL.Query(sqlSel, [1, 1, (pno - 1) * pageSize, pageSize], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        rspData["items"] = result;
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                })
            } break;
            case 'gethistorylist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, clothCount: '', pCount: '', items: [] };

                let sqlCnt = `SELECT count(_id) AS clothCount FROM clothes WHERE del=?`;
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0].clothCount >= 0) {
                        let count = result[0]["clothCount"];
                        Object.assign(rspData, {
                            clothCount: count,
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

                let sqlSel = `SELECT _id AS __id, mark, type AS ty, color, (SELECT name FROM vip WHERE _id=vipId) AS vipName, (SELECT title FROM commodit WHERE _id=ty) AS title, (SELECT accepttime FROM orderform WHERE cloth=__id) AS time FROM clothes WHERE del=? AND complete=? ORDER BY _id DESC LIMIT ?,?`;
                MySQL.Query(sqlSel, [1, 0, (pno - 1) * pageSize, pageSize], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        rspData["items"] = result;
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                })
            } break;
            default:
                break;
        }
    }
}

module.exports = new Cloth();