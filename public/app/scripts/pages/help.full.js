/*
 * 2023.12.14.10:23:2
 */

// -- Setting up some variables for our error party
let errStatus, errMsg, errData = {};

// -- Function for when the stuff hits the fan
async function ErrorHandler(msg, data, status, rdrObj = null) {
    // Putting all our error eggs in one basket
    const errorObj = {
        ok: false, message: msg, data, redirect: rdrObj
    };
    // Throwing it back
    throw {error: errorObj, status: status};
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showBody() {
    $(document).ready(function () {
        $('.page_loader--contain').hide(); // Hide the element
        $('.body_content').show(); // Show the element
        setTimeout(function () {
            $('.body_content').css('opacity', '1'); // Change opacity after a brief delay
        }, 10); //
    });
}

async function redirect(target, path, enableBack) {
    if (target === '_self') {
        history.pushState({}, '', path);
        await fetch(path); // Simulate a fetch request for async behavior
        if (!enableBack) {
            history.replaceState(null, null, location.href);
        }
        location.reload();
    } else if (target === '_blank') {
        window.open(path, '_blank');
    }
}

/**
 ? Initializes the IX2 (Interactions 2.0) module
 ** @returns {Promise<void>} - A Promise that resolves after IX2 has been initialized.
 */
function iniIx2() {
    return new Promise((resolve) => {
        setTimeout(() => {
            $(document).ready(function () {
                window.Webflow && window.Webflow.require("ix2").init();
                document.dispatchEvent(new CustomEvent("IX2_PREVIEW_LOAD"));
            });
            resolve();
        }, 500);
    });
}

/**
 *? Loads the Clerk frontend API script and initializes ClerkJS.
 ** @returns {Promise<void>} Resolves when Clerk is initialized.
 * */
async function loadClerk() {
    return new Promise((resolve) => {
        // Get this URL from the Clerk Dashboard
        const frontendApi = "clerk.illusory.io";
        const version = "@latest"; // Set to appropriate version
        // Creates asyncronous script
        const script = document.createElement("script");
        script.setAttribute("data-clerk-frontend-api", frontendApi);
        script.async = true;
        script.src = `https://${frontendApi}/npm/@clerk/clerk-js${version}/dist/clerk.browser.js`;
        // Adds listener to initialize ClerkJS after it's loaded
        script.addEventListener("load", async function () {
            await window.Clerk.load({
                // Set load options here...
            });
            // console.log("Clerk initiated 🔒");
            clerkResolved();
        });
        document.body.appendChild(script);
        // console.log('Clerk script loaded');
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

/**
 *? Loads a script dynamically.
 * @param {string} src - The source of the script to be loaded.
 * @param {string} name - The name of the script being loaded.
 ** @returns {Promise} - A promise that resolves when the script is loaded successfully, or rejects if an error occurs.
 **/

const lsc = (src, name) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.addEventListener("load", () => {
            resolve({loaded: name + " loaded...", error: false});
        });
        script.onerror = reject;
        script.src = src;
        script.async = false;
        document.body.append(script);
    });
};


$('[toggle="menu_btn"]').click(function () {
    // Check if screen width is less than or equal to 768px
    if (window.innerWidth <= 768) {
        $('#nav_sb').toggle(); // Toggle the sidebar
    }
});

$(document).click(function (event) {
    if (window.innerWidth <= 768) {
        let $target = $(event.target);

        // Check if the target is not inside '#nav_sb' and not '.cl-userButtonPopoverCard' and is not the toggle button itself
        if (!$target.closest('#nav_sb').length && !$target.closest('.cl-userButtonPopoverCard').length && !$target.is('[toggle="menu_btn"]')) {
            $('#nav_sb').hide();
        }
    }
});

$(window).resize(function () {
    // Check if screen width is greater than 768px
    if (window.innerWidth > 768) {
        $('#nav_sb').show(); // Show the sidebar
    } else {
        $('#nav_sb').hide();
    }
});


/**
 *? Fetches the cmdbar.js file from the given URL and logs the result or error message.
 * @async
 * @function lscCmdbar
 ** @returns {Promise} A Promise that resolves with the result or rejects with an error message.
 */
async function lscCmdbar() {
    await lsc("scripts/functions/cmdbar.js", "cmdbar.js")
        // .then((val) => console.log(val))
        .catch((err) => console.error(err.message));
}

/**
 *? Retrieves a Supabase token through the Clerk session.
 ** @returns {Promise<string>} A Promise that resolves to a Supabase token.
 *  If successful, the token is returned.
 *  If an error occurs, an "Invalid token" message is returned.
 *! @throws {Error} If an error occurs while retrieving the token.
 */

async function supaToken() {
    try {
        const token = await window.Clerk.session.getToken({
            template: "supabase-auth",
        });

        return token;
    } catch (error) {
        $(`.body_content`).remove();
        return await ErrorHandler(`Invalid token`, {}, `401`, {
            target: `_self`,
            path: `/app/sign-in`,
            enableBack: false
        });
    }
}

/**
 *? Creates a Supabase client with the provided token.
 * @param {string} token - The token used for authorization.
 ** @return {Promise<object|string>} - A promise that resolves to the Supabase client object if successful, or an error message if unsuccessful.
 */
async function supaClerk(token) {
    if (!token) {
        token = await supaToken();
    }
    let anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cWxvYndqd2Jib3VzZ2Rod3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY1ODk4ODYsImV4cCI6MTk5MjE2NTg4Nn0.nla93WMcf1pNyFXZ5_1sniMD97CYj8y9lF5zKif2TrI'
    try {
        const {createClient} = supabase;
        client = await createClient("https://supa.illusory.io", anon, {
            global: {
                headers: {Authorization: `Bearer ${token}`},
            }, realtime: {
                headers: {
                    apikey: token,
                }, params: {
                    apikey: anon,
                },
            },
        });
        client.realtime.setAuth(token)
    } catch (e) {
        client = "Invalid Supabase Client";
        console.error(e);
    }
    return client;
}

/**
 *? Retrieves the API keys from the server.
 ** @returns {Promise<string>} The API key.
 *! @throws {Error} If there is an error fetching the API keys.
 */
async function getApiKeys(token, format = 'visible') {
    if (!token) {
        token = await supaToken();
    }
    let apiKeysEndpoint = new URL(`https://cmd.illusory.io/v1/apikeys?format=${format}`);
    const response = await fetch(apiKeysEndpoint, {
        method: 'GET', headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        errStatus = 404;
        `Error fetching API. Please contact support if this issue persists.`
        errData = {};
        await ErrorHandler(errMsg, errData, errStatus);
    }
    const data = await response.json();
    return data.data[0].key;
}


async function updateMember(token, path, value) {
    if (!token) {
        token = await supaToken();
    }
    const body = {
        [path]: value
    }
    let apiKeysEndpoint = new URL(`https://cmd.illusory.io/v1/member/${path}`);
    const response = await fetch(apiKeysEndpoint, {
        method: 'POST', headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    const resJson = await response.json();
    const {message: resMsg} = resJson;
    if (!response.ok) {
        errStatus = 404;
        `Error rolling API key. Please contact support if this issue persists.`
        errData = {};
        await ErrorHandler(errMsg, errData, errStatus);
    }
    return;
}

/**
 ? Display an error message with customizable title, message, and button text.
 * @param {string} title - The title of the error message.
 * @param {string} message - The content of the error message.
 * @param {string} [buttonText=''] - The text of the action button.
 * @param {boolean} [showDiv=true] - Indicates whether to show the error message.
 * @param {boolean} [closeOther=true] - Indicates whether to close other alerts before showing the error message.
 */
async function errAlert(title, message, buttonText = '', showDiv = true, closeOther = true) {
    // console.log('errAlert', title, message, buttonText, showDiv, closeOther)
    if (closeOther) {
        // Close other alerts
        errAlert('', '', '', false, false);
        sucAlert('', '', '', false, false);
    }
    $('#errTit').html(title);
    $('#errTxt').html(message);
    $('#errActionBtn1').html(buttonText);

    if (showDiv) {
        $('#errDiv').show();
        let errDismiss = $('#errDismissBtn');
        errDismiss.off('click');
        errDismiss.click(function () {
            $('#errDiv').hide();
        });

        // add this code here
        $(document).mouseup(function (e) {
            const container = $("#errDiv");

            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
    } else {
        $('#errDiv').hide();
    }
}


async function errAlertSmall(message, indicator, showDiv = 'show') {
    $(`[errDiv="small"]`)[showDiv]();
    $('#errTxtSmall').html(message);
    $(`[err_alert_ind="true"]`).removeClass().addClass(`err_alert_ind_small ${indicator}`);
}


/**
 ? Shows a success alert with customized content.
 * @param {string} title - The title of the success alert.
 * @param {string} message - The message of the success alert.
 * @param {string} [buttonText=''] - The text of the action button.
 * @param {boolean} [showDiv=true] - Determines whether to show the success alert div.
 * @param {boolean} [closeOther=true] - Determines whether to close other alerts before showing the success alert.
 */
async function sucAlert(title, message, buttonText = '', showDiv = true, closeOther = true) {
    if (closeOther) {
        // Close other alerts
        sucAlert('', '', '', false, false);
        errAlert('', '', '', false, false);
    }
    $('#sucTit').html(title);
    $('#sucTxt').html(message);
    $('#sucActionBtn1').html(buttonText);

    if (showDiv) {
        $('#sucDiv').show();
        let sucDismiss = $('#sucDismissBtn');
        sucDismiss.off('click');
        sucDismiss.click(function () {
            $('#sucDiv').hide();
        });

        // add this code here
        $(document).mouseup(function (e) {
            const container = $("#sucDiv");

            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
    } else {
        $('#sucDiv').hide();
    }
}

/**
 *? Sends a GET request to identify the cmdbar using the given token.
 * @param {string} token - The authentication token used to authorize the request.
 ** @return {Promise<Object>} - A promise that resolves to the cmdbar response object.
 *! @throws {Object} - Throws an object with an 'err' property and 'status' property if the request fails.
 */

async function identifyCmdbar(token) {
    if (!token) {
        token = await supaToken();
    }
    const response = await fetch("https://cmd.illusory.io/v1/cmdbar/identify", {
        "method": "GET", "headers": {Authorization: `Bearer ${token}`}
    })
    if (!response.ok) {
        console.error(`Error validating CommandBar user`, response);
        errStatus = response.status;
        errMsg = `Error validating CommandBar user. Please contact support.`;
        errData = {};
        await ErrorHandler(errMsg, errData, errStatus);
    }
    return await response.json();
}

async function getUser(token) {
    try {
        if (!token) {
            token = await supaToken();
        }
        const url = new URL(`https://cmd.illusory.io/v1/user`);
        const response = await fetch(url, {
            method: 'GET', headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `There was an error with your request. Please try again later or contact support.`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later.`;
            }
            throw new Error(errMsg);
        }
        return resJson;
    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`, {
            target: '_self',
            path: '/app/sign-in',
            enableBack: false
        });
    }
}

async function updateUser(user) {
    if (!user) {
        user = await getUser();
    }
    let {
        onboarding_state,
        app_version,
        app_version_action,
        app_state_action,
        member_verification_state,
        member,
        member_claim,
        member_notify,
        member_username,
        member_lic,
        funds,
        funds_updated_at,
        renewing_soon,
        renewing_soon_count,
        expiring_soon,
        expiring_soon_count,
        renewal_required,
        total_required,
        total_commitment,
        funds_state
    } = user.data;

    if (member) {
        $(`[page_content="member_enable"]`).hide();
        $(`[page_content="member_setting"]`).show();
        $(`[member_input_active="username"]`).val(member_username);
    } else {
        $(`[page_content="member_setting"]`).hide();
        $(`[page_content="member_enable"]`).show();
        $(`[member_input="lic_key"]`).val(member_lic);
    }

    if (!member && member_claim === true && member_username !== null) {
        $(`[action-btn="is_member"]`).addClass(`green`);
        $(`[action-btn="not_member"]`).removeClass(`green`);
        $(`[member_input="username"]`).val(user.data.member_username);
        await showHideSectBlock(null, $(`[sect_block="username"]`));
        await showHideSectBlock(null, $(`[sect_block="lic_key"]`));
        if (member_notify === true) {
            await showHideSectBlock(null, $(`[sect_block="in_review"]`));
        } else {
            await showHideSectBlock(null, $(`[sect_block="notify_team"]`));
        }
    }
}

async function rpcUser(client) {
    if (!client) {
        client = await supaClerk()
    }
    await client.channel('users_restricted')
        .on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: 'users_restricted'
        }, async (payload) => {
            let user = {}
            const {
                onboarding_state,
                app_version,
                app_version_action,
                app_state_action,
                member_verification_state,
                member,
                member_claim,
                member_notify,
                member_username,
                member_lic,
                funds,
                funds_updated_at,
                renewing_soon,
                renewing_soon_count,
                expiring_soon,
                expiring_soon_count,
                renewal_required,
                total_required,
                total_commitment,
                funds_state
            } = payload.new;


            user = {
                data: {
                    onboarding_state,
                    app_version,
                    app_version_action,
                    app_state_action,
                    member_verification_state,
                    member,
                    member_claim,
                    member_notify,
                    member_username,
                    member_lic,
                    funds,
                    funds_updated_at,
                    renewing_soon,
                    renewing_soon_count,
                    expiring_soon,
                    expiring_soon_count,
                    renewal_required,
                    total_required,
                    total_commitment,
                    funds_state
                }
            }

            await updateUser(user);

        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
            }
        })
}


let inactivityTimeout;
let inactivityAlert = false;

async function showInactiveAlert() {
    if (inactivityAlert) {
        return;
    }
    inactivityAlert = true;
    errAlertSmall(`Disabled realtime updates due to inactivity`, `orange`);
    // console.log('Removing all channels');
    try {
        const client = await supaClerk()
        client.removeAllChannels();
    } catch (error) {
        console.error("Error in removeAllChannels timeout:", error);
    }
}

function startInactivityDetection() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(showInactiveAlert, 1 * 60 * 60 * 1000);
}

async function resetInactivityTimer() {
    try {
        if (inactivityAlert) {
            // If the alert was previously shown due to inactivity, restart the RPC process when the user becomes active again.
            inactivityAlert = false;
            errAlertSmall(`Reconnecting to realtime updates`, `orange`);
            $(`[err_item_ldr="realtime"]`).css(`visibility`, `visible`);
            LottieInteractivity.create({
                player: `[err_item_ldr="realtime"]`, mode: "chain", actions: [{state: "loop"}]
            });
            const token = await supaToken();
            const client = await supaClerk(token);
            await rpcUser(client);
            rpcRefresh();
            updateUser();
            hideInactiveAlert();
        }
    } catch (e) {
        console.error(e);
        if (e.error.redirect) {
            await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
        }
    }
    startInactivityDetection();
}

function setupInactivityDetection() {
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach(eventType => {
        document.addEventListener(eventType, resetInactivityTimer, true);
    });
    startInactivityDetection();
}

async function hideInactiveAlert() {
    await sleep(2000);
    errAlertSmall(`Reconnected to realtime updates`, `green`);
    LottieInteractivity.create({
        player: `[err_item_ldr="realtime"]`, mode: "chain", actions: [{state: "stop"}]
    });
    $(`[err_item_ldr="realtime"]`).css(`visibility`, `hidden`);
    await sleep(1000);
    errAlertSmall(`All good`, `grey`, `hide`);
}

const REFRESH_THRESHOLD = 50000;
const SLEEP_INTERVAL = 1000;
const MAX_INTERVAL_COUNT = 50;

let rpcRunningTimestamp = null;
let rpcIntervalCount = 0;
let removeChannelsTimeout = null;

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        clearTimeout(removeChannelsTimeout);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        const timeInBackground = Date.now() - rpcRunningTimestamp;
        if (timeInBackground >= 60000) { // 60 seconds
            updateUser();
            runRpc(true);
        }
    }
}

async function runRpc(alert = false) {
    if (alert) {
        // console.log("Alerting user");
        errAlertSmall(`Reconnecting to realtime updates`, `orange`);
        $(`[err_item_ldr="realtime"]`).css(`visibility`, `visible`);
        LottieInteractivity.create({
            player: `[err_item_ldr="realtime"]`, mode: "chain", actions: [{state: "loop"}]
        });
    }
    while (rpcIntervalCount < MAX_INTERVAL_COUNT) {
        if (document.visibilityState !== 'visible' || inactivityAlert) {
            // console.log(inactivityAlert ? 'User is inactive' : 'Tab is not visible');

            if (document.visibilityState !== 'visible') {
                // console.log('Tab is not visible');

                // Set a timeout to run supabase.removeAllChannels() after 2 minutes
                removeChannelsTimeout = setTimeout(async () => {
                    // console.log('Removing all channels');
                    try {
                        const client = await supaClerk()
                        client.removeAllChannels();
                    } catch (error) {
                        console.error("Error in removeAllChannels timeout:", error);
                    }
                }, 2 * 60 * 1000); // 2 minutes

                document.addEventListener('visibilitychange', handleVisibilityChange);
            }
            return;
        }
        if (alert) {
            alert = false;
            hideInactiveAlert();
        }
        await sleep(SLEEP_INTERVAL);
        rpcIntervalCount++;
    }
    const client = await supaClerk();
    await rpcUser(client);
    rpcIntervalCount = 0;
    rpcRefresh();
}


async function rpcRefresh() {
    if (rpcRunningTimestamp && (Date.now() - rpcRunningTimestamp < REFRESH_THRESHOLD)) {
        return;
    }
    rpcRunningTimestamp = Date.now();
    await runRpc();
}

setupInactivityDetection();


async function sendMemberClaim(member) {
    let actionBtnAtrr;
    if (member) {
        actionBtnAtrr = `is_member`;
    } else {
        actionBtnAtrr = `not_member`;
    }
    try {
        $(`[lottie_ldr_wrap="${actionBtnAtrr}"]`).show();
        $(`[action-btn-text="${actionBtnAtrr}"]`).addClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="${actionBtnAtrr}"]`, mode: "chain", actions: [{state: "loop"}]
        });

        await updateMember(null, `claim`, member)

        $(`[lottie_ldr_wrap="${actionBtnAtrr}"]`).hide();
        $(`[action-btn-text="${actionBtnAtrr}"]`).removeClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="${actionBtnAtrr}"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: true,
            message: `Your request was successful`
        }

    } catch (e) {
        console.error(e);

        $(`[lottie_ldr_wrap="${actionBtnAtrr}"]`).hide();
        $(`[action-btn-text="${actionBtnAtrr}"]`).removeClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="${actionBtnAtrr}"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: false,
            message: `There was an error with your request. Please try again later or contact support.`,
            error: e
        };
    }
}


async function sendMemberUsername(username) {
    try {
        $(`[lottie_ldr_wrap="username"]`).show();
        $(`[member_input_btn="username"]`).hide();

        LottieInteractivity.create({
            player: `[lottie_ldr="username"]`, mode: "chain", actions: [{state: "loop"}]
        });

        await updateMember(null, `username`, username)

        $(`[lottie_ldr_wrap="username"]`).hide();

        LottieInteractivity.create({
            player: `[lottie_ldr="username"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: true,
            message: `Your request was successful`
        }

    } catch (e) {
        console.error(e);

        $(`[lottie_ldr="confirm_username"]`).hide();

        LottieInteractivity.create({
            player: `[lottie_ldr="confirm_username"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: false,
            message: `There was an error with your request. Please try again later or contact support.`,
            error: e
        };
    }
}


async function sendMemberNotify(notify) {
    try {
        $(`[lottie_ldr_wrap="notify_team"]`).show();
        $(`[action-btn-text="notify_team"]`).addClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="username"]`, mode: "chain", actions: [{state: "loop"}]
        });

        await updateMember(null, `notify`, true)

        $(`[lottie_ldr_wrap="notify_team"]`).hide();

        LottieInteractivity.create({
            player: `[lottie_ldr="notify_team"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: true,
            message: `Your request was successful`
        }

    } catch (e) {
        console.error(e);

        $(`[lottie_ldr="notify_team"]`).hide();

        LottieInteractivity.create({
            player: `[lottie_ldr="notify_team"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return {
            ok: false,
            message: `There was an error with your request. Please try again later or contact support.`,
            error: e
        };
    }
}


async function copyLicKey() {
    try {
        $(`[lottie_ldr_wrap="copy"]`).show();
        $(`[action-btn_ico="copy"]`).addClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="copy"]`, mode: "chain", actions: [{state: "loop"}]
        });

        const key = $(`[member_input="lic_key"]`).val();
        const message = `Please review my lifetime member discount request for Illusory. My license key is: ${key}`;

        // Copy URL to clipboard
        await navigator.clipboard.writeText(message);

        const sucTit = `Your request was successful`;
        const sucMsg = `License Key was copied to clipboard successfully. Now, post it on the forum to get your account verified.`;
        sucAlert(sucTit, sucMsg, `Go to forum`);
        $(`#sucActionBtn1`).off('click').click(async function () {
            await redirect(`_blank`, `https://illusory.to/bhw-reply`, true);
        });

        $(`[lottie_ldr_wrap="copy"]`).hide();
        $(`[action-btn_ico="copy"]`).removeClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="copy"]`, mode: "chain", actions: [{state: "stop"}]
        });

    } catch (error) {
        $(`[lottie_ldr_wrap="copy"]`).hide();
        $(`[action-btn_ico="copy"]`).removeClass(`invisible`)

        LottieInteractivity.create({
            player: `[lottie_ldr="copy"]`, mode: "chain", actions: [{state: "stop"}]
        });

        let errMsg = error.message;
        let errStatus = error.status;
        let errData = error.data;
        errAlert(`Error with your request`, errMsg);
        try {
            await ErrorHandler(errMsg, errData, errStatus);
        } catch (error) {
            throw error;
        }
    }
}


async function showHideSectBlock(hideElement, showElement) {
    if (hideElement) {
        hideElement.hide();
    }
    showElement.show();
    setTimeout(function () {
        showElement.css('opacity', '1');
    }, 10);
}

$(`[action-btn="enable_member_start"]`).off('click').click(async function () {
    await showHideSectBlock($(`[sect_content="enable_start"]`), $(`[sect_content="enable_form"]`));
})

// Select issue area
$(`[action-btn-issue-area]`).off('click').click(async function () {
    // remove green and remove data-selected
    $(`[action-btn-issue-area]`).removeClass(`green`)
        .removeAttr(`data-selected`);
    $(this).addClass(`green`)
        .attr({
            'data-selected': true,
        });
})

// Select issue severity
$(`[action-btn-issue-severity]`).off('click').click(async function () {
    // remove green and remove data-selected
    $(`[action-btn-issue-severity]`).removeClass(`green`)
        .removeAttr(`data-selected`);
    $(this).addClass(`green`)
        .attr({
            'data-selected': true,
        });
})

$(`[action-btn="not_member"]`).off('click').click(async function () {
    const request = await sendMemberClaim(false);
    // check if request was successful or error
    if (request.ok) {
        $(this).addClass(`green`);
        $(`[action-btn="is_member"]`).removeClass(`green`);
        $(`.form_block`).hide();
        $(`[sect_block="specify_member"]`).show();
        await showHideSectBlock(null, $(`[sect_block="create_account"]`));
    } else {
        errAlert(`Error with your request`, request.message);
    }
})

$(`[member_input_btn="username"]`).off('click').click(async function () {
    const username = $(`[member_input="username"]`).val();
    const request = await sendMemberUsername(username);
    // check if request was successful or error
    if (request.ok) {
        await showHideSectBlock(null, $(`[sect_block="lic_key"]`));
        await showHideSectBlock(null, $(`[sect_block="notify_team"]`));
    } else {
        errAlert(`Error with your request`, request.message);
    }
})


$(`[action-btn="not_member"]`).off('click').click(async function () {
    const request = await sendMemberClaim(false);
    // check if request was successful or error
    if (request.ok) {
        $(this).addClass(`green`);
        $(`[action-btn="is_member"]`).removeClass(`green`);
        $(`.form_block`).hide();
        $(`[sect_block="specify_member"]`).show();
        await showHideSectBlock(null, $(`[sect_block="create_account"]`));
    } else {
        errAlert(`Error with your request`, request.message);
    }
})

$(`[action-btn="notify_team"]`).off('click').click(async function () {
    const request = await sendMemberNotify(true);
    // check if request was successful or error
    if (request.ok) {
        await showHideSectBlock($(`[sect_block="notify_team"]`), $(`[sect_block="in_review"]`));
    } else {
        errAlert(`Error with your request`, request.message);
    }


})

$(`[action-btn="copy"]`).off('click').click(async function () {
    await copyLicKey();
})


// Deferred functions
async function deferredActions() {
    let currentOpenTooltip = null;
    let leaveTimer;

    function setupTooltipListeners(triggerSelector, tooltipSelector, delay = 300) { // Increased delay to 1-2 seconds
        function findTooltipInNextSiblings(trigger) {
            let sibling = trigger.nextElementSibling;
            let steps = 2;  // Max number of siblings to check

            while (sibling && steps > 0) {
                if (sibling.matches(tooltipSelector)) {
                    return sibling;
                }
                sibling = sibling.nextElementSibling;
                steps--;
            }
            return null;
        }

        function showTooltip(tooltip) {
            clearTimeout(leaveTimer); // Clear any existing timer
            if (currentOpenTooltip && currentOpenTooltip !== tooltip) {
                currentOpenTooltip.style.display = 'none';
            }
            tooltip.style.display = 'block';
            currentOpenTooltip = tooltip;
        }

        function startHideTimer(tooltip) {
            return setTimeout(() => {
                if (tooltip === currentOpenTooltip) {
                    tooltip.style.display = 'none';
                    currentOpenTooltip = null;
                }
            }, delay);
        }

        document.querySelectorAll(triggerSelector).forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const tooltip = findTooltipInNextSiblings(trigger);
                if (tooltip) {
                    showTooltip(tooltip);
                }
            });

            trigger.addEventListener('mouseleave', () => {
                leaveTimer = setTimeout(() => {
                    // Additional check: Hide only if not over the tooltip
                    if (!currentOpenTooltip.matches(':hover')) {
                        currentOpenTooltip.style.display = 'none';
                        currentOpenTooltip = null;
                    }
                }, delay);
            });
        });

        document.querySelectorAll(tooltipSelector).forEach(tooltip => {
            tooltip.addEventListener('mouseenter', () => {
                clearTimeout(leaveTimer); // Cancel the timer when entering the tooltip
                currentOpenTooltip = tooltip;
            });

            tooltip.addEventListener('mouseleave', () => {
                leaveTimer = startHideTimer(tooltip);
            });
        });
    }

    setupTooltipListeners('.info_circle_duo-icon', '.info-wrap');
}

/**
 ? Initializes the page by performing the necessary asynchronous operations.
 ** @returns {Promise<void>} A promise that resolves when the page initialization is complete.
 */
async function pageInit() {
    await lscCmdbar();
    // await clearLocalItems();
    await loadClerk();
}


/**
 ? Resolves a clerk request.
 ** @returns {Promise<void>} A promise that resolves when the clerk request is resolved.
 * @async
 * @function clerkResolved
 * @memberof module:clerk
 */
async function clerkResolved() {
    try {
        // Authenticate request
        const token = await supaToken()
        const user = await getUser(token);

        const cmdbar = await identifyCmdbar(token);
        const {hmac, user_id} = cmdbar.data;
        // Start cmdbar
        await cmdbarStart(user_id, hmac);

        $(`.cmdbhelp--nav`).off('click').click(async function () {
            window.CommandBar.toggleHelpHub();
        })

        await updateUser(user);
        await deferredActions();

        showBody();

        // // Load realtime
        const client = await supaClerk(token)
        await rpcUser(client);
        rpcRefresh();
    } catch (e) {
        console.error(e);
        if (e.error.redirect) {
            await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
        }
    }
}

pageInit();