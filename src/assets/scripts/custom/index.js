var data = require('./data.js');
var moment = require('moment')

let impacted_lives = 297177 // May 6 2020 8
let rewards_count = 7178


function sleep(t) {
    const e = Date.now();
    let a = null;
    do {
        a = Date.now()
    } while (a - e < t)
}

function filterTransactions(t, e) {
    t = [];
    for (var a of t) a.timeStamp > e && a.push(a);
    return t
}
let c = "0xa9958ed59bafcfe2e156748222ca325b75388881",ap = "QNAZ3SGEV8AJJN17GYY7571K16BS2MFV78";

function checkForNewBlocksFrom(t) {
    var e = "http://api.etherscan.io/api?module=account&action=tokentx&address=0xa9958ed59bafcfe2e156748222ca325b75388881&startblock=" + t + "&sort=asc&apikey=" + ap;
    return new Promise(function(t, a) {
        $.getJSON(e, function(e) {
            1 == e.status ? t(e.result) : a(e.message)
        })
    })
}

function recursivecheckNewBlocks(t, e) {
    var a = "https://api.etherscan.io/api?module=account&action=tokentx&address=" + c + "&startblock=" + t + "&sort=asc&apikey=" + ap;
    $.getJSON(a, function(a) {
        if (1 != a.status) return console.log(a), console.log("Error " + a.message), e;
        var r = a.result;
        if (0 == r.length) return e;
        let o = r[r.length - 1];

        if (o.blockNumber == t) {
          processData(e)

        return
        }

        let n = e.concat(r)
        recursivecheckNewBlocks(o.blockNumber, n)
    })
}

function getRewardsData(dict){
  var result = []
  for (var key in dict) {
    let count = dict[key].count
    let date = new Date(key)
    result.push({"x":date,"y":count})
  }
  return result
}

function getWalletsData(dict){
  var result = []
  for (var key in dict) {
    let count = dict[key].walletsCount
    let date = new Date(key)
    result.push({"x":date,"y":count})
  }
  return result
}


//Don't use it. 0 and 1 is the same transaction hash and will break calculations
function getUniqueTransactions(t){
  var result = []

  const map = new Map();
  for (const item of t) {
    if(!map.has(item.hash)){
        map.set(item.hash, true);
        result.push(item);
      }
  }
  return result
}

function filterRewards(t){
var result = []
let n = Math.pow(10, 18);
for (var i = 0; i < t.length - 1; i ++){
  let t1 = t[i]
  let t2 = t[i+1]

  if(t1.hash == t2.hash && ((parseInt(t1.value) == 1 * n && parseInt(t2.value) == 0 * n) || (parseInt(t1.value) == 2.5 * n && parseInt(t2.value) == 0 * n)|| (parseInt(t1.value) == 0 * n && parseInt(t2.value) == 1 * n)|| (parseInt(t1.value) == 0 * n && parseInt(t2.value) == 2.5 * n))){
    if(t1.value == 0){
      result.push(t2)
    }
    else if (t2.value == 0){
      result.push(t1)
    }
  }
}
return result;
// let r =  t.filter(e => {
//       let n = Math.pow(10, 18);
//       // return (parseInt(e.value) == 1 * n || parseInt(e.value) == 2.5 * n)
//       return parseInt(e.value) == 0
//   });
//   return r
}

function processData(t) {
    var rewards = filterRewards(t)
    const reducer = (accumulator, element) => accumulator + parseInt(element.value);
    var sum = 0
    var gas = 0
    let n = Math.pow(10, 18);
    for (var el of rewards){
      sum += parseInt(el.value)/n
      gas += parseInt(el.gasUsed)  //* parseInt(el.gasPrice)
    }
    gas = 0.000000001 * gas

    var all = groupByDay(rewards);
    var groupedByDate = all[0]
    var allWallets = all[1]

    var rewardsData = getRewardsData(groupedByDate)
    var lastRewards = rewardsData.slice(-20).reverse(); //last 20 by day
    var lastTransactions = rewards.slice(-20).reverse() // last 20
    var walletsData = getWalletsData(groupedByDate)

    displayRewardsGraph(rewardsData,walletsData);
    displayTables(lastRewards,lastTransactions);

    $("#rewards").text(rewards.length.toLocaleString())
    $("#wallets").text(allWallets.size.toLocaleString())
    $("#mtcRewardsSum").text(sum.toLocaleString() + " MTC")
    $("#gasUsedSum").text(gas.toLocaleString() + " ETH")

    getWebsiteRewards().then((data)=>{
      let doc_difference = data - impacted_lives
      let blockchain_difference = rewards.length - rewards_count

      $("#impacted_lives").text(data.toLocaleString())
      $("#notRewarded").text((doc_difference - blockchain_difference).toLocaleString())

    })


}


function displayTables(e,t) {
    // let e = t.slice(-20).reverse();
    for (var a of e){
      let t = a.x.toLocaleDateString();
      $("#rewardsTable").append("<tr><td>" + t + "</td><td>" + a.y + "</td></tr>")
    }

    for (var a of t){
      let d = new Date(1e3 * a.timeStamp).toLocaleDateString();
      let v = a.value / 1e18
      let h = a.hash.substring(a.hash.length - 15)
      let b = a.blockNumber
      let link = '<a href="https://etherscan.io/tx/' + a.hash + '" target="_blank">&#128279;</a>'
      $("#transactionsTable").append("<tr><td>" + d + "</td><td>" + v + "</td><td>" + b + "</td><td>" + h + "</td><td>" + link + "</td></tr>")
    }
}

function displayRewardsGraph(t,w) {

    var e = document.getElementById("rewardsChart").getContext("2d");
    new Chart(e, {
        type: "bar",
        data: {
            datasets: [
            {
                label: "Rewards",
                borderColor:'#1976d2',
				        backgroundColor: '#1976d2',
                fill:true,
                yAxisID: 'y-axis-1',
                data: t
            },
            {
                borderColor: '#17671e',
                backgroundColor:'#17671e',
                label: "Wallets",
                fill:false,
                data: w,
                yAxisID: 'y-axis-2',
                type: 'line'
            }
          ]
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    distribution: "series"
                }],
                yAxes: [{
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'left',
							id: 'y-axis-1',
						}, {
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'right',
							id: 'y-axis-2',

							// grid line settings
							gridLines: {
								drawOnChartArea: false, // only want the grid lines for one axis to show up
							},
						}]
            }
        }
    })
}

function displayWalletGraph(r,w) {
    var e = document.getElementById("rewardsChart").getContext("2d");
    new Chart(e, {
        type: "line",
        data: {
            datasets: [{
                label: "Rewards",
                data: t
            },{
                label: "Wallets",
                data: w
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    distribution: "series"
                }]
            }
        }
    })
}

function groupByDay(t) {
    var allWallets = new Set()
    var result = {}
    for (var e of t){

      if (!allWallets.has(e.to)){
        allWallets.add(e.to)
      }

      var walletsCount = allWallets.size

      var a = moment(1e3 * e.timeStamp).startOf("day");
      var array = []
      if (!result[a]){
        var wallets = {}
        wallets[e.to] = e
        result[a]= {"count":1, "wallets":wallets, "walletsCount":walletsCount}
      }
      else{
        let count  = result[a].count + 1
        var wallets = result[a].wallets
        wallets[e.to] = e;

        result[a]={"count":count, "wallets":wallets, "walletsCount":walletsCount}
      }

    }
  return [result,allWallets];
}

function getWebsiteRewards(){
  return new Promise((a,r)=>{
    let origin = 'https://api.allorigins.win/get?url='
    let origin2 = 'http://www.whateverorigin.org/get?url='

    $.getJSON(origin + encodeURIComponent('https://doc.com/api/impacted_lives_metrics/'), function(data){
      var obj = JSON.parse(data.contents)
      let new_impacted_lives = obj.impacted_lives
      a(new_impacted_lives)
    });
  })


}

function startProcessing() {
  let blocks = data.blocks
  let lastBlock = blocks[blocks.length-1].blockNumber;
  recursivecheckNewBlocks(lastBlock, blocks)
//notRewarded
  // $.getJSON("https://doc.com/api/impacted_lives_metrics/",(x)=>{
  //   console.log(x)
  // })

  // let  lastBlock = blocks[blocks.length-1].blockNumber;
  // recursivecheckNewBlocks(lastBlock, blocks)
  // var firebaseConfig = {
  //       apiKey: "AIzaSyA5eVNCmZ_2ix7pwOEwpf4XUUz9ke-U4VE",
  //       authDomain: "doc-app-93a09.firebaseapp.com",
  //       databaseURL: "https://doc-app-93a09.firebaseio.com",
  //       projectId: "doc-app-93a09",
  //       storageBucket: "doc-app-93a09.appspot.com",
  //       messagingSenderId: "591281573370",
  //       appId: "1:591281573370:web:f3bde955e660ed534f2843",
  //       measurementId: "G-CE6WBW694W"
  //   };
  //   firebase.initializeApp(firebaseConfig);
}
startProcessing();
