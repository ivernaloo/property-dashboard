var MongoCli = require("mongodb").MongoClient,
    config   = require("config"),
    debug    = require("debug"),
    URL      = config.get("crawler.database");


/*
* connect logic
* @param {function} connection function
* @param {function} disconnect function
* */
function connection(connect, disconnect) {
    var log = debug("connection : ");

    log(URL)
    // connection url
    MongoCli.connect(URL, function (err, db) {
        log("connection status : ", err);
        connect(db);

        if (err) {
            log(" connection error ");
            return;
        }
        ;
    });
}

/*
* insert many documents
* @param {Array} save data set
* */
function insertDocuments(data) {
    var log = debug("insertDocuments : ");
    connection(
        function (db) {
            // Get the documents collection
            var collection = db.collection('documents');
            // Insert some documents
            collection.insertMany(data, function (err, result) {
                // log(err, result);
            }, function (res) {
                // log(res);
                db.close();
            });
        }
    )

}

var updateDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({a: 2}
        , {$set: {b: 1}}, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};


var deleteDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.deleteOne({a: 3}, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document with the field a equal to 3");
        callback(result);
    });
};

function findDocuments(query, callback) {
    var log = debug("findDocuments : ");
    connection(function(db){
        // Get the documents collection
        var collection = db.collection('documents');
        // Find some documents
        collection.find(query).toArray(function (err, docs) {

            log("Found the following records");
            log(docs);
            callback && callback(docs);
        });
    });

}

function findLatest(callback) {
    var log = debug("findLatest : ");
    connection(function(db){
        // Get the documents collection
        var collection = db.collection('documents');
        // Find latest
        collection.find().sort({"date": -1}).limit(1).toArray(function(err, items){
            items[0] ? callback(items[0]["date"]) : callback(null);
        });
    });

}

/*
* sample data
{
    "date" : "2017/10/1"
}
[{"区域":"江岸区","商品住房-成交套数":"28","商品住房-成交面积":"2334.00","写字楼-成交套数":"26","写字楼-成交面积":"1323.27","商业-成交套数":"3","商业-成交面积":"102.12","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"57","合计-成交面积":"3759.39"},{"区域":"江汉区","商品住房-成交套数":"27","商品住房-成交面积":"2734.37","写字楼-成交套数":"3","写字楼-成交面积":"237.80","商业-成交套数":"7","商业-成交面积":"327.25","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"37","合计-成交面积":"3299.42"},{"区域":"硚口区","商品住房-成交套数":"77","商品住房-成交面积":"8045.45","写字楼-成交套数":"3","写字楼-成交面积":"160.47","商业-成交套数":"0","商业-成交面积":"0.00","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"80","合计-成交面积":"8205.92"},{"区域":"汉阳区","商品住房-成交套数":"151","商品住房-成交面积":"15037.02","写字楼-成交套数":"10","写字楼-成交面积":"775.95","商业-成交套数":"3","商业-成交面积":"49.44","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"164","合计-成交面积":"15862.41"},{"区域":"青山区","商品住房-成交套数":"39","商品住房-成交面积":"3823.05","写字楼-成交套数":"0","写字楼-成交面积":"0.00","商业-成交套数":"1","商业-成交面积":"46.77","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"40","合计-成交面积":"3869.82"},{"区域":"武昌区","商品住房-成交套数":"9","商品住房-成交面积":"804.12","写字楼-成交套数":"15","写字楼-成交面积":"885.61","商业-成交套数":"1","商业-成交面积":"47.75","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"25","合计-成交面积":"1737.48"},{"区域":"洪山区","商品住房-成交套数":"53","商品住房-成交面积":"5681.45","写字楼-成交套数":"16","写字楼-成交面积":"1026.48","商业-成交套数":"0","商业-成交面积":"0.00","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"69","合计-成交面积":"6707.93"},{"区域":"东西湖区","商品住房-成交套数":"19","商品住房-成交面积":"1851.68","写字楼-成交套数":"20","写字楼-成交面积":"1873.01","商业-成交套数":"14","商业-成交面积":"680.07","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"53","合计-成交面积":"4404.76"},{"区域":"东湖高新区","商品住房-成交套数":"20","商品住房-成交面积":"1352.31","写字楼-成交套数":"8","写字楼-成交面积":"839.07","商业-成交套数":"3","商业-成交面积":"168.48","其他-成交套数":"4","其他-成交面积":"698.15","合计-成交套数":"35","合计-成交面积":"3058.01"},{"区域":"经济开发区","商品住房-成交套数":"14","商品住房-成交面积":"1513.33","写字楼-成交套数":"8","写字楼-成交面积":"368.76","商业-成交套数":"8","商业-成交面积":"375.40","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"30","合计-成交面积":"2257.49"},{"区域":"江夏区","商品住房-成交套数":"69","商品住房-成交面积":"7073.47","写字楼-成交套数":"0","写字楼-成交面积":"0.00","商业-成交套数":"4","商业-成交面积":"720.95","其他-成交套数":"16","其他-成交面积":"613.81","合计-成交套数":"89","合计-成交面积":"8408.23"},{"区域":"黄陂区","商品住房-成交套数":"23","商品住房-成交面积":"2485.70","写字楼-成交套数":"12","写字楼-成交面积":"610.57","商业-成交套数":"1","商业-成交面积":"72.45","其他-成交套数":"4","其他-成交面积":"1161.44","合计-成交套数":"40","合计-成交面积":"4330.16"},{"区域":"蔡甸区","商品住房-成交套数":"11","商品住房-成交面积":"1174.52","写字楼-成交套数":"19","写字楼-成交面积":"982.41","商业-成交套数":"2","商业-成交面积":"209.91","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"32","合计-成交面积":"2366.84"},{"区域":"新洲区","商品住房-成交套数":"26","商品住房-成交面积":"2801.52","写字楼-成交套数":"29","写字楼-成交面积":"1646.71","商业-成交套数":"0","商业-成交面积":"0.00","其他-成交套数":"3","其他-成交面积":"184.41","合计-成交套数":"58","合计-成交面积":"4632.64"},{"区域":"汉南区","商品住房-成交套数":"28","商品住房-成交面积":"3072.96","写字楼-成交套数":"0","写字楼-成交面积":"0.00","商业-成交套数":"1","商业-成交面积":"72.55","其他-成交套数":"0","其他-成交面积":"0.00","合计-成交套数":"29","合计-成交面积":"3145.51"},{"区域":"合计","商品住房-成交套数":"594","商品住房-成交面积":"59784.95","写字楼-成交套数":"169","写字楼-成交面积":"10730.11","商业-成交套数":"48","商业-成交面积":"2873.14","其他-成交套数":"27","其他-成交面积":"2657.81","合计-成交套数":"838","合计-成交面积":"76046.01"}]

* */

var insertDataDocuments = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.insertOne(
        {
            "date"  : "2017/10/1",
            "result": [{
                "区域"       : "江岸区",
                "商品住房-成交套数": "28",
                "商品住房-成交面积": "2334.00",
                "写字楼-成交套数" : "26",
                "写字楼-成交面积" : "1323.27",
                "商业-成交套数"  : "3",
                "商业-成交面积"  : "102.12",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "57",
                "合计-成交面积"  : "3759.39"
            }, {
                "区域"       : "江汉区",
                "商品住房-成交套数": "27",
                "商品住房-成交面积": "2734.37",
                "写字楼-成交套数" : "3",
                "写字楼-成交面积" : "237.80",
                "商业-成交套数"  : "7",
                "商业-成交面积"  : "327.25",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "37",
                "合计-成交面积"  : "3299.42"
            }, {
                "区域"       : "硚口区",
                "商品住房-成交套数": "77",
                "商品住房-成交面积": "8045.45",
                "写字楼-成交套数" : "3",
                "写字楼-成交面积" : "160.47",
                "商业-成交套数"  : "0",
                "商业-成交面积"  : "0.00",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "80",
                "合计-成交面积"  : "8205.92"
            }, {
                "区域"       : "汉阳区",
                "商品住房-成交套数": "151",
                "商品住房-成交面积": "15037.02",
                "写字楼-成交套数" : "10",
                "写字楼-成交面积" : "775.95",
                "商业-成交套数"  : "3",
                "商业-成交面积"  : "49.44",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "164",
                "合计-成交面积"  : "15862.41"
            }, {
                "区域"       : "青山区",
                "商品住房-成交套数": "39",
                "商品住房-成交面积": "3823.05",
                "写字楼-成交套数" : "0",
                "写字楼-成交面积" : "0.00",
                "商业-成交套数"  : "1",
                "商业-成交面积"  : "46.77",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "40",
                "合计-成交面积"  : "3869.82"
            }, {
                "区域"       : "武昌区",
                "商品住房-成交套数": "9",
                "商品住房-成交面积": "804.12",
                "写字楼-成交套数" : "15",
                "写字楼-成交面积" : "885.61",
                "商业-成交套数"  : "1",
                "商业-成交面积"  : "47.75",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "25",
                "合计-成交面积"  : "1737.48"
            }, {
                "区域"       : "洪山区",
                "商品住房-成交套数": "53",
                "商品住房-成交面积": "5681.45",
                "写字楼-成交套数" : "16",
                "写字楼-成交面积" : "1026.48",
                "商业-成交套数"  : "0",
                "商业-成交面积"  : "0.00",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "69",
                "合计-成交面积"  : "6707.93"
            }, {
                "区域"       : "东西湖区",
                "商品住房-成交套数": "19",
                "商品住房-成交面积": "1851.68",
                "写字楼-成交套数" : "20",
                "写字楼-成交面积" : "1873.01",
                "商业-成交套数"  : "14",
                "商业-成交面积"  : "680.07",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "53",
                "合计-成交面积"  : "4404.76"
            }, {
                "区域"       : "东湖高新区",
                "商品住房-成交套数": "20",
                "商品住房-成交面积": "1352.31",
                "写字楼-成交套数" : "8",
                "写字楼-成交面积" : "839.07",
                "商业-成交套数"  : "3",
                "商业-成交面积"  : "168.48",
                "其他-成交套数"  : "4",
                "其他-成交面积"  : "698.15",
                "合计-成交套数"  : "35",
                "合计-成交面积"  : "3058.01"
            }, {
                "区域"       : "经济开发区",
                "商品住房-成交套数": "14",
                "商品住房-成交面积": "1513.33",
                "写字楼-成交套数" : "8",
                "写字楼-成交面积" : "368.76",
                "商业-成交套数"  : "8",
                "商业-成交面积"  : "375.40",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "30",
                "合计-成交面积"  : "2257.49"
            }, {
                "区域"       : "江夏区",
                "商品住房-成交套数": "69",
                "商品住房-成交面积": "7073.47",
                "写字楼-成交套数" : "0",
                "写字楼-成交面积" : "0.00",
                "商业-成交套数"  : "4",
                "商业-成交面积"  : "720.95",
                "其他-成交套数"  : "16",
                "其他-成交面积"  : "613.81",
                "合计-成交套数"  : "89",
                "合计-成交面积"  : "8408.23"
            }, {
                "区域"       : "黄陂区",
                "商品住房-成交套数": "23",
                "商品住房-成交面积": "2485.70",
                "写字楼-成交套数" : "12",
                "写字楼-成交面积" : "610.57",
                "商业-成交套数"  : "1",
                "商业-成交面积"  : "72.45",
                "其他-成交套数"  : "4",
                "其他-成交面积"  : "1161.44",
                "合计-成交套数"  : "40",
                "合计-成交面积"  : "4330.16"
            }, {
                "区域"       : "蔡甸区",
                "商品住房-成交套数": "11",
                "商品住房-成交面积": "1174.52",
                "写字楼-成交套数" : "19",
                "写字楼-成交面积" : "982.41",
                "商业-成交套数"  : "2",
                "商业-成交面积"  : "209.91",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "32",
                "合计-成交面积"  : "2366.84"
            }, {
                "区域"       : "新洲区",
                "商品住房-成交套数": "26",
                "商品住房-成交面积": "2801.52",
                "写字楼-成交套数" : "29",
                "写字楼-成交面积" : "1646.71",
                "商业-成交套数"  : "0",
                "商业-成交面积"  : "0.00",
                "其他-成交套数"  : "3",
                "其他-成交面积"  : "184.41",
                "合计-成交套数"  : "58",
                "合计-成交面积"  : "4632.64"
            }, {
                "区域"       : "汉南区",
                "商品住房-成交套数": "28",
                "商品住房-成交面积": "3072.96",
                "写字楼-成交套数" : "0",
                "写字楼-成交面积" : "0.00",
                "商业-成交套数"  : "1",
                "商业-成交面积"  : "72.55",
                "其他-成交套数"  : "0",
                "其他-成交面积"  : "0.00",
                "合计-成交套数"  : "29",
                "合计-成交面积"  : "3145.51"
            }, {
                "区域"       : "合计",
                "商品住房-成交套数": "594",
                "商品住房-成交面积": "59784.95",
                "写字楼-成交套数" : "169",
                "写字楼-成交面积" : "10730.11",
                "商业-成交套数"  : "48",
                "商业-成交面积"  : "2873.14",
                "其他-成交套数"  : "27",
                "其他-成交面积"  : "2657.81",
                "合计-成交套数"  : "838",
                "合计-成交面积"  : "76046.01"
            }]
        }, function (err, result) {
            callback(result);
        });
};

module.exports.insertDocuments = insertDocuments;
module.exports.findDocuments = findDocuments;
module.exports.findLatest = findLatest;
