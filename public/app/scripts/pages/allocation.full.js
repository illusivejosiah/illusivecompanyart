/*
 * 2023.12.14.10:51:16
 */
// -- For vercel

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


function validateInput(event) {
    let input = event.target;
    let value = input.value || '';
    let newValue = value.replace(/[^0-9]/g, '');  // This will remove anything that's not a digit
    if (newValue !== value) {
        input.value = newValue;
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

async function hideSkel() {
    return new Promise((resolve) => {
        setTimeout(() => {
            $(".crd_wrp").show();
            $(".skel_cnt_active").hide();
            $(".crd_skel_wrp").hide();
            resolve("Hid card skeletons");
        }, 100);
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
        // // .then((val) => console.log(val))
        .catch((err) => console.error(err.message));
}

/**
 *? Fetches the "timeago" library from "scripts/functions/timeago.full.min.js"
 *? and logs the fetched value on successful fetch or logs the error message on failure.
 * @async
 * @function lscTimeAgo
 ** @returns {Promise<void>} - A promise that resolves when the fetch is successful or rejects with an error message otherwise.
 */
async function lscTimeAgo() {
    await lsc("scripts/functions/timeago.full.min.js", "timeago.full.min.js")
        // // .then((val) => console.log(val))
        .catch((err) => console.error(err.message));
}

/**
 *? Retrieves a Supabase token through the Clerk session.
 ** @returns {Promise<string>} A Promise that resolves to a Supabase token.
 *                            If successful, the token is returned.
 *                            If an error occurs, an "Invalid token" message is returned.
 *! @throws {Error} If an error occurs while retrieving the token.
 */

async function supaToken() {
    try {
        const token = await window.Clerk.session.getToken({
            template: "supabase-auth",
        });
        // 
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
        // console.log(client)
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
    console.log(data);
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
    // console.log('sucAlert', title, message, buttonText, showDiv, closeOther)
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
 *? Sends a request to get pricing information for proxies.
 * @param {Array} proxies - An array of proxies for which pricing information is needed.
 *! @throws {Error} - If there is an error with the request or if the response is not successful.
 ** @returns {Promise.<Object>} - A promise that resolves to the pricing information in JSON format.
 */
async function getPricing(proxies, compare = null) {
    try {
        let query;
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
            body: JSON.stringify(proxies)
        };
        const url = new URL(`https://cmd.illusory.io/v1/price`);

        if (!compare) {
            query = ``
        } else {
            query = `?compare=${compare}`
        }
        // add the query to the url
        url.search = query;

        // Send the request
        const response = await fetch(url, options);
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
        // sucAlert(`Your request was successful`, `${resMsg}`);
        return resJson;
    } catch (error) {
        if (error.message !== `No valid periods to process.`) {
            errAlert(`There was an error with your request`, `${error.message}`);
        }
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}

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

async function finalizeAllocation(proxies) {
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
            body: JSON.stringify(proxies)
        };
        const url = new URL(`https://cmd.illusory.io/v1/proxies/allocate`);

        // Send the request
        const response = await fetch(url, options);
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
        sucAlert(`Your request was successful`, `${resMsg}`);
        return resJson;
    } catch (error) {
        errAlert(`There was an error with your request`, `${error.message}`);
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}

async function setPricing(pricing) {
    function convertPeriodToSingular(period) {
        const mapping = {
            'yearly': 'Year', 'monthly': 'Month', 'weekly': 'Week', 'daily': 'Day', 'hourly': 'Hour'
        };
        return mapping[period] || period;
    }

    function updateDiscountDivs(discountValue, discountSelector, lineSelector) {
        let discountDiv = $(discountSelector);
        let lineDiv = $(lineSelector);
        if (discountValue !== undefined && discountValue > 0) {
            discountDiv.text(`-$${discountValue}`);
            lineDiv.show();
        } else {
            discountDiv.text('$0');
            lineDiv.hide();
        }
    }

    const ispTally = {'AT&T': 0, 'Verizon': 0, 'T-Mobile': 0};
    const periods = ['yearly', 'monthly', 'weekly', 'daily', 'hourly'];
    let anyPeriodExists = false; // To track if any periods exist in the pricing object
    // Clear any existing period lines
    $('[checkout_subcontent="time"]').empty();

    for (let period of periods) {
        let individualStandardPrice;
        let existsInPricing = pricing.data.periods.hasOwnProperty(period);

        if (existsInPricing) {
            anyPeriodExists = true; // Set the flag to true if any period exists
            let individualKeys = Object.keys(pricing.data.periods[period]?.individual || {});
            let firstIndividualKey = individualKeys[0];

            if (firstIndividualKey) {
                individualStandardPrice = pricing.data.periods[period].individual[firstIndividualKey].standard;
            }

            // Show line items associated with this period
            $(`[line_items="${period}"]`).show();

            // Update and show/hide the per_member_discount and per_member_discount_line divs
            let savingsIndividualMember = pricing.data.savings.member[period]?.individual;
            updateDiscountDivs(savingsIndividualMember, `[per_member_discount="${period}"]`, `[per_member_discount_line="${period}"]`);

            // Update and show/hide the per_bulk_discount and per_bulk_discount_line divs
            let savingsIndividualBulk = pricing.data.savings.bulk[period]?.individual;
            updateDiscountDivs(savingsIndividualBulk, `[per_bulk_discount="${period}"]`, `[per_bulk_discount_line="${period}"]`);

            // Determine the appropriate reduced per price
            let reducedPerPrice;
            if (pricing.data.periods[period].bulk.price !== null) {
                reducedPerPrice = pricing.data.periods[period].bulk.price;
            } else {
                if (pricing.data.member) {
                    reducedPerPrice = pricing.data.periods[period].individual[firstIndividualKey].member;
                } else {
                    reducedPerPrice = pricing.data.periods[period].individual[firstIndividualKey].standard;
                }
            }

            // Update the per_price divs
            reducedPerPrice = reducedPerPrice !== undefined ? reducedPerPrice : 0;
            $(`[per_price="${period}"]`).text(`$${reducedPerPrice}`);

            // Generate HTML structure for each individual item within the period
            for (let individualItem in pricing.data.periods[period].individual) {
                let itemTotal;
                let itemData = pricing.data.periods[period].individual[individualItem];
                if (itemData.interval > 1) {
                    itemTotal = reducedPerPrice * itemData.interval;
                } else {
                    itemTotal = reducedPerPrice;
                }
                let periodConverted = convertPeriodToSingular(period)

                // Check the prefix to determine the ISP and update the tally
                let isp;
                if (individualItem.startsWith('AT-')) {
                    isp = 'AT&T';
                } else if (individualItem.startsWith('VR-')) {
                    isp = 'Verizon';
                } else if (individualItem.startsWith('TM-')) {
                    isp = 'T-Mobile';
                }

                if (isp) {
                    ispTally[isp]++;
                }

                let outerDiv = $("<div></div>")
                    .attr("period_total_line", individualItem)
                    .addClass("w-layout-grid qstack_c2")

                let textCell = $("<div></div>")
                    .addClass("w-layout-cell lt_c")
                    .append($("<div></div>")
                        .attr("period_total_text", individualItem)
                        .addClass("sect_crd_subtxt")
                        .text(`${individualItem} + ${itemData.interval} ${periodConverted}(s)`));

                let totalCell = $("<div></div>")
                    .addClass("w-layout-cell rt_c")
                    .append($("<div></div>")
                        .attr("period_total", individualItem)
                        .addClass("sect_crd_subtxt white")
                        .text(`$${itemTotal}`));

                outerDiv.append(textCell).append(totalCell);

                $('[checkout_subcontent="time"]').append(outerDiv);
            }

        } else {
            // Hide line items associated with this period
            $(`[line_items="${period}"]`).hide();
        }

        individualStandardPrice = individualStandardPrice !== undefined ? `$${individualStandardPrice}` : '$0';
        let elementsToUpdate = $(`[per_standard="${period}"]`);
        elementsToUpdate.text(individualStandardPrice);
    }

    // Update the isp_quantity divs based on the tally and show/hide lines
    for (let isp in ispTally) {
        const ispCount = ispTally[isp];
        $(`[checkout_isp_quantity="${isp}"]`).text(ispCount);

        if (ispCount > 0) {
            $(`[isp_quantity_line="${isp}"]`).show();
        } else {
            $(`[isp_quantity_line="${isp}"]`).hide();
        }
    }

    // Show or hide divs based on whether any period exists
    if (anyPeriodExists) {
        // Update the total due text
        $('[due="total"]').text(`$${pricing.data.total.due}`);
        if (pricing.data.savings.interval > 0) {
            $('[interval_discount="total"]').text(`-$${pricing.data.savings.interval}`);
            $('[checkout_subcontent="interval_discount"]').show();
        } else {
            $('[checkout_subcontent="interval_discount"]').hide();
            $('[interval_discount="total"]').text(`-$0`);
        }
        // Show the product, per-price, time, savings, and funds lines
        $('[checkout_section="product"], [checkout_section="per_price"], [checkout_section="time"]').show();
        // Update the total savings text
        if (pricing.data.savings.total > 0) {
            $('[savings_line="total"]').show();
        } else {
            $('[savings_line="total"]').hide();
        }
        $('[savings="total"]').text(`$${pricing.data.savings.total}`);

        let compare, funds = 0, diff = 0;
        try {
            compare = await compareFunds(pricing.data.total.due);
            if (compare.data) {
                ({funds, diff} = compare.data);
                $('[checkout_funds="total"], [modal_det="funds"]').text(`$${funds}`)
                $('[modal_det="due"]').text(`$${pricing.data.total.due}`)
                $('[modal_det="diff"]').text(`$${diff}`)
                $('[funds_line="required"]').hide()
                $('[checkout_funds="required"]').text(`$0`)
                $('[checkout_btn="issue"]').hide()
                $(`[checkout_btn="continue"]`).css('display', 'flex')
            }
        } catch (e) {
            if (e.error.data) {
                console.error(e.error.data);
                ({funds, diff} = e.error.data);
                $('[checkout_funds="total"]').text(`$${funds}`)
                $('[checkout_funds="required"]').text(`$${diff}`)
                    .attr('funds_required', diff)
                $('[funds_line="required"]').css('display', 'grid')
                $('[checkout_btn="continue"]').hide()
                $(`[checkout_btn="issue"]`).css('display', 'flex')
            }
        }
        $(`.checkout_btn_sect`).show()
        // Change the indicator to "Action required" and set the class to orange
        $('[indicator="action_required"]').removeClass('green').addClass('orange').text('Action required');
    } else {
        $(`.checkout_btn_sect`).hide()
        $('[due="total"]').text(`$0`);
        $('[funds_line="required"]').hide()
        $('[checkout_funds="required"]').text(`$0`)
        $('[checkout_section="product"], [checkout_section="per_price"], [checkout_section="time"], [savings_line="total"]').hide();
        $('[savings="total"]').text(`$0`);
        // Change the indicator to "No pending changes" and set the class to green
        $('[indicator="action_required"]').removeClass('orange').addClass('green').text('No pending changes');
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
        await ErrorHandler(`${error.message}`, {}, `${error.status}`, {
            target: '_self',
            path: '/app/sign-in',
            enableBack: false
        });
    }
}

async function compareFunds(due) {
    try {
        const getDueData = {
            due: due
        }
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
            body: JSON.stringify(getDueData)
        };

        const url = new URL(`https://cmd.illusory.io/v1/funds/compare`);

        // Send the request
        const response = await fetch(url, options);
        const resJson = await response.json();
        const {message: resMsg, status: resStatus, data: resData} = resJson;
        if (!response.ok) {
            let errMsg = `There was an error with your request. Please try again later or contact support.`;
            if (resMsg) {
                errMsg = resMsg;
            } else if (resStatus === 429) {
                errMsg = `Too many requests. Please try again later.`;
            }
            let errStatus = resStatus;
            if (!resStatus) {
                errStatus = 400;
            }
            const data = resData;
            await ErrorHandler(`${errMsg}`, data, `${errStatus}`);
        }
        return resJson;
    } catch (e) {
        console.error(e);
        await ErrorHandler(`${e.error.message}`, e.error.data, `${e.error.status}`);
    }
}


let pendingAllocation = null;
let pendingPriceSet = null;

async function collectProxySettings(action) {
    if (action === `reprice`) {
        // Cancel any pending call
        if (pendingPriceSet !== null) {
            clearTimeout(pendingPriceSet);
        }
        // Set up a new pending call
        pendingPriceSet = setTimeout(async () => {
            pendingPriceSet = null;  // Reset the pending call variable
            $("#checkoutCrdAutoplayLdr").hide();
            LottieInteractivity.create({
                player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "stop"}]
            });
            $(".skel_checkout, #checkoutCrdLoopLdr").show();
            LottieInteractivity.create({
                player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "loop"}]
            });
            const proxiesObj = {
                "proxies": []
            };
            // Loop through each proxy input element
            $(".period_interval_input").each(function () {
                let input = $(this);
                let inputId = input.attr('id');
                let proxy = inputId.replace("period_input-", "");
                let period = $(`#period-${proxy}`).attr('current_period') || 'hourly'; // Default to hourly if no period set
                let currentValue = parseInt(input.val(), 10);
                proxiesObj.proxies.push({
                    "proxy_name": proxy, "period": period, "interval": currentValue
                });
            });
            // Call the target function with the collected array
            try {
                let pricing;
                if (proxiesObj.proxies.length > 0) {
                    pricing = await getPricing(proxiesObj);
                    await setPricing(pricing);
                } else {
                    throw new Error(`No valid periods to process.`);
                }
                if (pricing.data.hasOwnProperty('member') && pricing.data.member === false && pricing.data.total.due > pricing.data.total.member) {
                    const comparedPricing = await getPricing(proxiesObj, true);
                    const comparedSavings = comparedPricing.data.total.standard - comparedPricing.data.total.member;
                    $('[checkout_text="member_discount"]').text(`Save An Additional $${comparedSavings}`)
                } else if (pricing.data.hasOwnProperty('member') && pricing.data.member === false) {
                    $('[checkout_text="member_discount"]').text(`Member Discount Inactive`)
                }
            } catch (error) {
                console.error(error);
                await setPricing({data: {periods: {}}});
                const member = $("[is_member]").attr("is_member");
                if (member === 'false') {
                    $('[checkout_text="member_discount"]').text(`Member Discount Inactive`)
                }
            }
            $("#checkoutCrdLoopLdr").hide();
            if (!$("#checkoutCrdAutoplayLdr").is(":visible")) {
                $(".skel_checkout").hide();
            }
            LottieInteractivity.create({
                player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
            });
        }, 2000);  // 3-second delay
    } else if (action === `allocate`) {
        if (pendingAllocation !== null) {
            return;
        }
        pendingAllocation = true;
        $("#modAlloBtnIco").css("background-size", 0);
        $('#modAlloBtnLdr').css('display', 'flex');
        LottieInteractivity.create({
            player: "#modAlloBtnLdr", mode: "chain", actions: [{
                state: "loop",
            }]
        });

        const proxiesObj = {
            "proxies": {
                "time": []
            }
        };

        // Loop through each proxy input element
        $(".period_interval_input").each(function () {
            let input = $(this);
            let inputId = input.attr('id');
            let proxy = inputId.replace("period_input-", "");
            let period = $(`#period-${proxy}`).attr('current_period') || 'hourly'; // Default to hourly if no period set
            let currentValue = parseInt(input.val(), 10);
            proxiesObj.proxies.time.push({
                "proxy_name": proxy, "period": period, "interval": currentValue
            });
        });
        // Call the target function with the collected array
        try {
            await finalizeAllocation(proxiesObj);
            $('[modal_overlay="allocate"]').hide();
            // console.log(allocate)
        } catch (e) {
            console.error(e);
            pendingAllocation = null;
        }

        $("#modAlloBtnIco").css("background-size", "unset");
        $('#modAlloBtnLdr').css('display', 'none');
        LottieInteractivity.create({
            player: "#modAlloBtnLdr", mode: "chain", actions: [{state: "stop"}]
        });
        pendingAllocation = null;
    }
}


async function updateUser(user) {
    if (!user) {
        user = await getUser();
    }
    let {
        funds,
        renewing_soon,
        renewing_soon_count,
        expiring_soon,
        expiring_soon_count,
        renewal_required,
        total_required,
        total_commitment,
        member
    } = user.data;
    if (!total_commitment) {
        $(".body_content").remove();
        await redirect(`_self`, `/new`, false);
    }
    $('[upcoming="funds"]').text(`$${funds}`)
    $('[upcoming="renewing_soon"]').text(`$${renewing_soon}`)
    $('[upcoming="renewing_soon_count"]').text(`(${renewing_soon_count})`)
    $('[upcoming="expiring_soon"]').text(`$${expiring_soon}`)
    $('[upcoming="expiring_soon_count"]').text(`(${expiring_soon_count})`)
    $('[upcoming="renewal_required"]').text(`$${renewal_required}`)
    $('[upcoming="total_required"]').text(`$${total_required}`)
    $('[upcoming="total_commitment"]').text(`$${total_commitment}`)

    if (renewal_required > 0) {
        $('[info_icon="upcoming_renewal_required"]').addClass(`hide`)
        $('[info_icon_err="upcoming_renewal_required"]').removeClass(`hide`)
    } else {
        $('[info_icon_err="upcoming_renewal_required"]').addClass(`hide`)
        $('[info_icon="upcoming_renewal_required"]').removeClass(`hide`)

    }

    if (total_required > 0) {
        $('[info_icon="upcoming_total_required"]').addClass(`hide`)
        $('[info_icon_err="upcoming_total_required"]').removeClass(`hide`)
    } else {
        $('[info_icon_err="upcoming_total_required"]').addClass(`hide`)
        $('[info_icon="upcoming_total_required"]').removeClass(`hide`)
    }

    if (total_required == 0 && renewal_required == 0) {
        $('[info_icon="upcoming_funds"]').removeClass(`hide`)
        $('[info_icon_err="upcoming_funds"]').addClass(`hide`)
    } else {
        $('[info_icon_err="upcoming_funds"]').removeClass(`hide`)
        $('[info_icon="upcoming_funds"]').addClass(`hide`)
    }

    $('[checkout_funds="total"]').text(`$${funds}`)
    if (member) {
        $('[checkout_text="member_discount"]').text(`Member Discount Enabled`)
        $('[checkout_info_explain="member"]').text(`You have member pricing enabled and are receiving a discount on your proxies.`)
        $('[cta="member_discount_apply"]').hide()
        $('[tog="member_discount"]').css('display', 'flex');
        $('[is_member="false"]').attr('is_member', 'true');
    }
}

async function proxyActionSetAutoRenew(proxies) {
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
            body: JSON.stringify(proxies)
        };
        const url = new URL(`https://cmd.illusory.io/v1/proxies/allocate/renew`);

        // Send the request
        const response = await fetch(url, options);
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
        // sucAlert(`Your request was successful`, `${resMsg}`);
        return resJson;
    } catch (error) {
        errAlert(`There was an error with your request`, `${error.message}`);
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}


/**
 *? Asynchronously retrieves and processes data from a Supabase database.
 * @async
 * @function proxyActionGetProxies
 * @param {any} supabaseClient - A Supabase client instance.
 ** @returns {Promise<void>} - Returns a Promise that resolves after the data has been retrieved and processed.
 */

async function proxyActionGetProxies() {
    let ispTotal = 0;
    let ispTally = {'AT&T': 0, 'Verizon': 0, 'T-Mobile': 0};
    let periodTally = {'yearly': 0, 'monthly': 0, 'weekly': 0, 'daily': 0, 'hourly': 0};
    try {
        const apiKeyData = await getApiKeys({
            format: 'visible',
            master: true,
        })
        const apiKey = apiKeyData.data.apiKeys.find(key => key.master)?.key;

        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
        };

        const url = new URL(`https://cmd.illusory.io/v1/proxies`);

        // Send the request
        const response = await fetch(url, options);
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
        let items = resJson.data;
        let proxyCount = resJson.data.length;

        $(".prx_allo_crds_container").first().empty();

        for (let i = 0; i < items.length; i++) {
            let {
                proxy_name,
                period,
                isp,
                city,
                state,
                expires_at,
                added_at,
                auto_renew,
                auto_renew_interval,
                nickname,
                h_port,
                s_port
            } = items[i];

            const convertPeriods = {
                "hourly": "Hours", "daily": "Days", "weekly": "Weeks", "monthly": "Months", "yearly": "Years"
            };

            let autoRenewPeriod = convertPeriods[period] || "";

            let autoRenewColor, autoRenewText, autoRenewToggleCss;
            if (!auto_renew) {
                autoRenewColor = `grey`
                autoRenewText = `Auto Renew Off`
                autoRenewToggleCss = `off`
            } else {
                autoRenewColor = `green`;
                autoRenewText = `Renews Every ${auto_renew_interval} ${autoRenewPeriod}`;
                autoRenewToggleCss = `on`
            }

            if (auto_renew && auto_renew_interval === 1) {
                autoRenewText = autoRenewText.slice(0, -1);
            }

            // Create the main card container
            let card = $("<div></div>")
                .attr("id", `proxy-${proxy_name}`)
                .addClass("prx_allo_crd w-clearfix");

            // Icon container
            let iconContainer = $("<div></div>")
                .addClass("prx_allo_crd_ico_ctn w-clearfix")
                .attr("qm_btn", proxy_name);
            let iconWrap = $("<div></div>").addClass("prx_allo_crd_ico_wrp");
            let iconImg = $("<img>")
                .attr("src", "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64e8e6027533a9dbde2f3407_settings-03.svg")
                .attr("width", "17")
                .attr("height", "17")
                .addClass("prx_allo_crd_ico_settings");
            iconWrap.append(iconImg);

            // Quick Menu container
            let quickMenu = $("<div></div>")
                .attr("qm", proxy_name)
                .addClass("prx_crd_qm");

            let quickMenuGrids = $("<div></div>").addClass("qm_grids");

            // Auto Renew item
            let quickMenuAutoRenew = $("<div></div>").addClass("w-layout-grid qm_grid_item two");
            let quickMenuAutoRenewIcon = $("<div></div>").addClass("qm_item_ico renew")
                .attr("qm_item_ico_auto_renew_tog", proxy_name);

            // Lottie animation for toggle
            let autoRenewLottie = $("<div></div>").addClass("btn_ldr_wrp w-embed");
            let autoRenewLottiePlayer = $('<lottie-player class="lottie_btn_ldr"></lottie-player>')
                .attr({
                    "qm_item_ldr_auto_renew_tog": proxy_name,  // Note the attribute name change to signify the toggle
                    "src": "https://lottie.host/fb158a1f-7792-4544-bdfe-eaeb7cc509c9/MXhhkYpIxT.json",
                    "background": "transparent"
                });
            autoRenewLottie.append(autoRenewLottiePlayer);

            let quickMenuAutoRenewText = $("<div></div>").addClass("qm_item_txt").text("Auto Renew");
            let quickMenuAutoRenewWrap = $("<div></div>").addClass("qm_item w-clearfix");
            quickMenuAutoRenewWrap.append(quickMenuAutoRenewIcon, autoRenewLottie, quickMenuAutoRenewText);  // Notice the adjusted order here

            let quickMenuToggleBtn = $("<div></div>")
                .attr({"qm_auto_renew": auto_renew, "qm_item_auto_renew_tog": proxy_name})
                .addClass(`qm_tog_btn ${autoRenewToggleCss}`);
            let quickMenuToggle = $("<div></div>").addClass("qm_tog");
            quickMenuToggleBtn.append(quickMenuToggle);
            let quickMenuAutoRenewRight = $("<div></div>")
                .addClass("qm_item right");
            quickMenuAutoRenewRight.append(quickMenuToggleBtn);
            quickMenuAutoRenew.append(quickMenuAutoRenewWrap, quickMenuAutoRenewRight);


            // Renew Every item
            let quickMenuRenewInterval = $("<div></div>").addClass("w-layout-grid qm_grid_item two")
                .attr("qm_item_auto_renew_btn", proxy_name)
            let quickMenuRenewIntervalWrap = $("<div></div>").addClass("qm_item w-clearfix");
            // Icon
            let renewEveryIcon = $("<div></div>").addClass("qm_item_ico every")
                .attr("qm_item_ico_auto_renew_interval", proxy_name)
            quickMenuRenewIntervalWrap.append(renewEveryIcon);
            // Lottie animation
            let renewEveryLottie = $("<div></div>").addClass("btn_ldr_wrp w-embed");
            let renewEveryLottiePlayer = $('<lottie-player class="lottie_btn_ldr"></lottie-player>')
                .attr({
                    "qm_item_ldr_auto_renew_interval": proxy_name,
                    "src": "https://lottie.host/fb158a1f-7792-4544-bdfe-eaeb7cc509c9/MXhhkYpIxT.json",
                    "background": "transparent"
                });
            renewEveryLottie.append(renewEveryLottiePlayer);
            quickMenuRenewIntervalWrap.append(renewEveryLottie);

            // Text "Renew Every"
            let renewEveryText = $("<div></div>").addClass("qm_item_txt").text("Renew Every");
            quickMenuRenewIntervalWrap.append(renewEveryText);

            quickMenuRenewInterval.append(quickMenuRenewIntervalWrap);

            let quickMenuRenewIntervalIco = $("<div></div>").addClass("qm_auto_renew_check_ico")
                .attr("qm_item_auto_renew_check", proxy_name)

            // Input element on the right
            let inputElement = $(`<input type="text" value=${auto_renew_interval}>`)
                .attr({
                    "qm_item_auto_renew_input": proxy_name,
                    "qm_action": "renew_interval",
                    "initial_interval": auto_renew_interval
                })
                .addClass("renew_interval_input")
                .css({
                    "appearance": "none"
                })
                .on('input', validateInput);
            let inputEmbed = $("<div></div>").addClass("w-embed qm_item_auto_renew_input-wrap");
            inputEmbed.append(inputElement);
            let quickMenuRenewIntervalRight = $("<div></div>").addClass("qm_item right");
            quickMenuRenewIntervalRight.append(quickMenuRenewIntervalIco, inputEmbed);

            quickMenuRenewInterval.append(quickMenuRenewIntervalRight);


            // Swap Device item
            let quickMenuSwapDevice = $("<div></div>")
                .attr({"qm_item_swap_btn": proxy_name, "qm_action": "swap"})
                .addClass("w-layout-grid qm_grid_item one");
            let quickMenuSwapDeviceIcon = $("<div></div>").addClass("qm_item_ico swap");
            let quickMenuSwapDeviceText = $("<div></div>").addClass("qm_item_txt").text("Swap");
            let quickMenuSwapDeviceWrap = $("<div></div>").addClass("qm_item w-clearfix");
            quickMenuSwapDeviceWrap.append(quickMenuSwapDeviceIcon, quickMenuSwapDeviceText);
            quickMenuSwapDevice.append(quickMenuSwapDeviceWrap);

            // Remove item
            let quickMenuRemove = $("<div></div>")
                .attr({"qm_item_remove_btn": proxy_name, "qm_action": "remove"})
                .addClass("w-layout-grid qm_grid_item one");
            let quickMenuRemoveIcon = $("<div></div>").addClass("qm_item_ico remove");
            let quickMenuRemoveText = $("<div></div>").addClass("qm_item_txt").text("Remove");
            let quickMenuRemoveWrap = $("<div></div>").addClass("qm_item w-clearfix");
            quickMenuRemoveWrap.append(quickMenuRemoveIcon, quickMenuRemoveText);
            quickMenuRemove.append(quickMenuRemoveWrap);

            // // Revert Changes item
            // let quickMenuRevertChanges = $("<div></div>")
            //     .attr({"qm_item_revert_btn": proxy_name, "qm_action": "revert"})
            //     .addClass("w-layout-grid qm_grid_item one");
            // let quickMenuRevertChangesIcon = $("<div></div>")
            //     .addClass("qm_item_ico revert")
            // let quickMenuRevertChangesText = $("<div></div>").addClass("qm_item_txt").text("Revert Changes");
            // let quickMenuRevertChangesWrap = $("<div></div>").addClass("qm_item w-clearfix");
            // quickMenuRevertChangesWrap.append(quickMenuRevertChangesIcon, quickMenuRevertChangesText);
            // quickMenuRevertChanges.append(quickMenuRevertChangesWrap);

            // // Appending all items to quickMenuGrids
            // quickMenuGrids.append(quickMenuAutoRenew, quickMenuRenewInterval, quickMenuSwapDevice, quickMenuRemove, quickMenuRevertChanges);

            // Appending all items to quickMenuGrids
            quickMenuGrids.append(quickMenuAutoRenew, quickMenuRenewInterval, quickMenuSwapDevice, quickMenuRemove);

            // Appending the complete quickMenuGrids to quickMenu
            quickMenu.append(quickMenuGrids);

            // Appending the iconWrap and quickMenu to iconContainer
            iconContainer.append(iconWrap, quickMenu);
            card.append(iconContainer);

            // Details container and sub-elements
            let detailsContainer = $("<div></div>").addClass("prx_allo_crd_det_ctn");
            let titleWrap = $("<div></div>").addClass("prx_allo_crd_tit_wrp w-clearfix");

            let imgWrap = $("<div></div>").addClass("prx_crd_img_wrp w-clearfix");
            let imgElement = $("<img>")
                .attr("src", "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6c4bafd787ea107133530_iphone-14-drk.svg")
                .attr("loading", "lazy")
                .addClass("prx_crd_phone");
            imgWrap.append(imgElement);

            let titleSubwrap = $("<div></div>").addClass("prx_crd_tit_subwrp w-clearfix");
            let nicknameSubwrap = $("<div></div>").addClass("prx_crd_tit_nname_wrp w-clearfix");
            // Add proxy card nickname
            let cardNicknameText = $("<div></div>")
                .addClass("prx_crd_nkname_txt")
                .html("`" + nickname + "`")
                .attr("crd_nickname", proxy_name);

            let titleText = $("<div></div>").addClass("prx_crd_tit_v2").text(proxy_name);
            let subTitleText = $("<div></div>").addClass("prx_crd_subtit").attr("crd_ports", proxy_name)
                .text(`HTTP ${h_port} • SOCKS5 ${s_port}`)
            nicknameSubwrap.append(cardNicknameText)
            titleSubwrap.append(titleText, nicknameSubwrap, subTitleText);
            titleWrap.append(imgWrap, titleSubwrap);
            detailsContainer.append(titleWrap);

            const ispColors = {
                "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink"
            };

            let ispColor = ispColors[isp] || "";
            let location = city + ` ` + state

            // Indicators
            let indWrap = $("<div></div>")
                .addClass("allo_ind_wrp_v3 w-clearfix");
            let indSubwrapLeft = $("<div></div>")
                .addClass("allo_ind_subwrp_left");
            let indIsp = $("<div></div>")
                .addClass(`ind_det ${ispColor}`)
                .attr("crd_isp", proxy_name).text(isp);
            let indLocation = $("<div></div>")
                .addClass("ind_det")
                .attr({
                    "crd_location": proxy_name,
                    "crd_location_city": city,
                }).text(location);
            let indAdded = $("<div></div>")
                .addClass("ind_det added_at")
                .attr("datetime", added_at)
                .attr("crd_added", proxy_name).text(`ADDED ${added_at}`);
            let indAutoRenew = $("<div></div>")
                .addClass(`ind_det ${autoRenewColor}`)
                .attr("datetime", auto_renew)
                .attr("crd_auto_renew", proxy_name).text(`${autoRenewText}`);
            indSubwrapLeft.append(indIsp, indLocation, indAdded, indAutoRenew);
            indWrap.append(indSubwrapLeft);
            detailsContainer.append(indWrap);

            card.append(detailsContainer);

            // Divider
            let divider = $("<div></div>").addClass("allo_crd_dvdr");
            card.append(divider);

            let periodActionsBtnWrp = $("<div></div>").addClass("allo_period_btns_wrp w-clearfix").attr({
                "id": `period-${proxy_name}`, "initial_period": period, "current_period": period
            });

            // Button grid and buttons
            let periodActionsBtnGrid = await $("<div></div>").addClass("allo_prx_crd_btn_grid");

            ["Yearly", "Monthly", "Weekly", "Daily", "Hourly"].forEach((periodTxt) => {
                let btn = $("<div></div>")
                    .attr("id", `${periodTxt.toLowerCase()}Btn-${proxy_name}`)
                    .addClass("allo_action_btn w-clearfix");
                let btnText = $("<div></div>").addClass("allo_action_btn_txt").text(periodTxt);
                if (periodTxt.toLocaleLowerCase() === period) {
                    btn.addClass("green");
                }
                btn.append(btnText);
                periodActionsBtnGrid.append(btn);
            });

            card.append(periodActionsBtnWrp);

            // Second Divider
            let secondDivider = $("<div></div>").addClass("allo_crd_dvdr");
            card.append(secondDivider);

            // Period Change Counter
            let periodChangeCounter = $("<div></div>").addClass("period_change_counter w-embed");
            let periodIntervalWrap = $("<div></div>").addClass("period_interval_wrap");

            let subMinBtn = $("<button></button>").attr("id", `sub_interval_btn-${proxy_name}`).addClass("sub_interval_btn").attr("type", "button").css("background", "none");
            let subMinImg = $("<img>").attr("src", "https://uploads-ssl.webflow.com/601983fb7d31a9e2fe9f0840/61acf8dfd096cf7d66e81706_Minus%20Icon.svg");
            subMinBtn.append(subMinImg);

            let periodInput = $("<input>").attr("type", "text").attr("value", "0").attr("id", `period_input-${proxy_name}`).addClass("period_interval_input")
                .css({
                    "background": "none",
                    "-webkit-appearance": "none"
                })
                .on('input', validateInput);

            let addMinBtn = $("<button></button>").attr("id", `add_interval_btn-${proxy_name}`).addClass("add_interval_btn").attr("type", "button").css("background", "none");
            let addMinImg = $("<img>").attr("src", "https://uploads-ssl.webflow.com/601983fb7d31a9e2fe9f0840/61acf8df4e282247acf78145_Plus%20Icon.svg");
            addMinBtn.append(addMinImg);

            periodIntervalWrap.append(subMinBtn, periodInput, addMinBtn);
            periodChangeCounter.append(periodIntervalWrap);

            periodActionsBtnWrp.append(periodActionsBtnGrid, periodChangeCounter);

            const changes = `No Changes`;

            // Additional Details
            let crdDetailsBottom = $("<div></div>").addClass("prx_allo_crd_det_ctn");
            let indWrapBottom = $("<div></div>").addClass("allo_ind_wrp_v3 w-clearfix");
            let indSubwrapBottomLeft = $("<div></div>").addClass("allo_ind_subwrp_left");
            let indSubwrapBottomRight = $("<div></div>").addClass("ind_subwrp_right");

            let indChangesWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
            let indChanges = $("<div></div>")
                .addClass("ind_det none")
                .attr("crd_changes", proxy_name).text(changes);
            indChangesWrap.append(indChanges);

            let indDataRemainingWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
            let dataRemainingInd = $("<div></div>")
                .addClass("ind_det green_infinity")
                .attr("crd_data_remaining", proxy_name).html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;GB");
            indDataRemainingWrap.append(dataRemainingInd);

            if (!expires_at) {
                expires_at = new Date().toISOString();
            }

            // Add proxy `expires` indicator wrap
            let indExpiresWrap = $("<div></div>").addClass("ind_det_wrp w-clearfix");
            let currentDate = new Date();
            let itemDate = new Date(expires_at);
            let diffInDays = (currentDate - itemDate) / (1000 * 60 * 60 * 24);
            let expireColor = expires_at && diffInDays > 1 ? "grey" : "orange";

            // Add proxy `expires` indicator text
            let indExpires = $("<div></div>")
                .addClass(`ind_det ${expireColor} expires_at`)
                .attr({
                    "datetime": expires_at, "crd_expires": proxy_name
                }).text(`Updating`);

            // Add new proxy `expires` indicator within the wrap, but hidden
            let indNewExpires = $("<div></div>")
                .addClass(`ind_det green new_expires_at`)
                .attr({
                    "datetime": expires_at, "crd_new_expires": proxy_name
                }).text(`Updating`);

            // Add new proxy `expires` indicator within the wrap, but hidden
            let indNewExpiresAppend = $("<div></div>")
                .addClass(`ind_det none hide`)
                .attr({
                    "crd_new_expires_append": proxy_name
                }).text(`Includes Previous`);

            // Add proxy info icon on `expires` indicator
            let infoImgExpires = $("<img>").attr({
                "src": "https://uploads-ssl.webflow.com/61e7cdbd824d2f94d05c4edc/64b6d137c5e0af10f266c1ed_info-circle-duo-2.svg",
                "crd_expires_info_icon": proxy_name,
            }).addClass("info_circle_duo-icon");

            // Create the outer div with class 'info-wrap' and attribute 'crd_expires_tip'
            let infoWrap = $("<div></div>").addClass("info-wrap")
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

            // // Append the constructed element to 'indExpiresWrap' after 'infoImgExpires'
            // indExpiresWrap.append(infoImgExpires, indNewExpires, indNewExpiresAppend, infoImgExpires);

            indExpiresWrap.append(indExpires, indNewExpires, indNewExpiresAppend, infoImgExpires, infoWrap);

            indSubwrapBottomLeft.append(indChangesWrap);
            indSubwrapBottomRight.append(indDataRemainingWrap, indExpiresWrap);
            indWrapBottom.append(indSubwrapBottomLeft, indSubwrapBottomRight);
            crdDetailsBottom.append(indWrapBottom);
            card.append(crdDetailsBottom);

            // Append the entire card to the main container
            $(".prx_allo_crds_container").first().append(card);

            if (isp) {
                ispTally[isp]++;
            }

            if (period) {
                periodTally[period]++;
            }

            if (!auto_renew) {
                $(`[qm_item_auto_renew_btn="${proxy_name}"]`).hide();
            }
        }

        // Update the isp_quantity divs
        for (let isp in ispTally) {
            const ispCount = ispTally[isp];
            ispTotal += ispCount;
            $(`[isp_quantity="${isp}"]`).text(ispCount);
        }
        $(`[isp_quantity="total"]`).text(ispTotal);

        // Update the period_quantity divs
        for (let period in periodTally) {
            const periodCount = periodTally[period];
            $(`[period_quantity="${period}"]`).text(periodCount);
        }
        // Update proxy_count divs
        $(`[proxy_count="total"]`).text(proxyCount);
        return;
    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }

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
                expires_at,
                added_at,
                auto_renew,
                auto_renew_interval,
                period,
                h_port,
                city,
                state,
                country,
                isp,
                product,
                s_port,
                server_ip,
                traffic
            } = payload.new;

            console.log(payload);

            // let convertedTraffic = formatTraffic(traffic);

            let location = city + ` ` + state
            const ispColors = {
                "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink"
            };

            let ispColor = ispColors[isp] || "";

            $(`[crd_ports="${proxy_name}"]`).text(`HTTP ${h_port} • SOCKS5 ${s_port}`);
            $(`[crd_isp="${proxy_name}"]`).removeClass().addClass(`ind_det ${ispColor}`).text(isp);
            $(`[crd_location="${proxy_name}"]`).text(location);
            $(`[crd_nickname="${proxy_name}"]`).html("`" + nickname + "`");
            $(`[crd_added="${proxy_name}"]`).attr("datetime", added_at)
            $(`[crd_expires="${proxy_name}"]`).attr("datetime", expires_at)

            let initialPeriod = period;
            const convertPeriods = {
                "hourly": "Hours", "daily": "Days", "weekly": "Weeks", "monthly": "Months", "yearly": "Years"
            };
            let autoRenewPeriod = convertPeriods[initialPeriod] || "";

            if (auto_renew && auto_renew_interval === 1) {
                autoRenewPeriod = autoRenewPeriod.slice(0, -1);
            }

            if (auto_renew) {
                $(`[crd_auto_renew="${proxy_name}"]`).text(`Renews Every ${auto_renew_interval} ${autoRenewPeriod}`).removeClass("grey").addClass("green");
            } else {
                $(`[crd_auto_renew="${proxy_name}"]`).text(`Auto Renew Off`).removeClass("green").addClass("grey");
            }

            const elements = [`[crd_added=${proxy_name}]`, `[crd_expires=${proxy_name}]`].map(selector => document.querySelector(selector));
            elements.forEach(el => timeago.cancel(el));

            async function otherFuntions() {
                await getTimeAgoExpires();
                await getTimeAgoAdded();
            }

            await otherFuntions();
        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
                // console.log("Subscribed to proxy events")
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
                funds,
                renewing_soon,
                renewing_soon_count,
                expiring_soon,
                expiring_soon_count,
                renewal_required,
                total_required,
                total_commitment,
                member
            } = payload.new;

            // console.log(payload);

            user = {
                data: {
                    funds,
                    renewing_soon,
                    renewing_soon_count,
                    expiring_soon,
                    expiring_soon_count,
                    renewal_required,
                    total_required,
                    total_commitment,
                    member
                }
            }

            await updateUser(user);

        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
                // console.log("Subscribed to user events")
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
    console.log('Removing all channels');
    try {
        const client = await supaClerk(token)
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
            // console.log(inactivityAlert ? 'User is inactive' : 'Tab is not visible');

            if (document.visibilityState !== 'visible') {
                // console.log('Tab is not visible');

                // Set a timeout to run supabase.removeAllChannels() after 2 minutes
                removeChannelsTimeout = setTimeout(async () => {
                    console.log('Removing all channels');
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
        // console.log("Sleeping for", SLEEP_INTERVAL, "ms");
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


// Page TimeAgo - Expired TimeAgo

function expires_locale(number, index, totalSec) {
    return [["expired just now", "expires right now"], ["expired %ss ago", "expires %ss"], ["expired 1m ago", "expires 1m"], ["expired %sm ago", "expires %sm"], ["expired 1h ago", "expires 1h"], ["expired %sh ago", "expires %sh"], ["expired 1 day ago", "expires 1d"], ["expired %sd ago", "expires %sd"], ["expired 1wk ago", "expires 1wk"], ["expired %swk ago", "expires %swk"], ["expired 1mo ago", "expires 1mo"], ["expired %smo ago", "expires %smo"], ["expired 1yr ago", "expires 1yr"], ["expired %syr ago", "expires %syr"],][index];
}

async function getTimeAgoExpires() {
    return registerAndRenderTimeAgo(expires_locale, ".expires_at");
}

async function getTimeAgoNewExpires() {
    return registerAndRenderTimeAgo(expires_locale, ".new_expires_at");
}

// Page TimeAgo - Change `added_at` TimeAgo
function added_locale(number, index, totalSec) {
    return [["added just now", "right now"], ["added %ss ago", "%ss"], ["added 1m ago", "1m"], ["added %sm ago", "in %sm"], ["added 1h ago", "1h"], ["added %sh ago", "%sh"], ["added 1d ago", "1d"], ["added %sd ago", "%sd"], ["added 1wk ago", "1wk"], ["added %swk ago", "%swk"], ["added 1mo ago", "1mo"], ["added %smo ago", "%smo"], ["added 1yr ago", "1yr"], ["added %syr ago", "%syr"],][index];
}

async function getTimeAgoAdded() {
    return registerAndRenderTimeAgo(added_locale, ".added_at");
}

async function proxyIntervalController() {

    function calculateNewExpiration(currentValue, period, currentExpiration) {
        let expirationDate;

        // Check if currentExpiration exists
        if (currentExpiration) {
            expirationDate = new Date(currentExpiration);
            // Validate if the date is valid
            if (isNaN(expirationDate.getTime())) {
                console.error("Invalid date:", currentExpiration);
                return;
            }
        } else {
            // Use the current date and time if currentExpiration does not exist
            expirationDate = new Date();
        }

        // Calculate new expiration
        const addTime = (unit, multiplier = 1) => expirationDate[`set${unit}`](expirationDate[`get${unit}`]() + currentValue * multiplier);
        const timeUnits = {
            "hourly": "Hours", "daily": "Date", "weekly": "Date", "monthly": "Month", "yearly": "FullYear",
        };

        if (timeUnits[period]) {
            if (period === "weekly") {
                addTime(timeUnits[period], 7); // 7 days in a week
            } else {
                addTime(timeUnits[period]);
            }
        } else {
            console.error("Invalid period:", period);
            return;
        }
        return expirationDate.toISOString();
    }

    function convertMultipleJumps(currentValue, input, proxy, initialPeriod) {
        let period = initialPeriod;

        const conversionRates = {
            'hourly': {next: 'daily', divisor: 4},
            'daily': {next: 'weekly', divisor: 7},
            'weekly': {next: 'monthly', divisor: 4},
            'monthly': {next: 'yearly', divisor: 12}
        };

        // Remove the green class from the initial period button
        $(`#${initialPeriod}Btn-${proxy}`).removeClass('green');

        while (currentValue > periodFunctions[period].max) {
            // Check if a 'next' period exists before proceeding
            if (conversionRates[period]) {
                const nextPeriod = conversionRates[period].next;
                $(`#period-${proxy}`).attr('current_period', nextPeriod);

                currentValue = Math.floor(currentValue / conversionRates[period].divisor);

                period = nextPeriod;
            } else {
                // No next period exists, set to maximum allowable value for current period
                currentValue = periodFunctions[period].max;
                break;
            }
        }

        // Add the green class to the final period button
        $(`#${period}Btn-${proxy}`).addClass('green');

        input.val(currentValue);
    }

    const periodFunctions = {
        yearly: {
            max: 1, min: 0, convert: function (currentValue, input, proxy) {
                if (currentValue > this.max) {
                    input.val(this.max);
                }
            }
        }, monthly: {
            max: 11, min: 0, convert: function (currentValue, input, proxy) {
                convertMultipleJumps(currentValue, input, proxy, 'monthly');
            }
        }, weekly: {
            max: 3, min: 0, convert: function (currentValue, input, proxy) {
                convertMultipleJumps(currentValue, input, proxy, 'weekly');
            }
        }, daily: {
            max: 6, min: 0, convert: function (currentValue, input, proxy) {
                convertMultipleJumps(currentValue, input, proxy, 'daily');
            }
        }, hourly: {
            max: 4, min: 0, convert: function (currentValue, input, proxy) {
                convertMultipleJumps(currentValue, input, proxy, 'hourly');
            }
        }
    }

    $('.add_interval_btn').click(async function () {
        handleInput(this, 1);
    });

    $('.sub_interval_btn').click(async function () {
        handleInput(this, -1);
    });

    $('.period_interval_input').on('input', async function () {
        handleDirectInput(this);
    });

    function handleInputOrDirectInput(input, currentValue, proxy, period) {
        const periodElement = $(`#period-${proxy}`);
        let crdChangesElement = $(`[crd_changes="${proxy}"]`);
        let proxyElement = $(`#proxy-${proxy}`);
        let currentExpiresElement = $(`[crd_expires="${proxy}"]`);
        let currentExpiresTs = $(`[crd_expires="${proxy}"]`).attr("datetime");
        let newExpiresElement = $(`[crd_new_expires="${proxy}"]`);
        let expiresInfoText = $(`[crd_expires_info_text="${proxy}"]`);
        let expiresInfoExplain = $(`[crd_expires_explain_text="${proxy}"]`);
        let newExpiresAppendElement = $(`[crd_new_expires_append="${proxy}"]`);
        if (currentValue === 0) {
            let initialPeriod = periodElement.attr('initial_period') || 'hourly';
            periodElement.attr('current_period', initialPeriod);
            $(`#${period}Btn-${proxy}`).removeClass('green');
            $(`#${initialPeriod}Btn-${proxy}`).addClass('green');
            proxyElement.removeClass('green'); // Remove green class from #proxy-${proxy}
            input.val(0);
        } else if (currentValue < periodFunctions[period].min) {
            input.val(periodFunctions[period].min);
        } else if (currentValue > periodFunctions[period].max) {
            periodFunctions[period].convert(currentValue, input, proxy);
        } else {
            input.val(currentValue);
        }

        // Update inner text of the corresponding 'crd_changes' element
        if (currentValue >= 1) {
            crdChangesElement.text("After Changes");
            proxyElement.addClass('green');
            currentExpiresElement.hide();
            newExpiresElement.show();
            newExpiresAppendElement.show();
        } else {
            crdChangesElement.text("No Changes");
            proxyElement.removeClass('green');
            newExpiresElement.hide();
            newExpiresAppendElement.hide();
            currentExpiresElement.show();
            const localTime = formatToLocalTime(currentExpiresTs);
            expiresInfoText.text(localTime);
            expiresInfoExplain.text("The time at which this proxy expires in Standard Time.");
        }
        input.change();

        // Update the 'crd_new_expires' datetime attribute
        let currentExpiration = $(`[crd_expires="${proxy}"]`).attr("datetime");
        let newExpiration;
        if (currentValue)
            if (period === 'yearly' && currentValue > 1) {
                currentValue = 1;
                newExpiration = calculateNewExpiration(currentValue, period, currentExpiration);
            } else {
                newExpiration = calculateNewExpiration(currentValue, period, currentExpiration);
            }
        $(`[crd_new_expires="${proxy}"]`).attr("datetime", newExpiration);

        if (currentValue >= 1) {
            const localTime = formatToLocalTime(newExpiration);
            expiresInfoText.text(localTime);
            expiresInfoExplain.text("The time this proxy will expire after changes are applied.");
        }

        getTimeAgoNewExpires();
        collectProxySettings(`reprice`);
    }

    function handleInput(element, increment) {
        $("#checkoutCrdLoopLdr").hide();
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });
        let input = $(increment === 1 ? element.previousElementSibling : element.nextElementSibling);
        let inputId = input.attr('id');
        let proxy = inputId.replace("period_input-", "");
        let period = $(`#period-${proxy}`).attr('current_period') || 'hourly'; // Default to hourly if no period set
        let periodElement = $(`#period-${proxy}`);

        // Set initial_period if it's not set yet
        if (!periodElement.attr('initial_period')) {
            periodElement.attr('initial_period', period);
        }

        let currentValue = parseInt(input.val(), 10) + increment;

        // Now use the refactored handleInputOrDirectInput function
        handleInputOrDirectInput(input, currentValue, proxy, period);
    }

    function handleDirectInput(element) {
        $("#checkoutCrdLoopLdr").hide();
        LottieInteractivity.create({
            player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
        });
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });
        let input = $(element);
        let inputId = input.attr('id');
        let proxy = inputId.replace("period_input-", "");
        let period = $(`#period-${proxy}`).attr('current_period') || 'hourly'; // Default to hourly if no period set
        let periodElement = $(`#period-${proxy}`);

        // Set initial_period if it's not set yet
        if (!periodElement.attr('initial_period')) {
            periodElement.attr('initial_period', period);
        }

        let currentValue = parseInt(input.val(), 10);

        // Check if the value is NaN (occurs when the input is empty)
        if (isNaN(currentValue)) {
            currentValue = periodFunctions[period].min;
        }

        // Now use the refactored handleInputOrDirectInput function
        handleInputOrDirectInput(input, currentValue, proxy, period);
    }

    // Add click event listener to period buttons
    $('.allo_action_btn').click(function () {
        $("#checkoutCrdLoopLdr").hide();
        LottieInteractivity.create({
            player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
        });
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });
        let buttonId = $(this).attr('id');

        let btnIndex = buttonId.indexOf('Btn-');
        let newPeriod = buttonId.substring(0, btnIndex);
        let proxy = buttonId.substring(btnIndex + 4);

        // Get the period element
        let periodElement = $(`#period-${proxy}`);

        // Get the current period
        let currentPeriod = periodElement.attr('current_period');

        // Set the initial_period if it is not already set
        if (!periodElement.attr('initial_period')) {
            periodElement.attr('initial_period', currentPeriod);
        }

        // Do nothing if the new period is the same as the current period
        if (newPeriod === currentPeriod) {
            return;
        }

        // Remove 'green' class from the current period button
        $(`#${currentPeriod}Btn-${proxy}`).removeClass('green');

        // Add 'green' class to the new period button
        $(this).addClass('green');

        // Update current_period attribute
        periodElement.attr('current_period', newPeriod);

        // Update inner text of the corresponding 'crd_changes' element
        let crdChangesElement = $(`[crd_changes="${proxy}"]`);
        let proxyElement = $(`#proxy-${proxy}`);

        crdChangesElement.text("After Changes");
        proxyElement.addClass('green');

        // Reset input value to 1
        $(`#period_input-${proxy}`).val(1).change();

        // Update the 'crd_new_expires' datetime attribute
        let currentExpiration = $(`[crd_expires="${proxy}"]`).attr("datetime");
        let newExpiration = calculateNewExpiration(1, newPeriod, currentExpiration);
        $(`[crd_expires="${proxy}"]`).hide()
        $(`[crd_new_expires="${proxy}"]`).show()
        $(`[crd_new_expires_append="${proxy}"]`).show()
        $(`[crd_new_expires="${proxy}"]`).attr("datetime", newExpiration);
        let expiresInfoText = $(`[crd_expires_info_text="${proxy}"]`);
        let expiresInfoExplain = $(`[crd_expires_explain_text="${proxy}"]`);
        let newExpiresTs = $(`[crd_new_expires="${proxy}"]`).attr("datetime");
        const localTime = formatToLocalTime(newExpiresTs);
        expiresInfoText.text(localTime);
        expiresInfoExplain.text("The time this proxy will expire after changes are applied.");
        $(`.checkout_btn_sect`).show()
        getTimeAgoNewExpires();
        collectProxySettings(`reprice`);
    });

}

$('[checkout_btn="continue"]').click(async function () {
    $('[modal_overlay="allocate"]').removeClass('hide');
});

$('[checkout_btn="issue"]').click(async function () {
    let requiredFunds = parseInt($(`[checkout_funds="required"]`).attr('funds_required'), 10);
    window.open(`funds?custom=${requiredFunds}`, '_blank');
});

$('[mod_allocate_action_btn="cancel_allocate"]').click(async function () {
    $(`.modal_overlay`).addClass("hide");
});

$('[mod_allocate_action_btn="confirm_allocate"]').off('click').click(async function () {
    try {
        await collectProxySettings(`allocate`);
    } catch (error) {
        console.error(error);
    }
});

async function proxyQuickMenus() {

    function adjustToMaxInterval(period, interval, maxIntervals) {
        // Return the minimum of the provided interval and the maximum allowed interval for the period
        return Math.min(interval, maxIntervals[period.toLowerCase()] || interval);
    }

    function adjustPeriodAndInterval(period, interval) {
        // Maximum intervals for each period
        const maxIntervals = {
            'yearly': 1, 'monthly': 6, 'weekly': 2, 'daily': 5
        };

        let adjustedPeriod = period.toLowerCase();
        let adjustedInterval = adjustToMaxInterval(adjustedPeriod, interval, maxIntervals);

        return {adjustedPeriod, adjustedInterval};
    }

    function handleAutoRenewIntervalInput(element) {
        let input = $(element);
        let proxy = input.attr(`qm_item_auto_renew_input`);
        let period = $(`#period-${proxy}`).attr('current_period') || 'weekly'; // Default to weekly since it has the lowest max value
        let currentValue;
        currentValue = parseInt(input.val(), 10);
        // Check if the value is NaN (occurs when the input is empty)
        if (isNaN(currentValue)) {
            currentValue = 1;
        }
        currentValue = adjustPeriodAndInterval(period, currentValue).adjustedInterval;
        input.val(currentValue);
    }

    $(document).click(function (event) {
        // Hide and set opacity to 0 for all menus
        $('.prx_crd_qm').css('opacity', '0');
        $('.prx_crd_qm, .qm_auto_renew_check_ico').hide();

    });

    $('.prx_allo_crd_ico_ctn').click(async function (event) {
        event.stopPropagation();  // Prevent this event from propagating to the document's click event

        let proxy = $(this).attr('qm_btn');

        // Hide and set opacity to 0 for all menus except the current one
        $('.prx_crd_qm').not(`[qm="${proxy}"]`).css('opacity', '0').hide();

        let inputElement = $(`[qm_item_auto_renew_input="${proxy}"]`);
        let initialInterval = parseInt(inputElement.attr('initial_interval'), 10);
        inputElement.val(initialInterval);

        // Show and set opacity to 1 for only the related menu
        $(this).find(`[qm="${proxy}"]`).show();
        await sleep(20);
        $(this).find(`[qm="${proxy}"]`).css('opacity', '1').show();
    });


    $('.renew_interval_input').on('input', async function () {
        handleAutoRenewIntervalInput(this);
    });


    $('.qm_auto_renew_check_ico').click(async function (event) {
        // Stop the event from bubbling up
        event.stopPropagation();

        let proxy = $(this).attr('qm_item_auto_renew_check');

        $(this).hide();
        $(`[qm_item_auto_renew_input="${proxy}"]`).attr('disabled', 'disabled');

        $(`[qm_item_ico_auto_renew_interval="${proxy}"]`).hide();
        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_interval="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
        });
        $(`[qm_item_ldr_auto_renew_interval="${proxy}"]`).show();
        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_interval="${proxy}"]`, mode: "chain", actions: [{state: "loop"}]
        });

        let inputElement = $(`[qm_item_auto_renew_input="${proxy}"]`);
        let autoRenew = $(`[qm_item_auto_renew_tog="${proxy}"]`).attr('qm_auto_renew');
        let initialInterval = parseInt(inputElement.attr('initial_interval'), 10);
        autoRenew = autoRenew === 'true';
        let currentValue;

        currentValue = parseInt(inputElement.val(), 10);

        // Check if the value is NaN (occurs when the input is empty)
        if (isNaN(currentValue)) {
            currentValue = 1;
        }
        const proxiesObj = {
            "proxies": {
                "time": []
            }
        };

        proxiesObj.proxies.time.push({
            "auto_renew": autoRenew,
            "interval": currentValue,
            "proxy_name": proxy
        });

        try {
            await proxyActionSetAutoRenew(proxiesObj)
            $(`[qm_item_ldr_auto_renew_interval="${proxy}"]`).hide();
            $(`[qm_item_ico_auto_renew_interval="${proxy}"]`).show();
            inputElement.attr('initial_interval', currentValue);
            $(`[qm_item_auto_renew_input="${proxy}"]`).removeAttr('disabled');
        } catch (e) {
            console.error(e);
            $(`[qm_item_ldr_auto_renew_interval="${proxy}"]`).hide();
            $(`[qm_item_ico_auto_renew_interval="${proxy}"]`).show();
            inputElement.val(initialInterval);
            $(`[qm_item_auto_renew_input="${proxy}"]`).removeAttr('disabled');
        }
        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_interval="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
        });
    });

    $('.qm_tog_btn').click(async function (event) {
        // Stop the event from bubbling up
        event.stopPropagation();

        let proxy = $(this).attr('qm_item_auto_renew_tog');

        $(`[qm_item_ico_auto_renew_tog="${proxy}"]`).hide();

        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_tog="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
        });
        $(`[qm_item_ldr_auto_renew_tog="${proxy}"]`).show();
        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_tog="${proxy}"]`, mode: "chain", actions: [{state: "loop"}]
        });

        let autoRenew = $(`[qm_item_auto_renew_tog="${proxy}"]`).attr('qm_auto_renew');
        autoRenew = autoRenew === 'true';
        let inputElement = $(`[qm_item_auto_renew_input="${proxy}"]`);
        let currentValue, addTogClass, addIndClass, removeTogClass, removeIndClass, newAutoRenew, autoRenewBtnDisplay,
            autoRenewIndText;
        let initialPeriod = $(`#period-${proxy}`).attr('initial_period') || 'hourly';
        const convertPeriods = {
            "hourly": "Hour", "daily": "Day", "weekly": "Week", "monthly": "Month", "yearly": "Year"
        };

        let autoRenewPeriod = convertPeriods[initialPeriod] || "";

        if (autoRenew) {
            currentValue = 0;
            addTogClass = 'off';
            addIndClass = 'grey';
            removeTogClass = 'on';
            removeIndClass = 'green';
            newAutoRenew = false;
            autoRenewBtnDisplay = 'hide';
            autoRenewIndText = `Auto Renew Off`;
        } else {
            currentValue = 1;
            addTogClass = 'on';
            addIndClass = 'green';
            removeTogClass = 'off';
            removeIndClass = 'grey';
            newAutoRenew = true;
            autoRenewBtnDisplay = 'show';
            autoRenewIndText = `Renews Every ${currentValue} ${autoRenewPeriod}`;
        }

        const proxiesObj = {
            "proxies": {
                "time": []
            }
        };

        proxiesObj.proxies.time.push({
            "auto_renew": autoRenew,
            "interval": currentValue,
            "proxy_name": proxy
        });

        try {
            await proxyActionSetAutoRenew(proxiesObj)
            $(`[qm_item_ldr_auto_renew_tog="${proxy}"]`).hide();
            $(`[qm_item_ico_auto_renew_tog="${proxy}"]`).show();
            $(`[qm_item_auto_renew_tog="${proxy}"]`).removeClass(removeTogClass).addClass(addTogClass).attr('qm_auto_renew', newAutoRenew);
            $(`[crd_auto_renew="${proxy}"]`).removeClass(removeIndClass).addClass(addIndClass).text(autoRenewIndText);
            inputElement.val(currentValue).attr('initial_interval', currentValue);
            $(`[qm_item_auto_renew_btn="${proxy}"]`)[autoRenewBtnDisplay]();
        } catch (e) {
            console.error(e);
            $(`[qm_item_ldr_auto_renew_tog="${proxy}"]`).hide();
            $(`[qm_item_ico_auto_renew_tog="${proxy}"]`).show();
        }
        LottieInteractivity.create({
            player: `[qm_item_ldr_auto_renew_tog="${proxy}"]`, mode: "chain", actions: [{state: "stop"}]
        });
    });


    $('[qm_item_auto_renew_btn]').click(async function () {
        let proxy = $(this).attr('qm_item_auto_renew_btn');

        let inputElement = $(`[qm_item_auto_renew_input="${proxy}"]`);

        // Check if the input is disabled
        if (!inputElement.is(':disabled')) {
            // Hide all qm_auto_renew_check elements
            $('[qm_item_auto_renew_check]').hide();

            // Show the specific qm_auto_renew_check for this proxy
            $(`[qm_item_auto_renew_check="${proxy}"]`).show();

            // Highlight the value inside the input
            inputElement.select();
        }
    });


    $('.renew_interval_input').on('click focus', function () {
        let proxy = $(this).attr('qm_item_auto_renew_input');  // Assuming the proxy value is stored in the quick_menu_item attribute

        // Hide all qm_auto_renew_check elements
        $('[qm_item_auto_renew_check]').hide();

        // Show the specific qm_auto_renew_check for this proxy
        $(`[qm_item_auto_renew_check="${proxy}"]`).show();

        // Highlight the value inside the input
        $(this).select();
    });


    // When the swap button is clicked
    $('[qm_action="swap"]').click(async function () {
        const proxy = $(this).attr('qm_item_swap_btn');
        const isp = $(`[crd_isp="${proxy}"]`).text();
        const location = $(`[crd_location="${proxy}"]`).text();
        const added = $(`[crd_added="${proxy}"]`).text();
        const ispColors = {
            "AT&T": "blue", "Verizon": "red", "T-Mobile": "pink"
        };
        $(`[swap_initial="proxy"]`).text(proxy);
        $(`[swap_initial="isp"]`).text(isp).removeClass().addClass(`ind_det ${ispColors[isp]}`);
        $(`[swap_initial="location"]`).text(location);
        $(`[swap_initial="added"]`).text(added);
        $(`[modal_overlay="swap"]`).removeClass("hide");
    });

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
        $(`[modal_overlay="swap"]`).addClass("hide");
        $(`.swap--dropdown`).addClass("hide");
        clearSwapSelected();
    });

    $(document).on('click', '[mod_btn="copy_settings"]', function () {
        // Toggle the 'selected' class for the clicked element
        $(this).toggleClass('selected');

        // Check if the element has the 'selected' class
        const isSelected = $(this).hasClass('selected');
        console.log('Clicked element. isSelected:', isSelected); // Diagnostic log

        // Forcefully set the 'swap_copy_settings' attribute
        if (isSelected) {
            $(this).attr('swap_copy_settings', 'true');
            console.log('Set attribute to true'); // Diagnostic log
        } else {
            $(this).attr('swap_copy_settings', 'false');
            console.log('Set attribute to false'); // Diagnostic log
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
        console.log('Clicked outside dropdown'); // Diagnostic log
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
        }
    }

    async function proxyActionSwap(proxy_name, isp, location, copy_settings) {
        try {

            const swapData = {
                isp,
                location,
                copy_settings
            }

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
                body: JSON.stringify(swapData)
            };
            const url = new URL(`https://cmd.illusory.io/v1/proxies/swap/${proxy_name}`);

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
    $('[qm_action="remove"]').click(async function () {
        const proxy = $(this).attr('qm_item_remove_btn');
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

            let proxy_name = $(`[remove_proxy="text"]`).text();

            const proxiesArray = {
                "proxies": []
            };

            proxiesArray.proxies.push(proxy_name);

            await proxyActionRemove(proxiesArray);

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
        }
    }

}


// Deferred functions!

async function proxyActionsDeferred() {
    await proxyIntervalController();
    await proxyQuickMenus();
}

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
        const user = await getUser(token);
        const cmdbar = await identifyCmdbar(token);
        const {hmac, user_id} = cmdbar.data;
        // Start cmdbar
        await cmdbarStart(user_id, hmac);

        $(`.cmdbhelp--nav`).off('click').click(async function () {
            window.CommandBar.toggleHelpHub();
        })

        // Get funds
        await updateUser(user);
        showBody();
        // Get Proxies
        await proxyActionGetProxies();
        await proxyActionsDeferred();
        $(".skel_sect_crd_det").hide();

        // Load timeago
        await lscTimeAgo();
        await getTimeAgoExpires();
        await getTimeAgoNewExpires();
        await getTimeAgoAdded();

        // Hide skel and show ui
        $(".skel_prx_allo_crd").hide();
        $('.prx_allo_crds_container').show()


        await iniIx2();
        // await hideSkel();
        // await pageLoader();

        // Load realtime
        const client = await supaClerk(token)
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