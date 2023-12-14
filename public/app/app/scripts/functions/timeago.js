/*
 * 2023.12.13.13:43:26
 */

/*
timeago.js (c) 2023
Desc: Timeago config
Created:  2023-04-01T21:47:13.995Z
Modified: 2023-07-24T15:31:23.884Z
*/

// Modal TimeAgo

function modal_time_ago() {
    return new Promise((resolve) => {
        var modal_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total seconds between date to be formatted and today's date;

            return [
                ["just now", "right now"],
                ["%s seconds ago", "in %s seconds"],
                ["1 minute ago", "in 1 minute"],
                ["%s minutes ago", "in %s minutes"],
                ["1 hour ago", "in 1 hour"],
                ["%s hours ago", "in %s hours"],
                ["1 day ago", "in 1 day"],
                ["%s days ago", "in %s days"],
                ["1 week ago", "in 1 week"],
                ["%s weeks ago", "in %s weeks"],
                ["1 month ago", "in 1 month"],
                ["%s months ago", "in %s months"],
                ["1 year ago", "in 1 year"],
                ["%s years ago", "in %s years"],
            ][index];
        };

        timeago.register("en_US", modal_locale);
        timeago.render(document.getElementById("cp-expiration-date"));
        timeago.render(document.getElementById("cp-activity-lastReset"));
        timeago.render(document.getElementById("cp-activity-lastReboot"));
        timeago.render(document.getElementById("cp-activity-added"));
        setTimeout(() => {
            resolve("Set time ago...");
        }, 100);
    });
}

// Page TimeAgo

async function getTimeAgoManual() {
    return new Promise((resolve) => {
        var ipchange_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total secs between date to be formatted and today's date;

            if (totalSec > 60) {
                var ipChangeColor = "grey";
            } else {
                var ipChangeColor = "orange";
            }

            return [
                ["ip changed just now", "ip changing right now"],
                ["ip changed %s secs ago", "in %s secs"],
                ["ip changed 1 min ago", "in 1 min"],
                ["ip changed %s mins ago", "in %s mins"],
                ["ip changed 1 hr ago", "in 1 hr"],
                ["ip changed %s hrs ago", "in %s hrs"],
                ["ip changed 1 day ago", "in 1 day"],
                ["ip changed %s days ago", "in %s days"],
                ["ip changed 1 wk ago", "in 1 wk"],
                ["ip changed %s wks ago", "in %s wks"],
                ["ip changed 1 mo ago", "in 1 mo"],
                ["ip changed %s mos ago", "in %s mos"],
                ["ip changed 1 yr ago", "in 1 yr"],
                ["ip changed %s yrs ago", "in %s yrs"],
            ][index];
        };

        timeago.register("en_US", ipchange_locale);
        timeago.render(document.querySelectorAll(".last_ip_change"));
        setTimeout(() => {
            resolve("Set time ago...");
        }, 200);
    });
}


async function getTimeAgoReboot() {
    return new Promise((resolve) => {
        var reboot_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total secs between date to be formatted and today's date;

            if (totalSec > 60) {
                var ipChangeColor = "grey";
            } else {
                var ipChangeColor = "orange";
            }

            return [
                ["rebooted just now", "rebooting right now"],
                ["rebooted %s secs ago", "in %s secs"],
                ["rebooted 1 min ago", "in 1 min"],
                ["rebooted %s mins ago", "in %s mins"],
                ["rebooted 1 hr ago", "in 1 hr"],
                ["rebooted %s hrs ago", "in %s hrs"],
                ["rebooted 1 day ago", "in 1 day"],
                ["rebooted %s days ago", "in %s days"],
                ["rebooted 1 wk ago", "in 1 wk"],
                ["rebooted %s wks ago", "in %s wks"],
                ["rebooted 1 mo ago", "in 1 mo"],
                ["rebooted %s mos ago", "in %s mos"],
                ["rebooted 1 yr ago", "in 1 yr"],
                ["rebooted %s yrs ago", "in %s yrs"],
            ][index];
        };

        timeago.register("en_US", reboot_locale);
        timeago.render(document.querySelectorAll(".last_reboot"));
        setTimeout(() => {
            resolve("Set time ago...");
        }, 200);
    });
}


// Change `expires` TimeAgo

async function getTimeAgoExpires() {
    return new Promise((resolve) => {
        var expires_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total secs between date to be formatted and today's date;

            return [
                ["expired just now", "expires right now"],
                ["expired %ss ago", "expires %ss"],
                ["expired 1m ago", "expires 1m"],
                ["expired %sm ago", "expires %sm"],
                ["expired 1h ago", "expires 1h"],
                ["expired %sh ago", "expires %sh"],
                ["expired 1 day ago", "expires 1d"],
                ["expired %sd ago", "expires %sd"],
                ["expired 1wk ago", "expires 1wk"],
                ["expired %swk ago", "expires %swk"],
                ["expired 1mo ago", "expires 1mo"],
                ["expired %smo ago", "expires %smo"],
                ["expired 1yr ago", "expires 1yr"],
                ["expired %syr ago", "expires %syr"],
            ][index];
        };

        timeago.register("en_US", expires_locale);
        timeago.render(document.querySelectorAll(".expires_at"));
        setTimeout(() => {
            resolve("Set time ago `expires`...");
        }, 200);
    });
}


// Change `added_at` TimeAgo

async function getTimeAgoAdded() {
    return new Promise((resolve) => {
        var added_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total secs between date to be formatted and today's date;

            return [
                ["added just now", "right now"],
                ["added %ss ago", "%ss"],
                ["added 1m ago", "1m"],
                ["added %sm ago", "in %sm"],
                ["added 1h ago", "1h"],
                ["added %sh ago", "%sh"],
                ["added 1d ago", "1d"],
                ["added %sd ago", "%sd"],
                ["added 1wk ago", "1wk"],
                ["added %swk ago", "%swk"],
                ["added 1mo ago", "1mo"],
                ["added %smo ago", "%smo"],
                ["added 1yr ago", "1yr"],
                ["added %syr ago", "%syr"],
            ][index];
        };

        timeago.register("en_US", added_locale);
        timeago.render(document.querySelectorAll(".added_at"));
        setTimeout(() => {
            resolve("Set time ago `added_at`...");
        }, 200);
    });
}

async function getTimeAgoAuto() {
    return new Promise((resolve) => {
        var auto_locale = function (number, index, totalSec) {
            // number: the time ago / time in number;
            // index: the index of array below;
            // totalSec: total secs between date to be formatted and today's date;

            if (totalSec > 60) {
                var ipChangeColor = "grey";
            } else {
                var ipChangeColor = "orange";
            }

            return [
                ["auto changed ip just now", "auto-changing ip right now"],
                ["auto changed ip %s secs ago", "auto-changing ip in %s sec"],
                ["auto changed ip 1 min ago", "auto-changing ip in 1 min"],
                ["auto changed ip %s mins ago", "auto-changing ip in %s min"],
                ["auto changed ip 1 hrs ago", "auto-changing ip in 1 hrs"],
                ["auto changed ip %s hrs ago", "auto-changing ip in %s hrs"],
                ["auto changed ip 1 day ago", "auto-changing ip in 1 day"],
                ["auto changed ip %s days ago", "auto-changing ip in %s days"],
                ["auto changed ip 1 wk ago", "auto-changing ip in 1 wk"],
                ["auto changed ip %s wks ago", "auto-changing ip in %s wks"],
                ["auto changed ip 1 mos ago", "auto-changing ip in 1 mos"],
                ["auto changed ip %s mos ago", "auto-changing ip in %s mos"],
                ["auto changed ip 1 yr ago", "auto-changing ip in 1 yr"],
                ["auto changed ip %s yrs ago", "auto-changing ip in %s yrs"],
            ][index];
        };

        timeago.register("en_US", auto_locale);
        timeago.render(document.querySelectorAll(".auto_change_on"));
        setTimeout(() => {
            resolve("Set time ago...");
        }, 200);
    });
}