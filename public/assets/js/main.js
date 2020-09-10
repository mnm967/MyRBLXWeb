const socket = io.connect('http://localhost:4000', {secure: true});
//const socket = io.connect('wss://myrblx.com', {secure: true});

var timeFunctionArr = [];
var functionArr = [];

$(document).ready(function() {
    socket.emit('group details');
    if(readCookie("LoggedInUserID") != null){
        socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
        socket.emit('earning social check', {'userid': readCookie("LoggedInUserID")});
        socket.emit('recent referral earnings', {'userid': readCookie("LoggedInUserID")});
        socket.emit('user referrals details', {'userid': readCookie("LoggedInUserID")});
        socket.emit('giveaway details', {'userid' : readCookie("LoggedInUserID")});
        socket.emit('redeem username', {'userid' : readCookie("LoggedInUserID")});
        socket.emit('available offerwalls');
        socket.emit('get quizzes');

        socket.emit('redeemed promo codes', {'userid' : readCookie("LoggedInUserID")});

        $('.redeemCodeRecaptchaForm').on('submit', function(e) {
            e.preventDefault();
            if(grecaptcha.getResponse() == "") {
              alert("Please complete the Recaptcha.");
            } else {
                var promoCode = $(".redeemPromoInput").val();
                socket.emit('redeem promo', {'userid': readCookie("LoggedInUserID"), 'promo_code': promoCode});
            }
        });
        $('.giveawayRecaptchaForm').on('submit', function(e) {
            e.preventDefault();
            if(grecaptcha.getResponse() == "") {
              alert("Please complete the Recaptcha.");
            }else{
                socket.emit('enter giveaway', {'userid': readCookie("LoggedInUserID")});
            }
        });
    }
    socket.emit('recent earnings');
    socket.emit('robux drop time');
    socket.emit('recent giveaway winners');
});
socket.on('user info', (result) => {
    $(".headerRobuxAmount").html(result['currentPoints'].toFixed(1) + " R$");
    $(".earnUserRobux").html(result['currentPoints'].toFixed(1) + " R$");
});
socket.on('recent earnings', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var item = result[i];
        var amount = item['amountEarned'];
        var username = item['username'];
        var offerwall = item['offerwall'];

        var earning_item = '<div class="user-item my-2 row justify-content-center">\
        <div class="col-md-2 col-sm-12">\
            <div class="m-auto user-img-div">\
            <img class="m-auto user-img" src="https://www.roblox.com/Thumbs/Avatar.ashx?x=150&amp;y=150&amp;Format=Png&amp;username='+username+'">\
            </div>\
        </div>\
        <div class="col-md-8 col-sm-12">\
            <div class="user-name-text">'+username+'</div>\
            <div class="user-earned-text">Earned <strong>'+amount+' ROBUX</strong> from <strong>'+offerwall+'</strong></div>\
        </div>\
        <div class="col-md-2 col-sm-12">\
            <div class="my-2 mx-auto user-amount-button-div">\
            <button class="btn logout-button user-amount-button">'+amount+' Robux</button>\
            </div>\
        </div>\
        </div>';
        finalHTML += earning_item;
    }
    $(".recentEarningsContainer").html(finalHTML);
});
socket.on('get quizzes', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var item = result[i];
        var name = item['name'];
        var description = item['description'];
        var link = item['link'];
        var imageUrl = item['imageUrl'];
        var robuxAmount = item['robuxAmount'];

        var quiz_item = `<div class="user-item my-2 row justify-content-center mx-5" style="background-color: #efefef; border-radius: 8px;">
        <div class="col-lg-2 col-sm-12 col-md-12" style="margin-top: 16px;">
          <div style="width: 100%; display: flex;">
            <img class="m-auto" style="object-fit: cover;" height="156px" width="156px" src="${imageUrl}">
          </div> 
        </div>
        <div class="col-lg-6 col-sm-12 col-md-12" style="margin-top: 16px;">
          <div class="user-name-text" style="text-align: center;">${name}</div>
          <div class="user-earned-text" style="text-align: center;">${description}</div>
        </div>
        <div class="col-lg-2 col-sm-12 col-md-12" style="margin-top: 16px;">
          <div class="my-2 mx-auto user-amount-button-div">
            <a href="${link}" target="_blank"><button class="btn logout-button user-amount-button grow">Earn ${robuxAmount} R$</button></a>
          </div>
        </div>
      </div>`;
        finalHTML += quiz_item;
    }
    $(".quizSiteContainer").html(finalHTML);
});
socket.on('available offerwalls', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var offerwallName = result[i]['offerwallName'];
        var offerwallLink = result[i]['url'];

        if(offerwallName != 'Gillo Quiz Site') offerwallLink = offerwallLink.replace("[RBX_USER_ID]", readCookie('LoggedInUserID'));

        if(offerwallName == 'Gillo Quiz Site'){
            var offerwallHTML = '<div class="col-md-12 col-lg-4 col-sm-12 px-0 my-2">\
                <button class="btn my-sm-0 offerwall-button" style="font-weight: bold" onclick="openOfferwall('+i+',\''+offerwallLink+'\', \''+offerwallName+'\')" id="ow-'+i+'">'+offerwallName+'</button>\
            </div>';
            finalHTML = offerwallHTML + finalHTML;
        }else{
            var offerwallHTML = '<div class="col-md-12 col-lg-4 col-sm-12 px-0 my-2">\
                <button class="btn my-sm-0 offerwall-button offerwall-unselected" style="font-weight: bold" onclick="openOfferwall('+i+',\''+offerwallLink+'\', \''+offerwallName+'\')" id="ow-'+i+'">'+offerwallName+'</button>\
            </div>';
            finalHTML += offerwallHTML;
        }
    }
    $("#earnIFrame").attr("src", "");
    $(".earnOfferwallsContainer").html(finalHTML);
    $(".quizSiteContainer").show();
    $("#earnIFrame").hide();
});
socket.on('group details', (result) => {
    var groupId = result['groupId'];
    var groupFunds = result['groupFunds'];

    $('.redeemGroupButton').attr("href", "https://www.roblox.com/groups/"+groupId);
    $('.availableRobuxValue').html(groupFunds);
});
var nextRobuxDropDateTime;
socket.on('robux drop time', (result) => {
    nextRobuxDropDateTime = result['nextRobuxDropDateTime'];

    functionArr.push(function(){
        //.replace(/\s/, 'T')+'Z'
        var countDownDate = new Date(nextRobuxDropDateTime).getTime();
    
        var now = new Date().getTime();
        
        var distance = countDownDate - now;
    
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        hours = hours + (days * 24);
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var secondsStr = seconds+"";
        if(secondsStr.length == 1) secondsStr = "0"+secondsStr;
        
        var minutesStr = minutes+"";
        if(minutesStr.length == 1) minutesStr = "0"+minutesStr;

        var hoursStr = hours+"";
        if(hoursStr.length == 1) hoursStr = "0"+hoursStr;
        
        var timeLeft = hoursStr+":"+minutesStr+":"+secondsStr;
        $(".robuxDropCountdown").html(timeLeft);
    });
    
    for (i = 0; i < functionArr.length; i++) {
        functionArr[i]();
    }
    setInterval(function() {
      for (i = 0; i < functionArr.length; i++) {
        functionArr[i]();
      }
    }, 1000);
});
socket.on('earning social check', (result) => {
    if(result.isDiscordComplete){
        $(".discordButton").attr('disabled', true);
    }else{
        $(".discordButton").click(() => {
            socket.emit('social earn', {'name': 'Discord', 'userid': readCookie("LoggedInUserID")});
            $(".discordButton").attr('disabled', true);
            $(".discordButton").prop("onclick", null).off("click");
        });
    }

    if(result.isInstagramComplete){
        $(".instagramButton").attr('disabled', true);
    }else{
        $(".instagramButton").click(() => {
            socket.emit('social earn', {'name': 'Instagram', 'userid': readCookie("LoggedInUserID")});
            $(".instagramButton").attr('disabled', true);
            $(".instagramButton").prop("onclick", null).off("click");
        });
    }

    if(result.isYoutubeComplete){
        $(".youtubeButton").attr('disabled', true);
    }else{
        $(".youtubeButton").click(() => {
            socket.emit('social earn', {'name': 'Youtube', 'userid': readCookie("LoggedInUserID")});
        });
    }
});
socket.on('social earn', (result) => {
    if(result['name'] == "Discord"){
        $(".discordButton").attr('disabled', true);
        $(".discordButton").prop("onclick", null).off("click");

        window.open('https://www.discord.com/', '_blank');
    }else if(result['name'] == "Instagram"){
        $(".instagramButton").attr('disabled', true);
        $(".instagramButton").prop("onclick", null).off("click");

        window.open('https://www.instagram.com/', '_blank');
    }else if(result['name'] == "Youtube"){
        $(".youtubeButton").attr('disabled', true);
        $(".youtubeButton").prop("onclick", null).off("click");

        window.open('https://www.youtube.com/', '_blank');
    }
});

socket.on('recent referral earnings', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var robloxUsername = result[i]['username'];
        var totalRobuxEarned = result[i]['totalRobuxEarned'];
        var userRobuxEarned = result[i]['userRobuxEarned'];

        var item = '<div class="user-item my-2 row justify-content-center col-12">\
        <div class="col-md-2 col-sm-12">\
          <div class="m-auto user-img-div">\
            <img class="m-auto user-img" src="https://www.roblox.com/Thumbs/Avatar.ashx?x=150&amp;y=150&amp;Format=Png&amp;username='+robloxUsername+'">\
          </div>\
        </div>\
        <div class="col-md-8 col-sm-12">\
          <div class="user-name-text">'+robloxUsername+'</div>\
          <div class="user-earned-text">Total Robux Earned: <strong>'+totalRobuxEarned+' ROBUX</strong></div>\
        </div>\
        <div class="col-md-2 col-sm-12">\
          <div class="my-2 mx-auto user-amount-button-div">\
            <button class="btn logout-button user-amount-button">You earned: <br><strong>'+userRobuxEarned+' Robux</strong></button>\
          </div>\
        </div>\
      </div>';

      finalHTML += item;
    }
    $(".recentReferralEarnings").html(finalHTML);
});

socket.on('user referrals details', (result) => {
    var userId = result['userId'];
    var userTotalEarnedPoints = result['userTotalEarnedPoints'];
    var totalReferralPoints = result['totalReferralPoints'];
    var totalReferrals = result['totalReferrals'];

    $('.totalUserReferrals').html(totalReferrals);
    $('.totalReferralPointsEarned').html(userTotalEarnedPoints);

    $('.referralTextArea').html('Join MyRBLX.com today, the #1 ROBLOX rewards site! Complete offers, surveys or watch videos and earn R$ which is instantly sent straight to your Roblox account. With daily giveaways and the best rates, join today at https://myrblx.com/r/'+userId+' !');
    $('.referralCopyInputText').val('https://myrblx.com/r/'+userId);
});

socket.on('recent giveaway winners', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var winnerUsername = result[i]['winnerUsername'];
        var prizeAmount = result[i]['prizeAmount'];
        var winnerChance = result[i]['winnerChance'];

        var item = '<div class="user-item my-2 row justify-content-center">\
        <div class="col-lg-2 col-sm-12 col-md-12">\
          <div class="m-auto user-img-div">\
            <img class="m-auto user-img" src="https://www.roblox.com/Thumbs/Avatar.ashx?x=150&amp;y=150&amp;Format=Png&amp;username='+winnerUsername+'">\
          </div>\
        </div>\
        <div class="col-lg-6 col-sm-12 col-md-12">\
          <div class="user-name-text">'+winnerUsername+'</div>\
          <div class="user-earned-text"><strong>Winning Chance:</strong> '+winnerChance+'%</div>\
        </div>\
        <div class="col-lg-2 col-sm-12 col-md-12">\
          <div class="my-2 mx-auto user-amount-button-div">\
            <button class="btn logout-button user-amount-button">'+prizeAmount+' Robux</button>\
          </div>\
        </div>\
      </div>';
        finalHTML += item;
    }
    $(".giveawayRecentWinners").html(finalHTML);
});

var nextGiveawayTime;
socket.on('giveaway details', (result) => {
    var endDate = result['endDate'];
    nextGiveawayTime = endDate;
    var prizeAmount = result['prizeAmount'];
    var participatingUsers = result['participatingUsers'];
    var isUserEnteredGiveaway = result['isUserEnteredGiveaway'];

    $('.giveawayJoinedUsers').html(participatingUsers);
    $('.giveawayPromptJoinedUsers').html(participatingUsers);
    $('.giveawayPrizeAmount').html(prizeAmount+" R$");

    if(isUserEnteredGiveaway){
        $('.giveawayEnterButton').html('You\'ve Entered This Giveaway!!!');
        $(".giveawayEnterButton").attr('disabled', true);
    }

    timeFunctionArr.push(function(){
        //.replace(/\s/, 'T')+'Z'
        var countDownDate = new Date(nextGiveawayTime).getTime();
    
        var now = new Date().getTime();
        
        var distance = countDownDate - now;
    
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        hours = hours + (days * 24);
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var secondsStr = seconds+"";
        if(secondsStr.length == 1) secondsStr = "0"+secondsStr;
        
        var minutesStr = minutes+"";
        if(minutesStr.length == 1) minutesStr = "0"+minutesStr;
        
        var hoursStr = hours+"";
        if(hoursStr.length == 1) hoursStr = "0"+hoursStr;
        
        $(".giveawayCountdownHours").html(hoursStr+"");
        $(".giveawayCountdownMinutes").html(minutesStr+"");
        $(".giveawayCountdownSeconds").html(secondsStr+"");
    });
    
    for (i = 0; i < timeFunctionArr.length; i++) {
        timeFunctionArr[i]();
    }
    setInterval(function() {
      for (i = 0; i < timeFunctionArr.length; i++) {
        timeFunctionArr[i]();
      }
    }, 1000);
});

socket.on('user cookie request', () => {
    socket.emit('user cookie', {cookie: readCookie("LoggedInUserID")})
});

socket.on('redeem username', (result) => {
    var username = result['username'];
    $(".redeemUsernameInput").val(username);
    $('.redeemForm').on('submit', function(e) {
        e.preventDefault();
        var robuxAmount = parseInt($('.robuxAmountInput').val());
        $('.redeemButton').html("Processing Request...");
        socket.emit('redeem robux', {userId: readCookie('LoggedInUserID'), amount: robuxAmount});
    });
});
socket.on('redeem failed', (result) => {
    var message = result['message'];
    $('.redeemButton').html("Give me Robux!!!");
    showMainModal("Robux Withdrawal Failed", 
                message, 
                "assets/img/error.svg", 
                true);
});
socket.on('giveaway enter failed offers', () => {
    showMainModal("Giveaway Entry Failed", 
                "You need to complete at least 1 offer to enter this giveaway.", 
                "assets/img/error.svg", 
                true);
});
socket.on('redeem success', (result) => {
    var username = result['username'];
    var amount = result['amount'];

    $('.redeemButton').html("Give me Robux!!!");
    showMainModal("Robux Withdrawal Successful", 
                "You have successfully withdrawn <strong>"+amount+" R$</strong>", 
                "assets/img/success.svg", 
                false);
    socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
});

socket.on('update giveaway entries', (result) => {
    var participatingUsers = result['participatingUsers'];

    $('.giveawayJoinedUsers').html(participatingUsers);
    $('.giveawayPromptJoinedUsers').html(participatingUsers);
});

socket.on('giveaway enter success', (result) => {
    $('.giveawayEnterButton').html('You\'ve Entered This Giveaway!!!');
    $(".giveawayEnterButton").attr('disabled', true);
    $(".giveawayEnterButton").prop("onclick", null).off("click");
});

socket.on('redeemed promo codes', (result) => {
    var finalHTML = "";
    for (i = 0; i < result.length; ++i) {
        var code = result[i]['code'];
        var robuxAmount = result[i]['robuxAmount'];

        var item = '<div class="user-item my-2 row justify-content-center col-12">\
        <div class="col-md-6 col-sm-12">\
          <div class="user-name-text" style="padding-top: 16px"><p style="margin-bottom: 0px !important">'+code+'<p></div>\
        </div>\
        <div class="col-md-6 col-sm-12">\
          <div class="my-2 mx-auto user-amount-button-div w-100">\
            <button class="btn logout-button user-amount-button w-100">You earned: <br><strong>'+robuxAmount+' Robux</strong></button>\
          </div>\
        </div>\
      </div>';
        finalHTML += item;
    }
    $(".redeemedPromoList").html(finalHTML);
});
socket.on('update giveaway entries', (result) => {
    var participatingUsers = result['participatingUsers'];

    $('.giveawayJoinedUsers').html(participatingUsers);
    $('.giveawayPromptJoinedUsers').html(participatingUsers);
});

socket.on('promo redeem success', (result) => {
    var code = result['code'];
    var amount = result['amount'];

    var item = '<div class="user-item my-2 row justify-content-center col-12">\
    <div class="col-md-6 col-sm-12">\
        <div class="user-name-text" style="padding-top: 16px"><p style="margin-bottom: 0px !important">'+code+'<p></div>\
    </div>\
    <div class="col-md-6 col-sm-12">\
        <div class="my-2 mx-auto user-amount-button-div w-100">\
        <button class="btn logout-button user-amount-button w-100">You earned: <br><strong>'+amount+' Robux</strong></button>\
        </div>\
    </div>\
    </div>';
    $(".redeemedPromoList").prepend(item);

    showMainModal("Promo Code Successful", 
                "You have successfully redeemed a promo code for <strong>"+amount+" R$</strong> Robux", 
                "assets/img/success.svg", 
                false);
    grecaptcha.reset();
    socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
});
socket.on('promo redeem failed', () => {
    showMainModal("Promo Code Failed", 
                "Sorry the Promo Code You Entered didn't work. Please Try Again.", 
                "assets/img/error.svg", 
                true);
    grecaptcha.reset();
});
socket.on('promo redeem failed used', () => {
    showMainModal("Promo Code Failed", 
                "You have already used this Promo.", 
                "assets/img/error.svg", 
                true);
    grecaptcha.reset();
});
socket.on('robux drop winners', (result) => {
    var winners = result['winners'];
    nextRobuxDropDateTime = result['newNextDropTime'];
    var prizeAmount = result['prizeAmount'];

    var winnersText = ``;
    if(winners[1] === undefined || winners[1] === null ) var winnersText = `${winners[0]} has won`;
    else if(winners[2] == undefined || winners[2] === null) var winnersText = `${winners[0]} and ${winners[1]} have each won`;
    else winnersText = `${winners[0]}, ${winners[1]} and ${winners[2]} have each won`;

    var text = `Congratulations!!!<br>
    ${winnersText} ${prizeAmount} R$<br>
    <br>
    How to Participate:<br>
    <br><br>
    &bull; To enter the <strong>ROBUX DROP</strong> you must stay on the <strong>MYRBLX.COM</strong> page or have it open.<br>
    <br>
    &bull; Complete lots of offers to increase your chance of winning!<br>
    <br>
    &bull; Share your referral link to as much friends as possible!<br>`;

    showMainModal("ROBUX TIME!!!", 
                text, 
                "assets/img/money-bag.svg", 
                false);
    socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
});
socket.on('giveaway winner', (result) => {
    var winner = result['winner'];
    nextGiveawayTime = result['newGiveawayEndDate'];
    var prizeAmount = result['prizeAmount'];
    var nextGiveawayAmount = result['nextGiveawayAmount'];

    $('.giveawayJoinedUsers').html(0);
    $('.giveawayPromptJoinedUsers').html(0);
    $('.giveawayPrizeAmount').html(nextGiveawayAmount+" R$");

    $('.giveawayEnterButton').html('Enter');
    $(".giveawayEnterButton").attr('disabled', false);

    var text = `Congratulations!!!<br>
    ${winner} has won ${prizeAmount} R$<br>
    <br>
    How to Participate:<br>
    <br>
    &bull; You can enter Giveaways through the <strong>Giveaways Page</strong><br>
    <br>
    &bull; Complete lots of offers to increase your chance of winning!<br>
    <br>
    &bull; Share your referral link to as much friends as possible!<br>`;

    showMainModal("GIVEAWAY TIME!!!", 
                text, 
                "assets/img/money-bag.svg", 
                false);
    socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
});
socket.on('user earning', (result) => {
    var amount =  result['amount'];
    var offerwall =  result['offerwall'];

    showMainModal("You've Got Robux!!!", 
                "You just earned <strong>"+amount+" R$</strong> from <strong>"+offerwall+"</strong>", 
                "assets/img/money-bag.svg", 
                false);

    socket.emit('user info', {'userid' : readCookie("LoggedInUserID")});
});

function openOfferwall(offerwallIndex, offerwallLink, offerwallName){
    if(offerwallName == "Gillo Quiz Site"){
        $(".quizSiteContainer").show();
        $("#earnIFrame").hide();

        $(".offerwall-button").removeClass('offerwall-unselected');
        $(".offerwall-button").addClass('offerwall-unselected');

        $("#ow-"+offerwallIndex).removeClass('offerwall-unselected');
    }else{
        $(".quizSiteContainer").hide();
        $("#earnIFrame").show();

        $(".offerwall-button").removeClass('offerwall-unselected');
        $(".offerwall-button").addClass('offerwall-unselected');
    
        $("#ow-"+offerwallIndex).removeClass('offerwall-unselected');
        $("#earnIFrame").attr("src", offerwallLink);
    }
}

socket.on('user robux update', (result) => {
    $(".headerRobuxAmount").html(result['points'] + " R$");
    $(".earnUserRobux").html(result['points'] + " R$");
});

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function showMainModal(title, text, image, isButtonRed){
    if(isButtonRed){
        $(".mainModalButton").removeClass('payout-button-green');
        $(".mainModalButton").addClass('payout-button-red');
    }else{
        $(".mainModalButton").removeClass('payout-button-red');
        $(".mainModalButton").addClass('payout-button-green');
    }

    $('.mainModalTitle').html(title);
    $('.mainModalText').html(text);
    $('.mainModalImage').attr("src", image);

    $('#main-modal').modal('show');
}