/*
 * 2023.12.14.10:51:16
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
    await lsc("../scripts/functions/cmdbar.js", "cmdbar.js")
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
async function getApiKeys(
    {
        token = null, format = 'visible', master = true, accessLevel, permission, limit
    }
) {
    if (!token) {
        token = await supaToken();
    }

    let apiKeysEndpoint = new URL(`https://cmd.illusory.io/v1/apikeys`);
    // Setting default parameters
    let params = new URLSearchParams({
        format: format,
        master: master.toString()
    });

    // Conditionally add additional parameters if they are provided
    if (accessLevel) {
        params.append('accessLevel', accessLevel);
    }
    if (permission) {
        params.append('permission', permission);
    }
    if (limit || limit === 0) {
        params.append('limit', limit);
    }

    // Append the search parameters to the endpoint URL
    apiKeysEndpoint.search = params.toString();

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
    // console.log(data);
    return data;
}

async function rollApiKeys(token, key_id) {
    if (!token) {
        token = await supaToken();
    }
    let apiKeysEndpoint = new URL(`https://cmd.illusory.io/v1/apikeys/key/roll`);
    const response = await fetch(apiKeysEndpoint, {
        method: 'POST', headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({key_id})
    });
    const resJson = await response.json();
    const {message: resMsg} = resJson;
    if (!response.ok) {
        errStatus = 404;
        `Error rolling API key. Please contact support if this issue persists.`
        errData = {};
        await ErrorHandler(errMsg, errData, errStatus);
    }
    sucAlert(`Your request was successful`, `${resMsg}`);
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
                    expiring_soon,
                    total_required,
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
            errAlertSmall(`Reconnecting to realtime updates`);
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


async function maskedApiKeys(type) {
    let master, accessLevel = null, permission = null, limit = 1, format = 'masked';
    if (type === 'master') {
        master = true;
    } else if (type === 'change_ip') {
        master = false;
        accessLevel = 'proxies';
        permission = 'change_ip';
    } else {
        master = false
        accessLevel = 'proxies';
        permission = 'any';
        limit = 0;
    }
    let apiKeyData = await getApiKeys({
        format,
        master,
        accessLevel,
        permission,
        limit
    });

    // Check if apiKeyData.data.apiKeys is an array
    if (Array.isArray(apiKeyData.data.apiKeys)) {
        apiKeyData.data.apiKeys.forEach(apiKey => {
            // Determine the type based on scope.master
            let determinedType = apiKey.master ? 'master' : 'change_ip';

            // If type is undefined or null, or matches the determined type, apply UI changes
            if (type === undefined || type === null || determinedType === type) {
                // Apply UI changes for each matching key or determined type
                // console.log(determinedType);
                $(`[api_key="${determinedType}"]`).val(apiKey.key)
                    .text(apiKey.key)
                    .attr('key_id', apiKey.key_id) // Set the key_id attribute
                    .attr('scope', JSON.stringify(apiKey.scope)); // Set the scope attribute as a JSON string
                $(`[action-btn_copy="${determinedType}"]`).hide();
                $(`[action-btn_reveal="${determinedType}"]`).css('display', 'flex');
            }
        });
    } else {
        console.error('apiKeyData.data.apiKeys is not an array');
        // Handle the case where apiKeyData.data.apiKeys is not an array
    }
}

async function revealApiKey(type) {
    let actionBtnMain = $(`[action-btn_reveal="${type}"]`);
    let actionBtnCopy = $(`[action-btn_copy="${type}"]`);
    let actionIco = $(`[action-btn_ico_reveal="${type}"]`);
    let ldrLottie = $(`[lottie_ldr_reveal="${type}"]`);

    try {
        actionIco.css("background-size", 0);
        ldrLottie.css('display', 'flex');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "loop"}]
        });

        let master, accessLevel = null, permission = null, limit = 1, format = 'visible';
        if (type === 'master') {
            master = true;
        } else if (type === 'change_ip') {
            master = false;
            accessLevel = 'proxies';
            permission = 'change_ip';
        }
        let apiKeyData = await getApiKeys({
            format,
            master,
            accessLevel,
            permission,
            limit
        });

        let apiKey;
        if (master) {
            apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;
        } else if (type === 'change_ip') {
            apiKey = apiKeyData.data.apiKeys.find(key => key.scope.proxies.includes('change_ip'))?.key;
        }

        if (apiKey) {
            $(`[api_key="${type}"]`).val(apiKey).text(apiKey);
        } else {
            console.error('No API key found for the specified type');
            // Handle the case where no API key is found
        }

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
        });

        actionBtnMain.hide();
        actionBtnCopy.css(`display`, `flex`);

    } catch (e) {
        console.error(e);

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
        });

        actionBtnMain.hide();
        actionBtnCopy.css(`display`, `flex`);
    }
}


async function copyApiKey(type) {
    let actionIco = $(`[action-btn_ico_copy="${type}"]`);
    let ldrLottie = $(`[lottie_ldr_copy="${type}"]`);
    try {
        actionIco.css("background-size", 0);
        ldrLottie.css('display', 'flex');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "loop"}]
        });

        let master, accessLevel = null, permission = null, limit = 1, format = 'visible';
        if (type === 'master') {
            master = true;
        } else if (type === 'change_ip') {
            master = false;
            accessLevel = 'proxies';
            permission = 'change_ip';
        }
        let apiKeyData = await getApiKeys({
            format,
            master,
            accessLevel,
            permission,
            limit
        });
        let apiKey;

        if (master) {
            apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;
        } else if (type === 'change_ip') {
            apiKey = apiKeyData.data.apiKeys.find(key => key.scope.proxies.includes('change_ip'))?.key;
        }

        if (apiKey) {
            $(`[api_key="${type}"]`).val(apiKey).text(apiKey);

            // Copy URL to clipboard
            await navigator.clipboard.writeText(apiKey);

            sucAlert(`Your request was successful`,
                `API Key was copied to clipboard. You can use it to authenticate your requests.`,
                `View Docs`
            );

            $(`#sucActionBtn1`).off('click').click(async function () {
                await redirect(`_blank`, `https://illusory.io/docs`, true);
            });
        } else {
            console.error('No API key found for the specified type');
            // Handle the case where no API key is found
            // Add any additional error handling here
        }

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
        });

    } catch (error) {

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
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

async function triggerKeyRoll(type) {
    let actionIco = $(`[action-btn_ico_roll="${type}"]`);
    let ldrLottie = $(`[lottie_ldr_roll="${type}"]`);

    try {
        actionIco.css("background-size", 0);
        ldrLottie.css('display', 'flex');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "loop"}]
        });

        let keyElem = $(`[api_key="${type}"]`)
        let key_id = keyElem.attr('key_id');

        await rollApiKeys(null, key_id);

        await sleep(1000);

        await maskedApiKeys(type);

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
        });

    } catch (e) {
        console.error(e);

        actionIco.css("background-size", "unset");
        ldrLottie.css('display', 'none');

        LottieInteractivity.create({
            player: ldrLottie[0],
            mode: "chain",
            actions: [{state: "stop"}]
        });
    }
}

$(`[action-btn_reveal]`).off('click').click(async function () {
    let type = $(this).attr('action-btn_reveal');
    await revealApiKey(type);
})

$(`[action-btn_copy]`).off('click').click(async function () {
    let type = $(this).attr('action-btn_copy');
    await copyApiKey(type);
})


$(`[action-btn_roll]`).off('click').click(async function () {
    let type = $(this).attr('action-btn_roll');
    await triggerKeyRoll(type);
})

// Deferred functions
async function deferredActions() {
    // Nothing to do here yet
    await maskedApiKeys();
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

        // // Get funds
        await updateUser(user);

        showBody();

        await deferredActions();

        $(".skel_apikey").hide();

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