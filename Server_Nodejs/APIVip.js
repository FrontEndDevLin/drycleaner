/**
 * Created by X on 2019/3/20
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Vip() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnVip = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        switch (handle) {
            case 'getviplist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param.pno || 1, field = param.field || "rgt", sort = param.sort || "-1";
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, vipCount: '', pCount: '', items: [] };
                let sqlCnt = `SELECT count(_id) AS vipCount FROM vip WHERE del=?`;
                MySQL.Query(sqlCnt, [1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0]["vipCount"] >= 0) {
                        let count = result[0]["vipCount"];
                        Object.assign(rspData, {
                            vipCount: count,
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

                field = field == "count" ? "count" : "rgt";
                sort = sort == "1" ? "" : "DESC";
                let sqlSel = `SELECT name, phone, gender, rgt, _id, count FROM vip WHERE del=? 
                    ORDER BY ${field} ${sort} LIMIT ?, ?`;
                MySQL.Query(sqlSel, [1, (pno - 1) * pageSize, pageSize], (err, result) => {
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
            case 'addvip': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, function (postParam) {
                    // console.log(postParam);name, phone, 
                    let vName = postParam.name, vPhone = postParam.phone;
                    if (!(vName && vPhone)) {
                        return NS.Send(res, NS.Build(403, "缺少参数"));
                    }
                    MySQL.Query(`SELECT _id FROM vip WHERE phone=?`, [vPhone], (err, result) => {
                        if (err) throw err;
                        if (result) {
                            if (result.length == 0) {
                                let sql = `INSERT INTO vip VALUES(NULL, ?, ?, DEFAULT, ?, DEFAULT, DEFAULT)`;
                                MySQL.Query(sql, [vName, vPhone, new Date().getTime()], (err, result) => {
                                    if (err) throw err;
                                    let data;
                                    if (result && result.affectedRows == 1) {
                                        data = NS.Build(200, "添加成功");
                                    } else {
                                        data = NS.Build(400, "添加失败");
                                    }
                                    NS.Send(res, data);
                                })
                            } else {
                                return NS.Send(res, NS.Build(412, "手机号码已存在"));
                            }
                        } else {
                            return NS.Send(res, NS.Build(412, "手机号码已存在"));
                        }
                    })
                });
            } break;
            case 'delvip': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, function (postParam) {
                    let id = postParam["vid"];
                    if (!id) {
                        return NS.Send(res, NS.Build(415, "参数错误"))
                    }
                    let sql = `UPDATE vip SET del=? WHERE _id=?`;
                    MySQL.Query(sql, [0, id], (err, result) => {
                        if (err) throw err;
                        if (result.affectedRows == 1) {
                            NS.Send(res, NS.Build(200, "删除成功"))
                        } else {
                            NS.Send(res, NS.Build(400, "删除失败"))
                        }
                    })
                });
            } break;
            case 'editvip': {
                // /vip/editvip  post  {vid: , newName: '', newPhone: '', newGender: ''};
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, function (postParam) {
                    let id = postParam["vid"];
                    if (!id) {
                        return NS.Send(res, NS.Build(415, "参数错误"))
                    }
                    let name = postParam["newName"] || "", phone = postParam["newPhone"], gender = parseInt(postParam["newGender"]) || 0;
                    if (!name) {
                        return NS.Send(res, NS.Build(415, "用户名不能为空"))
                    }
                    let querySql = `SELECT phone FROM vip WHERE _id=?`;
                    MySQL.Query(querySql, id, (err, result) => {
                        if (err) throw err;
                        if (result && result[0]) {
                            if (phone == result[0].phone) {
                                let updateSql = `UPDATE vip SET name=?,gender=? WHERE _id=?`;
                                MySQL.Query(updateSql, [name, gender, id], (err, result) => {
                                    if (err) throw err;
                                    if (result && result.affectedRows == 1) {
                                        NS.Send(res, NS.Build(200, "更新成功"))
                                    } else {
                                        NS.Send(res, NS.Build(400, "更新失败")) 
                                    }
                                })
                            } else {
                                let selPhoneSql = `SELECT _id FROM vip WHERE phone=?`;
                                MySQL.Query(selPhoneSql, [phone], (err, result) => {
                                    if (err) throw err;
                                    if (result && result.length >= 1) {
                                        return NS.Send(res, NS.Build(415, "手机号码已存在"))
                                    }
                                    let updateSql = `UPDATE vip SET name=?,gender=?,phone=? WHERE _id=?`;
                                    MySQL.Query(updateSql, [name, gender, phone, id], (err, result) => {
                                        if (err) throw err;
                                        if (result && result.affectedRows == 1) {
                                            NS.Send(res, NS.Build(200, "更新成功"))
                                        } else {
                                            NS.Send(res, NS.Build(400, "更新失败"))
                                        }
                                    })
                                })
                            }
                        }
                    })
                })
            } break;
            default:
                break;
        }
    }
}

module.exports = new Vip();