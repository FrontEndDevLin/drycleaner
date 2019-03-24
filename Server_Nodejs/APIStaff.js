/**
 * Created by X on 2019/3/22
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Staff() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");
    let fs = require("fs");

    this.OnStaff = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }
        let session_id = NS.GetCookieParam(req)["session_id"];
        let level = NS.sessionMap.get(session_id)["dc_level"];
        if (!level || level == 0) {
            return NS.Send(res, NS.Build(403, "拒绝访问"))
        }

        switch (handle) {
            case 'canaddstaff': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let ident = param["ident"] || "staff";
                let sql = `SELECT _id, name FROM store WHERE del=?`;
                if (ident == "manager") {
                    sql += " AND own=0";
                }
                MySQL.Query(sql, [1], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 1) {
                        NS.Send(res, NS.Build(200, "可添加", result))
                    } else {
                        NS.Send(res, NS.Build(403, "请先添加店铺"))
                    }
                })
            } break;
            case 'addstaff': {
                if (!NS.MethodFilter(req, res, "post")) return;
                NS.GetPostData(req, function (postParam) {
                    let name = postParam["name"], phone = postParam["phone"], pwd = postParam["pwd"],
                        store = postParam["storeId"], gender = postParam["gender"] || 0, ident = postParam["ident"] || "staff";
                    let staffLv = ident == "manager" ? 9 : 0;
                    if (staffLv == 9) {
                        if (level == 9) {
                            return NS.Send(res, NS.Build(403, "拒绝访问"))
                        }
                    }

                    if (!name || !phone || !pwd || !store) {
                        return NS.Send(res, NS.Build(406, "参数错误"))
                    }

                    let existSql = `SELECT _id FROM member WHERE name=? OR phone=?`;
                    MySQL.Query(existSql, [name, phone], (err, result) => {
                        if (err) throw err;
                        if (result && result.length >= 1) {
                            return NS.Send(res, NS.Build(409, "员工名或手机号码重复"))
                        }

                        let selSql = `SELECT _id FROM store WHERE _id=? AND del=?`;
                        MySQL.Query(selSql, [store, 1], (err, result) => {
                            if (err) throw err;
                            if (result && result.length >= 1) {
                                let avatars = fs.readdirSync("./res/avatar/default");
                                let long = avatars.length;
                                let insSql = `INSERT INTO member VALUES(NULL, ?, ?, ?, DEFAULT, ?, md5(?), ?, ?, ?, DEFAULT, DEFAULT, DEFAULT)`;
                                MySQL.Query(insSql, [name, gender, phone, staffLv, pwd, "avatar/default/" + avatars[parseInt(Math.random() * long)], store, new Date().getTime()], (err, result) => {
                                    if (err) throw err;
                                    if (result && result.affectedRows == 1) {
                                        if (staffLv == 0) {
                                            NS.Send(res, NS.Build(200, "添加成功"))
                                        } else {
                                            let ownId = result.insertId;
                                            MySQL.Query(`UPDATE store SET own=? WHERE _id=?`, [ownId, store], (err, result) => {
                                                if (err) throw err;
                                                if (result) {
                                                    NS.Send(res, NS.Build(200, "添加成功"))
                                                } else {
                                                    NS.Send(res, NS.Build(400, "添加失败"))
                                                }
                                            })
                                        }
                                    } else {
                                        NS.Send(res, NS.Build(400, "添加失败"))
                                    }
                                });
                            } else {
                                NS.Send(res, NS.Build(409, "店铺不存在"))
                            }
                        })
                    })


                })
            } break;
            case 'getmanagerlist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                if (level != 99) {
                    return NS.Send(res, NS.Build(403, "拒绝访问"))
                }
                let isAll = param["all"] || null;
                let pno = param["pno"] || 1;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, managerCount: '', pCount: '', items: [] };
                let sqlCnt = `SELECT count(_id) AS managerCount FROM member WHERE level=? AND del=?`;
                MySQL.Query(sqlCnt, [9, 1], (err, result) => {
                    if (err) throw err;
                    if (result[0] && result[0]["managerCount"] >= 0) {
                        let count = result[0]["managerCount"];
                        Object.assign(rspData, {
                            managerCount: count,
                            pCount: Math.ceil(count / pageSize)
                        });
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        NS.Send(res, NS.Build(406, "参数错误"))
                    }
                })


                let sql = `SELECT _id AS id, name, gender, phone, avatar, rgt, salary, (
                    SELECT name FROM store WHERE own=id
                ) AS storename FROM member WHERE del=? AND level=? ORDER BY _id`;

                if (!isAll) {
                    sql += ` LIMIT ${(pno - 1) * pageSize}, ${pageSize}`
                }

                MySQL.Query(sql, [1, 9, (pno - 1) * pageSize, pageSize], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        for (let tmp of result) {
                            tmp["avatar"] = NS.Base64ToImg(fs.readFileSync(`./res/${tmp["avatar"]}`, "base64"));
                            tmp["storename"] = tmp["storename"] || '未分派';
                        }
                        rspData["items"] = result;
                        progress += 50;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                        }
                    } else {
                        return NS.Send(res, NS.Build(400, "查询失败"))
                    }
                })
            } break;
            case 'getstafflist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let pno = param["pno"] || 1;
                let pageSize = 12;
                let progress = 0;
                let rspData = { pno: pno, staffCount: '', pCount: '', items: [] };

                let session_id = NS.GetCookieParam(req)["session_id"];
                let uid = NS.sessionMap.get(session_id)["dc_uid"];
                let sqlCnt = "";
                if (level == 99) {
                    sqlCnt = `SELECT count(_id) AS staffCount FROM member WHERE level=0 AND del=1`;
                } else if (level == 9) {
                    sqlCnt = `SELECT count(_id) AS staffCount FROM member WHERE level=0 AND del=1 AND store=(
                        SELECT _id FROM store WHERE own=${uid}
                    )`;
                }
                if (sqlCnt) {
                    MySQL.Query(sqlCnt, [], (err, result) => {
                        if (err) throw err;
                        if (result[0] && result[0]["staffCount"] >= 0) {
                            let count = result[0]["staffCount"];
                            Object.assign(rspData, {
                                staffCount: count,
                                pCount: Math.ceil(count / pageSize)
                            });
                            progress += 50;
                            if (progress == 100) {
                                NS.Send(res, NS.Build(200, "查询成功", rspData))
                            }
                        } else {
                            NS.Send(res, NS.Build(406, "参数错误"))
                        }
                    })
                }

                let sqlSel = "";
                if (level == 99) {
                    sqlSel = `SELECT _id, name, gender, phone, store, avatar, salary, (SELECT name FROM store WHERE _id=store) AS storename, rgt FROM member WHERE del=1 AND level=0`;
                } else if (level == 9) {
                    sqlSel = `SELECT _id, name, gender, phone, store, avatar, salary, (SELECT name FROM store WHERE _id=store) AS storename, rgt FROM member WHERE del=1 AND level=0 AND store=(
                        SELECT _id FROM store WHERE own=${uid}
                    )`;
                }
                if (sqlSel) {
                    sqlSel += ` ORDER BY store LIMIT ?, ?`;
                    MySQL.Query(sqlSel, [(pno - 1) * pageSize, pageSize], (err, result) => {
                        if (err) throw err;
                        if (result && result.length >= 0) {
                            let cnt = 0;
                            for (let tmp of result) {
                                fs.readFile(`./res/${tmp["avatar"]}`, 'base64', (err, base64data) => {
                                    if (err) {
                                        base64data = "";
                                    }
                                    tmp["avatar"] = NS.Base64ToImg(base64data);
                                    cnt++;
                                    if (cnt == result.length) {
                                        rspData["items"] = result;
                                        progress += 50;
                                        if (progress == 100) {
                                            NS.Send(res, NS.Build(200, "查询成功", rspData))
                                        }
                                    }
                                })
                            }
                            if (result.length == 0) {
                                rspData["items"] = result;
                                progress += 50;
                                if (progress == 100) {
                                    NS.Send(res, NS.Build(200, "查询成功", rspData))
                                }
                            }
                        } else {
                            NS.Send(res, NS.Build(406, "参数错误"));
                        }
                    })
                }
            } break;
            case 'editmanager': {
                if (!NS.MethodFilter(req, res, "post")) return;
                if (level != 99) {
                    return;
                }
                NS.GetPostData(req, (postParam) => {
                    let mid = postParam["id"];
                    if (!mid) return;
                    let name = postParam["newName"], phone = postParam["newPhone"];
                    // 查询数据库中name有没有被使用，使用者是谁
                    let existNameSql = `SELECT _id FROM member WHERE name=?`;
                    let existPhoneSql = `SELECT _id FROM member WHERE phone=?`;
                    let queryExistProgress = 0;

                    MySQL.Query(existNameSql, [name], (err, result) => {
                        if (err) throw err;
                        if (result && result[0]) {
                            if (mid == result[0]["_id"]) {
                                queryExistProgress += 50;
                                // next
                                doNext();
                            } else {
                                // 存在
                                return NS.Send(res, NS.Build(400, "名字已存在"))
                            }
                        } else {
                            queryExistProgress += 50;
                            // next
                            doNext();
                        }
                    });

                    MySQL.Query(existPhoneSql, [phone], (err, result) => {
                        if (err) throw err;
                        if (result && result[0]) {
                            if (mid == result[0]["_id"]) {
                                queryExistProgress += 50;
                                // next
                                doNext();
                            } else {
                                // 存在
                                return NS.Send(res, NS.Build(400, "手机号已存在"))
                            }
                        } else {
                            queryExistProgress += 50;
                            // next
                            doNext();
                        }
                    });

                    function doNext() {
                        if (queryExistProgress == 100) {
                            let gender = postParam["gender"] || 0, salary = postParam["salary"],
                                lv = postParam["ident"] == "staff" ? 0 : 9;
                            let sql = `UPDATE member SET name=?, phone=?, gender=?, salary=?, level=? WHERE _id=?`;
                            MySQL.Query(sql, [name, phone, gender, salary, lv, mid], (err, result) => {
                                if (err) throw err;
                                if (result && result.affectedRows == 1) {
                                    NS.Send(res, NS.Build(200, "修改成功"))
                                } else {
                                    NS.Send(res, NS.Build(400, "修改失败"))
                                }
                            })
                        }
                    }
                })
            } break;
            case 'editstaff': {
                if (!NS.MethodFilter(req, res, "post")) return;
                if (level != 99 && level != 9) {
                    return;
                }
                NS.GetPostData(req, (postParam) => {
                    let mid = postParam["id"];
                    if (!mid) return;
                    let name = postParam["newName"], phone = postParam["newPhone"];
                    // 查询数据库中name有没有被使用，使用者是谁
                    let existNameSql = `SELECT _id FROM member WHERE name=?`;
                    let existPhoneSql = `SELECT _id FROM member WHERE phone=?`;
                    let queryExistProgress = 0;

                    MySQL.Query(existNameSql, [name], (err, result) => {
                        if (err) throw err;
                        if (result && result[0]) {
                            if (mid == result[0]["_id"]) {
                                queryExistProgress += 50;
                                doNext();
                            } else {
                                return NS.Send(res, NS.Build(400, "名字已存在"))
                            }
                        } else {
                            queryExistProgress += 50;
                            doNext();
                        }
                    });

                    MySQL.Query(existPhoneSql, [phone], (err, result) => {
                        if (err) throw err;
                        if (result && result[0]) {
                            if (mid == result[0]["_id"]) {
                                queryExistProgress += 50;
                                doNext();
                            } else {
                                return NS.Send(res, NS.Build(400, "手机号已存在"))
                            }
                        } else {
                            queryExistProgress += 50;
                            doNext();
                        }
                    });

                    function doNext() {
                        if (queryExistProgress == 100) {
                            let gender = postParam["gender"] || 0, salary = postParam["salary"],
                                lv = postParam["ident"] == "manager" ? 9 : 0;

                            if (lv == 9) {

                                let memberSql = `SELECT store FROM member WHERE _id=?`; // 店铺编号

                                // 查询该店是否存在店长
                                let existManagerSql = `SELECT own FROM store WHERE del=? AND _id=(
                                    SELECT store FROM member WHERE _id=? AND level=?
                                )`;
                                MySQL.Query(existManagerSql, [1, mid, 0], (err, result) => {
                                    if (err) throw err;
                                    if (result && result.length) {
                                        NS.Send(res, NS.Build(406, "该店已存在店长，请先降级"))
                                    } else {
                                        let sql = `UPDATE store SET own=? WHERE _id=(
                                            SELECT store FROM member WHERE _id=?
                                        )`;
                                        MySQL.Query(sql, [mid, mid], (err, result) => {
                                            if (err) throw err;
                                            if (result && result.affectedRows == 1) {
                                                final();
                                            } else {
                                                NS.Send(res, NS.Build(400, "修改失败"))
                                            }
                                        })
                                    }
                                })
                            } else {
                                final();
                            }

                            function final() {
                                let sql = `UPDATE member SET name=?, phone=?, gender=?, salary=?, level=? WHERE _id=?`;
                                MySQL.Query(sql, [name, phone, gender, salary, lv, mid], (err, result) => {
                                    if (err) throw err;
                                    if (result && result.affectedRows == 1) {
                                        NS.Send(res, NS.Build(200, "修改成功"))
                                    } else {
                                        NS.Send(res, NS.Build(400, "修改失败"))
                                    }
                                })
                            }
                        }
                    }
                })
            } break;
            case 'delmanager': {
                if (!NS.MethodFilter(req, res, "post")) return;
                if (level != 99) {
                    return;
                }
                NS.GetPostData(req, (postParam) => {
                    let id = postParam["id"];
                    if (!id) return id;
                    let progress = 0;
                    let sqlMember = `UPDATE member SET level=?, del=? WHERE _id=?`;
                    MySQL.Query(sqlMember, [0, 0, id], (err, result) => {
                        if (err) throw err;
                        if (result && result.affectedRows == 1) {
                            progress += 50;
                            if (progress == 100) {
                                NS.Send(res, NS.Build(200, "删除成功"));
                            }
                        } else {
                            NS.Send(res, NS.Build(400, "删除失败"));
                        }
                    });

                    let sqlStore = `UPDATE store SET own=? WHERE own=?`;
                    MySQL.Query(sqlStore, [0, id], (err, result) => {
                        if (err) throw err;
                        if (result && result.affectedRows == 1) {
                            progress += 50;
                            if (progress == 100) {
                                NS.Send(res, NS.Build(200, "删除成功"));
                            }
                        } else {
                            NS.Send(res, NS.Build(400, "删除失败"));
                        }
                    })
                })
            } break;
            case 'delstaff': {
                if (!NS.MethodFilter(req, res, "post")) return;
                if (level != 99 && level != 9) {
                    return;
                }
                NS.GetPostData(req, (postParam) => {
                    let id = postParam["id"];
                    if (!id) return id;
                    let sqlMember = `UPDATE member SET del=? WHERE _id=? AND level=?`;
                    MySQL.Query(sqlMember, [0, id, 0], (err, result) => {
                        if (err) throw err;
                        if (result && result.affectedRows == 1) {
                            NS.Send(res, NS.Build(200, "删除成功"));
                        } else {
                            NS.Send(res, NS.Build(400, "删除失败"));
                        }
                    });
                })
            } break;
            default:
                break;
        }
    }
}

module.exports = new Staff();