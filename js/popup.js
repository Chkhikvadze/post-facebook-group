function initIFrame() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var expiry = new Date(parseInt(localStorage.expiryTime));
        var now = new Date();
        if (localStorage.accessToken && now < expiry) {
            chrome.tabs.getSelected(null, function (tab) {
                var tablink = tab.url;
                if (tablink === undefined)
                    return;

                if (!isValidURL(tablink)){
                    showNotification("Link is invalid!")
                    return;
                }

                $('.link').empty();
                var html = "<li><iframe class='frame' id='frame' src='" + tablink + "'></iframe></li>";

                $('.link').append($(html));
                $('#preloader').addClass('none');

            });
        } else {
            loginfacebook(initIFrame);
        }
    });
}

function loginfacebook(callback) {

    if (localStorage["appId"] === undefined || localStorage["appId"] === "") {
        showNotification("Fill Facebook App ID!");
        return;
    }

    var url = "https://www.facebook.com/dialog/oauth?"
        + "display=popup&"
        + "client_id=" + localStorage["appId"] + "&"
        + "redirect_uri=https://www.facebook.com/connect/login_success.html&"
        + "scope=user_managed_groups, user_about_me, user_posts, manage_pages, publish_pages, publish_actions, public_profile&" + "response_type=token";
    chrome.windows
        .create(
        {
            'url': url,
            'width': 580,
            'height': 400
        },
        function (popupWindow) {
            chrome.tabs
                .query(
                {
                    active: true
                },
                function (tabs) {
                    tabid = tabs[0].id;
                    chrome.tabs.onUpdated
                        .addListener(function (tabid, tab) {
                            var tabUrl = tab.url;
                            var accessTokenMatcher = null;
                            var expiresInMatcher = null;
                            if (tabUrl != null) {
                                accessTokenMatcher = tabUrl
                                    .match(/[\\?&#]access_token=([^&#])*/i);
                                expiresInMatcher = tabUrl
                                    .match(/expires_in=.*/);
                            }
                            if (accessTokenMatcher != null) {
                                token = accessTokenMatcher[0];
                                token = token
                                    .substring(14);
                                expires_in = expiresInMatcher[0];
                                expires_in = expires_in
                                    .substring(11);
                                localStorage.accessToken = token;
                                var currentDate = new Date();
                                var expiryTime = currentDate
                                        .getTime()
                                    + 1000
                                    * (expires_in - 300);
                                localStorage.expiryTime = expiryTime;
                                chrome.windows
                                    .remove(popupWindow.id);
                                callback();
                            }
                            ;
                        });
                });
        });

}

document.addEventListener('DOMContentLoaded', function () {
    initIFrame();
});


function showNotification(desc) {
    var img = "/images/notification.png";
    var desc = desc;
    var options = {
        type: "basic",
        title: "Post in FaceBook",
        message: desc,
        iconUrl: img
    };
    console.log(chrome.notifications);
    chrome.notifications.create("", options, function (id) {
        setTimeout(function () {
            chrome.notifications.clear(id, function () {
            });
        }, 5000);
    });
}


$(document).ready(function () {

    $(".btn-settings").click(function () {
        chrome.tabs.create({
            url: "options.html"
        });
    });

    $("#share").on("click", function (e) {
        chrome.tabs.getSelected(null, function (tab) {
            var tablink = tab.url;
            if (tablink === undefined)
                return;

            if (!isValidURL(tablink)){
                showNotification("Link is invalid!")
                return;
            }


            var post_url = "https://graph.facebook.com/v2.4/" + localStorage["groupId"] + "/feed";
            $.ajax({
                type: 'POST',
                url: post_url,
                data: {link: tablink, access_token: localStorage.accessToken, format: "json"},
                success: function (data) {
                    if (data.id !== undefined) {
                        showNotification("Successful Post");
                    } else {
                        showNotification("Error Post")
                    }

                },
                dataType: "JSON"
            });
        });
    });

    $("#test").on("click", function (e) {


    });
});

function isValidURL(url){
    var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if(RegExp.test(url)){
        return true;
    }else{
        return false;
    }
}