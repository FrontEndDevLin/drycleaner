/**
 * Created by X on 2019/3/24
 */

let qs = require("querystring");
let NS = require("./NameSpace");

function Statist() {
    let url = require("url");
    let MySQL = require("./MySQLInterface");

    this.OnStatist = function (req, res, handle) {
        let query = url.parse(req.url).query;
        let param;
        if (req.method == "GET") {
            param = qs.parse(query);
        }

        let session_id = NS.GetCookieParam(req)["session_id"];
        let uid = NS.sessionMap.get(session_id)["dc_uid"];
        let level = NS.sessionMap.get(session_id)["dc_level"];
        switch (handle) {
            case 'getstatist': {
                if (!NS.MethodFilter(req, res, "get")) return;
                let now = new Date();
                let progress = 0;
                let dayStart = new Date(now.toLocaleDateString()).getTime();
                let dayEnd = dayStart + 1000 * 60 * 60 * 24;

                let rspData = { top6Sell: [], top3Store: [], top5Staff: [] };

                let top6SellSql = `SELECT title FROM orderform WHERE complete=? AND accepttime BETWEEN ? AND ?`;
                if (level != 99) {
                    top6SellSql += ` AND acceptstore=(SELECT store FROM member WHERE _id=?)`;
                }
                MySQL.Query(top6SellSql, [1, dayStart, dayEnd, uid], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        let arr = [];
                        for (let tmp of result) {
                            let isRep = false;
                            for (let tmp2 of arr) {
                                if (tmp2["title"] == tmp["title"]) {
                                    tmp2["count"]++;
                                    isRep = true;
                                    break;
                                }
                            }
                            if (!isRep) {
                                arr.push({"title": tmp.title, "count": 1})
                            }
                        }
                        arr.sort(NS.Compare("count"));
                        rspData["top6Sell"] = arr.slice(0, 6);
                        progress += 30;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "获取成功", rspData));
                        }
                    }
                });

                // 最近7天订单数前三店铺
                let days = 7;
                let sevenDaysAgo = dayEnd - 1000 * 60 * 60 * 24 * days;
                let top3SellSql = `SELECT acceptStore,(SELECT name FROM store WHERE _id=acceptStore) AS storeName ,accepttime FROM orderform WHERE complete=? AND accepttime BETWEEN ? AND ?`;
                let rangeArr = [];
                let dayStrArr = [];
                for (let i = 0; i < days; i++) {
                    let lastDay = sevenDaysAgo + 1000 * 60 * 60 * 24 * i;
                    let key = new Date(lastDay).toLocaleDateString();
                    dayStrArr.push(key);
                    let thatDay = new Date(key).getTime();
                    let obj = {};
                    obj[key] = [thatDay, thatDay + 1000 * 60 * 60 * 24 - 1];
                    rangeArr.push(obj);
                }
                // console.log(JSON.stringify(rangeArr))

                MySQL.Query(top3SellSql, [1, sevenDaysAgo, dayEnd], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        let arr = [];
                        for (let tmp of result) {
                            tmp["storeName"] = tmp["storeName"] || "CEO";
                            let isRep = false;
                            for (let tmp2 of arr) {
                                if (tmp2["store"] == tmp["storeName"]) {
                                    tmp2["count"]++;
                                    tmp2["times"].push(tmp["accepttime"]);
                                    isRep = true;
                                    break;
                                }
                            }
                            if (!isRep) {
                                arr.push({"store": tmp["storeName"], "count": 1, "times": [tmp["accepttime"]]});
                            }
                        }

                        arr.sort(NS.Compare("count")).slice(0, 3);
                        // console.log(JSON.stringify(arr));
                        let top3Data = [];
                        for (let tmp of arr) {
                            let obj = {storeName: tmp.store, data: {}};
                            for (let time of tmp["times"]) {
                                for (let range of rangeArr) {
                                    for (let day in range) {
                                        if (time >= range[day][0] && time <= range[day][1]) {
                                            if (obj["data"][day]) {
                                                obj["data"][day]++;
                                            } else {
                                                obj["data"][day] = 1;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            top3Data.push(obj);
                        }
                        // console.log(dayStrArr);
                        for (let tmp of top3Data) {
                            let keyArr = [];
                            for (let key in tmp["data"]) {
                                keyArr.push(key);
                            }
                            for (let day of dayStrArr) {
                                let isExist = false;
                                for (let day2 of keyArr) {
                                    if (day2 == day) {
                                        isExist = true;
                                    }
                                }
                                if (!isExist) {
                                    tmp["data"][day] = 0;
                                }
                            }

                            // console.log(tmp);
                            let newData = {};
                            for (let dayTmp of dayStrArr) {
                                for (let day in tmp["data"]) {
                                    if (day == dayTmp) {
                                        newData[day] = tmp["data"][day];
                                        break;
                                    }
                                }
                            }
                            tmp["data"] = newData;
                        }
                        
                        rspData["top3Store"] = top3Data;

                        progress += 40;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "获取成功", rspData));
                        }
                    }

                });

                // 本月销售额前6比较上月


                // 今日Top5员工订单数
                let top5staff = `SELECT (SELECT name FROM member WHERE _id=accept) AS accepter FROM orderform WHERE complete=? AND accepttime BETWEEN ? AND ?`;
                MySQL.Query(top5staff, [1, dayStart, dayEnd], (err, result) => {
                    if (err) throw err;
                    if (result && result.length >= 0) {
                        let length = result.length;
                        let arr = [];
                        for (let tmp of result) {
                            let isRep = false;
                            for (let tmp2 of arr) {
                                if (tmp2["accepter"] == tmp["accepter"]) {
                                    isRep = true;
                                    tmp2["count"]++;
                                    break;
                                }
                            }
                            if (!isRep) {
                                arr.push({accepter: tmp["accepter"], count: 1})
                            }
                        }
                        arr.sort(NS.Compare("count"));
                        arr.slice(0, 5);
                        let top5Count = 0;
                        for (let tmp of arr) {
                            top5Count += tmp["count"];
                        }
                        arr.push({ accepter: '其他人', count: length - top5Count} );
                        rspData["top5Staff"] = arr;

                        progress += 30;
                        if (progress == 100) {
                            NS.Send(res, NS.Build(200, "获取成功", rspData));
                        }
                    }
                })
            } break;
            default:
                break;
        }
    }
}

module.exports = new Statist();