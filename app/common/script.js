'use strict';

var appUrl = window.location.origin;

$(function() {
   
    window.loginCallBack = function(username) {
        $("#display-name").text(username);
        $("body").addClass("authed").removeClass("anon");
    }
    
    $(".logout").click(function () {
        $.get("/logout", function() {
            $("#display-name").text("");
            $("body").addClass("anon").removeClass("authed");
        });
        return false;
    });
    
});
