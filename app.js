const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const noblox = require("noblox.js");
const https = require('https');
const cron = require('node-cron');
const Math = require('mathjs');
const requestIp = require('request-ip')

const app = express();
const port = 4000;

const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(port);

var SOCKET = {};

var sqlconnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'apkmrepr_user',
    password : '(0G$X2!1!c)!',
    database : 'apkmrepr_myrblx'
});
// var sqlconnection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'myrblx'
// });

sqlconnection.connect(function(err) {
    if (err) throw err;
});

sqlconnection.query("SELECT groupAdminCookie FROM admin_group_details", function(err, r){
    if(err) console.log(err);
    var cookie = r[0]['groupAdminCookie'];
    noblox.setCookie(cookie);
});

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
}

var robuxDropMilliseconds = 60 * 60000;
var giveawayMiliseconds = 12*60*60*1000;

function createGiveaway(){
    sqlconnection.query("UPDATE pending_giveaways SET isActive = 0", function(err, r){
        var newGiveawayTime = new Date();
        newGiveawayTime = new Date(newGiveawayTime.getTime() + (giveawayMiliseconds));

        sqlconnection.query("UPDATE admin_settings SET nextGiveawayTime = ?", [newGiveawayTime], function(err, r){});

        var rand = Math.floor(Math.random() * Math.floor(2));
        var newPrizeAmount = 5;
        if(rand == 0) newPrizeAmount = 5;
        if(rand == 1) newPrizeAmount = 10;
        if(rand == 2) newPrizeAmount = 12;

        sqlconnection.query("INSERT INTO pending_giveaways SET prizeAmount = ?, endDate = ?, isActive = 1", 
        [newPrizeAmount, newGiveawayTime], function(err, r){
            if(err){
                console.log('Error:', err);
            }
        });
    });
}
function updateRobuxDropTime(){
    var newRobuxDropTime = new Date();
    newRobuxDropTime = new Date(newRobuxDropTime.getTime() + robuxDropMilliseconds);

    sqlconnection.query("UPDATE admin_settings SET nextRobuxDropTime = ?", [newRobuxDropTime], function(err, r){
        if(err) console.log('Error:', err);
    });
}
createGiveaway();
updateRobuxDropTime();

//Robux Drop:
var robuxDropPrizeAmount1 = 1;
var robuxDropPrizeAmount2 = 2;
var robuxDropPrizeAmount3 = 3;

//(seconds) (minutes) (hours) (days) (months) (years)
//eg. 0 */30 * * * * executes every 30 min
cron.schedule('0 */60 * * * *', () => {

    var onlineUsers = Object.keys(SOCKET);
    if(onlineUsers.length < 1){
        var newRobuxDropTime = new Date();
        newRobuxDropTime = new Date(newRobuxDropTime.getTime() + robuxDropMilliseconds);

        sqlconnection.query("UPDATE admin_settings SET nextRobuxDropTime = ?", [newRobuxDropTime], function(err, r){
            if(err) console.log('Error:', err);
        });
    }else{
        var shuffledList = shuffle(onlineUsers);

        var winnerUserId1 = shuffledList[0];
        var winnerUserId2 = shuffledList.length >= 2 ? shuffledList[1] : -1;
        var winnerUserId3 = shuffledList.length >= 3 ? shuffledList[2] : -1;

        var rand = Math.floor(Math.random() * Math.floor(2));

        var prizeAmount = 5;
        if(rand == 0) prizeAmount = robuxDropPrizeAmount1;
        if(rand == 1) prizeAmount = robuxDropPrizeAmount2;
        if(rand == 2) prizeAmount = robuxDropPrizeAmount3;

        sqlconnection.query("SELECT * FROM users WHERE id = ? OR id = ? OR id = ?", [winnerUserId1, winnerUserId2, winnerUserId3], function(err, r){
            if(err){
                console.log('Error:', err);
                var newRobuxDropTime = new Date();
                newRobuxDropTime = new Date(newRobuxDropTime.getTime() + 60*60000);

                sqlconnection.query("UPDATE admin_settings SET nextRobuxDropTime = ?", [newRobuxDropTime], function(err, r){
                    if(err) console.log('Error:', err);
                });
            }else{
                var winnerUsername1 = undefined;
                var winnerUsername2 = undefined;
                var winnerUsername3 = undefined;

                for (i = 0; i < r.length; ++i) {
                    if(r[i]['id'] == winnerUserId1) winnerUsername1 = r[i]['username'];
                    else if(r[i]['id'] == winnerUserId2) winnerUsername2 = r[i]['username'];
                    else if(r[i]['id'] == winnerUserId3) winnerUsername3 = r[i]['username'];
                }
                sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ? WHERE id = ? OR id = ? OR id = ?", [prizeAmount, winnerUserId1, winnerUserId2, winnerUserId3], function(err, r){
                    if(err) console.log('Error:', err);
                });
                sqlconnection.query("INSERT INTO robux_drop_winners SET winnerUserId1 = ?, winnerUserId2 = ?, winnerUserId3 = ?, winnerUsername1 = ?, winnerUsername2 = ?, winnerUsername3 = ?, robuxAmount = ?", 
                [winnerUserId1, winnerUserId2, winnerUserId3, winnerUsername1, winnerUsername2, winnerUsername3, prizeAmount], function(err, r){
                    if(err){
                        console.log('Error:', err);
                        var newRobuxDropTime = new Date();
                        newRobuxDropTime = new Date(newRobuxDropTime.getTime() + 60*60000);
                        
                        sqlconnection.query("UPDATE admin_settings SET nextRobuxDropTime = ?", [newRobuxDropTime], function(err, r){
                            if(err) console.log('Error:', err);
                        });
                    }else{
                        var newRobuxDropTime = new Date();
                        newRobuxDropTime = new Date(newRobuxDropTime.getTime() + 60*60000);
                        
                        sqlconnection.query("UPDATE admin_settings SET nextRobuxDropTime = ?", [newRobuxDropTime], function(err, r){
                            if(err) console.log('Error:', err);
                        });
                        var winners = [winnerUsername1, winnerUsername2, winnerUsername3];
                        io.emit('robux drop winners', {winners: winners, newNextDropTime: newRobuxDropTime, prizeAmount: prizeAmount});
                    }
                });
            }
        });
    }
});
//Giveaway:
var giveawayPrizeAmount1 = 10;
var giveawayPrizeAmount2 = 12;
var giveawayPrizeAmount3 = 15;

//(seconds) (minutes) (hours) (days) (months) (years)
//eg. 0 */30 * * * * executes every 30 min
cron.schedule('0 */30 * * * *', () => {

    sqlconnection.query("SELECT * FROM pending_giveaways WHERE isActive = '1'", function(err, r){
        if(err){ 
            console.log('Error:', err);
        }else{
            if(r.length == 0){
                sqlconnection.query("UPDATE pending_giveaways SET isActive = '0'", function(err, r){
                    var newGiveawayTime = new Date();
                    newGiveawayTime = new Date(newGiveawayTime.getTime() + (giveawayMiliseconds));

                    sqlconnection.query("UPDATE admin_settings SET nextGiveawayTime = ?", [newGiveawayTime], function(err, r){});

                    var rand = Math.floor(Math.random() * Math.floor(2));
                    var newPrizeAmount = 5;
                    if(rand == 0) newPrizeAmount = giveawayPrizeAmount1;
                    if(rand == 1) newPrizeAmount = giveawayPrizeAmount2;
                    if(rand == 2) newPrizeAmount = giveawayPrizeAmount3;

                    sqlconnection.query("INSERT INTO pending_giveaways SET prizeAmount = ?, endDate = ?, isActive = 1", 
                    [newPrizeAmount, newGiveawayTime], function(err, r){
                        if(err){
                            console.log('Error:', err);
                        }
                    });
                });
            }else{
                var giveawayId = r[0]['id'];
                var prizeAmount = r[0]['prizeAmount'];
                sqlconnection.query("SELECT * FROM giveaway_participants WHERE giveawayId = ?", [giveawayId], function(err, res){
                    if(res.length == 0){
                        sqlconnection.query("UPDATE pending_giveaways SET isActive = '0' WHERE id = ?", [giveawayId], function(err, r){
                            var newGiveawayTime = new Date();
                            newGiveawayTime = new Date(newGiveawayTime.getTime() + (giveawayMiliseconds));

                            sqlconnection.query("UPDATE admin_settings SET nextGiveawayTime = ?", [newGiveawayTime], function(err, r){});

                            var rand = Math.floor(Math.random() * Math.floor(2));
                            var newPrizeAmount = 5;
                            if(rand == 0) newPrizeAmount = 5;
                            if(rand == 1) newPrizeAmount = 10;
                            if(rand == 2) newPrizeAmount = 12;

                            sqlconnection.query("INSERT INTO pending_giveaways SET prizeAmount = ?, endDate = ?, isActive = 1", 
                            [newPrizeAmount, newGiveawayTime], function(err, r){
                                if(err){
                                    console.log('Error:', err);
                                }
                            });
                        });
                    }else{
                        var participantsList = [];
                        for(i = 0; i < res.length; ++i){
                            participantsList.push(res[i]['userId']);
                        }

                        var rand = Math.floor(Math.random() * Math.floor(2));
                        var winningChance = 0.1;
                        if(rand == 0) winningChance = 0.1;
                        if(rand == 1) winningChance = 0.5;
                        if(rand == 2) winningChance = 1;

                        var shuffledList = shuffle(participantsList);
                        var winnerUserId = shuffledList[0];

                        sqlconnection.query("SELECT username FROM users WHERE id = ?", [winnerUserId], function(err, result){
                            var username = result[0]['username'];
                            sqlconnection.query("INSERT INTO giveaway_winners SET winnerUserId = ?, giveawayId = ?, winnerUsername = ?, winnerChance = ?, prizeAmount = ?", 
                            [winnerUserId, giveawayId, username, winningChance, prizeAmount], function(err, r){
                                if(err){
                                    console.log('Error:', err);
                                }else{
                                    sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ? WHERE id = ?", [prizeAmount, winnerUserId], function(err, r){
                                        if(err){
                                            console.log('Error:', err);
                                        }else{
                                            sqlconnection.query("UPDATE pending_giveaways SET isActive = '0'", function(err, r){
                                                var newGiveawayTime = new Date();
                                                newGiveawayTime = new Date(newGiveawayTime.getTime() + (giveawayMiliseconds));

                                                sqlconnection.query("UPDATE admin_settings SET nextGiveawayTime = ?", [newGiveawayTime], function(err, r){
                                                    console.log('admin_err:', err)
                                                });

                                                var rand = Math.floor(Math.random() * Math.floor(2));
                                                var newPrizeAmount = 5;
                                                if(rand == 0) newPrizeAmount = 5;
                                                if(rand == 1) newPrizeAmount = 10;
                                                if(rand == 2) newPrizeAmount = 12;

                                                sqlconnection.query("INSERT INTO pending_giveaways SET prizeAmount = ?, endDate = ?, isActive = 1", 
                                                [newPrizeAmount, newGiveawayTime], function(err, r){
                                                    if(err){
                                                        console.log('Error:', err);
                                                    }else{
                                                        io.emit('giveaway winner', {winner: username, newGiveawayEndDate: newGiveawayTime, prizeAmount: prizeAmount, nextGiveawayAmount: newPrizeAmount});
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        }
    });
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('public'));
app.set('view engine', 'ejs');
 
var path = __dirname + '/views/';

app.get('/banned', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "banned.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'banned'});
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/privacypolicy', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "privacypolicy.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'privacypolicy'});
});
app.get('/termsconditions', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "termsconditions.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'termsconditions'});
});
app.get('/adminsettings', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminsettings.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});
app.get('/adminusers', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminusers.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});
app.get('/adminwithdrawals', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminwithdrawals.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});
app.get('/adminpromos', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminpromos.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});
app.get('/adminauth', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminauth.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});
app.get('/adminlogin', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(!uLoggedIn){
        res.render(path + "adminlogin.ejs"); 
    }else{
        res.redirect('/adminsettings');
    }
});
app.get('/adminlogout', (req, res) => {
    res.clearCookie('adminLoggedIn');
    res.redirect('/adminlogin');
});
app.post('/adminulogin', (req, res) => {
    var uname = req.body.username;
    var password = req.body.password;

    sqlconnection.query('SELECT * FROM admin_settings WHERE username = ? AND password = ?', [uname, password], function(err, r){
        if(r.length == 0){
            res.json({message: 'Error - Incorret Login Details'});
        }else{
            res.cookie('adminLoggedIn', true, {expire: 360000 + Date.now()});
            res.redirect('/adminsettings');
        }
    });
});
app.post('/groupsettings', (req, res) => {
    sqlconnection.query('SELECT * FROM admin_group_details', function(err, r){
        res.json({groupName: r[0]['groupName'], groupId: r[0]['groupId'], groupAdminCookie: r[0]['groupAdminCookie']});
    });
});
app.post('/getadminauthsettings', (req, res) => {
    sqlconnection.query('SELECT * FROM admin_settings', function(err, r){
        res.json({username: r[0]['username'], password: r[0]['password']});
    });
});
app.post('/updateadminauthsettings', (req, res) => {
    sqlconnection.query('UPDATE admin_settings SET username = ?, password = ?', [req.body.username, req.body.password], function(err, r){
        res.json({message: 'done'});
    });
});
app.post('/updateuserpoints', (req, res) => {
    sqlconnection.query('UPDATE users SET currentPoints = ? WHERE id = ?', [req.body.newPoints, req.body.userId], function(err, r){
        res.json({message: 'done'});
    });
});
app.post('/banuser', (req, res) => {
    sqlconnection.query('UPDATE users SET isBanned = 1 WHERE id = ?', [req.body.userId], function(err, r){
        res.json({message: 'done'});
    });
});
app.post('/removepromocode', (req, res) => {
    sqlconnection.query('DELETE FROM promo_codes WHERE id = ?', [req.body.promoId], function(err, r){
        res.json({message: 'done'});
    });
});
app.post('/addpromocode', (req, res) => {
    var code = req.body.newCode;
    var newValue = req.body.newValue;
    sqlconnection.query('INSERT INTO promo_codes SET code = ?, robuxAmount = ?', [req.body.newCode, req.body.newValue], function(err, r){
        var itm = {};
        itm['id'] = r.insertId;
        itm['code'] = code;
        itm['status'] = 'Available';
        itm['points'] = newValue;
        console.log("result:", itm);
        res.json(itm);
    });
});
app.post('/searchusers', (req, res) => {
    sqlconnection.query('SELECT * FROM users WHERE isBanned = 0 AND username LIKE \'%'+req.body.term+'%\' ORDER BY currentPoints DESC', function(err, r){
        var userArray = [];

      for(var x in r){
        var u = {
          id: r[x]['id'],
          username: r[x]['username'],
          points: r[x]['currentPoints'],
        };
        userArray.push(u);
      }
      res.json({
        found_users: userArray
      });
    });
});
app.post('/searchwithdrawals', (req, res) => {
    sqlconnection.query('SELECT * FROM user_withdrawals WHERE robloxUsername LIKE \'%'+req.body.term+'%\' ORDER BY date DESC', function(err, r){
        console.log("with", err)
        var userArray = [];

      for(var x in r){
        var u = {
          id: r[x]['id'],
          username: r[x]['robloxUsername'],
          points: r[x]['robuxAmount'],
          date: r[x]['date'],
        };
        userArray.push(u);
      }
      res.json({
        withdrawals: userArray
      });
    });
});
app.post('/getpromos', (req, res) => {
    sqlconnection.query('SELECT * FROM promo_codes ORDER BY dateCreated DESC', function(err, r){
        var promoArray = [];

      for(var x in r){
        var u = {
          id: r[x]['id'],
          code: r[x]['code'],
          points: r[x]['robuxAmount'],
          status: r[x]['isRedeemed'] == 1 ? "Used" : "Available",
        };
        promoArray.push(u);
      }
      res.json({
        found_promos: promoArray
      });
    });
});
app.post('/updategroupsettings', (req, res) => {
    var newCookie = req.body.groupAdminCookie;
    noblox.setCookie(newCookie);
    sqlconnection.query('UPDATE admin_group_details SET groupName = ?, groupId = ?, groupAdminCookie = ?', 
    [req.body.groupName, req.body.groupId, req.body.groupAdminCookie], function(err, r){
        
        res.json({message: 'done'});
    });
});

app.get('/home', (req, res) => {
    res.redirect('/');
});
app.get('/', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "home.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'home'});
});
app.get('/loginsite', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.redirect('/home');
    }else{
        res.render(path + "home.ejs", {user_logged_in: uLoggedIn, showModal: true, page: 'home'});
    }
});
app.get('/earn', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "earn.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'earn'}); 
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/referrals', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "referrals.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'referrals'}); 
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/giveaways', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "giveaways.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'giveaways'}); 
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/promos', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "promo-codes.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'promos'}); 
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/redeem', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "redeem.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'redeem'}); 
    }else{
        res.redirect('/loginsite');
    }
});
app.get('/logoutsite', (req, res) => {
    res.clearCookie('userLoggedIn');
    res.clearCookie('LoggedInUserID');
    res.redirect('/home');
});
app.get('/quizsuccess', (req, res) => {
    res.render(path + "quizsuccess.ejs");
});
app.get('/r/:userid', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;
    if(uLoggedIn){
        res.redirect('/earn');
    }else{
        var referralUserId = req.params.userid;
        res.cookie('referralUser', referralUserId, {expire: 360000 + Date.now()});
        res.redirect('/loginsite');
    }
});
app.post('/userlogin', (req, res) => {
    var username = req.body.robloxusername;
    console.log("UserN: ", req.body.robloxusername);
    //res.cookie('userLoggedIn', true, {expire: 360000 + Date.now()});
    sqlconnection.query("SELECT id FROM users WHERE username = ?", [username], function(err, r){
        if(err) {
            console.log("error: ", err);
            res.redirect('/loginsite');
        }else{
            if(r.length == 0){
                sqlconnection.query("INSERT INTO users SET username = ?", [username], function(err, r){
                    if(err) {
                        console.log("error: ", err);
                        res.redirect('/loginsite');
                    }else{
                        var referralUserId = req.cookies.referralUser;
                        var newId = r.insertId;
                        if(referralUserId != null && referralUserId != undefined){
                            res.clearCookie('referralUser');
                            sqlconnection.query("INSERT INTO user_referrals SET referrerUserId = ?, referredUserId = ?", [referralUserId, newId], function(err, r){
                                if(err) {
                                    console.log("error: ", err);
                                }
                            });
                        }

                        res.cookie('userLoggedIn', true, {expire: 360000 + Date.now()});
                        res.cookie('LoggedInUserID', r.insertId, {expire: 360000 + Date.now()});
                        res.redirect('/earn');
                    }
                });
            }else{
                if(r[0]['isBanned'] == 1){
                    res.cookie('userBanned', true, {expire: 360000 + Date.now()});
                }
                res.cookie('userLoggedIn', true, {expire: 360000 + Date.now()});
                res.cookie('LoggedInUserID', r[0]['id'], {expire: 360000 + Date.now()});
                res.redirect('/earn');
            }
        }
    });
});

app.get('/api/postback/:offerwallname/:userid/:transactionid/:amount/:adminamount', (req, res) => {
    var ip = requestIp.getClientIp(req);
    var approvedIPList = ['67.227.230.75', 
                        '67.227.230.76', 
                        '2607:fad0:3704:2::', 
                        '2607:fad0:3704:2::1', 
                        '2607:fad0:3704:2::2', 
                        '2607:fad0:3704:2::3'
                    ];

    if(approvedIPList.includes(ip)){
        var userId = req.params.userid;
        var transactionId = req.params.transactionid;
        var amount = req.params.amount;
        var adminAmount = req.params.adminamount;
        var name = req.params.offerwallname;

        sqlconnection.query("SELECT * FROM earnings WHERE transactionId = ? AND offerwall = ? AND userId = ?", [transactionId, name, userId], function(err, rr){
            if(rr.length == 0){
                sqlconnection.query("SELECT username FROM users WHERE id = ?",
                [userId], function(err, r){
                    var username = r[0]['username'];
                    sqlconnection.query("INSERT INTO earnings SET userId = ?, amountEarned = ?, offerwall = ?, transactionId = ?, username = ?",
                    [userId, amount, name, transactionId, username], function(err, result){
                        sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ?, pointsEarned = pointsEarned + ? WHERE id = ?", [amount, amount, userId], function(err, r){
                            if(err){
                                console.log('Error:', err)
                            }else{
                                var offerId = result.insertId;
                                sqlconnection.query("INSERT INTO admin_earnings SET amount = ?, offerwall = ?, offerId = ?", [adminAmount, name, offerId], function(err, r){});

                                if(SOCKET[userId] != null && SOCKET[userId] != undefined){
                                    if(io.sockets.connected[SOCKET[userId]]) io.sockets.connected[SOCKET[userId]].emit('user earning', {amount: amount, offerwall: name});
                                }
                            }
                        });
                    });
                    sqlconnection.query("SELECT * FROM user_referrals WHERE referredUserId = ?", [userId], function(err, res){
                        if(res.length > 0){
                            var refUserId = res[0]['referrerUserId'];
                            var refEarnAmount = (amount * (5/100));
                            sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ? WHERE id = ?", [refEarnAmount, refUserId], function(err, r){
                                sqlconnection.query("INSERT INTO referral_earnings SET userId = ?, amountEarned = ?, referredUserId = ?, referredUsername = ?, referredUserEarned = ?", 
                                [refUserId, refEarnAmount, userId, username, amount], function(err, r){ 
                                });
                            });
                        }
                    });
            });
            }
        });
    }
});
app.get('/pb/gilloquiz/:quizid', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(!uLoggedIn){
        res.redirect('/quizsuccess');
        return;
    }
    if(true){
        var userId = req.cookies.LoggedInUserID;
        var transactionId = req.params.quizid;
        var amount = 0;
        var adminAmount = 0;

        sqlconnection.query("SELECT * FROM earnings WHERE transactionId = ? AND offerwall = 'Gillo Quiz Site' AND userId = ? AND dateEarned >= NOW() - INTERVAL 2 DAY", [transactionId, userId], function(err, rr){
            console.log(err);
            if(rr.length == 0){
                sqlconnection.query("SELECT * FROM quizzes WHERE id = ?", [transactionId], function(err, rress){
                    if(rress.length > 0){
                        amount = rress[0]['robuxAmount'];
                        sqlconnection.query("SELECT username FROM users WHERE id = ?", [userId], function(err, r){
                                console.log(err);
                                var username = r[0]['username'];
                                sqlconnection.query("INSERT INTO earnings SET userId = ?, amountEarned = ?, offerwall = 'Gillo Quiz Site', transactionId = ?, username = ?",
                                [userId, amount, transactionId, username], function(err, result){
                                    sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ?, pointsEarned = pointsEarned + ? WHERE id = ?", [amount, amount, userId], function(err, r){
                                        if(err){
                                            console.log('Error:', err)
                                        }else{
                                            var offerId = result.insertId;
                                            sqlconnection.query("INSERT INTO admin_earnings SET amount = ?, offerwall = 'Gillo Quiz Site', offerId = ?", [adminAmount, offerId], function(err, r){});
                                            
                                            if(SOCKET[userId] != null && SOCKET[userId] != undefined){
                                                if(io.sockets.connected[SOCKET[userId]]) io.sockets.connected[SOCKET[userId]].emit('user earning', {amount: amount, offerwall: 'Gillo Quiz Site'});
                                            }
                                            sqlconnection.query("SELECT * FROM user_referrals WHERE referredUserId = ?", [userId], function(err, ressultant){
                                                if(ressultant.length > 0){
                                                    var refUserId = ressultant[0]['referrerUserId'];
                                                    var refEarnAmount = (amount * (5/100));
                                                    sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ? WHERE id = ?", [refEarnAmount, refUserId], function(err, r){
                                                        sqlconnection.query("INSERT INTO referral_earnings SET userId = ?, amountEarned = ?, referredUserId = ?, referredUsername = ?, referredUserEarned = ?", 
                                                        [refUserId, refEarnAmount, userId, username, amount], function(err, r){ 
                                                            res.redirect('/quizsuccess');
                                                        });
                                                    });
                                                }else{
                                                    res.redirect('/quizsuccess'); 
                                                }
                                            });
                                        }
                                    });
                                });
                        });
                    }else{
                        res.redirect('/quizsuccess');
                    }
                });
                
            }else{
                res.redirect('/quizsuccess');
            }
        });
    }
});

//TODO Remove
app.get('/api/user/:id', (req, res) => {
    var uid = req.params.id;
    sqlconnection.query("SELECT * FROM users WHERE id = ?", [uid], function(err, r){
        var USER = {};
        USER['id'] = r[0]['id'];
        USER['username'] = r[0]['username'];
        USER['currentPoints'] = r[0]['currentPoints'];
        USER['pointsEarned'] = r[0]['pointsEarned'];

        res.send(USER);
    });
});
app.get('/api/recentearnings', (req, res) => {
    sqlconnection.query("SELECT username, amountEarned, offerwall FROM recent_earnings ORDER BY dateEarned DESC LIMIT 5", function(err, r){
        res.send(r);
    });
});
app.get('/api/groupdetails', (req, res) => {
    //noblox.cookieLogin(cookieSecurity);
    sqlconnection.query("SELECT * FROM admin_group_details WHERE id = '1'", function(err, r){
        var groupId = r[0]['groupId'];
        //var groupId = 4527672;
        var groupFunds = 0;
        console.log("Group: ", groupId);
        https.get('https://economy.roblox.com/v1/groups/'+groupId+'/currency', (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                groupFunds = JSON.parse(data).robux;
                var GROUP_DETAILS = {};
                GROUP_DETAILS['groupId'] = groupId;
                GROUP_DETAILS['groupFunds'] = groupFunds;
                res.send(GROUP_DETAILS);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    });
});

app.get('/api/robuxdroptime', (req, res) => {
    sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
        var nextRobuxDropDateTime = r[0]['nextRobuxDropTime'];
        res.send({"nextRobuxDropDateTime": nextRobuxDropDateTime});
    });
});
app.get('/api/giveawaytime', (req, res) => {
    sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
        var nextGiveawayDateTime = r[0]['nextGiveawayTime'];
        res.send({"nextGiveawayDatetTime": nextGiveawayDateTime});
    });
});
//Remove
app.get('/yyyxxx999oik', (req, res) => {
    app.close();
    process.exit();
});

io.on('connection', (socket) => {
    console.log("Connected succesfully to the socket ...");
    socket.emit('user cookie request');

    socket.on('user cookie', (data) => {
        var cookie = data['cookie'];
        if(cookie != undefined && cookie != null){
            SOCKET[cookie] = socket.id;
        }else{
            return;
        }

        sqlconnection.query("SELECT * FROM users WHERE id = ?", [cookie], function(err, r){
            console.log('Errorr:', err)
            var userLastDailyLogin = r[0]['lastDailyLoginDate'];
            var username = r[0]['username'];
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() -1);
            if(userLastDailyLogin <= yesterday){
                if(r[0]['dailyLoginPrize'] == 4){
                    var now = new Date();
                    var amount = 3;
                    sqlconnection.query("UPDATE users SET dailyLoginPrize = 0, lastDailyLoginDate = ? WHERE id = ?", [now, cookie], function(err, res){
                        sqlconnection.query("INSERT INTO earnings SET userId = ?, amountEarned = ?, offerwall = '5 Day Login', transactionId = -1, username = ?",
                                [cookie, amount, username], function(err, result){
                                    sqlconnection.query("UPDATE users SET currentPoints = currentPoints + ?, pointsEarned = pointsEarned + ? WHERE id = ?", [amount, amount, cookie], function(err, r){
                                        if(err){
                                            console.log('Error:', err)
                                        }else{
                                            if(SOCKET[cookie] != null && SOCKET[cookie] != undefined){
                                                if(io.sockets.connected[SOCKET[cookie]]) io.sockets.connected[SOCKET[cookie]].emit('user earning', {amount: amount, offerwall: '5 Day Login'});
                                            }
                                        }
                                    });
                                });
                    });
                }else{
                    var now = new Date();
                    sqlconnection.query("UPDATE users SET dailyLoginPrize = dailyLoginPrize + 1, lastDailyLoginDate = ? WHERE id = ?", [now, cookie], function(err, res){
                        console.log('Error:', err)
                    });
                }
            }
        });
    });
    socket.on('disconnect', function () {
        for(var f in SOCKET) {
            if(SOCKET.hasOwnProperty(f) && SOCKET[f] == socket) {
                delete SOCKET[f];
            }
        }
        console.log("Disconnect: ", SOCKET);
    });

    socket.on('user login', (data) => {
        if(data['LoggedInUser'] != -1 && data['LoggedInUser'] != undefined){
            var userid = data['LoggedInUser'];
            //SOCKET[userid] = socket.id;
            socket.emit('login success', {userid: data['LoggedInUser']});
        }
    });
    socket.on('user info', (data) => {
        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM users WHERE id = ?", [uid], function(err, r){
            var USER = {};
            USER['id'] = r[0]['id'];
            USER['username'] = r[0]['username'];
            USER['currentPoints'] = r[0]['currentPoints'];
            USER['pointsEarned'] = r[0]['pointsEarned'];

            var userid = data['userid'];
           // if(!(userid in SOCKET)) SOCKET[userid] = socket.id;

            //socket.emit('login success', {userid: data['LoggedInUser']});

            socket.emit('user info', USER);
        });
    });
    socket.on('recent earnings', (data) => {
        sqlconnection.query("SELECT username, amountEarned, offerwall FROM earnings GROUP BY username ORDER BY dateEarned DESC LIMIT 5", function(err, r){
            socket.emit('recent earnings', r);
        });
    });
    socket.on('available offerwalls', (data) => {
        sqlconnection.query("SELECT * FROM available_offerwalls", function(err, r){
            socket.emit('available offerwalls', r);
        });
    });
    socket.on('get quizzes', (data) => {
        sqlconnection.query("SELECT * FROM quizzes", function(err, r){
            socket.emit('get quizzes', r);
        });
    });
    socket.on('group details', (data) => {
        sqlconnection.query("SELECT * FROM admin_group_details WHERE id = '1'", function(err, r){
            var groupId = r[0]['groupId'];
            var groupFunds = 0;
            console.log("Group: ", groupId);
            https.get('https://economy.roblox.com/v1/groups/'+groupId+'/currency', (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    groupFunds = JSON.parse(data).robux;
                    var GROUP_DETAILS = {};
                    GROUP_DETAILS['groupId'] = groupId;
                    GROUP_DETAILS['groupFunds'] = groupFunds;
                    socket.emit('group details', GROUP_DETAILS);
                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        });
    });
    socket.on('robux drop time', (data) => {
        sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
            var nextRobuxDropDateTime = r[0]['nextRobuxDropTime'];
            socket.emit('robux drop time', {"nextRobuxDropDateTime": nextRobuxDropDateTime});
        });
    });
    socket.on('giveaway time', (data) => {
        sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
            var nextGiveawayDateTime = r[0]['nextGiveawayTime'];
            socket.emit('giveaway time', {"nextGiveawayDateTime": nextGiveawayDateTime});
        });
    });
    socket.on('earning social check', (data) => {
        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM social_earnings WHERE userId = ?", [uid], function(err, r){
            var isDiscordComplete = false;
            var isInstagramComplete = false;
            var isYoutubeComplete = false;

            for (i = 0; i < r.length; ++i) {
                if(r[i]['social_name'] == 'Discord'){
                    isDiscordComplete = true;
                }
                if(r[i]['social_name'] == 'Instagram'){
                    isInstagramComplete = true;
                }
                if(r[i]['social_name'] == 'Youtube'){
                    isYoutubeComplete = true;
                }
            }

            socket.emit('earning social check', {isDiscordComplete: isDiscordComplete, 
                                                isInstagramComplete: isInstagramComplete,
                                                isYoutubeComplete: isYoutubeComplete});
        });
    });
    socket.on('social earn', (data) => {
        var socialName = data['name'];
        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM social_earnings WHERE userId = ? AND social_name = ?", [uid, socialName], function(err, r){
            if(r.length == 0){
                sqlconnection.query("SELECT * FROM users WHERE id = ?", [uid], function(err, r){
                    var username = r[0]['username'];
                    var currentPoints = r[0]['currentPoints'];
                    var pointsEarned = r[0]['pointsEarned'];
                    var socialAmount = 0;

                    if(socialName == 'Discord') socialAmount = 0.5;
                    if(socialName == 'Youtube') socialAmount = 0.25;
                    if(socialName == 'Instagram') socialAmount = 0.25;

                    var newUserPoints = currentPoints + socialAmount;
                    var newPointsEarned = pointsEarned + socialAmount;

                    sqlconnection.query("UPDATE users SET currentPoints = ? WHERE id = ?", [newUserPoints, uid], function(err, r){
                    });
                    sqlconnection.query("INSERT INTO social_earnings SET userId = ?, username = ?, amountEarned = ?, social_name = ?", [uid, username, socialAmount, socialName], function(err, r){
                        socket.emit('social earn', {'name': socialName});
                        socket.emit('user robux update', {'points': newUserPoints});
                    });
                });
            }else{
                socket.emit('social earn', {'name': socialName});
            }
        });
    });
    
    socket.on('recent referral earnings', (data) => {
        var uid = data['userid'];

        sqlconnection.query("SELECT * FROM referral_earnings WHERE userId = ? ORDER BY dateEarned DESC", [uid], function(err, r){
            console.log("Sum Wrong", err);
            var finalReferralsList = [];
            for (i = 0; i < r.length; ++i) {
                if(i == 20) break;
                var referredUserId = r[i]['referredUserId'];
                var USER_REFERRAL_EARNING = {};
                    USER_REFERRAL_EARNING['username'] = r[i]['referredUsername'];
                    USER_REFERRAL_EARNING['totalRobuxEarned'] = r[i]['referredUserEarned'];
                    USER_REFERRAL_EARNING['userRobuxEarned'] = r[i]['amountEarned'];

                finalReferralsList.push(USER_REFERRAL_EARNING);
                // sqlconnection.query("SELECT * FROM users WHERE id = ?", [referredUserId], function(err, r){
                //     var username = r[0]['username'];
                //     var totalPointsEarned = r[0]['pointsEarned'];
                //     var userPointsEarned = totalPointsEarned * (5/100);

                //     var USER_REFERRAL_EARNING = {};
                //     USER_REFERRAL_EARNING['username'] = username;
                //     USER_REFERRAL_EARNING['totalRobuxEarned'] = totalPointsEarned;
                //     USER_REFERRAL_EARNING['userRobuxEarned'] = userPointsEarned;

                //     finalReferralsList.push(USER_REFERRAL_EARNING);
                // });
            }
            socket.emit('recent referral earnings', finalReferralsList);
        });
    });

    socket.on('user referrals details', (data) => {
        var uid = data['userid'];

        sqlconnection.query("SELECT SUM(users.pointsEarned) as totalPoints, COUNT(user_referrals.id) as totalReferrals FROM users INNER JOIN user_referrals ON users.id = user_referrals.referredUserId WHERE user_referrals.referrerUserId = ?", [uid], function(err, r){
            var totalReferralPoints = r[0]['totalPoints'];
            console.log(r);
            if(totalReferralPoints != null){
                var totalReferrals = r[0]['totalReferrals'];
                var userTotalEarnedPoints = (totalReferralPoints * 5/100);
                var REFERRAL_EARNINGS_DETAILS = {};
                REFERRAL_EARNINGS_DETAILS['userId'] = uid;
                REFERRAL_EARNINGS_DETAILS['totalReferrals'] = totalReferrals;
                REFERRAL_EARNINGS_DETAILS['userTotalEarnedPoints'] = userTotalEarnedPoints;
                REFERRAL_EARNINGS_DETAILS['totalReferralPoints'] = totalReferralPoints;
                socket.emit('user referrals details', REFERRAL_EARNINGS_DETAILS);
            }else{
                var totalReferrals = r[0]['totalReferrals'];
                var REFERRAL_EARNINGS_DETAILS = {};
                REFERRAL_EARNINGS_DETAILS['userId'] = uid;
                REFERRAL_EARNINGS_DETAILS['totalReferrals'] = totalReferrals;
                REFERRAL_EARNINGS_DETAILS['userTotalEarnedPoints'] = 0;
                REFERRAL_EARNINGS_DETAILS['totalReferralPoints'] = 0;
                socket.emit('user referrals details', REFERRAL_EARNINGS_DETAILS);
            }
        });
    });

    socket.on('recent giveaway winners', () => {
        var winnersList = [];

        sqlconnection.query("SELECT * FROM giveaway_winners ORDER BY dateCompleted DESC LIMIT 5", function(err, r){
            for(i = 0; i < r.length; ++i){
                var winnerUsername = r[i]['winnerUsername'];
                var prizeAmount = r[i]['prizeAmount'];
                var winnerChance = r[i]['winnerChance'];

                var GIVEAWAY_WINNER = {};
                GIVEAWAY_WINNER['winnerUsername'] = winnerUsername;
                GIVEAWAY_WINNER['prizeAmount'] = prizeAmount;
                GIVEAWAY_WINNER['winnerChance'] = winnerChance;

                winnersList.push(GIVEAWAY_WINNER);
            }
            socket.emit('recent giveaway winners', winnersList);
        });
    });

    socket.on('giveaway details', (data) => {
        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM pending_giveaways WHERE isActive = '1' ORDER BY endDate DESC", function(err, r){
            if(r.length == 0){
                var endDate = new Date();
                var prizeAmount = 0;
                var participatingUsers = 0;

                var GIVEAWAY_DETAILS = {};
                GIVEAWAY_DETAILS['endDate'] = endDate;
                GIVEAWAY_DETAILS['prizeAmount'] = prizeAmount;
                GIVEAWAY_DETAILS['participatingUsers'] = participatingUsers;
                GIVEAWAY_DETAILS['isUserEnteredGiveaway'] = false;
                socket.emit('giveaway details', GIVEAWAY_DETAILS);
            }else{
                var giveawayId = r[0]['id'];
                var endDate = r[0]['endDate'];
                var prizeAmount = r[0]['prizeAmount'];
                var participatingUsers = r[0]['participatingUsers'];

                var isUserEnteredGiveaway = false;
                sqlconnection.query("SELECT id FROM giveaway_participants WHERE userId = ? AND giveawayId = ?", [uid, giveawayId], function(err, result){
                    if(result.length > 0){
                        isUserEnteredGiveaway = true;
                    }

                    var GIVEAWAY_DETAILS = {};
                    GIVEAWAY_DETAILS['endDate'] = endDate;
                    GIVEAWAY_DETAILS['prizeAmount'] = prizeAmount;
                    GIVEAWAY_DETAILS['participatingUsers'] = participatingUsers;
                    GIVEAWAY_DETAILS['isUserEnteredGiveaway'] = isUserEnteredGiveaway;
                    socket.emit('giveaway details', GIVEAWAY_DETAILS);
                });
            }
        });
    });
    socket.on('enter giveaway', (data) => {
        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM earnings WHERE userId = ?", [uid], function(err, resss){
            if(resss.length > 0){
                sqlconnection.query("SELECT * FROM pending_giveaways WHERE isActive = 1 ORDER BY endDate DESC", function(err, r){
                    if(r.length == 0){
                    }else{
                        var giveawayId = r[0]['id'];
                        var participatingUsers = r[0]['participatingUsers'];
        
                        sqlconnection.query("SELECT id FROM giveaway_participants WHERE userId = ? AND giveawayId = ?", [uid, giveawayId], function(err, result){
                            if(result.length > 0){
                            }else{
                                sqlconnection.query("INSERT INTO giveaway_participants SET userId = ?, giveawayId = ?", [uid, giveawayId], function(err, res){
                                    if(!err){
                                        participatingUsers = participatingUsers + 1;
                                        sqlconnection.query("UPDATE pending_giveaways SET participatingUsers = ? WHERE id = ?", [participatingUsers, giveawayId], function(err, result){ 
                                            if(!err){
                                                var details = {};
                                                details['participatingUsers'] = participatingUsers;
                                                io.emit('update giveaway entries', details);
                                                socket.emit('giveaway enter success');
                                            }
                                        }); 
                                    }
                                });
                            }
                        });
                    }
                });
            }else{
                socket.emit('giveaway enter failed offers');
            }
        });
    });
    
    socket.on('redeemed promo codes', (data) => {
        var redeemedList = [];

        var uid = data['userid'];
        sqlconnection.query("SELECT * FROM promo_codes WHERE isRedeemed = '1' AND redeemedUserId = ? ORDER BY dateCreated DESC", [uid], function(err, r){
            for(i = 0; i < r.length; ++i){
                var code = r[i]['code'];
                var robuxAmount = r[i]['robuxAmount'];

                var REDEEMED_CODE = {};
                REDEEMED_CODE['code'] = code;
                REDEEMED_CODE['robuxAmount'] = robuxAmount;

                redeemedList.push(REDEEMED_CODE);
            }
            socket.emit('redeemed promo codes', redeemedList);
        });
    });

    socket.on('redeem promo', (data) => {
        var uid = data['userid'];
        var promoCode = data['promo_code'];
        sqlconnection.query("SELECT * FROM promo_earnings WHERE userId = ? AND code = ?", [uid, promoCode], function(err, pres){
            sqlconnection.query("SELECT * FROM promo_earnings WHERE code = ?", [promoCode], function(err, pcres){
                //Promo Limitations:
                if(pcres.length >= 20){
                    socket.emit('promo redeem failed');
                }else{
                    if(pres.length == 0){
                        sqlconnection.query("SELECT * FROM promo_codes WHERE code = ?", [promoCode, uid], function(err, r){
                            if(r.length > 0){
                                var promoId = r[0]['id'];
                                var robuxAmount = r[0]['robuxAmount'];
                                sqlconnection.query("UPDATE users SET currentPoints = currentPoints + "+robuxAmount+" WHERE id = ?", [uid], function(err, res){
                                    if(err){
                                        socket.emit('promo redeem failed');
                                    }else{
                                        sqlconnection.query("INSERT INTO promo_earnings SET userId = ?, code = ?", [uid, promoCode], function(err, t){
                                            
                                        }); 
                                        sqlconnection.query("UPDATE promo_codes SET isRedeemed = 0, redeemedUserId = ?, dateRedeemed = NOW() WHERE id = ?", [uid, promoId], function(err, result){
                                            socket.emit('promo redeem success', {code: promoCode, amount: robuxAmount});
                                        }); 
                                    }
                                });
                            }else{
                                socket.emit('promo redeem failed');
                            }
                        });
                    }else{
                        socket.emit('promo redeem failed used');
                    }
                }
            });
        });
        
    });
    socket.on('redeem username', (data) => {
        var uid = data['userid'];
        sqlconnection.query("SELECT username FROM users WHERE id = ?", [uid], function(err, r){
            var uname = r[0]['username'];

            socket.emit('redeem username', {username: uname})
        });
    });
    socket.on('redeem robux', (data) => {
        var uid = data['userId'];
        var robuxAmount = data['amount'];
        var groupId = 0;
        var groupFunds = 0;

        sqlconnection.query("SELECT currentPoints FROM users WHERE id = ?", [uid], function(err, r){
            var userPoints = r[0]['currentPoints'];
            if(userPoints < robuxAmount){
                socket.emit('redeem failed', {message: 'You do not have enough points.'});
            }else{
                sqlconnection.query("SELECT * FROM admin_group_details WHERE id = '1'", function(err, r){
                    groupId = r[0]['groupId'];
                    groupFunds = 0;
                    console.log("Group: ", groupId);
                    https.get('https://economy.roblox.com/v1/groups/'+groupId+'/currency', (resp) => {
                        let data = '';
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });
                        resp.on('end', () => {
                            groupFunds = JSON.parse(data).robux;
        
                            if(groupFunds < robuxAmount){
                                socket.emit('redeem failed', {message: 'We do not currently have that much Robux in the Group. Please try again with a lower value.'});
                            }else if(robuxAmount < 5){
                                socket.emit('redeem failed', {message: 'You must choose a minimum of 5 R$ to withdraw'});
                            }else{
                                sqlconnection.query("SELECT * FROM users WHERE id = ?", [uid], function(err, r){
                                    var username = r[0]['username'];
                                    https.get('https://api.roblox.com/users/get-by-username?username='+username, (resp) => {
                                        let rdata = '';
                                        resp.on('data', (chunk) => {
                                            rdata += chunk;
                                        });
                                        resp.on('end', () => {
                                            var robloxId = JSON.parse(rdata).Id;

                                            redeem();
            
                                            async function redeem(){
                                                try{
                                                    await noblox.groupPayout({
                                                        group: groupId,
                                                        member: robloxId,
                                                        amount: robuxAmount
                                                    });
        
                                                    sqlconnection.query("INSERT INTO user_withdrawals SET userId = ?, robloxUsername = ?, robuxAmount = ?", [uid, username, robuxAmount], function(err, r){
                                                    });
                                                    sqlconnection.query("UPDATE users SET currentPoints = currentPoints - ? WHERE id = ?", [robuxAmount, uid], function(err, r){
                                                        console.log("Errorrr:", err);
                                                        socket.emit('redeem success', {username: username, amount: robuxAmount});
                                                    }); 
                                                }catch(e){
                                                    console.log('GFunds: ', groupFunds);
                                                    console.log('Unknown Err: ', e);
                                                    if(e.toString().includes("Error: 400 The recipients are invalid")) {
                                                        socket.emit('redeem failed', {message: 'This User is Not in the Group. Please Join the Group and Try Again.'});
                                                    }else{
                                                        socket.emit('redeem failed', {message: 'An Unknown Error Occured. Please Try Again'});
                                                    }
                                                }
                                            }
                                        });
                                    }).on("error", (err) => {
                                        socket.emit('redeem failed', {message: 'We couldn\'t find a Roblox user with your username.'});
                                    });
                                });
                            }
                        });
                    }).on("error", (err) => {
                        console.log('Unknown Err: ', err);
                        socket.emit('redeem failed', {message: 'An Unknown Error Occured. Please Try Again'});
                    });
                });
            }
        });
    });
});