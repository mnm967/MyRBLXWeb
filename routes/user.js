const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const noblox = require("noblox.js");
const https = require('https');
const cron = require('node-cron');
const Math = require('mathjs');
const requestIp = require('request-ip');

var router = require('express').Router();
var path = __dirname + '/../views/';

router.get('/home', (req, res) => {
    res.redirect('/');
});

router.get('/', (req, res) => {
    if(req.cookies.userLoggedIn == true && req.cookies.userBanned == true){
        res.redirect('/banned');
        return;
    }

    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "home.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'home'});
});

router.get('/loginsite', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.redirect('/home');
    }else{
        res.render(path + "home.ejs", {user_logged_in: uLoggedIn, showModal: true, page: 'home'});
    }
});

router.get('/earn', (req, res) => {
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

router.get('/referrals', (req, res) => {
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

router.get('/giveaways', (req, res) => {
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

router.get('/promos', (req, res) => {
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

router.get('/redeem', (req, res) => {
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

router.get('/logoutsite', (req, res) => {
    res.clearCookie('userLoggedIn');
    res.clearCookie('LoggedInUserID');
    res.redirect('/home');
});

router.get('/quizsuccess', (req, res) => {
    res.render(path + "quizsuccess.ejs");
});

router.get('/r/:userid', (req, res) => {
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

router.post('/userlogin', (req, res) => {
    var username = req.body.robloxusername;
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

router.get('/banned', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    if(uLoggedIn){
        res.render(path + "banned.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'banned'});
    }else{
        res.redirect('/loginsite');
    }
});

router.get('/privacypolicy', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "privacypolicy.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'privacypolicy'});
});

router.get('/termsconditions', (req, res) => {
    var uLoggedIn = req.cookies.userLoggedIn;
    if(req.cookies.userLoggedIn === undefined) uLoggedIn = false;

    res.render(path + "termsconditions.ejs", {user_logged_in: uLoggedIn, showModal: false, page: 'termsconditions'});
});

router.get('/api/user/:id', (req, res) => {
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

router.get('/api/recentearnings', (req, res) => {
    sqlconnection.query("SELECT username, amountEarned, offerwall FROM recent_earnings ORDER BY dateEarned DESC LIMIT 5", function(err, r){
        res.send(r);
    });
});

router.get('/api/groupdetails', (req, res) => {
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

router.get('/api/robuxdroptime', (req, res) => {
    sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
        var nextRobuxDropDateTime = r[0]['nextRobuxDropTime'];
        res.send({"nextRobuxDropDateTime": nextRobuxDropDateTime});
    });
});

router.get('/api/giveawaytime', (req, res) => {
    sqlconnection.query("SELECT * FROM admin_settings WHERE id = '1'", function(err, r){
        var nextGiveawayDateTime = r[0]['nextGiveawayTime'];
        res.send({"nextGiveawayDatetTime": nextGiveawayDateTime});
    });
});

//Remove
router.get('/yyyxxx999oik', (req, res) => {
    router.close();
    process.exit();
});

module.exports = router;