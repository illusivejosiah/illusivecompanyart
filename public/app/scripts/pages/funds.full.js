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


async function getCustomAmountUrlSearch() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const custom = urlParams.get("custom");
    if (custom && custom >= 5 && !isNaN(custom)) {
        $(`[add_funds_input="custom"]`).val(custom)
        $('[due="total"]').text(`$${custom}`)
            .attr('due_total', custom);
    }
    return;
}


function validateInput(event) {
    let input = event.target;
    let value = input.value || '';
    let newValue = value.replace(/[^0-9]/g, '');  // This will remove anything that's not a digit
    if (newValue !== value) {
        input.value = newValue;
    }
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


async function createPaymentSession(method, amount, token) {
    try {
        if (!token) {
            token = await supaToken();
        }
        const url = new URL(`https://cmd.illusory.io/v1/payments/session`);
        const response = await fetch(url, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }, body: JSON.stringify({
                method,
                amount
            })
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
        errAlert(`There was an error with your request`, `${error.message}`);
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}

function handleInputOrDirectInput(input, currentValue, increment) {
    if (increment) {
        currentValue = currentValue + increment;
    }
    $('[due="total"]').text(`$${currentValue}`)
        .attr('due_total', currentValue);
    let funds = parseInt($('[checkout_funds="total"]').attr('funds_total'), 10);
    $('[checkout_funds="after"]').text(`$${funds + currentValue}`)
    input.change();
}

function handleInput(element) {
    // console.log(`Handling input`)
    let fundsType = $(element).attr('funds_crd');
    let input = $(`[add_funds_input="${fundsType}"]`);

    if (fundsType === `custom`) {
        $(`[funds_crd="custom"]`).addClass('green');
        $(`[add_funds_input="custom"]`).addClass('green').focus();
        $(`[funds_crd="custom_upcoming"]`).removeClass('green');
        $(`[add_funds_input="custom_upcoming"]`).removeClass('green');
        $(`[indicator="fund_option"]`).text('Custom Only Selected');
    } else {
        $(`[funds_crd="custom"]`).removeClass('green');
        $(`[add_funds_input="custom"]`).removeClass('green');
        $(`[funds_crd="custom_upcoming"]`).addClass('green');
        $(`[add_funds_input="custom_upcoming"]`).addClass('green');
        $(`[indicator="fund_option"]`).text('Custom + Upcoming Selected');
    }

    let currentValue = parseInt(input.val(), 10);

    if (isNaN(currentValue)) {
        console.error(`Current value is NaN`);
        currentValue = 5;
        input.val(currentValue);
    }
    if (currentValue < 5) {
        $(`.checkout_next_btn`).hide();
        if (currentValue < 1) {
            input.val(5)
        }
    } else {
        $(`.checkout_next_btn`).show();
    }

    let customInput = parseInt($('[add_funds_input="custom"]').val(), 10);
    let upcomingTotal = parseInt($(`[checkout_upcoming="total_required"]`).attr('total_required'), 10);
    $('[add_funds_input="custom_upcoming"]').val(`${upcomingTotal + customInput}`)

    // Now use the refactored handleInputOrDirectInput function
    handleInputOrDirectInput(input, currentValue);
}

function handleDirectInput(element) {
    let input = $(element);
    let currentValue = parseInt(input.val(), 10);

    if (isNaN(currentValue)) {
        console.error(`Current value is NaN`);
        currentValue = 5;
        input.val(currentValue);
    }
    if (currentValue < 5) {
        $(`.checkout_next_btn`).hide();
    } else {
        $(`.checkout_next_btn`).show();
    }

    let upcomingTotal = parseInt($(`[checkout_upcoming="total_required"]`).attr('total_required'), 10);
    $('[add_funds_input="custom_upcoming"]').val(`${upcomingTotal + currentValue}`)

    // Now use the refactored handleInputOrDirectInput function
    handleInputOrDirectInput(input, currentValue);
}

$('[interval_btn="add_funds"]').click(async function () {
    let input = $(`[add_funds_input="custom"]`);
    let currentValue = parseInt(input.val(), 10);
    input.val(currentValue + 1)
});

$('[interval_btn="sub_funds"]').click(async function () {
    let input = $(`[add_funds_input="custom"]`);
    let currentValue = parseInt(input.val(), 10);
    input.val(currentValue + -1)
});

$('[add_funds_btn]').click(async function () {
    let buttons = $(`[add_funds_btn]`);
    buttons.removeClass('green');
    $(this).addClass('green');
    let input = $(`[add_funds_input="custom"]`);
    let amount = parseInt($(this).attr('add_funds_btn'), 10);
    if (amount === 0) {
        let target = `.fund_crd`;
        handleInput(target);
    } else {
        input.val(amount);
        handleDirectInput(input);
    }
});


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

$('.add_funds_input').on('input', async function () {
    handleDirectInput(this);
});

$('.fund_crd').click(async function () {
    handleInput(this);
});

$('[checkout_btn="continue"]').click(async function () {
    $(`[checkout_container="amount"]`).addClass('hide');
    $(`[checkout_container="options"]`).removeClass('hide');
});

$('[back_btn="options"]').click(async function () {
    $(`[checkout_container="options"]`).addClass('hide');
    $(`[checkout_container="amount"]`).removeClass('hide');
});

$('[payment_method="crypto"]').click(async function () {
    $("#cryptoCrdLoopLdr").show();
    LottieInteractivity.create({
        player: "#cryptoCrdLoopLdr", mode: "chain", actions: [{state: "loop"}]
    });
    const amount = parseInt($('[due="total"]').attr('due_total'), 10);
    try {
        const session = await createPaymentSession('crypto', amount);
        const {redirect_url} = session.data;
        window.location.href = redirect_url;
    } catch (e) {
        console.error(e);
    }
    $("#cryptoCrdLoopLdr").hide();
    LottieInteractivity.create({
        player: "#cryptoCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
    });
});

$('[payment_method="card"]').click(async function () {
    $("#cardCrdLoopLdr").show();
    LottieInteractivity.create({
        player: "#cardCrdLoopLdr", mode: "chain", actions: [{state: "loop"}]
    });
    const amount = parseInt($('[due="total"]').attr('due_total'), 10);
    try {
        const session = await createPaymentSession('card', amount);
        const {redirect_url} = session.data;
        window.location.href = redirect_url;
    } catch (e) {
        console.error(e);
    }
    $("#cardCrdLoopLdr").hide();
    LottieInteractivity.create({
        player: "#cardCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
    });
});

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
    if (total_required > 0) {
        $('[checkout_upcoming="renewing_soon"]').text(`$${renewing_soon}`)
        $('[checkout_upcoming="expiring_soon"]').text(`$${expiring_soon}`)
        $('[checkout_upcoming="total_required"]').text(`$${total_required}`).attr('total_required', total_required)
        let customInput = parseInt($('[add_funds_input="custom"]').val(), 10);
        $('[add_funds_input="custom_upcoming"]').val(`${total_required + customInput}`)
        $(`[funds_crd="custom_upcoming"]`).show();
        $(`[checkout_section="upcoming"]`).show();
    } else {
        $(`[funds_crd="custom_upcoming"]`).hide();
        $(`[checkout_section="upcoming"]`).hide();
    }
    const dueTotal = parseInt($('[due="total"]').attr('due_total'), 10);
    $('[checkout_funds="total"]').text(`$${funds}`)
        .attr('funds_total', funds);
    $('[checkout_funds="after"]').text(`$${funds + dueTotal}`)
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


// Deferred functions
async function deferredActions() {
    // When dom is ready, say hello
    $(document).ready(function () {
        let input = $(`[add_funds_input="custom"]`);
        let customInputVal = parseInt(input.val(), 10);
        let checkFundsAfterVal = parseInt($('[checkout_funds="after"]').text().replace('$', ''), 10);
        if (customInputVal !== checkFundsAfterVal) {
            handleInputOrDirectInput(input, customInputVal);
        }
    });
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


/***
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
        await getCustomAmountUrlSearch();
        const user = await getUser(token);
        showBody();

        const cmdbar = await identifyCmdbar(token);
        const {hmac, user_id} = cmdbar.data;
        // Start cmdbar
        await cmdbarStart(user_id, hmac);

        $(`.cmdbhelp--nav`).off('click').click(async function () {
            window.CommandBar.toggleHelpHub();
        })
        // // Get funds
        await updateUser(user);

        await deferredActions();

        // // Hide skel and show ui
        $(".skel_checkout_funds").hide();

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