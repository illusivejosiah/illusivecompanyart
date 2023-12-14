/*
 * 2023.12.14.10:23:2
 */

// -- Setting up some variables for our error party
let errStatus, errMsg, errData = {};

// -- Function for when the stuff hits the fan
async function ErrorHandler(msg, data, status) {
    // Putting all our error eggs in one basket
    const errorObj = {
        ok: false, message: msg, data
    };
    // Throwing it back
    throw {error: errorObj, status: status};
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showBody() {
    $(document).ready(function () {
        $('.body_content').show(); // Show the element
        setTimeout(function () {
            $('.body_content').css('opacity', '1'); // Change opacity after a brief delay
        }, 10); //
    });
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
 * Asynchronously redirects the user to a different URL based on the specified target.
 * If the target is '_self', it updates the browser history, performs a fetch request,
 * and reloads the page. If the target is '_blank', it opens the URL in a new tab/window.
 *
 * @param {string} target - The target window/tab to redirect the user to ('_self' or '_blank').
 * @param {string} path - The URL path to redirect the user to.
 * @param {boolean} enableBack - Indicates whether to enable the option to navigate back after redirection.
 *
 * @return {Promise<void>} A promise that resolves after redirection is completed.
 */
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


async function mountClerk() {
    await window.Clerk.mountSignUp(
        document.getElementById("sign-up")
    );
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
    } catch (e) {
        return;
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
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}


// Deferred functions
async function deferredActions(delay = 0) {
    await sleep(delay);
    $(`.cl-footer`).remove();

    $(document).ready(function () {
        let link = $('<a/>', {
            href: '/app/sign-in',
            class: 'sect_crd_rt_cta w-inline-block w-clearfix',
            style: 'position: absolute; right: 30px;'
        });

        let div = $('<div/>', {
            class: 'sect_crd_rt_cta_txt',
            text: 'Sign In'
        });

        let img = $('<img/>', {
            src: 'https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b8275960eb4ca6ae6b08d3_arrow-up-right-line-white-1sk.svg',
            loading: 'lazy',
            alt: '',
            class: 'rt_cta_ico'
        });

        link.append(div);
        link.append(img);
        $('.cl-card').prepend(link);
    });
}

/**
 ? Initializes the page by performing the necessary asynchronous operations.
 ** @returns {Promise<void>} A promise that resolves when the page initialization is complete.
 */
async function pageInit() {
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
    await mountClerk();
    // Authenticate request

    await deferredActions(500);
    showBody();

    // await iniIx2();
    // // await hideSkel();
    // // await pageLoader();

}

pageInit();