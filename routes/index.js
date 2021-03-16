var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* 前端请求路由 */
router.get('/request', function (req, res) {
  console.log(req.query.function);
  let req_code = parseInt(req.query.function);
  let random_stat = [Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random())];

  switch (req_code) {
    case 101:
      let res_simu = {function: 101, keyList: [{key: 1, locked:random_stat[0]}, {key: 2, locked: random_stat[1]},{key: 3, locked: random_stat[2]},{key: 4, locked: random_stat[3]}]};
      res.send(res_simu);
      break;

    case 102:
      let res_case102 = {
        function: 102,
        key: parseInt(req.query.key),
        result: 0,
        installationStatusList: [
          {ecuName: "MOT", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "ESP", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "BSV", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "KRE", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "EZE", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "ARE", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "ABA", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "eBKV", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "FTU", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "BTU", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "RFK", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "LHI", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "IEL", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "WMO", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "HKL", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},

          {ecuName: "FSV", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "LSE", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "ADP", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "OCU", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "EFR", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
          {ecuName: "LSA", swv: {soll: "1EA2B312", ist: "1EA2B312"}, hwv: {soll: "1EA2B312", ist: "1EA2B312"}, tnr: {soll: "1EA2B312", ist: "1EA2B312"}, zdc: 0},
        ]
      };
      res.send(res_case102);
      break;

    case 103:
      let res_case103 = {function: 103, key: req.query.key, ecuName: req.query.ecuName, result: 1};
      res.send(res_case103);
      break;

    case 110:
      let res_case110 = {
        function: 110,
        key: parseInt(req.query.key),
        result: 0,
        installationStatus: {ecuName: req.query.ecuName, swv: {soll: "1101", ist: "1101"}, hwv: {soll: "H03", ist: "H03"}, tnr: {soll: "1EA2B312A", ist: "1EA2B312A"}, zdc: 1}
      };
      res.send(res_case110);
      break;

    case 111:
      let res_case111 = {function: 111, key: req.query.key, ecuName: req.query.ecuName, result: 0};
      setTimeout(function () {
        res.send(res_case111);
      }, 0);
      break;





    case 1:
      let res_case1 = {function: 1, key: parseInt(req.query.key), result: 0,
                        ecuList: [{ecuName: 'MOT'}, {ecuName: 'ESP'}, {ecuName: 'BSV'}, {ecuName: 'KRE'}, {ecuName: 'EZE'}, {ecuName: 'ARE'}, {ecuName: 'ABA'}, {ecuName: 'eBKV'}, {ecuName: 'FTU'},
                                  {ecuName: 'BTU'}, {ecuName: 'RFK'}, {ecuName: 'LHI'}, {ecuName: 'IEL'}, {ecuName: 'WMO'}, {ecuName: 'HKL'}, {ecuName: 'FSV'}, {ecuName: 'LSE'}, {ecuName: 'ADP'},
                                  {ecuName: 'OCU'}, {ecuName: 'EFR'}, {ecuName: 'LSA'}
                        ],
                      };
      res.send(res_case1);
      break;

    case 2:
      let res_case2 = {function: 2, key: parseInt(req.query.key), result: 0};
      res.send(res_case2);
      break;

    case 3:
      let res_case3 = {function: 3, key: parseInt(req.query.key), ecuName:req.query.ecuName,result: 0};
      res.send(res_case3);
      break;

    case 10:
      let res_case10 ={function: 2, key: parseInt(req.query.key), ecuName: req.query.ecuName, result: 0};
      res.send(res_case10);
      break;

    case 11:
      let res_case11 = {function: 3, key: parseInt(req.query.key), ecuName:req.query.ecuName,result: 0};
      res.send(res_case11);
      break;

    case 13:
      let res_case13 = {function: 13, key: parseInt(req.query.key),
        ecuList: [{ecuName: 'MOT'}, {ecuName: 'ESP'}, {ecuName: 'BSV'}, {ecuName: 'KRE'}, {ecuName: 'EZE'}, {ecuName: 'ARE'}, {ecuName: 'ABA'}, {ecuName: 'eBKV'}, {ecuName: 'FTU'},
          {ecuName: 'BTU'}, {ecuName: 'RFK'}, {ecuName: 'LHI'}, {ecuName: 'IEL'}, {ecuName: 'WMO'}, {ecuName: 'HKL'}, {ecuName: 'FSV'}, {ecuName: 'LSE'}, {ecuName: 'ADP'},
          {ecuName: 'OCU'}, {ecuName: 'EFR'}, {ecuName: 'LSA'}
        ],
      };
      res.send(res_case13);
      break;

    case 14:
      let res_case14 = {function: 14, key: parseInt(req.query.key), result: 0, vin: 'LFV1B25N1L7603848'};
      res.send(res_case14);
      break;
  }
});

module.exports = router;
