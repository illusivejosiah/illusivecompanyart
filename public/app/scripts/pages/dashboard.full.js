/*
 * 2023.12.14.10:51:16
 */

// This function returns a Promise that resolves after a certain delay.
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

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

async function errAlertSmall(message, indicator, showDiv = 'show') {
    $(`[errDiv="small"]`)[showDiv]();
    $('#errTxtSmall').html(message);
    $(`[err_alert_ind="true"]`).removeClass().addClass(`err_alert_ind_small ${indicator}`);
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


async function mountClerk() {
    try {
        const userButtonComponent = document.querySelector('[clerk="user_btn"]');

        const session = await window.Clerk.session
        let name;
        if (!session.user.firstName) {
            name = session.user.primaryEmailAddress.emailAddress
        } else {
            name = session.user.firstName;
        }

        document.querySelector('[clerk="user_btn_text"]').innerHTML = name;

        window.Clerk.mountUserButton(userButtonComponent, {
            userProfileMode: "navigation",
            userProfileUrl: "/app/settings/account",
            afterSignOutUrl: "/app/sign-in",
            afterMultiSessionSingleSignOutUrl: "/app/sign-in",
            afterSwitchSessionUrl: "/app",
        });
    } catch (error) {
        await ErrorHandler(`Error mounting Clerk`, {}, `500`, {
            target: `_self`,
            path: `/app/sign-in`,
            enableBack: false
        });
    }
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
 *? Displays the network status by loading the network display script from a given URL and saving it as a local JavaScript file.
 * @async
 * @function lscNetworkDisplay
 *! @throws {Error} If there is an error while loading the network display script or saving it as a local file.
 */
async function lscNetworkDisplay() {
    await lsc("scripts/functions/networkStatusDisplay.full.js", "networkDisplay.js")
        // .then((val) => console.log(val))
        .catch((err) => console.error(err.message));
}

/**
 * Fetches the "timeago" library from "scripts/functions/timeago.full.min.js"
 * and logs the fetched value on successful fetch or logs the error message on failure.
 * @async
 * @function lscTimeAgo
 ** @returns {Promise<void>} - A promise that resolves when the fetch is successful or rejects with an error message otherwise.
 */
async function lscTimeAgo() {
    await lsc("scripts/functions/timeago.full.min.js", "timeago.full.min.js")
        // .then((val) => console.log(val))
        .catch((err) => console.error(err.message));
}

/**
 * Fetches a Supabase authentication token using the Clerk session token template.
 *
 * @async
 * @function supaToken
 ** @returns {Promise<string>} - The Supabase authentication token.
 *                            If successful, the token will be returned.
 *                            If an error occurs, an "Invalid token" string will be returned.
 *
 * @throws {Error} - If an error occurs during the token retrieval process.
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
 * Creates a Supabase client with the provided token.
 *
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
 * Retrieves the API keys from the server.
 ** @returns {Promise<string>} The API key.
 ! @throws {Error} If there is an error fetching the API keys.
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
    console.log(data);
    return data;
}


/**
 ? Sends a GET request to identify the cmdbar using the given token.
 * @param {string} token - The authentication token used to authorize the request.
 ** @return {Promise<Object>} - A promise that resolves to the cmdbar response object.
 ! @throws {Object} - Throws an object with an 'err' property and 'status' property if the request fails.
 */

async function identifyCmdbar(token) {
    const response = await fetch("https://cmd.illusory.io/v1/cmdbar/identify", {
        "method": "GET", "headers": {Authorization: `Bearer ${token}`}
    })
    if (!response.ok) {
        console.error(`Error validating CommandBar user`, response);
        errStatus = response.status;
        errMsg = `Error validating CommandBar user. Please contact support.`;
        errData = {};
        return await ErrorHandler(errMsg, errData, errStatus);
    }
    return await response.json();
}


/**
 ? Retrieves the first element within the document that matches the specified CSS selector.
 * @param {string} s - The CSS selector used to select the element.
 ** @return {Element} - The first element matching the CSS selector, or null if no match is found.
 */


async function getCurrentProxyUrlSearch() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get("proxy");
}

/**
 ? Global variables
 * @type {Element}
 */

let prxMod = $("#prx_mod");


/**
 ? Format traffic value into human-readable format.
 * @param {number} traffic - The traffic value in bytes.
 ** @returns {string} - The formatted traffic value with appropriate unit (e.g., "1.23 GB").
 */

async function formatTraffic(traffic) {
    if (traffic === 0) {
        return '0 Bytes';
    }

    let thresholds = [[1, 'Bytes', 1], [1024, 'KB', 1024], [1048576, 'MB', 1048576], [1073741824, 'GB', 1073741824], [1099511627776, 'TB', 1099511627776],];

    let [_, suffix, divider] = thresholds.reverse().find(([lowerBound]) => traffic >= lowerBound);

    let divided = parseFloat(traffic) / parseFloat(divider);
    let converted = divided + " " + suffix;

    if (traffic >= 1024) {
        converted = divided.toFixed(2) + " " + suffix;
    }

    return converted;
}

/**
 ? Updates the innerHTML of the element with the specified attribute selector and proxy name.
 * @param {string} selector - The attribute selector to identify the element.
 * @param {string} proxy_name - The value of the attribute to identify the element.
 * @param {any} value - The new value for the innerHTML of the element.
 */
function updateProxyElem(selector, proxy_name, value) {
    document.querySelector(`[${selector}=${proxy_name}]`).innerHTML = value;
}

/**
 ? Updates the attribute value of a given DOM element that matches the provided selector and proxy name.
 * @param {string} selector - The attribute selector to target the specific DOM element.
 * @param {string} proxy_name - The name of the proxy attribute to filter the DOM element.
 * @param {string} attribute - The name of the attribute to be updated.
 * @param {*} value - The new value for the attribute.
 */
function updateProxyAttr(selector, proxy_name, attribute, value) {
    document.querySelector(`[${selector}=${proxy_name}]`).setAttribute(attribute, value);
}


function formatToLocalTime(utcDateStr) {
    // Parse the UTC date string
    let date = new Date(utcDateStr);

    // Get month, day, and year
    let abbreviatedMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let day = date.getDate();
    let month = abbreviatedMonthNames[date.getMonth()];
    let year = date.getFullYear();

    // Format the date part
    let formattedDate = `${month} ${day} ${year}`;

    // Format hours, minutes, and seconds for the time part
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Format the time string
    let formattedTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

    // Combine date and time
    return `${formattedDate} ${formattedTime}`;
}

/**
 * Asynchronously retrieves and processes data from a Supabase database.
 * @async
 * @function proxyActionGetProxies
 * @param {any} supabaseClient - A Supabase client instance.
 ** @returns {Promise<void>} - Returns a Promise that resolves after the data has been retrieved and processed.
 */

async function proxyActionGetProxies(supabaseClient) {
    if (!supabaseClient) {
        supabaseClient = await supaClerk()
    }
    const {data, error} = await supabaseClient
        .from("proxies_restricted")
        .select()
        .order("proxy_name", {ascending: true});
    return new Promise((resolve) => {
        setTimeout(async () => {
            if (error) {
                console.error("we got an error:", error);
            } else {
                let currentProxy = await getCurrentProxyUrlSearch();
                let currentProxyExists = false;
                $(".prx_crds").first().empty();
                let items = await data;
                for (let i = 0; i < items.length; i++) {
                    // Proxies array
                    let {
                        added_at,
                        auto_change,
                        auto_change_time,
                        city,
                        expires_at,
                        h_port,
                        h_threads,
                        isp,
                        last_ip_change,
                        network_status,
                        nickname,
                        proxy_name,
                        s_port,
                        s_threads,
                        traffic
                    } = items[i];

                    // -- Create card
                    let card = $("<div></div>")
                        .attr("prx_card", proxy_name)
                        .addClass("prx_crd_v3 w-clearfix");

                    // -- Add proxy icon wrap (container)
                    let crdIcoCtn = $("<div></div>").addClass("prx_crd_ico_ctn w-clearfix");
                    card.append(crdIcoCtn);

                    // -- Add proxy rotate icon wrap
                    let crdIcoRot = $("<div></div>").addClass("prx_crd_ico_wrp reset")
                        .attr({
                            "onclick": "quickActionReset(this)", "proxy": proxy_name
                        });
                    crdIcoCtn.append(crdIcoRot);

                    // Add proxy rotate icon
                    let rotateImgElem = $("<img>")
                        .attr({
                            "src": "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6d64d6348b93177420253_refresh-cw-01.svg",
                            "proxy_reset_icon": proxy_name,
                        })
                        .addClass("prx_crd_ico_rot");

                    // Create the loader div for the rotating icon
                    let rotateImgLdr = $("<div></div>").addClass("prx_crd_reset_ldr-wrap w-embed")
                        .attr("proxy_reset_ldr_wrap", proxy_name)
                        .html(`<lottie-player class="lottie_ldr prx_crd" proxy_reset_ldr="${proxy_name}" src="https://lottie.host/fb158a1f-7792-4544-bdfe-eaeb7cc509c9/MXhhkYpIxT.json" background="transparent"></lottie-player>`);

                    // Append both the image and loader to the icon wrapper
                    crdIcoRot.append(rotateImgElem).append(rotateImgLdr);

                    // -- Add proxy zap icon wrap
                    let crdIcoZap = $("<div></div>").addClass("prx_crd_ico_wrp settings");
                    crdIcoCtn.append(crdIcoZap);

                    // Add proxy zap icon
                    let zapImgElem = $("<img>")
                        .attr({
                            "src": "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6d776c9c1a624e6f75430_zap.svg",
                        })
                        .addClass("prx_crd_ico_zap");
                    crdIcoZap.append(zapImgElem);

                    // -- Add proxy interact div
                    let crdInteract = $("<div></div>")
                        .addClass("prx_crd_interact w-clearfix")
                        .attr({
                            "onclick": "interact(this)", "interact": proxy_name
                        });
                    card.append(crdInteract);

                    // -- Add proxy card title wrap
                    let cardTitleWrap = $("<div></div>").addClass("prx_crd_tit_wrp w-clearfix");
                    card.append(cardTitleWrap);

                    // Add proxy image wrap
                    let crdImg = $("<div></div>").addClass("prx_crd_img_wrp w-clearfix");
                    cardTitleWrap.append(crdImg);

                    // Add proxy image
                    let crdImgElem = $("<img>")
                        .attr("src", "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6c4bafd787ea107133530_iphone-14-drk.svg")
                        .addClass("prx_crd_phone");
                    crdImg.append(crdImgElem);

                    // Add proxy card title subwrap
                    let cardTitSubwrap = $("<div></div>").addClass("prx_crd_tit_subwrp w-clearfix");
                    cardTitleWrap.append(cardTitSubwrap);

                    // Add proxy card title + nickname wrap
                    let cardTitNnameWrp = $("<div></div>").addClass("prx_crd_tit_nname_wrp w-clearfix");
                    cardTitSubwrap.append(cardTitNnameWrp);

                    // Add proxy card nickname
                    let cardNicknameText = $("<div></div>")
                        .addClass("prx_crd_nkname_txt")
                        .html("`" + nickname + "`")
                        .attr("crd_nickname", proxy_name)

                    if (nickname) {
                        cardNicknameText.html("`" + nickname + "`").show();
                    } else {
                        cardNicknameText.hide();
                    }

                    cardTitNnameWrp.append(cardNicknameText);

                    // Add proxy card title
                    let cardTitleText = $("<div></div>")
                        .addClass("prx_crd_tit_v2")
                        .html(proxy_name)
                        .attr("crd_tit", proxy_name);
                    cardTitNnameWrp.append(cardTitleText);

                    // Add proxy card subtitle
                    let cardSubTitle = $("<div></div>")
                        .addClass("prx_crd_subtit")
                        .attr("crd_ports", proxy_name)
                        .html("HTTP " + h_port + " • " + "SOCKS5 " + s_port);
                    cardTitSubwrap.append(cardSubTitle);

                    // -- Add proxy card details grid
                    let cardDetGrid = $("<div></div>").addClass("prx_crd_det_grid w-layout-grid");
                    card.append(cardDetGrid);

                    // -- Add proxy city (group 1)
                    let cardCityGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardCityGrp);

                    // Add proxy city (subheader)
                    let cardCitySubh = $("<div></div>").addClass("prx_crd_det_subh").html("Location");
                    cardCityGrp.append(cardCitySubh);

                    // Add proxy city (text)
                    let cardCityText = $("<div></div>").addClass("prx_crd_det_text").html(city).attr("crd_city", proxy_name);
                    cardCityGrp.append(cardCityText);

                    // -- Add proxy last ip change (group 2)
                    let cardLastIpGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardLastIpGrp);

                    // Add proxy last ip change (subheader)
                    let cardLastIpSubh = $("<div></div>").addClass("prx_crd_det_subh").html("Last IP Change");
                    cardLastIpGrp.append(cardLastIpSubh);

                    // Add proxy last ip change (text)
                    let cardLastIpText = $("<div></div>")
                        .addClass("prx_crd_det_text last_ip_change")
                        .attr({
                            "datetime": last_ip_change, "crd_last_ip_change": proxy_name
                        })
                        .html("updating");
                    cardLastIpGrp.append(cardLastIpText);

                    // -- Add proxy auto change (group 3)
                    let cardAutoChangeGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardAutoChangeGrp);

                    // Add proxy auto change (subheader)
                    let cardAutoChangeSubh = $("<div></div>").addClass("prx_crd_det_subh").html("Auto Change");
                    cardAutoChangeGrp.append(cardAutoChangeSubh);

                    let autoChangeTime = !auto_change ? "Off" : "Every " + auto_change_time + "M";

                    // Add proxy auto change (text)
                    let cardAutoChangeText = $("<div></div>").addClass("prx_crd_det_text").html(autoChangeTime).attr("crd_auto_change", proxy_name);
                    cardAutoChangeGrp.append(cardAutoChangeText);

                    // -- Add proxy threads (group 4)
                    let cardThreadsGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardThreadsGrp);

                    // Add proxy threads (subheader)
                    let cardThreadsSubh = $("<div></div>").addClass("prx_crd_det_subh").html("Live Threads");
                    cardThreadsGrp.append(cardThreadsSubh);

                    // Add proxy threads (text)
                    let totalThreads = (parseInt(h_threads) + parseInt(s_threads)).toString();
                    let cardThreadsText = $("<div></div>").addClass("prx_crd_det_text").html(totalThreads).attr("crd_threads", proxy_name);
                    cardThreadsGrp.append(cardThreadsText);

                    // -- Add proxy usage (group 5)
                    let cardUsageGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardUsageGrp);

                    // Add proxy usage (subheader)
                    let cardUsageSubh = $("<div></div>").addClass("prx_crd_det_subh").html("Data Used");
                    cardUsageGrp.append(cardUsageSubh);

                    let converted = await formatTraffic(traffic);

                    // Add proxy `usage` (text)
                    let cardUsageText = $("<div></div>").addClass("prx_crd_det_text").html(converted).attr("crd_traffic", proxy_name);
                    cardUsageGrp.append(cardUsageText);

                    // -- Add proxy `data left` (group 6)
                    let cardDataLeftGrp = $("<div></div>").addClass("prx_crd_det_grp");
                    cardDetGrid.append(cardDataLeftGrp);

                    // Add proxy `data left` (subheader)
                    let cardDataLeftSubh = $("<div></div>").addClass("prx_crd_det_subh").html("Data Left");
                    cardDataLeftGrp.append(cardDataLeftSubh);

                    // Add proxy `data left` (image)
                    let cardDataLeftElem = $("<img>")
                        .attr("src", "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6bda55035e565c3f0d3da_infinity.svg")
                        .addClass("prx_crd_data_left_img");
                    cardDataLeftGrp.append(cardDataLeftElem);

                    // -- Add proxy indicators wrap
                    let indWrap = $("<div></div>").addClass("ind_wrp_v3 w-clearfix");
                    card.append(indWrap);

                    // - Add proxy indicators subwrap (left)
                    let indSubwrapLeft = $("<div></div>").addClass("ind_subwrp_left w-clearfix");
                    indWrap.append(indSubwrapLeft);

                    // Add proxy `ISP` indicator wrap
                    let indIspWrap = $("<div></div>").addClass("ind_det_wrp");
                    indSubwrapLeft.append(indIspWrap);

                    const ispColors = {
                        "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink"
                    };

                    let ispColor = ispColors[isp] || "";

                    // Add proxy `ISP` indicator text
                    let indIsp = $("<div></div>").addClass(`ind_det ${ispColor}`).html(isp).attr("crd_isp", proxy_name);
                    indIspWrap.append(indIsp);

                    // Add proxy `online` indicator wrap
                    let indOnlineWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
                    indSubwrapLeft.append(indOnlineWrap);

                    let networkColor = await setNetworkStatusColor(network_status, null);

                    // Add proxy `online` indicator text
                    let indOnline = $("<div></div>").addClass(`ind_det ${networkColor.curOnlineColor}`).html(network_status).attr("crd_online", proxy_name);
                    indOnlineWrap.append(indOnline);

                    // - Add proxy indicators subwrap (right)
                    let indSubwrapRight = $("<div></div>").addClass("ind_subwrp_right w-clearfix");
                    indWrap.append(indSubwrapRight);

                    // Add proxy `added` indicator wrap
                    let indAddedWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
                    indSubwrapRight.append(indAddedWrap);

                    // Add proxy `added` indicator text
                    let indAdded = $("<div></div>").addClass("ind_det added_at grey").attr({
                        "datetime": added_at, "crd_added": proxy_name
                    }).html("updating");
                    indAddedWrap.append(indAdded);

                    // Add proxy `expires` indicator wrap
                    let indExpiresWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
                    indSubwrapRight.append(indExpiresWrap);

                    let currentDate = new Date();
                    let itemDate = new Date(expires_at);
                    let diffInDays = (itemDate - currentDate) / (1000 * 60 * 60 * 24);

                    let expireColor = expires_at && diffInDays > 1 ? "grey" : "orange";

                    // Add proxy `expires` indicator text
                    let indExpires = $("<div></div>").addClass(`ind_det ${expireColor} expires_at`).attr({
                        "datetime": expires_at, "crd_expires": proxy_name
                    }).html("updating");
                    indExpiresWrap.append(indExpires);

                    // Add proxy info icon on `expires` indicator
                    let infoImgExpires = $("<img>").attr({
                        "src": "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6d137c5e0af10f266c1ed_info-circle-duo-2.svg",
                        "crd_expires_info_icon": proxy_name,
                    }).addClass("info_circle_duo-icon");

                    // Create the outer div with class 'info-wrap' and attribute 'crd_expires_tip'
                    let infoWrap = $("<div></div>").addClass("info-wrap prx_crd_expires")
                        .attr("crd_expires_tip", proxy_name);

                    // Create the first inner div with class 'info_grid-wrap'
                    let infoGridWrap = $("<div></div>").addClass("info_grid-wrap");
                    infoWrap.append(infoGridWrap);

                    // Create the first grid item with class 'info_grid-item'
                    let infoGridItem = $("<div></div>").addClass("w-layout-grid info_grid-item one")
                        .attr("crd_expires_info", proxy_name);
                    infoGridWrap.append(infoGridItem);

                    let localTime = formatToLocalTime(expires_at);

                    // Add the text for the first grid item
                    let infoItemText = $("<div></div>").addClass("info_item-text")
                        .attr("crd_expires_info_text", proxy_name)
                        .text(localTime);
                    infoGridItem.append(infoItemText);

                    // Create the second grid item with class 'info_grid-item-explain'
                    let infoGridItemExplain = $("<div></div>").addClass("w-layout-grid info_grid-item-explain one")
                        .attr("crd_expires_explain", proxy_name);
                    infoGridWrap.append(infoGridItemExplain);

                    // Add the description text for the second grid item
                    let infoItemDescription = $("<div></div>").addClass("info_item-text explain")
                        .attr("crd_expires_explain_text", proxy_name)
                        .text("The time at which this proxy expires in Standard Time.");
                    infoGridItemExplain.append(infoItemDescription);

                    // Append the constructed element to 'indExpiresWrap' after 'infoImgExpires'
                    indExpiresWrap.append(infoImgExpires, infoWrap);

                    $(".prx_crds").first().append(card);

                    if (proxy_name == currentProxy) {
                        // console.log("Current proxy exists")
                        currentProxyExists = true;
                        let currentProxyElem = document.querySelector(`[interact=${proxy_name}]`);
                        interact(currentProxyElem);
                    }
                }

                // Once all proxies have been added, check if the current proxy exists
                if (!currentProxyExists) {
                    // If the current proxy does not exist, redirect to the first proxy in the list
                    let url = new URL(window.location.href);
                    url.searchParams.delete("proxy");
                    window.history.replaceState({}, document.title, url);
                    // Set attribute
                    prxMod.attr("open", false);
                    // Resize dashboard
                    resizeDash(false);
                }
            }
            resolve();
        }, 200);
    });
}


/**
 ? Proxies RPC Proxy method.
 * @param {Object} supabaseClient - The Supabase client object.
 ** @return {Promise} - A promise representing the completion of the method.
 */
async function rpcProxy(client) {
    if (!client) {
        client = await supaClerk()
    }
    await client.channel('proxies_restricted')
        .on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: 'proxies_restricted'
        }, async (payload) => {
            const {
                proxy_name,
                nickname,
                network_status,
                expires_at,
                added_at,
                auto_renew,
                period,
                auth_method,
                auto_change,
                auto_change_time,
                h_port,
                h_threads,
                city,
                state,
                country,
                isp,
                last_auto_check,
                last_ip_change,
                last_reboot,
                next_ip_change,
                ipv4,
                online_webhook,
                password,
                product,
                proxy_admin,
                s_port,
                s_threads,
                server_ip,
                traffic,
                username,
                whitelist
            } = payload.new;

            // console.log(payload);

            let converted = await formatTraffic(traffic);

            let autoChangeTime;
            autoChangeTime = !auto_change ? "Off" : `Every ${auto_change_time}M`;

            let localTime = formatToLocalTime(expires_at);

            let currentDate = new Date();
            let itemDate = new Date(expires_at);
            let diffInDays = (itemDate - currentDate) / (1000 * 60 * 60 * 24);

            let expireColor = expires_at && diffInDays > 1 ? "grey" : "orange";

            $(`[crd_ports=${proxy_name}]`).html(`HTTP ${h_port} • SOCKS5 ${s_port}`);
            $(`[crd_isp=${proxy_name}]`).html(isp);
            $(`[crd_city=${proxy_name}]`).html(city);
            $(`[crd_threads=${proxy_name}]`).html(parseInt(h_threads) + parseInt(s_threads));
            $(`[crd_traffic=${proxy_name}]`).html(converted);
            $(`[crd_auto_change=${proxy_name}]`).html(autoChangeTime);
            $(`[crd_last_ip_change=${proxy_name}]`).attr("datetime", last_ip_change);
            $(`[crd_added=${proxy_name}]`).attr("datetime", added_at);
            $(`[crd_expires=${proxy_name}]`).attr("datetime", expires_at)
                .removeClass("grey orange").addClass(expireColor);
            $(`[crd_expires_info_text=${proxy_name}]`).html(localTime);

            getNetworkStatus(proxy_name, network_status, 'crd');

            const currentProxy = await getCurrentProxyUrlSearch();

            if (currentProxy == proxy_name) {
                // console.log("Current proxy is selected");
                getNetworkStatus(proxy_name, network_status, 'cp');
                $("#currentProxy").html(proxy_name);
                $("#cp-auto-changeTime").val(auto_change_time);
                $("#cp-header-isp").html(isp);
                $("#cp-header-added").attr("datetime", added_at)
                $("#cp-header-expires").attr("datetime", expires_at)
                    .removeClass("grey orange").addClass(expireColor);
                $("#cp-specs-isp").html(isp);
                $("#cp-specs-loc").html(city + ", " + state);
                $("#cp-usage-threads").html(s_threads + h_threads + " Threads");
                $("#cp-usage-traffic").html(converted);
                $("#cp-activity-lastReset").html(last_ip_change)
                    .attr("datetime", last_ip_change);
                $("#cp-activity-lastReboot").html(last_reboot)
                    .attr("datetime", last_reboot);
                $("#cp-expiration-date").html(expires_at)
                    .attr("datetime", expires_at);
                $("#cp-expiration-local").html(localTime)
                $("#cp-expiration-period").html(period);
                $("#cp-auth-uname").html(username);
                $("#cp-auth-pword").html(password);
                $("#cp-basic-unameInput").val(username);
                $("#cp-basic-pwordInput").val(password);
                // $("#whitelistIp").val(whitelist);
                $("#cp-connect-serverIp").html(server_ip);
                $("#cp-connect-httpPort").html(h_port);
                $("#cp-connect-socksPort").html(s_port);
                $(`[modal_expires="info"]`).html(localTime);

                if (auto_renew) {
                    $("#cp-expiration-renew").html("On");
                } else {
                    $("#cp-expiration-renew").html("Off");
                }

                const cpElements = ["cp-header-added", "cp-header-expires", "cp-expiration-date", "cp-activity-lastReset", "cp-activity-lastReboot", "cp-activity-added"].map(selector => document.querySelector(selector));
                await cpElements.forEach(el => timeago.cancel(el));
            }

            const crdElems = [`[crd_last_ip_change=${proxy_name}]`, `[crd_added=${proxy_name}]`, `[crd_expires=${proxy_name}]`].map(selector => document.querySelector(selector));
            await crdElems.forEach(el => timeago.cancel(el));

            async function otherFuntions() {
                if (currentProxy == proxy_name) {
                    await getTimeAgoModalExpires()
                    await getTimeAgoModalAdded()
                    await getTimeAgoModal();
                }
                await getTimeAgoManual();
                await getTimeAgoExpires();
                await getTimeAgoAdded();
            }

            await otherFuntions();

        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
            }
        })
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

/**
 ? Refreshes the RPC Proxy.
 ? If it has been less than 50 seconds since the last refresh, returns without doing anything.
 ? If it has been 50 seconds or more since the last refresh, refreshes the RPC Proxy.
 ** @return {Promise<void>} A Promise that resolves once the RPC Proxy is refreshed.
 */
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
            const client = await supaClerk();
            await rpcProxy(client);
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
            // If tab is not visible or if the inactivity alert is shown, stop the RPC process

            if (document.visibilityState !== 'visible') {
                // If the tab is not visible, set a timeout to run supabase.removeAllChannels() after 2 minutes

                // Set a timeout to run supabase.removeAllChannels() after 2 minutes
                removeChannelsTimeout = setTimeout(async () => {
                    // console.log('Removing all channels');
                    try {
                        // console.log('Removing all channels');
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
    await rpcProxy(client);
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


/**
 ? Registers a locale function and renders the time ago for the selected elements.
 * @param {function} localeFunc - The locale function to register.
 * @param {string} selector - The CSS selector for the elements to render the time ago.
 ** @return {Promise<string>} - A promise that resolves to a success message after rendering the time ago.
 */
async function registerAndRenderTimeAgo(localeFunc, selector) {
    return new Promise((resolve) => {
        timeago.register("en_US", localeFunc);
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => timeago.render(element));
        resolve(`Set time ago for ${selector}...`);
    });
}

// Modal TimeAgo
function modal_locale(number, index, totalSec) {
    return [["just now", "right now"], ["%s seconds ago", "%s seconds"], ["1 minute ago", "1 minute"], ["%s minutes ago", "%s minutes"], ["1 hour ago", "1+ hour"], ["%s hours ago", "%s+ hours"], ["1 day ago", "1+ day"], ["%s days ago", "%s+ days"], ["1 week ago", "1 week"], ["%s weeks ago", "%s+ weeks"], ["1 month ago", "1+ month"], ["%s months ago", "%s months"], ["1 year ago", "1 year"], ["%s years ago", "%s years"],][index];
}

async function getTimeAgoModal() {
    return registerAndRenderTimeAgo(modal_locale, "#cp-expiration-date, #cp-activity-lastReset, #cp-activity-lastReboot, #cp-activity-added");
}

// Page TimeAgo - Expired TimeAgo
function expires_locale(number, index, totalSec) {
    return [["expired just now", "expires right now"], ["expired %ss ago", "expires %ss"], ["expired 1m ago", "expires 1m"], ["expired %sm ago", "expires %sm"], ["expired 1h ago", "expires 1h+"], ["expired %sh ago", "expires %sh+"], ["expired 1 day ago", "expires 1d+"], ["expired %sd ago", "expires %sd"], ["expired 1wk ago", "expires 1wk+"], ["expired %swk ago", "expires %swk+"], ["expired 1mo ago", "expires 1mo+"], ["expired %smo ago", "expires %smo+"], ["expired 1yr ago", "expires 1yr"], ["expired %syr ago", "expires %syr"],][index];
}

async function getTimeAgoModalExpires() {
    return registerAndRenderTimeAgo(expires_locale, "#cp-header-expires");
}


async function getTimeAgoExpires() {
    return registerAndRenderTimeAgo(expires_locale, ".expires_at");
}

// Page TimeAgo - Change IP TimeAgo
function ipchange_locale(number, index, totalSec) {

    return [["just now", "right now"], ["%ss ago", "%s secs"], ["1m ago", "in 1 min"], ["%sm ago", "in %s mins"], ["1h ago", "in 1 hr"], ["%sh ago", "in %s hrs"], ["1d ago", "in 1 day"], ["%sd ago", "in %s days"], ["1wk ago", "in 1 wk"], ["%swk ago", "in %s wks"], ["1mo ago", "in 1 mo"], ["%smo ago", "in %s mos"], ["1yr ago", "in 1 yr"], ["%syr ago", "in %s yrs"],][index];
}

async function getTimeAgoManual() {
    return registerAndRenderTimeAgo(ipchange_locale, ".last_ip_change");
}

// Page TimeAgo - Change `added_at` TimeAgo
function added_locale(number, index, totalSec) {
    return [["added just now", "right now"], ["added %ss ago", "%ss"], ["added 1m ago", "1m"], ["added %sm ago", "in %sm"], ["added 1h ago", "1h"], ["added %sh ago", "%sh"], ["added 1d ago", "1d"], ["added %sd ago", "%sd"], ["added 1wk ago", "1wk"], ["added %swk ago", "%swk"], ["added 1mo ago", "1mo"], ["added %smo ago", "%smo"], ["added 1yr ago", "1yr"], ["added %syr ago", "%syr"],][index];
}

async function getTimeAgoAdded() {
    return registerAndRenderTimeAgo(added_locale, ".added_at");
}

async function getTimeAgoModalAdded() {
    return registerAndRenderTimeAgo(added_locale, "#cp-header-added");
}

// Page TimeAgo - Auto Refresh TimeAgo
function auto_locale(number, index, totalSec) {
    return [["auto changed ip just now", "auto-changing ip right now"], ["auto changed ip %s secs ago", "auto-changing ip in %s sec"], ["auto changed ip 1 min ago", "auto-changing ip in 1 min"], ["auto changed ip %s mins ago", "auto-changing ip in %s min"], ["auto changed ip 1 hrs ago", "auto-changing ip in 1 hrs"], ["auto changed ip %s hrs ago", "auto-changing ip in %s hrs"], ["auto changed ip 1 day ago", "auto-changing ip in 1 day"], ["auto changed ip %s days ago", "auto-changing ip in %s days"], ["auto changed ip 1 wk ago", "auto-changing ip in 1 wk"], ["auto changed ip %s wks ago", "auto-changing ip in %s wks"], ["auto changed ip 1 mos ago", "auto-changing ip in 1 mos"], ["auto changed ip %s mos ago", "auto-changing ip in %s mos"], ["auto changed ip 1 yr ago", "auto-changing ip in 1 yr"], ["auto changed ip %s yrs ago", "auto-changing ip in %s yrs"],][index];
}

async function getTimeAgoAuto() {
    const on = document.querySelectorAll(".auto_change_on");
    if (on.length > 0) {
        return registerAndRenderTimeAgo(auto_locale, ".auto_change_on");
    } else {
        // // console.log("No auto change on");
    }
}

async function quickActionReset(clicked_object) {
    let proxy = clicked_object.getAttribute("proxy");
    let actionIcon = $(`[proxy_reset_icon="${proxy}"]`)
    let ldrWrp = $(`[proxy_reset_ldr_wrap="${proxy}"]`)
    actionIcon.hide();
    ldrWrp.show();
    LottieInteractivity.create({
        player: `[proxy_reset_ldr="${proxy}"]`, mode: "chain", actions: [{state: "loop"}]
    });
    try {
        await proxyActionChangeIp(proxy);
    } catch (e) {
        ldrWrp.hide();
        actionIcon.show();
        LottieInteractivity.create({
            player: `[proxy_reset_ldr="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
        });
        if (e.error.redirect) {
            await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
        }
    }
    ldrWrp.hide();
    actionIcon.show();
    LottieInteractivity.create({
        player: `[proxy_reset_ldr="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
    });
}

/**
 ? Opens a modal and retrieves details for a clicked object.
 * @param {object} clicked_object - The object that was clicked.
 ** @returns {Promise} A promise that resolves with the modal details.
 */
async function interact(clicked_object) {
    await openModal();
    $(`.prx_crd_v3`).removeClass("green");
    let proxy = clicked_object.getAttribute("interact");
    $(`[prx_card="${proxy}"]`).addClass("green");
    const client = await supaClerk()
    const {data, error} = await client
        .from("proxies_restricted")
        .select()
        .eq("proxy_name", proxy);

    document.title = proxy; // New title :)
    // Construct URLSearchParams object instance from current URL querystring.
    let queryParams = new URLSearchParams(window.location.search);
    // Set new or modify existing parameter value.
    queryParams.set("proxy", proxy);
    // Replace current querystring with the new one.
    history.replaceState(null, null, "?" + queryParams.toString());


    return new Promise(async (resolve) => {
        if (error) {
            $("#successMsg").hide();
            $("#errorMsg").hide();
            $("#errorMsg").show();
            $("#errorTxt").html(error.response.data.message);
            console.error(error);
        } else {

            const {
                nickname,
                expires_at,
                added_at,
                auto_renew,
                period,
                ipv4,
                username,
                password,
                server_ip,
                network_status,
                h_port,
                s_port,
                whitelist,
                last_ip_change,
                last_reboot,
                s_threads,
                h_threads,
                isp,
                traffic,
                auto_change,
                auto_change_time,
                auth_method,
                city,
                state,
                country
            } = data[0];

            let converted = await formatTraffic(traffic);

            let localTime = formatToLocalTime(expires_at);

            let currentDate = new Date();
            let itemDate = new Date(expires_at);
            let diffInDays = (itemDate - currentDate) / (1000 * 60 * 60 * 24);

            let expireColor = expires_at && diffInDays > 1 ? "grey" : "orange";

            if (nickname) {
                $("#cp-header-nickname").html("`" + nickname + "`");
            } else {
                $("#cp-header-nickname").html("`EDIT NICKNAME`");
            }

            $("#currentProxy").html(proxy);
            $("#cp-header-isp").html(isp);
            $("#cp-header-added").attr("datetime", added_at)
            $("#cp-header-expires").html(`${expires_at}`)
                .attr("datetime", expires_at)
                .removeClass("grey orange").addClass(expireColor);
            $("#cp-auto-changeTime").val(auto_change_time);
            $("#cp-specs-loc").html(city + ", " + state);
            $("#cp-usage-threads").html(s_threads + h_threads + " Threads");
            $("#cp-usage-traffic").html(converted);
            $("#cp-activity-lastReset").html(last_ip_change)
                .attr("datetime", last_ip_change);
            $("#cp-activity-lastReboot").html(last_reboot)
                .attr("datetime", last_reboot);
            $("#cp-activity-added").html(added_at)
                .attr("datetime", added_at);
            $("#cp-expiration-date").html(expires_at)
                .attr("datetime", expires_at);
            $("#cp-expiration-local").html(localTime)
            $("#cp-expiration-period").html(period);
            $("#cp-auth-uname").html(username);
            $("#cp-auth-pword").html(password);
            $("#cp-auth-whitelist").html(whitelist);
            $("#cp-basic-unameInput").val(username);
            $("#cp-basic-pwordInput").val(password);
            $("#cp-whitelist-ipInput").val(whitelist);
            $("#cp-connect-serverIp").html(server_ip);
            $("#cp-connect-httpPort").html(h_port);
            $("#cp-connect-socksPort").html(s_port);
            $("#cp-specs-isp").html(isp);
            $(`[modal_info="expires"]`).html(localTime);
            getNetworkStatus(proxy, network_status, 'cp');
            //$("#cp-header-network").html(network_status);

            // Determine `ISP` color
            const ispColors = {
                "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink",
            };
            const ispPrevColors = ["blue", "red", "pink", "grey"];
            const ispColor = ispColors[isp];
            $("#cp-header-isp").removeClass(ispPrevColors.join(' '))
                .addClass(ispColor);  // Add new class

            if (auto_change) {
                $("#cp-tog-auto-ip").attr("enabled", "true")
                    .removeClass("off")
                    .addClass("on");
                $("#autoChangeOnLine, #autoChangeOnRow").show();

            } else {
                $("#cp-tog-auto-ip").attr("enabled", "false")
                    .removeClass("on")
                    .addClass("off");
                $("#autoChangeOnLine, #autoChangeOnRow").hide();
            }

            if (ipv4) {
                $("#cp-tog-ipv4").attr("enabled", "true")
                    .removeClass("off")
                    .addClass("on");
            } else {
                $("#cp-tog-auto-ip").attr("enabled", "false")
                    .removeClass("on")
                    .addClass("off");
            }

            if (auto_renew) {
                $("#cp-expiration-renew").html("On");
            } else {
                $("#cp-expiration-renew").html("Off");
            }

            if (auth_method == "basic") {
                const defaultBtn = $("#modAuthBasBtn");
                defaultBtn.attr({
                    "default": "true",
                    "active": "true"
                })
                    .addClass("green");
                $('.auth_basic_input_wrp').show();   // Show the basic input wrapper
                $('.auth_whitelist_input_wrp').hide();  // Hide the whitelist input wrapper
                $('#modAuthDispWhli').hide();
                const altBtn = $("#modAuthWhliBtn");
                altBtn.attr({
                    "default": "false",
                    "active": "false"
                })
                    .removeClass("green");
                $('#modAuthDispBas').show();
                $("#cp-auth-method").html("Basic (Username & Password)");
                // console.log("Basic auth method")
            } else {
                const defaultBtn = $("#modAuthWhliBtn");
                defaultBtn.attr({
                    "default": "true",
                    "active": "true"
                })
                    .addClass("green");
                $('.auth_whitelist_input_wrp').show();  // Show the whitelist input wrapper
                $('.auth_basic_input_wrp').hide();  // Hide the basic input wrapper
                $('#modAuthDispBas').hide();
                const altBtn = $("#modAuthBasBtn");
                altBtn.attr({
                    "default": "false",
                    "active": "false"
                })
                    .removeClass("green");
                $('#modAuthDispWhli').show();
                $("#cp-auth-method").html("Whitelist (IP Address)");
                // console.log("Whitelist auth method")
            }

            async function loadModalItems() {
                await getTimeAgoModal();
                await getTimeAgoModalExpires();
                await getTimeAgoModalAdded();
                await hide_skel_mod();
            }

            loadModalItems();
        }
        setTimeout(() => {
            resolve("Got modal details...");
        }, 100);
    });
}


$("#close_mod").on('click', function () {
    $(`.prx_crd_v3`).removeClass("green");
    // // console.log("close_mod clicked");
    // Get the current URL
    const url = new URL(window.location.href);

    // Get the URL parameters
    const urlParams = new URLSearchParams(url.search);

    // Check if the parameter exists
    if (urlParams.has('proxy')) {
        // Remove the parameter
        urlParams.delete('proxy');

        // Update the URL with the modified parameters
        url.search = urlParams.toString();

        // Replace the current URL with the modified one
        window.history.replaceState(null, '', url.toString());
    }
    // Set attribute
    prxMod.attr("open", false);
    // Resize dashboard
    resizeDash(false);
    // Clear modal
    modalAuthOptions('close')
});


/**
 ? Performs an action on a proxy with the specified parameters.
 * @param {string} proxy_name - The name of the proxy.
 * @param {string} action - The action to perform on the proxy.
 * @param {string} ldrSelector - The selector of the loader element.
 * @param {string} actionBtnIco - The selector of the action button icon element.
 */
let modProxyActionRunning;

async function modProxyActionBtnLdr(proxy_name, action, ldrSelector, actionBtnIco) {
    if (modProxyActionRunning) {
        return;
    }
    try {
        modProxyActionRunning = true;

        $(actionBtnIco).css("background-size", 0);
        $(ldrSelector).css('display', 'flex');
        LottieInteractivity.create({
            player: ldrSelector, mode: "chain", actions: [{state: "loop"}]
        });

        let actions = {
            "change_ip": proxyActionChangeIp,
            "copy_change_link": proxyActionCopyChangeLink,
            "power_cycle": proxyActionPowerCycle,
        }

        if (actions.hasOwnProperty(action)) {
            await actions[action](proxy_name); // Call the function associated with the action
        }

        $(actionBtnIco).css("background-size", "unset");
        $(ldrSelector).css('display', 'none');
        LottieInteractivity.create({
            player: ldrSelector, mode: "chain", actions: [{state: "stop"}]
        });
        modProxyActionRunning = false;
    } catch (e) {
        $(actionBtnIco).css("background-size", "unset");
        $(ldrSelector).css('display', 'none');
        LottieInteractivity.create({
            player: ldrSelector, mode: "chain", actions: [{state: "stop"}]
        });
        modProxyActionRunning = false;
        console.error(e);
    }
}


/**
 ? Modifies and updates an automatic change loader with specified parameters.
 * @param {string} proxy_name - The name of the proxy.
 * @param {boolean} enable - Indicates whether to enable the automatic change.
 * @param {number} rate - The rate at which the automatic change should occur.
 * @param {string} ldrSelector - The selector of the loader element.
 ** @return {Promise} - A promise that resolves when the loader is updated successfully, or rejects with an error if an error occurs.
 */
let modAutoChgLdrTimeout1;
let modAutoChgLdrTimeout2;

function modAutoChangeUpdateLdr(proxy_name, enable, rate, ldrSelector) {
    // Show the animation
    $(ldrSelector).show();

    LottieInteractivity.create({
        player: ldrSelector, mode: "chain", actions: [{state: "autoplay"}]
    });

    // If there's an existing first timeout, clear it
    if (modAutoChgLdrTimeout1) {
        clearTimeout(modAutoChgLdrTimeout1);
    }

    // If there's an existing second timeout, clear it
    if (modAutoChgLdrTimeout2) {
        clearTimeout(modAutoChgLdrTimeout2);
    }

    return new Promise((resolve, reject) => {
        modAutoChgLdrTimeout1 = setTimeout(async () => {
            try {
                await proxyActionUpdateAutoChange(proxy_name, enable, rate);
                resolve();
            } catch (error) {
                reject(error);
            }
        }, 2000);

        modAutoChgLdrTimeout2 = setTimeout(() => {
            // Hide the animation
            $(ldrSelector).hide();
        }, 2500); // Make sure this time is at least larger than the delay in the first setTimeout to allow animations to run for that period.
    });
}


/**
 ? Update IPv4 LDR.
 * @param {string} proxy_name - The name of the proxy.
 * @param {boolean} enable - Whether to enable or disable IPv4 LDR.
 * @param {string} ldrSelector - The selector for the LDR element.
 ** @return {Promise<void>} A promise that resolves when the update is successful and rejects when there is an error.
 */

let modIpv4TogLdrTimeout1;
let modIpv4TogLdrTimeout2;

function modIpv4UpdateLdr(proxy_name, enable, ldrSelector) {
    // Show the animation
    $(ldrSelector).show();

    LottieInteractivity.create({
        player: ldrSelector, mode: "chain", actions: [{state: "autoplay"}]
    });

    // If there's an existing first timeout, clear it
    if (modIpv4TogLdrTimeout1) {
        clearTimeout(modIpv4TogLdrTimeout1);
    }

    // If there's an existing second timeout, clear it
    if (modIpv4TogLdrTimeout2) {
        clearTimeout(modIpv4TogLdrTimeout2);
    }

    return new Promise((resolve, reject) => {
        modIpv4TogLdrTimeout1 = setTimeout(async () => {
            try {
                await proxyActionUpdateIpv4(proxy_name, enable);
                resolve();
            } catch (error) {
                reject(error);
            }
        }, 2000);

        modIpv4TogLdrTimeout2 = setTimeout(() => {
            // Hide the animation
            $(ldrSelector).hide();
        }, 2500);   //Consider making this at least larger than the delay in the first setTimeout to allow animations to run for that period.
    });
}

$("#cp-tog-auto-ip").on('click', async function () {
    const autoIpTog = $("#cp-tog-auto-ip").attr("enabled");
    let proxy_name = await getCurrentProxyUrlSearch(), enable, rate, ldrSelector, prevEnable, prevRemoveClass,
        prevAddClass, prevDisplay;
    if (autoIpTog === "false") {
        enable = true;
        $("#cp-auto-changeTime").val(10);
        rate = 10; // Default value
        prevEnable = "false";
        prevRemoveClass = "on";
        prevAddClass = "off";
        prevDisplay = "hide"
        $("#cp-tog-auto-ip").attr("enabled", "true")
            .removeClass("off")
            .addClass("on");
        $("#autoChangeOnLine, #autoChangeOnRow").show();
        $("#cp-auto-changeTime").val(rate);
        ldrSelector = "#modAutoChgValLdr";
    } else {
        enable = false;
        rate = 1440;
        prevEnable = "true";
        prevRemoveClass = "off";
        prevAddClass = "on";
        prevDisplay = "show"
        $("#cp-tog-auto-ip").attr("enabled", "false")
            .removeClass("on")
            .addClass("off");
        $("#autoChangeOnLine, #autoChangeOnRow").hide();
        ldrSelector = "#modAutoChgTogLdr";
    }
    // Call the reusable function with selected animationId
    try {
        await modAutoChangeUpdateLdr(proxy_name, enable, rate, ldrSelector);
    } catch (e) {
        $("#cp-tog-auto-ip").attr("enabled", prevEnable)
            .removeClass(prevRemoveClass)
            .addClass(prevAddClass);
        $("#autoChangeOnLine, #autoChangeOnRow")[prevDisplay](); // Show or hide the auto change on line
        console.error(e)
        if (e.error.redirect) {
            await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
        }
    }
});


$('#cp-auto-changeTime').on('change', async function () {
    let ldrSelector = "#modAutoChgValLdr", rate = $(this).val();
    const enable = $("#cp-tog-auto-ip").attr("enabled") === "true", proxy_name = await getCurrentProxyUrlSearch();
    if (enable) {
        try {
            await modAutoChangeUpdateLdr(proxy_name, enable, rate, ldrSelector);
        } catch (e) {
            console.error(e)
            if (e.error.redirect) {
                await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
            }
        }
    }
});


$('#cp-auto-changeTime').on('focus', async function () {
    $("#modAutoChgValLdr").hide();
    clearTimeout(modAutoChgLdrTimeout1);
});


$('.add_min').click(function () {
    let input = $(this).prev();
    if (parseInt(input.val(), 10) < 1440) {
        input.val(parseInt(input.val(), 10) + 1);
        input.change();
    }
});

$('.sub_min').click(function () {
    let input = $(this).next();
    if (parseInt(input.val(), 10) > 1) {
        input.val(parseInt(input.val(), 10) - 1);
        input.change();
    }
});


$("#cp-tog-ipv4").on('click', async function () {
    const ipv4Tog = $("#cp-tog-ipv4").attr("enabled");
    let proxy_name = await getCurrentProxyUrlSearch(), enable, ldrSelector = "#modIpv4TogLdr", prevEnable,
        prevRemoveClass, prevAddClass;
    if (ipv4Tog === "false") {
        enable = true;
        prevEnable = "false";
        prevRemoveClass = "on";
        prevAddClass = "off";
        $("#cp-tog-ipv4").attr("enabled", "true")
            .removeClass("off")
            .addClass("on");
    } else {
        enable = false;
        prevEnable = "true";
        prevRemoveClass = "off";
        prevAddClass = "on";
        $("#cp-tog-ipv4").attr("enabled", "false")
            .removeClass("on")
            .addClass("off");
    }
    // Call the reusable function with selected animationId
    try {
        await modIpv4UpdateLdr(proxy_name, enable, ldrSelector);
    } catch (error) {
        $("#cp-tog-ipv4").attr("enabled", prevEnable)
            .removeClass(prevRemoveClass)
            .addClass(prevAddClass);
        console.error(error)
    }
});

/**
 ? Resizes cards and modal to fit screen size.
 * @param {boolean} modOpen - Indicates whether the modal is open or closed.
 */
// Cache the jQuery selectors
let navSb = $(".nav_sb");
let contentArea = $(".dash_content_area");
let modCol = $(".dash_mod_col");
let crdsCol = $(".dash_crds_col");
let prxCrds = $(".prx_crds");
let prxCrdDetGrid = $(".prx_crd_det_grid");
let indSubwrpRight = $(".ind_subwrp_right");

function resizeDash(modOpen) {
    // Get the window width once to reduce layout thrashing
    let windowWidth = $(window).width();
    if (modOpen) { // If modal is open
        // Base styles
        navSb.css({display: "block"});
        contentArea.css({"margin-left": "12rem", padding: "1.4rem 1rem 1.5rem 1.2rem"});
        if (windowWidth >= 2300) {
            modCol.css({display: "block", width: "625px"});
            crdsCol.css({width: "calc(-198px + 100vw - 625px)", display: "flex"});
            prxCrds.css({"grid-template-columns": "1fr 1fr 1fr"});
        } else if (windowWidth <= 2299 && windowWidth >= 1850) {
            modCol.css({display: "block", width: "625px"});
            crdsCol.css({width: "calc(-198px + 100vw - 625px)", display: "flex"});
            prxCrds.css({"grid-template-columns": "1fr 1fr", "max-width": "60vw"});
        } else if (windowWidth <= 1849 && windowWidth >= 1400) {
            modCol.css({display: "block", width: "625px"});
            crdsCol.css({width: "calc(-198px + 100vw - 625px)", display: "flex"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "625px"});
        } else if (windowWidth <= 1399 && windowWidth >= 1300) {
            modCol.css({display: "block", width: "560px"});
            crdsCol.css({width: "calc(-198px + 100vw - 560px)", display: "flex"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "560px"});
        } else if (windowWidth <= 1299 && windowWidth >= 1200) {
            modCol.css({display: "block", width: "480px"});
            crdsCol.css({width: "calc(-198px + 100vw - 480px)", display: "flex"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "100vw"});
        } else if (windowWidth <= 1199 && windowWidth >= 750) {
            contentArea.css({"margin-left": "0", padding: "1.4rem 0rem 1.5rem 0rem"});
            modCol.css({display: "block", width: "calc(-198px + 100vw - 15px)"});
            crdsCol.css({width: "0", display: "none"});
        } else if (windowWidth <= 749) {
            navSb.css({display: "none"});
            contentArea.css({"margin-left": "0", padding: "1.4rem 0rem 1.5rem 0rem"});
            modCol.css({display: "block", width: "100vw"});
            crdsCol.css({width: "0", display: "none"});
        }
    } else { // when modal is closed
        // Base styles
        navSb.css({display: "block"});
        contentArea.css({"margin-left": "12rem", padding: "1.4rem 1rem 1.5rem 1.2rem"});
        modCol.css({display: "none"});
        if (windowWidth >= 2300) {
            crdsCol.css({display: "flex", width: "calc(-198px + 100vw - 15px)"});
            prxCrds.css({"grid-template-columns": "1fr 1fr 1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr 1fr 1fr"});
            indSubwrpRight.css({float: "right", clear: "none", "padding-top": "0"});
        } else if (windowWidth <= 2299 && windowWidth >= 1700) {
            crdsCol.css({display: "flex", width: "calc(-198px + 100vw - 15px)"});
            prxCrds.css({"grid-template-columns": "1fr 1fr 1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr 1fr 1fr"});
            indSubwrpRight.css({float: "right", clear: "none", "padding-top": "0"});
        } else if (windowWidth <= 1699 && windowWidth >= 1200) {
            crdsCol.css({display: "flex", width: "calc(-198px + 100vw - 15px)"});
            prxCrds.css({"grid-template-columns": "1fr 1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr 1fr 1fr"});
            indSubwrpRight.css({float: "right", clear: "none", "padding-top": "0"});
        } else if (windowWidth <= 1199 && windowWidth >= 750) {
            crdsCol.css({display: "flex", width: "calc(-198px + 100vw - 15px)"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr 1fr 1fr"});
            indSubwrpRight.css({float: "right", clear: "none", "padding-top": "0"});
        } else if (windowWidth <= 749 && windowWidth >= 550) {
            navSb.css({display: "none"});
            contentArea.css({"margin-left": "0", padding: "1.4rem 0rem 1.5rem 0rem"});
            crdsCol.css({display: "flex", width: "100vw"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr 1fr 1fr"});
            indSubwrpRight.css({float: "right", clear: "none", "padding-top": "0"});
        } else if (windowWidth <= 549) {
            navSb.css({display: "none"});
            contentArea.css({"margin-left": "0", padding: "1.4rem 0rem 1.5rem 0rem"});
            crdsCol.css({display: "flex", width: "100vw"});
            prxCrds.css({"grid-template-columns": "1fr", "max-width": "100vw"});
            prxCrdDetGrid.css({"grid-template-columns": "1fr"});
            indSubwrpRight.css({float: "left", clear: "both", "padding-top": "3px"});
        }
    }
}

/**
 ? Checks if the PRX module is open.
 ** @return {boolean} True if the PRX module is open, false otherwise.
 */
async function checkPrxModOpen() {
    let modOpen;
    if (prxMod.attr("open")) {
        modOpen = true;
    } else {
        modOpen = false;
    }
    return modOpen;
}

document.addEventListener("DOMContentLoaded", (event) => {
    let modOpen;
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Check if a parameter exists
    if (urlParams.has('proxy')) {
        modOpen = true;
    } else {
        modOpen = false;
    }
    resizeDash(modOpen);
    prxMod.attr("open", modOpen);
});

// When the window resizes, resize the dashboard
window.addEventListener("resize", async (event) => {
    // Get element id & attribute
    const modOpen = await checkPrxModOpen();
    // Pass to resize function
    resizeDash(modOpen);
});

/**
 ? Sets the 'open' attribute of the modal to 'false' and returns a confirmation message.
 ** @returns {Promise<string>} A promise that resolves to a confirmation message.
 */
async function modalStart() {
    const modOpen = await checkPrxModOpen();
    // Set the 'open' attribute of the modal to 'false'.
    if (!modOpen) {
        prxMod.attr("open", false);
    }
    // Introduce a delay of 100 milliseconds.
    await delay(100);
    // Once the delay is over, return a confirmation message.
    return;
}


/**
 ? Opens the modal dialog.
 ** @returns {Promise<string>} A promise that resolves to a string indicating the modal has been opened.
 */
async function openModal() {
    // Show skeleton modal first
    await show_skel_mod();
    return new Promise((resolve, reject) => {
        checkPrxModOpen()
            .then((modOpen) => {
                // Check if the modal is not open
                if (!modOpen) {
                    // If it's not open, set 'open' attribute to true (modal is now open)
                    prxMod.attr("open", true);
                    // Resize dashboard to accommodate the opened modal
                    resizeDash(true);
                }
                // After a short delay, resolve the promise indicating the modal has been opened
                setTimeout(() => resolve("Opened"), 100);
            })
            .catch((error) => {
                // If any error occurs during the operation, log the error
                console.error(error);
                reject(error);
            });
    });
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

/**
 ? Display an error message with customizable title, message, and button text.
 * @param {string} proxy_name - The name of the proxy.
 * @param {string} title - The title of the error message.
 * @param {string} message - The content of the error message.
 * @param {string} [buttonText=''] - The text of the action button.
 * @param {boolean} [showDiv=true] - Indicates whether to show the error message.
 * @param {boolean} [closeOther=true] - Indicates whether to close other alerts before showing the error message.
 */
async function modErrAlert(proxy_name, title, message, buttonText = '', showDiv = true, closeOther = true) {
    if (closeOther) {
        // Close other alerts
        modErrAlert('', '', '', ``, false, false);
        modSucAlert('', '', '', ``, false, false);
    }
    $('#modErrTit').html(title);
    $('#modErrTxt').html(message);
    $('#modErrActionBtn1').html(buttonText);

    if (showDiv) {
        $('#modErrDiv').show();
        let modErrDismiss = $('#modErrDismissBtn');
        modErrDismiss.off('click');
        modErrDismiss.click(function () {
            $('#modErrDiv').hide();
        });

        // add this code here
        $(document).mouseup(function (e) {
            const container = $("#modErrDiv");

            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
    } else {
        $('#modErrDiv').hide();
    }
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
 ? Shows a success alert with customized content.
 * @param {string} proxy_name - The name of the proxy.
 * @param {string} title - The title of the success alert.
 * @param {string} message - The message of the success alert.
 * @param {string} [buttonText=''] - The text of the action button.
 * @param {boolean} [showDiv=true] - Determines whether to show the success alert div.
 * @param {boolean} [closeOther=true] - Determines whether to close other alerts before showing the success alert.
 */
async function modSucAlert(proxy_name, title, message, buttonText = '', showDiv = true, closeOther = true) {
    if (closeOther) {
        modSucAlert('', '', '', ``, false, false);
        modErrAlert('', '', '', ``, false, false);
    }
    $('#modSucTit').html(title);
    $('#modSucTxt').html(message);
    $('#modSucActionBtn1').html(buttonText);

    if (showDiv) {
        $('#modSucDiv').show();
        let modSucDismiss = $('#modSucDismissBtn');
        modSucDismiss.off('click');
        modSucDismiss.click(function () {
            $('#modSucDiv').hide();
        });

        // add this code here
        $(document).mouseup(function (e) {
            const container = $("#modSucDiv");

            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
    } else {
        $('#modSucDiv').hide();
    }
}

/**
 ? Performs authentication options based on the given command.
 * @param {string} command - The command to perform (either 'close' or an empty string).
 ** @return {void}
 */
async function modalAuthOptions(command) {
    let modAuthOptions = document.getElementById("authOptions");
    if (command == 'close') {
        // If auth options is open, close it
        if (modAuthOptions.getAttribute("open") === 'true') {
            modAuthOptions.setAttribute("open", "false");
            $(".mod_primary_content").show();
            $("#authOptions").hide();
            $(".mod_bottom_btn_auth").hide();
            $(".mod_bottom_btn_primary").show();
        }
    } else {
        let proxy_name = await getCurrentProxyUrlSearch();
        // If auth options is closed, open it
        modAuthOptions.setAttribute("open", "true");
        $(".mod_primary_content").hide();
        $('#modFirstConfBtn').hide();
        $("#authOptions").show();
        $(".mod_bottom_btn_auth").show();
        $(".mod_bottom_btn_primary").hide();

        // Preserve the original uname, pword, and IP
        let originalUname = $('#cp-basic-unameInput').val();
        let originalPword = $('#cp-basic-pwordInput').val();
        let originalIP = $('#cp-whitelist-ipInput').val();

        // Flags to track changes in the input fields
        let unameChanged = false;
        let pwordChanged = false;
        let ipChanged = false;

        // Define buttons
        let basicBtn = $('#modAuthBasBtn');
        let whitelistBtn = $('#modAuthWhliBtn');

        // Define inputs
        let basicInputs = ['#cp-basic-unameInput', '#cp-basic-pwordInput'];
        let whitelistInputs = ['#cp-whitelist-ipInput'];

        function getEmptyFieldsError(fields) {
            let emptyFields = [];

            for (let field in fields) {
                let value = $(fields[field]).val();
                if (value === '') {
                    emptyFields.push(field);
                }
            }

            if (emptyFields.length === 0) {
                return 'Please fill in the required fields.';
            } else {
                return emptyFields.join(' & ') + ' cannot be empty.';
            }
        }

        function checkAuthFields() {
            let fields = {};

            // Check the inputs of the active button only
            if (basicBtn.attr('active') === 'true') {
                fields = {
                    'Username': '#cp-basic-unameInput', 'Password': '#cp-basic-pwordInput'
                };

                let newUname = $(fields['Username']).val();
                let newPword = $(fields['Password']).val();
                if (newUname === originalUname && newPword === originalPword) {
                    unameChanged = false;
                    pwordChanged = false;
                    $('#modFirstConfBtn').hide();
                }
            } else if (whitelistBtn.attr('active') === 'true') {
                fields = {
                    'IP Address': '#cp-whitelist-ipInput'
                };

                let newIP = $(fields['IP Address']).val();

                if (newIP === originalIP && newIP !== '') {
                    ipChanged = false;
                    $('#modFirstConfBtn').hide();
                }
            }
            const errMsg = getEmptyFieldsError(fields);
            if (errMsg !== 'Please fill in the required fields.') {
                $('#inputErrAuth').show();
                $('#inputErrAuthMsg').html(errMsg);
                // $('#modFirstConfBtn').hide(); // Hide the confirm button
            } else {
                $('#inputErrAuth').hide();
                $('#inputErrAuthMsg').html('');
                // $('#modFirstConfBtn').show(); // Show the confirm button
            }
        }

        // Function to handle input event for uname
        let unameInputFunction = function () {
            let newUname = $(this).val();
            if (newUname !== originalUname) {
                unameChanged = true;
                $('#modFirstConfBtn').show();
                if (unameChanged && pwordChanged) {
                    $('#inputErrAuth').hide();
                    $('#inputErrAuthMsg').html('');
                }
            }
            checkAuthFields();
        }

        // Function to handle input event for pword
        let pwordInputFunction = function () {
            let newPword = $(this).val();
            if (newPword !== originalPword) {
                pwordChanged = true;
                $('#modFirstConfBtn').show();
                if (unameChanged && pwordChanged) {
                    $('#inputErrAuth').hide();
                    $('#inputErrAuthMsg').html('');
                }
            }
            checkAuthFields();
        }

        // Function to handle input event for IP
        let ipInputFunction = function () {
            let newIP = $(this).val();
            if (newIP !== originalIP) {
                ipChanged = true;
                $('#modFirstConfBtn').show();
                if (ipChanged) {
                    $('#inputErrAuth').hide();
                    $('#inputErrAuthMsg').html('');
                }
            }
            checkAuthFields();
        }

        // Add event listener for uname, pword, and IP changes
        $('#cp-basic-unameInput').off('input').on('input', unameInputFunction);
        $('#cp-basic-pwordInput').off('input').on('input', pwordInputFunction);
        $('#cp-whitelist-ipInput').off('input').on('input', ipInputFunction);

        // Function to reset the values of the inputs
        function resetInputs(inputs) {
            for (let i = 0; i < inputs.length; i++) {
                $(inputs[i]).val('');
            }
            $('#inputErrAuth').hide();
        }

        // Function to handle button clicks
        function handleBtnClick(clickedBtn, alternateBtn, clickedInputWrp, alternateInputWrp, alternateInputs) {
            let fields;
            if (clickedBtn.attr('default') === 'false') {
                // If the alternate button is default and the inputs have changed, reset them
                if (alternateBtn.attr('default') === 'true' && alternateBtn.attr('active') === 'true') {
                    let inputUnchanged = false;
                    resetInputs(alternateInputs); // Reset the inputs associated with the default button

                    if (alternateInputs.includes('#cp-basic-unameInput') && (unameChanged || pwordChanged)) {
                        $('#cp-basic-unameInput').val(originalUname);
                        $('#cp-basic-pwordInput').val(originalPword);
                        unameChanged = false;
                        pwordChanged = false;
                        $('#inputErrAuth').hide();
                        $('#inputErrAuthMsg').html('');
                    } else {
                        inputUnchanged = true;
                        fields = {
                            'Username': '#cp-basic-unameInput', 'Password': '#cp-basic-pwordInput',
                        };
                    }
                    if (alternateInputs.includes('#cp-whitelist-ipInput') && ipChanged) {
                        $('#cp-whitelist-ipInput').val(originalIP);
                        ipChanged = false;
                        $('#inputErrAuth').hide();
                        $('#inputErrAuthMsg').html('');
                    } else {
                        inputUnchanged = true;
                        fields = {
                            'IP Address': '#cp-whitelist-ipInput'
                        };
                    }
                    if (inputUnchanged) {
                        $('#inputErrAuth').show();
                        let errMsg = getEmptyFieldsError(fields);
                        $('#inputErrAuthMsg').html(errMsg);
                    }
                }

                clickedBtn.attr('active', 'true');
                // clickedBtn.removeClass("actions_btn");
                clickedBtn.addClass("green");
                alternateBtn.attr('active', 'false');
                alternateBtn.removeClass("green");
                // alternateBtn.addClass("actions_btn");
                $(clickedInputWrp).show();   // Show the clicked input wrapper
                $(alternateInputWrp).hide();  // Hide the alternate input wrapper
                checkAuthFields();
            } else if (clickedBtn.attr('default') === 'true' && alternateBtn.attr('active') === 'true') {
                alternateBtn.attr('active', 'false');
                alternateBtn.removeClass("green");
                // alternateBtn.addClass("actions_btn");
                clickedBtn.attr('active', 'true');
                // clickedBtn.removeClass("actions_btn");
                clickedBtn.addClass("green");
                $(clickedInputWrp).show();   // Show the clicked input wrapper
                $(alternateInputWrp).hide();  // Hide the alternate input wrapper
                resetInputs(alternateInputs); // Reset the alternate inputs
                checkAuthFields();

                // Reset the clicked inputs to their original values
                if (clickedBtn.is(basicBtn)) {
                    $('#cp-basic-unameInput').val(originalUname);
                    $('#cp-basic-pwordInput').val(originalPword);
                    // If both username and password match the original, hide the confirm button
                    if ($('#cp-basic-unameInput').val() === originalUname && $('#cp-basic-pwordInput').val() === originalPword) {
                        $('#modFirstConfBtn').hide();
                    }
                } else if (clickedBtn.is(whitelistBtn)) {
                    $('#cp-whitelist-ipInput').val(originalIP);

                    // If IP address matches the original, hide the confirm button
                    if ($('#cp-whitelist-ipInput').val() === originalIP) {
                        $('#modFirstConfBtn').hide();
                    }
                }
                checkAuthFields();
                $('#inputErrAuth').hide();
                $('#inputErrAuthMsg').html('');
                modErrAlert(``, ``, ``, ``, false);
                $('#modFirstConfBtn').hide();
            }
        }

        // Button events
        basicBtn.off('click').on('click', function () {
            handleBtnClick(basicBtn, whitelistBtn, '.auth_basic_input_wrp', '.auth_whitelist_input_wrp', whitelistInputs);
        });


        whitelistBtn.off('click').on('click', function () {
            handleBtnClick(whitelistBtn, basicBtn, '.auth_whitelist_input_wrp', '.auth_basic_input_wrp', basicInputs);
        });

        // Define the reset behavior function
        function resetBehavior() {
            if (basicBtn.attr('default') === 'true') {
                // console.log('basicBtn default', basicBtn.attr('default'))
                // Reset basic auth
                $('#cp-basic-unameInput').val(originalUname);
                $('#cp-basic-pwordInput').val(originalPword);
                $('.auth_basic_input_wrp').show();
                basicBtn.attr("active", "true")
                    .addClass("green");
                $("#cp-auth-method").html("Basic (Username & Password)");
                $('#modAuthDispBas').show();
                // Cancel whitelist auth
                $('.auth_whitelist_input_wrp').hide();
                whitelistBtn.removeClass("green")
                    .attr("active", "false");
                resetInputs(whitelistInputs)
                $('#modAuthDispWhli').hide();
            }
            if (whitelistBtn.attr('default') === 'true') {
                // console.log('whitelistBtn default', whitelistBtn.attr('default'))
                // Reset whitelist auth
                $('#cp-whitelist-ipInput').val(originalIP);
                $('.auth_whitelist_input_wrp').show();
                whitelistBtn.attr("active", "true")
                    .addClass("green");
                $("#cp-auth-method").html("Whitelist (IP Address)");
                // Cancel basic auth
                $('.auth_basic_input_wrp').hide();
                $('#modAuthDispWhli').show();
                basicBtn.removeClass("green")
                    .attr("active", "false");
                resetInputs(basicInputs)
                $('#modAuthDispBas').hide();
            }

            modSucAlert('', '', '', ``, false);
            unameChanged = false;
            pwordChanged = false;
            ipChanged = false;
            $('#modFirstConfBtn').hide();
            modalAuthOptions('close');
        }

        $('#modFirstCancelBtn').off('click').click(function () {
            let isEmpty = false;
            if (basicBtn.attr('active') === 'true') {
                isEmpty = basicInputs.some(input => $(input).val() === '');
            } else if (whitelistBtn.attr('active') === 'true') {
                isEmpty = whitelistInputs.some(input => $(input).val() === '');
            }

            if (unameChanged || pwordChanged || ipChanged || isEmpty) {
                const errTit = `There are unsaved changes`;
                const errTxt = `Recent authentication changes have not been saved and will be reverted. Do you still want to cancel?`;
                const errBtnTxt = `Yes, cancel changes`;
                // Show error
                modErrAlert(proxy_name, errTit, errTxt, errBtnTxt);
            } else {
                modSucAlert(``, ``, ``, ``, false);
                modalAuthOptions('close');
            }
        });

        let modFirstConfBtnRunning = false;
        $('#modFirstConfBtn').off('click').click(async function () {
            // If the button is already running, return
            if (modFirstConfBtnRunning) {
                return;
            }
            // Set the flag to true
            modFirstConfBtnRunning = true;

            $("#modConfBtnIco").css("background-size", 0);
            $('#modConfBtnLdr').css('display', 'flex');
            LottieInteractivity.create({
                player: "#modConfBtnLdr", mode: "chain", actions: [{
                    state: "loop",
                }]
            });

            let getDataBasic = {
                username: $('#cp-basic-unameInput').val(), password: $('#cp-basic-pwordInput').val(),
            };

            let getDataWhitelist = {
                authorize_ip: $('#cp-whitelist-ipInput').val(),
            };

            // -- Basic auth
            if (unameChanged || pwordChanged) {
                try {
                    const apiKeyData = await getApiKeys({
                        format: 'visible',
                        master: true,
                    })
                    const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

                    const options = {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(getDataBasic)
                    };

                    const url = new URL(`https://cmd.illusory.io/v1/proxies/auth/basic/${proxy_name}`);

                    // Send the request
                    const response = await fetch(url, options);
                    const resJson = await response.json();
                    const {message: resMsg, status: resStatus} = resJson;

                    if (!response.ok) {
                        let errMsg = `There was an error with your request. Please try again later or contact support. Proxy Name: ${proxy_name}`;
                        if (resMsg) {
                            errMsg = resMsg;
                        } else if (resStatus === 429) {
                            errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
                        }
                        throw new Error(errMsg);
                    }

                    originalUname = getDataBasic.username;
                    originalPword = getDataBasic.password;
                    unameChanged = false;
                    pwordChanged = false;
                    $('#basicBtn').attr('default', 'true');
                    $('#modAuthWhliBtn').attr('default', 'false');
                    $("#cp-auth-method").html("Basic (Username & Password)");
                    $('#modAuthDispBas').show();
                    $('#modAuthDispWhli').hide();

                    const sucTit = `Your request was successful`;
                    const sucMsg = resMsg;
                    modSucAlert(proxy_name, sucTit, sucMsg);
                } catch (error) {
                    const errStatus = error.status;
                    const errMsg = error.message;
                    const errData = {proxy_name, getDataBasic, unameChanged, pwordChanged};
                    const modOpen = await checkPrxModOpen();
                    if (modOpen) {
                        const errTit = `There was an error with your request`;
                        const errTxt = error.message;
                        modErrAlert(proxy_name, errTit, errTxt);
                    }
                    try {
                        await ErrorHandler(errMsg, errData, errStatus);
                    } catch (e) {
                        console.error(e);
                        modFirstConfBtnRunning = false;
                    }
                }
            }

            // -- Whitelist auth
            if (ipChanged) {
                // console.log('ipChanged', ipChanged)
                try {
                    const apiKeyData = await getApiKeys({
                        format: 'visible',
                        master: true,
                    })
                    const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

                    const options = {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(getDataWhitelist)
                    };
                    const url = new URL(`https://cmd.illusory.io/v1/proxies/auth/whitelist/${proxy_name}`);
                    // Send the request
                    const response = await fetch(url, options);
                    const resJson = await response.json();
                    const {message: resMsg, status: resStatus} = resJson;

                    if (!response.ok) {
                        let errMsg = `There was an error with your request. Please try again later or contact support. Proxy Name: ${proxy_name}`;
                        if (resMsg) {
                            errMsg = resMsg;
                        } else if (resStatus === 429) {
                            errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
                        }
                        throw new Error(errMsg);
                    }

                    // handle the successful case here
                    originalIP = getDataWhitelist.authorize_ip;
                    ipChanged = false;
                    $('#modAuthDispWhli').show();
                    $('#modAuthDispBas').hide();
                    $('#modAuthWhliBtn').attr('default', 'true');
                    $('#basicBtn').attr('default', 'false');
                    $('#cp-basic-unameInput').val('');
                    $('#cp-basic-pwordInput').val('');
                    $("#cp-auth-method").html("Whitelist (IP Address)");
                    const sucTit = `Your request was successful`;
                    const sucMsg = resMsg;
                    modSucAlert(proxy_name, sucTit, sucMsg);

                } catch (error) {
                    const errStatus = error.status;
                    const errMsg = error.message;
                    const errData = {proxy_name, getDataWhitelist, ipChanged};
                    const errTit = `There was an error with your request`;
                    const errTxt = error.message;
                    modErrAlert(proxy_name, errTit, errTxt);
                    try {
                        await ErrorHandler(errMsg, errData, errStatus);
                    } catch (e) {
                        console.error(e);
                        modFirstConfBtnRunning = false;
                    }
                }
            }

            $("#modConfBtnIco").css("background-size", "unset");
            $('#modConfBtnLdr').css('display', 'none');
            LottieInteractivity.create({
                player: "#modConfBtnLdr", mode: "chain", actions: [{state: "stop"}]
            });

            if (!unameChanged && !pwordChanged && !ipChanged) {
                $('#modFirstConfBtn').hide();
            }
            modFirstConfBtnRunning = false;
        });

        $('#modErrActionBtn1, .prx_crd_interact').off('click').click(function () {
            modErrAlert(``, ``, ``, ``, false, true);
            const modAuthOptions = document.getElementById("authOptions");
            const authOpen = modAuthOptions.getAttribute("open") === 'true';
            if (authOpen) {
                resetBehavior();
            }
        });
    }
}


$('[mod_swap_action_btn="confirm_swap"]').click(async function () {
    await triggerProxySwap();
});


async function triggerProxySwap() {
    try {
        $(`[action_btn_ico="swap"]`).css("background-size", 0);
        $(`[ldr_btn_ico="swap"]`).css('display', 'flex');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="swap"]`, mode: "chain", actions: [{state: "loop"}]
        });

        const proxy_name = $(`[swap_initial="proxy"]`).text();
        const location = $(`[swap="new_proxy"]`).attr('location');
        const isp = $(`[swap="new_proxy"]`).attr('isp');
        const copy_settings = $(`[mod_btn="copy_settings"]`).attr('swap_copy_settings');

        await proxyActionSwap(proxy_name, isp, location, copy_settings);

        $(`[action_btn_ico="swap"]`).css("background-size", "unset");
        $(`[ldr_btn_ico="swap"]`).css('display', 'none');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="swap"]`, mode: "chain", actions: [{state: "stop"}]
        });

        $(`[modal_overlay="swap"]`).addClass("hide");

    } catch (e) {
        console.error(e);

        $(`[action_btn_ico="swap"]`).css("background-size", "unset");
        $(`[ldr_btn_ico="swap"]`).css('display', 'none');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="swap"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return;
    }
}


async function proxyActionSwap(proxy_name, isp, location, copy_settings) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isp: isp,
                location: location,
                copy_settings: copy_settings
            })
        };

        const url = new URL(`https://cmd.illusory.io/v1/proxies/swap/${proxy_name}`);

        // Send the request
        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const sucTit = `Your request was successful`;
        const sucMsg = resMsg;
        sucAlert(sucTit, sucMsg);
    } catch (error) {
        const errTit = `There was an error with your request`;
        const errTxt = error.error.message;
        errAlert(errTit, errTxt);
        throw error;
    }
}


// When the cancel button is clicked
$(document).on('click', '[mod_action_btn="swap"]', async function () {
    const proxy = $(`#currentProxy`).text();
    const isp = $(`#cp-header-isp`).text();
    const location = $(`#cp-specs-loc`).text().replace(/,/g, '');
    const added = $(`#cp-header-added`).text();
    const ispColors = {
        "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink"
    };
    $(`[swap_initial="proxy"]`).text(proxy);
    $(`[swap_initial="isp"]`).text(isp).removeClass().addClass(`ind_det ${ispColors[isp]}`);
    $(`[swap_initial="location"]`).text(location);
    $(`[swap_initial="added"]`).text(added);
    $(`[modal_overlay="swap"]`).removeClass("hide");
});

// Function to fetch stock data
async function getStock() {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        };
        const url = new URL(`https://cmd.illusory.io/v1/stock`);

        const response = await fetch(url, options);
        const resJson = await response.json();
        if (!response.ok) {
            let errMsg = `There was an error with your request.`;
            if (resJson.message) {
                errMsg = resJson.message;
            } else if (resJson.status === 429) {
                errMsg = `Too many requests.`;
            }
            throw new Error(errMsg);
        }
        return resJson.data; // Return the data for further processing
    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}


// Function to update the UI based on the stock data
async function updateSwapStock(isp) {
    try {
        const $locationsContainer = $('[swap="locations"]');
        const $skeletonsContainer = $('[swap="skels"]');

        $locationsContainer.hide();
        $skeletonsContainer.removeClass('hide');

        const items = await getStock(); // Fetch stock data

        $locationsContainer.empty(); // Clearing the container

        items.forEach(item => {
            const {city, state, open} = item;
            let stock = item[isp]; // Accessing the stock value for the specified ISP

            // Check if stock is 0 or location is not open
            let isDisabled = stock === 0 || open !== true;

            const $gridItem = $('<div>')
                .addClass('swap_drop_grid-item')
                .attr('swap_loc_btn', city);
            if (isDisabled) {
                $gridItem.addClass('disabled'); // Add 'disabled' class if necessary
                stock = 0; // Set stock to 0 if disabled
            }

            const $locationText = $('<div>')
                .addClass('swap_drop_grid_item-text')
                .attr('swap_loc', city)
                .text(`${city} ${state}`);
            const $stockText = $('<div>')
                .addClass('swap_drop_loc_stock-text')
                .attr('swap_loc_stock', city)
                .text(stock);

            $gridItem.append($locationText, $stockText);
            $locationsContainer.append($gridItem);
        });

        $skeletonsContainer.addClass('hide');
        $locationsContainer.show();
    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}

// When an ISP button is clicked
$(document).on('click', '[swap_isp_btn]', function () {
    $("[swap_isp_btn]").removeClass("active");
    $(this).addClass("active");

    const isp = $(this).attr('swap_isp_btn');
    const ispNames = {
        "att": "AT&T", "verizon": "Verizon", "tmobile": "T-Mobile"
    };

    let ispName = ispNames[isp] || "";
    $(`[swap_new_proxy="text"]`).text(ispName);

    $(`[swap="new_proxy"]`).removeClass("green").attr('applied', false);
    $(`[swap_btn="apply"]`).hide();

    updateSwapStock(isp);
});

// When a location button is clicked
$(document).on('click', '[swap_loc_btn]', function () {
    if ($(this).hasClass('disabled')) {
        return; // Exit if 'disabled' class is present
    }

    $("[swap_loc_btn]").removeClass("active");
    $(this).addClass("active");

    const city = $(this).attr('swap_loc_btn');
    const fullLocation = $(`[swap_loc="${city}"]`).text();
    const isp = $('[swap_isp_btn].active').attr('swap_isp_btn');
    const ispNames = {
        "att": "AT&T", "verizon": "Verizon", "tmobile": "T-Mobile"
    };

    let ispName = ispNames[isp] || "";
    $(`[swap_new_proxy="text"]`).text(ispName + " -> " + fullLocation);
    $(`[swap="new_proxy"]`).attr({
        'isp': ispName,
        'location': city,
        'applied': false
    });

    $(`[swap_btn="apply"]`).show();
});

// When the apply button is clicked
$(document).on('click', '[swap_btn="apply"]', function () {
    $(`.swap--dropdown`).addClass("hide");

    $(`[swap="new_proxy"]`).addClass("green").attr('applied', true);
});

// When the cancel button is clicked
$(document).on('click', '[swap_btn="cancel"]', function () {
    $(`.swap--dropdown`).addClass("hide");
    clearSwapSelected();
});

// When the modal cancel button is clicked
$(document).on('click', '[mod_swap_action_btn="cancel_swap"]', function () {
    $(`.modal_overlay`).addClass("hide");
    $(`.swap--dropdown`).addClass("hide");
    clearSwapSelected();
});

$(document).on('click', '[mod_btn="copy_settings"]', function () {
    // Toggle the 'selected' class for the clicked element
    $(this).toggleClass('selected');

    // Check if the element has the 'selected' class
    const isSelected = $(this).hasClass('selected');
    // console.log('Clicked element. isSelected:', isSelected); // Diagnostic log

    // Forcefully set the 'swap_copy_settings' attribute
    if (isSelected) {
        $(this).attr('swap_copy_settings', 'true');
        // console.log('Set attribute to true'); // Diagnostic log
    } else {
        $(this).attr('swap_copy_settings', 'false');
        // console.log('Set attribute to false'); // Diagnostic log
    }
});


// When the new_proxy element is clicked
$(document).off('click', '[swap="new_proxy"]').on('click', '[swap="new_proxy"]', function (event) {
    event.stopPropagation(); // Prevent this click from propagating to the document
    $('.swap--dropdown').toggleClass('hide');
    checkSwapApplied();
});

// When clicking outside the dropdown
$(document).on('click', '.modal_crd.swap', function (event) {
    // console.log('Clicked outside dropdown'); // Diagnostic log
    // Check if the dropdown is does not contain hide
    if (!$('.swap--dropdown').hasClass('hide')) {

        // Check if the clicked element is not the mod_btn and not inside the dropdown
        if (!$(event.target).closest('.swap--dropdown, [mod_btn="copy_settings"]').length) {
            $('.swap--dropdown').addClass('hide');
            $('.swap--dropdown').removeClass('open'); // Assuming you use a class like 'open' to track if the dropdown is visible
            checkSwapApplied();
        }
    }
});


// Check if the selections have been applied
async function checkSwapApplied() {
    const applied = $(`[swap="new_proxy"]`).attr('applied') === 'true';

    if (!applied) {
        clearSwapSelected();
        return true; // Cleared
    }
    return false; // Not cleared
}

// Clear the selected items
function clearSwapSelected() {
    $(`[swap="new_proxy"]`).removeClass("green").attr({
        'isp': '',
        'location': '',
        'applied': false
    });
    $("[swap_isp_btn], [swap_loc_btn]").removeClass("active");
    $(`[swap_new_proxy="text"]`).text("Select");
    $(`[swap_btn="apply"]`).hide();
    $('[swap="locations"]').empty();
    $(`[mod_btn="copy_settings"]`).removeClass(`selected`)
        .attr({
            "swap_copy_settings": "false",
        });
}


async function proxyActionRemove(proxies) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proxies)
        };

        const url = new URL(`https://cmd.illusory.io/v1/proxies/remove`);

        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const sucTit = `Your request was successful`;
        const sucMsg = resMsg;
        sucAlert(sucTit, sucMsg);
    } catch (error) {
        const errTit = `There was an error with your request`;
        const errTxt = error.error.message;
        errAlert(errTit, errTxt);
        throw error;
    }
}


// When the cancel button is clicked
$(document).on('click', '[mod_action_btn="remove"]', async function () {
    const proxy = $(`#currentProxy`).text();
    $(`[remove_proxy="text"]`).text(proxy);
    $(`[modal_overlay="remove"]`).removeClass("hide");
});


// When the cancel button is clicked
$(document).on('click', '[mod_remove_action_btn="cancel_remove"]', async function () {
    $(`[remove_proxy="text"]`).text('');
    $(`[modal_overlay="remove"]`).addClass("hide");
});


$('[mod_remove_action_btn="confirm_remove"]').click(async function () {
    await triggerProxyRemove();
});


async function triggerProxyRemove() {
    try {
        $(`[action_btn_ico="remove"]`).css("background-size", 0);
        $(`[ldr_btn_ico="remove"]`).css('display', 'flex');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="remove"]`, mode: "chain", actions: [{state: "loop"}]
        });

        const proxy_name = $(`[remove_proxy="text"]`).text();

        const proxies = {proxies: [proxy_name]};

        await proxyActionRemove(proxies);

        $(`[action_btn_ico="remove"]`).css("background-size", "unset");
        $(`[ldr_btn_ico="remove"]`).css('display', 'none');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="remove"]`, mode: "chain", actions: [{state: "stop"}]
        });

        $(`.modal_overlay`).addClass("hide");

    } catch (e) {
        console.error(e);

        $(`[action_btn_ico="remove"]`).css("background-size", "unset");
        $(`[ldr_btn_ico="remove"]`).css('display', 'none');

        LottieInteractivity.create({
            player: `[ldr_btn_ico="remove"]`, mode: "chain", actions: [{state: "stop"}]
        });

        return;
    }
}


async function closeModal() {
    return new Promise((resolve) => {
        $("#prx_mod").hide();
        $(".crd_wrp").show();
        $(".auth-select-wrap").hide();
        $(".webhook-online-trigger-wrap").hide();
        prxMod.attr("open", false);
        setTimeout(() => {
            resolve("Closed");
        }, 100);
    });
}

$("#modAuthOptBtn, #modAuthOptView").click(function () {
    modalAuthOptions('open');
});

async function navStart() {
    const navSb = document.getElementById("nav_sb");
    navSb.setAttribute("open", "true");
}

async function openNav() {
    // await show_skel_mod();
    $(".skel_mod").show();
    const navSb = document.getElementById("nav_sb");
    navSb.setAttribute("open", "true");

    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         //$("#prx_mod").css("display", "flex");
    //         // $(".crd_wrp").hide();
    //
    //         resolve("Opened");
    //     }, 100);
    // });
}

async function hide_skel_dash() {
    $(".prx_crds_skel").addClass(`hide`);
    $(".prx_crds").removeClass(`hide`);
}

async function hide_skel_mod() {
    $(".skel_mod").hide();
}

async function show_skel_mod() {
    $(".skel_mod").show();
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
 ? Executes different actions based on the given action parameter.
 * @param {SupabaseClient} supabaseClient - The Supabase client object used for database queries.
 * @param {string} action - The action to be performed. Possible values are "user_get_proxies" and "auto_change".
 ** @return {Promise<void>} A promise that resolves when the action is completed. No value is returned.
 */
async function clerkActions(supabaseClient, action) {
    // Get Proxies
    if (action == "user_get_proxies") {
        await proxyActionGetProxies(supabaseClient);
    }
    // Auto Change
    if (action == "user_get_proxies") {
        await proxyActionUpdateAutoChange();
    }
}

/**
 ? Changes the IP address for a specific proxy.
 * @param {string} proxy_name - The name of the proxy.
 ! @throws {Error} If there was an error changing the IP address.
 */
async function proxyActionChangeIp(proxy_name) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        };

        const url = new URL(`https://cmd.illusory.io/v1/proxies/changeip/${proxy_name}`);

        // Send the request
        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const modOpen = await checkPrxModOpen();
        let sucTit = `Your request was successful`;
        if (modOpen) {
            modSucAlert(proxy_name, sucTit, resMsg);
        } else {
            sucAlert(sucTit, `${resMsg}`);
        }
        modSucAlert(proxy_name, sucTit, resMsg);

    } catch (error) {
        const modOpen = await checkPrxModOpen();
        if (modOpen) {
            const errTit = `There was an error with your request`;
            const errTxt = error.error.message;
            modErrAlert(proxy_name, errTit, errTxt);
        } else {
            errAlert(`There was an error with your request`, `${error.error.message}`);
        }
        throw error;
    }
}

/**
 ? Copies the change link URL for a given proxy to the clipboard and displays a success message.
 * @param {string} proxy_name - The name of the proxy.
 ! @throws {Error} If the request fails or encounters an error.
 */
async function proxyActionCopyChangeLink(proxy_name) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: false,
            accessLevel: 'proxies',
            permission: 'change_ip',
            limit: 1
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.scope.proxies.includes('change_ip'))?.key;
        const url = `https://cmd.illusory.io/v1/proxies/changeip/${apiKey}/${proxy_name}`;
        // Copy URL to clipboard
        await navigator.clipboard.writeText(url);
        // console.log('URL copied to clipboard');
        const sucTit = `Your request was successful`;
        const sucMsg = `Change IP Link is copied to clipboard for ${proxy_name}.`;
        modSucAlert(proxy_name, sucTit, sucMsg);
    } catch (error) {
        let errMsg = error.message;
        let errStatus = error.status;
        let errData = error.data;
        // Open error modal if any
        let modOpen = await checkPrxModOpen();
        if (modOpen) {
            const errTit = `There was an error with your request`;
            modErrAlert(proxy_name, errTit, errMsg);
        }
        try {
            await ErrorHandler(errMsg, errData, errStatus);
        } catch (error) {
            throw error;
        }
    }
}


async function proxyActionPowerCycle(proxy_name) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
        };
        const url = new URL(`https://cmd.illusory.io/v1/proxies/reboot/${proxy_name}`);

        // Send the request
        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const sucTit = `Your request was successful`;
        modSucAlert(proxy_name, sucTit, resMsg);
    } catch (error) {
        const modOpen = await checkPrxModOpen();
        if (modOpen) {
            const errTit = `There was an error with your request`;
            const errTxt = error.error.message;
            modErrAlert(proxy_name, errTit, errTxt);
        }
        throw error;
    }
}

/**
 ? Executes a proxy action to update the auto change IP settings.
 * @param {string} proxy_name The name of the proxy.
 * @param {boolean} enable Whether to enable or disable auto change IP.
 * @param {number} rate The rate at which the IP should change.
 ! @throws {Error} If the request fails or encounters an error.
 */

async function proxyActionUpdateAutoChange(proxy_name, enable, rate) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                enable: enable,
                rate: rate
            })
        };
        const url = new URL(`https://cmd.illusory.io/v1/proxies/autochangeip/${proxy_name}`);

        // Send the request
        const response = await fetch(url, options);

        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const sucTit = `Your request was successful`;
        const sucMsg = resMsg;
        modSucAlert(proxy_name, sucTit, sucMsg);
    } catch (error) {
        const modOpen = await checkPrxModOpen();
        if (modOpen) {
            const errTit = `There was an error with your request`;
            const errTxt = error.error.message;
            modErrAlert(proxy_name, errTit, errTxt);
        }
        throw error;
    }
}

async function proxyActionUpdateIpv4(proxy_name, enable) {
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                enable: enable
            })
        };
        const url = new URL(`https://cmd.illusory.io/v1/proxies/ipv4/${proxy_name}`);

        // Send the request
        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus} = resJson;
        if (!response.ok) {
            let errMsg = `Please try again later or contact support. Proxy Name: ${proxy_name}`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later. Proxy Name: ${proxy_name}`;
            }
            errStatus = response.status;
            errData = resJson.data;
            await ErrorHandler(errMsg, errData, errStatus);
        }
        const sucTit = `Your request was successful`;
        modSucAlert(proxy_name, sucTit, resMsg);
    } catch (error) {
        const modOpen = await checkPrxModOpen();
        if (modOpen) {
            const errTit = `There was an error with your request`;
            const errTxt = error.error.message;
            modErrAlert(proxy_name, errTit, errTxt);
        }
        throw error;
    }
}

$('#modChIpBtn').off('click').click(async function () {
    let action = "change_ip", proxy_name = await getCurrentProxyUrlSearch(), ldrSelector = "#modChIpBtnLdr",
        actionBtnIco = "#modChIpBtnIco"
    await modProxyActionBtnLdr(proxy_name, action, ldrSelector, actionBtnIco);
});

$('#modCpyChIpLnkBtn').off('click').click(async function () {
    let action = "copy_change_link", proxy_name = await getCurrentProxyUrlSearch(),
        ldrSelector = "#modCpyChIpLnkBtnLdr", actionBtnIco = "#modCpyChIpLnkBtnIco"
    await modProxyActionBtnLdr(proxy_name, action, ldrSelector, actionBtnIco);
});

$('#modPowerCycleBtn').off('click').click(async function () {
    let action = "power_cycle", proxy_name = await getCurrentProxyUrlSearch(), ldrSelector = "#modPowerCycleBtnLdr",
        actionBtnIco = "#modPowerCycleBtnIco"
    await modProxyActionBtnLdr(proxy_name, action, ldrSelector, actionBtnIco);
});


$(`[modal_copy]`).off('click').click(async function () {
    let proxy = await getCurrentProxyUrlSearch();
    let elemToTarget = $(this).attr('modal_copy');
    let textToCopy = $(`#${elemToTarget}`).text();
    await navigator.clipboard.writeText(textToCopy);
    modSucAlert(proxy, `Your request was successful`, `Copied details to clipboard for ${proxy}.`);
    $(this).addClass('copied');
    sleep(2000).then(() => {
        $(this).removeClass('copied');
        modSucAlert(``, ``, ``, ``, false);
    });
});

/**
 ? Clears local items asynchronously.
 ** @returns {Promise<string>} - A promise that resolves to a message indicating that the local items have been cleared.
 */
// async function clearLocalItems() {
//     return new Promise((resolve) => {
//         localStorage.removeItem("rpcProxyInterval");
//         localStorage.removeItem("rpcProxyRunning");
//         setTimeout(() => {
//             resolve("Cleared local items");
//         }, 100);
//     });
// }

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

// Usage example
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
        await mountClerk();
        // Authenticate request
        const token = await supaToken()
        const client = await supaClerk(token)
        const cmdbar = await identifyCmdbar(token);
        const {hmac, user_id} = cmdbar.data;
        // Start cmdbar
        await cmdbarStart(user_id, hmac);
        $(`.cmdbhelp--nav`).off('click').click(async function () {
            window.CommandBar.toggleHelpHub();
        })
        // Get Proxies
        await lscNetworkDisplay()
        showBody();
        await proxyActionGetProxies(client);
        // await clerkActions(client, "user_get_proxies");

        // Load timeago
        await lscTimeAgo();
        await getTimeAgoManual();
        await getTimeAgoExpires();
        await getTimeAgoAdded();
        // await getTimeAgoAuto();

        await navStart();
        await modalStart();
        await hide_skel_dash();
        // await pageLoader();

        // Load realtime

        await rpcProxy(client);
        await rpcUser(client);
        rpcRefresh();
        await deferredActions();
    } catch (e) {
        console.error(e);
        if (e.error.redirect) {
            await redirect(e.error.redirect.target, e.error.redirect.path, e.error.redirect.enableBack);
        }
    }
}

pageInit();