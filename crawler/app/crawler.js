var debug     = require('debug'),
    config    = require("config"),
    cheerio   = require('cheerio'),
    request   = require('request'),
    fs        = require('fs'),
    async     = require('async'),
    URL       = config.get("crawler.url"),
    BASE_URL = config.get("crawler.base"),
    database  = require("../database/mongo"),
    // parseTableData = require("./parseTable").parseTable,
    RESULTS   = {},
    PATH      = {
        "urldatabase": "./crawler/data/database.json",
        "pricedata"  : "./crawler/data/estate.json"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log,
    iconv     = require('iconv-lite');

function saveData(finalTask) {
    log = debug("saveData :");
    fs.writeFile(PATH.pricedata, JSON.stringify(PRICEDATA), function (err) {
        if (err) throw err;
        log('completed save data');
        finalTask && finalTask();
    });
}

/*
* getList的启动函数
* */
function init(finalTask) {
    var log = debug("init");

    log("start");

    // parse the url
    parseList(URL);
}

// parse the list
function parseList(url, callback, next) {
    log = debug("parseList : ");
    log("start..");

    log("list url : ", url)
    parseTable("http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html")
    return;
    request({
        method  : 'GET',
        uri     : url,
        encoding: null
    }, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $      = cheerio.load(iconv.decode(body, 'gb2312')),
                items  = $(".service").toArray(), // get the list result
                result = [],
                next = $("a:contains(下一页)")[0].attribs.href || null;

            async.each(items,
                // iteratee : async function
                function (item, callback) {
                    var url  = item.attribs.href,
                        // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                        date = item.children[0].data.replace(/\D+/g, " ").split(" ").slice(0, 3).join("/"); // should jump when unormal info
                    parseTable(url, function (data) {
                        result.push({"date": date, "data": data});
                        log("url : ", url)
                        callback(null, item)
                    });
                },
                // callback as soon as any iteratee returns true
                function (err) {
                    log("result : ", result.length);
                    log("error : ", err);
                    // database.insertDocuments(result);
                    if (next) {
                        parseList(BASE_URL + next)
                        // fixed bug: http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854_4.html
                        // http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/contents/854/24309.html
                    }
                });
            return;
            // @todo two async flow
            //  @todo list : detect async, get the next page
            //  @done item : each async, modify the each cocurrence to async logic. one by one


            database.findLatest(function (latest) {
                log("latest : ", latest)


                items.each(function (i, elem) {
                    var url  = $(elem).attr("href"),
                        // reference : http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
                        date = $(elem).text().replace(/\D+/g, " ").split(" ").slice(0, 3).join("/");
                    // if (latest && date == latest) return; // @todo update logic
                    // if (i > 3) return; // @todo concurrence
                    // return;
                    parseTable(url, function (data) {
                        result.push({"date": date, "data": data});
                        database.insertDocuments(result);
                    });


                });
            })
        } else {
            log("getlist error..")
        }
    })
}

/*
* 初始化价格数据库
* */
function initPriceData() {
    return fs.readFileSync(PATH.pricedata, 'utf8');
}

/*
* given a url, get the page and parse table
* then return the data
*
* @param {Sting} url
* @callback {Function}
* @return {JSON[Object]}
*
* */
function parseTable(url, callback) {
    var log      = debug("parseTable : "),
        base     = config.get("crawler.base"),
        headings = [],
        h1s,
        h2s; // custom heading;

    request({
        method  : 'GET',
        uri     : base + url,
        encoding: null
    }, function (err, res, body) {
        if (!!res.statusCode && res.statusCode == 200) {
            var $ = cheerio.load(iconv.decode(body, 'gb2312'), {
                decodeEntities: false
            });

            // var Table = $($("#artibody > p").html());
            var trs = []; // trs collection
            var table = []; // html table parse result
            var _table = $("#artibody > p");
            log(".....", _table.toArray()[0])
            // log("table : ",_table)
            return;
            h1s = $(Table.find("tr")[0]).find("td");
            h2s = $(Table.find("tr")[1]).find("td");
            h1s.each(function (i, elem) {
                if (i < 1) {
                    headings.push($($(elem).find("font")).html()); // insert the first title
                    return;
                }
                headings.push($($(elem).find("font")).html() + "-" + $($(h2s[2 * (i - 1)]).find("font")).html(), $($(elem).find("font")).html() + "-" + $($(h2s[2 * i - 1]).find("font")).html());
            });

            $(Table.find("tr")).each(function (i, el) {
                trs.push($(el).html());
            });

            // traverse line proceed very tr line to combine the data set
            arrayify(trs, [2, -2]).map(function (tr, i) {
                var _item = {};

                // traverse item
                $($(tr).find("font")).each(function (index, el) {
                    _item[headings[index]] = $(el).html()
                });

                table.push(_item);
            });

            callback(table);

        } else {
            log("request error")
        }
    })

}

/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @param  range such as [2,2] to indicate range to cut
 * @return {Array} the converted object
 */
function arrayify(collection, range) {
    if (range) {
        _array = collection.slice(range[0], range[1])
    }
    return _array; // simple convert array-like to array
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
    var log = debug("factory : ");

    return function (row) {
        return arrayify(row.cells).reduce(function (prev, curr, i) {
            prev[headings[i]] = curr.innerText;
            return prev;
        }, {});
    }
}

module.exports.init = init;