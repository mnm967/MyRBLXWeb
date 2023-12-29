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

router.get('/adminsettings', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminsettings.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminusers', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminusers.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminwithdrawals', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminwithdrawals.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminpromos', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminpromos.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminauth', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(uLoggedIn){
        res.render(path + "adminauth.ejs"); 
    }else{
        res.redirect('/adminlogin');
    }
});

router.get('/adminlogin', (req, res) => {
    var uLoggedIn = req.cookies.adminLoggedIn;
    if(req.cookies.adminLoggedIn === undefined) uLoggedIn = false;
    
    if(!uLoggedIn){
        res.render(path + "adminlogin.ejs"); 
    }else{
        res.redirect('/adminsettings');
    }
});

router.get('/adminlogout', (req, res) => {
    res.clearCookie('adminLoggedIn');
    res.redirect('/adminlogin');
});

router.post('/adminulogin', (req, res) => {
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

router.post('/groupsettings', (req, res) => {
    sqlconnection.query('SELECT * FROM admin_group_details', function(err, r){
        res.json({groupName: r[0]['groupName'], groupId: r[0]['groupId'], groupAdminCookie: r[0]['groupAdminCookie']});
    });
});

router.post('/getadminauthsettings', (req, res) => {
    sqlconnection.query('SELECT * FROM admin_settings', function(err, r){
        res.json({username: r[0]['username'], password: r[0]['password']});
    });
});

router.post('/updateadminauthsettings', (req, res) => {
    sqlconnection.query('UPDATE admin_settings SET username = ?, password = ?', [req.body.username, req.body.password], function(err, r){
        res.json({message: 'done'});
    });
});

router.post('/updateuserpoints', (req, res) => {
    sqlconnection.query('UPDATE users SET currentPoints = ? WHERE id = ?', [req.body.newPoints, req.body.userId], function(err, r){
        res.json({message: 'done'});
    });
});

router.post('/banuser', (req, res) => {
    sqlconnection.query('UPDATE users SET isBanned = 1 WHERE id = ?', [req.body.userId], function(err, r){
        res.json({message: 'done'});
    });
});

router.post('/updategroupsettings', (req, res) => {
    var newCookie = req.body.groupAdminCookie;
    noblox.setCookie(newCookie);
    sqlconnection.query('UPDATE admin_group_details SET groupName = ?, groupId = ?, groupAdminCookie = ?', 
    [req.body.groupName, req.body.groupId, req.body.groupAdminCookie], function(err, r){
        
        res.json({message: 'done'});
    });
});

router.post('/removepromocode', (req, res) => {
    sqlconnection.query('DELETE FROM promo_codes WHERE id = ?', [req.body.promoId], function(err, r){
        res.json({message: 'done'});
    });
});

router.post('/addpromocode', (req, res) => {
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

router.post('/searchusers', (req, res) => {
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

router.post('/searchwithdrawals', (req, res) => {
    sqlconnection.query('SELECT * FROM user_withdrawals WHERE robloxUsername LIKE \'%'+req.body.term+'%\' ORDER BY date DESC', function(err, r){
        console.log("error", err)
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

router.post('/getpromos', (req, res) => {
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

module.exports = router;