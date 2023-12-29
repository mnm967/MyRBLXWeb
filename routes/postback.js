const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const noblox = require("noblox.js");
const https = require('https');
const cron = require('node-cron');
const Math = require('mathjs');
const requestIp = require('request-ip')
var router = require('express').Router();

router.get('/api/postback/:offerwallname/:userid/:transactionid/:amount/:adminamount', (req, res) => {
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

router.get('/pb/gilloquiz/:quizid', (req, res) => {
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

module.exports = router;