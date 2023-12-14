/*
 * 2023.12.14.11:36:50
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
        const url = new URL(`https://cmd.illusory.io/v1/proxies/deploy`);

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
        sucAlert(`Your request was successful`, `${resMsg}`, `View Dashboard`);
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
                let itemTotal = pricing.data.periods[period].individual[individualItem].total;
                let itemData = pricing.data.periods[period].individual[individualItem];

                let periodConverted = convertPeriodToSingular(period)

                // Check the prefix to determine the ISP and update the tally
                let isp;
                if (individualItem.startsWith('AT-')) {
                    isp = 'AT&T';
                } else if (individualItem.startsWith('VR-')) {
                    isp = 'Verizon';
                } else if (individualItem.startsWith('TM-')) {
                    isp = 'T-Mobile';
                } else {
                    await ErrorHandler(`Invalid ISP in pricing object.`, {}, 400);
                }

                if (isp) {
                    ispTally[isp]++;
                }

                let loc;
                if (individualItem.includes('-LA-')) {
                    loc = 'Los Angeles';
                } else if (individualItem.includes('-CL-')) {
                    loc = 'Cleveland';
                } else if (individualItem.includes('-AU-')) {
                    loc = 'Austin';
                } else if (individualItem.includes('-NY-')) {
                    loc = 'New York';
                } else {
                    await ErrorHandler(`Invalid location in pricing object.`, {}, 400);
                }

                let outerDiv = $("<div></div>")
                    .attr("period_total_line", individualItem)
                    .addClass("w-layout-grid qstack_c2")

                let textCell = $("<div></div>")
                    .addClass("w-layout-cell lt_c")
                    .append($("<div></div>")
                        .attr("period_total_text", individualItem)
                        .addClass("sect_crd_subtxt")
                        .text(`${isp} (${loc}) + ${itemData.interval} ${periodConverted}(s)`));

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
                // console.log(e.error.data);
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

function updatePeriodText(period, currentValue) {
    // Add the green class to the final period button
    $(`[period_btn="${period}"]`).addClass('green');

    let periodInd = $(`[indicator="period"]`);
    let lengthInd = $(`[indicator="period_length"]`);
    let periodTit = $(`[period_length="title"]`)

    const pluralPeriods = {
        "hourly": "Hours", "daily": "Days", "weekly": "Weeks", "monthly": "Months", "yearly": "Years"
    };
    let periodText = pluralPeriods[period] || "";
    if (currentValue === 1) {
        periodText = periodText.slice(0, -1);
    }

    // Update the elements
    periodInd.text(`${period} Period Selected`);
    periodTit.text(`${periodText}`);
    lengthInd.text(`${currentValue} ${periodText} Expiration Selected`);
    // console.log(`Current value at end of multiple jumps: ${currentValue}, Period: ${period}`)
}

function convertMultipleJumps(currentValue, input, initialPeriod) {
    let period = initialPeriod;
    // console.log(`Current value at start of multiple jumps: ${currentValue}, Period: ${period}`)
    const conversionRates = {
        'hourly': {next: 'daily', divisor: 4},
        'daily': {next: 'weekly', divisor: 7},
        'weekly': {next: 'monthly', divisor: 4},
        'monthly': {next: 'yearly', divisor: 12}
    };

    // Remove the green class from the initial period button
    $(`[period_btn="${period}"]`).removeClass('green');

    while (currentValue > periodFunctions[period].max) {
        // Check if a 'next' period exists before proceeding
        if (conversionRates[period]) {
            const nextPeriod = conversionRates[period].next;
            $(`[action_btns="period"]`).attr('current_period', nextPeriod);

            currentValue = Math.floor(currentValue / conversionRates[period].divisor);

            period = nextPeriod;
            // console.log(`Current value within while in multiple jumps: ${currentValue}, Period: ${period}`)
        } else {
            // No next period exists, set to maximum allowable value for current period
            currentValue = periodFunctions[period].max;
            // console.log(`Current value before break in multiple jumps: ${currentValue}, Period: ${period}`)
            break;
        }
    }
    let reduction = getReduction(period, currentValue);
    $(`[period_length="discount"]`).text(`${reduction}% Discount`);
    updatePeriodText(period, currentValue);
    input.val(currentValue);
}

const periodFunctions = {
    yearly: {
        max: 1, min: 1, convert: function (currentValue, input) {
            if (currentValue > this.max) {
                input.val(this.max);
            }
        }
    }, monthly: {
        max: 11, min: 1, convert: function (currentValue, input) {
            convertMultipleJumps(currentValue, input, 'monthly');
        }
    }, weekly: {
        max: 3, min: 1, convert: function (currentValue, input) {
            convertMultipleJumps(currentValue, input, 'weekly');
        }
    }, daily: {
        max: 6, min: 1, convert: function (currentValue, input) {
            convertMultipleJumps(currentValue, input, 'daily');
        }
    }, hourly: {
        max: 4, min: 1, convert: function (currentValue, input) {
            convertMultipleJumps(currentValue, input, 'hourly');
        }
    }
}

function getReduction(period, value) {

    const intervalReductions = {
        'yearly': [{min: 1, max: 1, reduction: 0.20}],
        'monthly': [{min: 2, max: 2, reduction: 0.04}, {min: 3, max: 5, reduction: 0.08}, {
            min: 6, max: 11, reduction: 0.12
        }],
        'weekly': [{min: 2, max: 2, reduction: 0.04}, {min: 3, max: 3, reduction: 0.08}],
        'daily': [{min: 2, max: 3, reduction: 0.04}, {min: 4, max: 5, reduction: 0.08}, {
            min: 6, max: 6, reduction: 0.12
        }],
        'hourly': []
    };

    let reductions = intervalReductions[period];
    for (let i = 0; i < reductions.length; i++) {
        if (value >= reductions[i].min && value <= reductions[i].max) {
            return reductions[i].reduction * 100; // Convert to percentage
        }
    }
    return 0;
}

function handleInputOrDirectInput(input, currentValue, period) {

    if (currentValue < periodFunctions[period].min) {
        input.val(periodFunctions[period].min);
    } else if (currentValue > periodFunctions[period].max) {
        periodFunctions[period].convert(currentValue, input);
    } else {
        let reduction = getReduction(period, currentValue);
        $(`[period_length="discount"]`).text(`${reduction}% Discount`);
        updatePeriodText(period, currentValue);
        input.val(currentValue);
    }

    input.change();

    collectProxySettings(`reprice`);
}

function handleInput(element, increment) {
    $("#checkoutCrdLoopLdr").hide();
    $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
    LottieInteractivity.create({
        player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
    });
    let input = $(element);
    let periodElement = $(`[action_btns="period"]`);
    let period = periodElement.attr('current_period') || 'hourly';

    // Set initial_period if it's not set yet
    if (!periodElement.attr('current_period')) {
        periodElement.attr('current_period', `hourly`);
    }

    let currentValue = parseInt(input.val(), 10) + increment;

    // Now use the refactored handleInputOrDirectInput function
    handleInputOrDirectInput(input, currentValue, period);
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
    let periodElement = $(`[action_btns="period"]`);
    let period = periodElement.attr('current_period') || 'hourly'; // Default to hourly if no period set

    // Set initial_period if it's not set yet
    if (!periodElement.attr('current_period')) {
        periodElement.attr('current_period', `hourly`);
    }

    let currentValue = parseInt(input.val(), 10);

    // Check if the value is NaN (occurs when the input is empty)
    if (isNaN(currentValue)) {
        currentValue = periodFunctions[period].min;
    }

    // Now use the refactored handleInputOrDirectInput function
    handleInputOrDirectInput(input, currentValue, period);
}

function updateTotalISP() {
    // Initialize counters for each ISP
    let totalATT = 0;
    let totalVerizon = 0;
    let totalTMobile = 0;

    // Loop through each input and sum up the values
    $('.quantity_loc_input[input_isp="AT&T"]').each(function () {
        totalATT += parseInt($(this).val(), 10);
    });

    $('.quantity_loc_input[input_isp="Verizon"]').each(function () {
        totalVerizon += parseInt($(this).val(), 10);
    });

    $('.quantity_loc_input[input_isp="T-Mobile"]').each(function () {
        totalTMobile += parseInt($(this).val(), 10);
    });

    // Update the total indicators
    $('[indicator="AT&T"]').text(`${totalATT} AT&T Selected`);
    $('[indicator="Verizon"]').text(`${totalVerizon} Verizon Selected`);
    $('[indicator="T-Mobile"]').text(`${totalTMobile} T-Mobile Selected`);
}

// Function to update the value based on action
function updateValue(input, action, stock) {
    // console.log("Updating value!");
    let currentValue = parseInt(input.val());
    if (action === "add") {
        input.val(Math.min(stock, currentValue + 1));
    } else if (action === "sub") {
        input.val(Math.max(0, currentValue - 1));
    }
}

// Function to handle the green class addition/removal
function handleGreenClass(input, stockText, locCard, loc) {
    console.log("Handling green class!" + input.val());
    if (parseInt(input.val()) !== 0) {
        input.addClass('green');
        stockText.addClass('green');
        locCard.addClass('green');
    } else {
        input.removeClass('green');
        stockText.removeClass('green');

        if ($(`[input_loc="${loc}"]`).toArray().every(el => parseInt($(el).val()) === 0)) {
            locCard.removeClass('green');
        }
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

async function intervalController() {

    // Add click event listener to period buttons
    $('.new_action_btn').click(function () {
        console.log('click event listener triggered');
        $("#checkoutCrdLoopLdr").hide();
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();

        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });

        // Get the new period
        let newPeriod = $(this).attr(`period_btn`);

        // Get the current period
        let currentPeriodElem = $(`[action_btns="period"]`);

        // Set the currentPeriod if it is not already set
        if (!currentPeriodElem.attr('current_period')) {
            currentPeriodElem.attr('current_period', `hourly`);
            console.warn('current_period attribute not set, setting to hourly')
        }

        let currentPeriod = currentPeriodElem.attr('current_period');

        let currentPeriodBtn = $(`[period_btn="${currentPeriod}"]`);

        // Do nothing if the new period is the same as the current period
        if (newPeriod === currentPeriod) {
            return;
        }

        // Remove 'green' class from the current period button
        currentPeriodBtn.removeClass('green');

        // Add 'green' class to the new period button
        $(this).addClass('green');

        // Update current_period attribute
        currentPeriodElem.attr('current_period', newPeriod);

        // Reset input value to 1
        $(`[period_length="input"]`).val(1).change();
        let reduction = getReduction(newPeriod, 1);
        $(`[period_length="discount"]`).text(`${reduction}% Discount`);

        updatePeriodText(newPeriod, 1);
        collectProxySettings(`reprice`);
    });


    $('.add_new_interval_btn').click(async function () {
        handleInput(`.new_period_input`, 1);
    });

    $('.sub_new_interval_btn').click(async function () {
        handleInput(`.new_period_input`, -1);
    });

    $('.new_period_input').on('input', async function () {
        handleDirectInput(this);
    });

    $('[checkout_btn="continue"]').click(async function () {
        $('[modal_overlay="new"]').removeClass(`hide`);
    });

    $('[checkout_btn="issue"]').click(async function () {
        let requiredFunds = parseInt($(`[checkout_funds="required"]`).attr('funds_required'), 10);
        window.open(`funds?custom=${requiredFunds}`, '_blank');
    });

    $('[mod_btn="cancel"]').click(async function () {
        $('[modal_overlay="new"]').addClass(`hide`);
    });

    $('[mod_btn="allocate"]').off('click').click(async function () {
        try {
            await collectProxySettings(`allocate`);
        } catch (error) {
            console.log(error);
        }
        return;
    });

    // Combined event listener for both add and sub buttons
    $(document).on('click', '.add_quantity_btn, .sub_quantity_btn', function () {

        let loc = $(this).hasClass('add_quantity_btn') ? $(this).attr('add_quantity_loc') : $(this).attr('sub_quantity_loc');
        let isp = $(this).hasClass('add_quantity_btn') ? $(this).attr('add_quantity_isp') : $(this).attr('sub_quantity_isp');
        let action = $(this).hasClass('add_quantity_btn') ? 'add' : 'sub';

        let locCard = $(`[loc_crd="${loc}"]`);
        let stockText = $(`.loc_crd_quantity_stock[stock_isp="${isp}"][stock_loc="${loc}"]`);

        // Check if the location card is disabled
        if (locCard.attr('disabled') === 'disabled') {
            console.log("Card is disabled. Exiting function.");
            return;
        }

        let input = $(`[input_loc="${loc}"][input_isp="${isp}"]`);
        let inputValue = parseInt(input.val());
        let stock = parseInt($(`[stock_isp="${isp}"][stock_loc="${loc}"]`).attr('stock'))

        // Check conditions based on the action
        if (action === 'add' && inputValue >= stock) {
            console.log("Action is add and input is already at max. Exiting function.");
            return;
        } else if (action === 'sub' && inputValue <= 0) {
            console.log("Action is subtract and input is already at minimum. Exiting function.");
            return;
        }

        $("#checkoutCrdLoopLdr").hide();
        LottieInteractivity.create({
            player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
        });
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });

        updateValue(input, action, stock);

        handleGreenClass(input, stockText, locCard, loc);
        updateTotalISP();
        collectProxySettings(`reprice`);
    });


    $(document).on('input', '.quantity_loc_input', function () {
        let loc = $(this).attr('input_loc');
        let isp = $(this).attr('input_isp');
        let stock = parseInt($(`[stock_isp="${isp}"][stock_loc="${loc}"]`).attr('stock'))
        let inputValue = parseInt($(this).val());
        let prevValue = $(this).data('previousValue') || 0; // get the previous value or default to 0
        let locCard = $(`[loc_crd="${loc}"]`);
        let stockText = $(`.loc_crd_quantity_stock[stock_isp="${isp}"][stock_loc="${loc}"]`);

        if (inputValue === 0) {
            handleGreenClass($(this), stockText, locCard, loc);
        }

        if (inputValue === prevValue) {
            console.log("Value hasn't changed. Exiting function.");
            return;
        }

        if (stock === 0) {
            $(this).val(0);
            return;
        }

        $("#checkoutCrdLoopLdr").hide();
        LottieInteractivity.create({
            player: "#checkoutCrdLoopLdr", mode: "chain", actions: [{state: "stop"}]
        });
        $(".skel_checkout, #checkoutCrdAutoplayLdr").show();
        LottieInteractivity.create({
            player: "#checkoutCrdAutoplayLdr", mode: "chain", actions: [{state: "autoplay"}]
        });

        // Check if input is empty or NaN and default to 0
        if (isNaN(inputValue) || $(this).val().trim() === "") {
            inputValue = 0;
            $(this).val(0);
        }

        // Ensure input value is within allowed range
        if (inputValue > stock) {
            inputValue = stock;
            $(this).val(stock);
        } else if (inputValue < 0) {
            inputValue = 0;
            $(this).val(0);
        }

        // Update the previous value data attribute
        $(this).data('previousValue', inputValue);

        handleGreenClass($(this), stockText, locCard, loc);
        updateTotalISP();
        collectProxySettings(`reprice`);
    });
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

async function toggleStockVisibility() {
    await sleep(3000);
    $(".skel_loc_crd").hide();
    $('.loc_crds_container').show()
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
            $(".quantity_loc_input").each(function () {
                let quantity = parseInt($(this).val(), 10);
                let isp = $(this).attr('input_isp');
                let loc = $(this).attr('input_loc');
                let intervalInput = $(`[period_length="input"]`);
                let interval = parseInt(intervalInput.val(), 10);
                let period = $(`[action_btns="period"]`).attr('current_period') || 'hourly'; // Default to hourly if no period set

                // Loop based on the quantity and push the object to cartArray
                for (let i = 0; i < quantity; i++) {
                    proxiesObj.proxies.push({
                        "period": period, "interval": interval, "isp": isp, "location": loc
                    });
                }
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
            "proxies": []
        };
        // Loop through each proxy input element
        $(".quantity_loc_input").each(function () {
            let quantity = parseInt($(this).val(), 10);
            let isp = $(this).attr('input_isp');
            let loc = $(this).attr('input_loc');
            let intervalInput = $(`[period_length="input"]`);
            let interval = parseInt(intervalInput.val(), 10);
            let period = $(`[action_btns="period"]`).attr('current_period') || 'hourly'; // Default to hourly if no period set

            // Loop based on the quantity and push the object to cartArray
            for (let i = 0; i < quantity; i++) {
                proxiesObj.proxies.push({
                    "period": period, "interval": interval, "isp": isp, "location": loc
                });
            }
        });

        try {
            await finalizeAllocation(proxiesObj);
            $('[modal_overlay="new"]').addClass(`hide`);
            $('#sucActionBtn1').off('click').click(function () {
                window.location.href = `/app/dashboard`;
            });
        } catch (e) {
            const errMsg = e.error.message;
            $('[modal_overlay="new"]').addClass(`hide`);
            pendingAllocation = null;
            if (errMsg.includes(`The amount requested is lower than the available stock`)) {
                $(".skel_loc_crd").show();
                $('.loc_crds_container').hide()
                toggleStockVisibility();
            }
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

    const currentFunds = $('[checkout_funds="total"]').text()
    const currentFundsNum = parseInt(currentFunds.slice(1), 10)
    if (currentFundsNum !== funds) {
        $('[checkout_funds="total"]').text(`$${funds}`)
        collectProxySettings(`reprice`);
    }

    if (member) {
        $('[checkout_text="member_discount"]').text(`Member Discount Enabled`)
        $('[checkout_info_explain="member"]').text(`You have member pricing enabled and are receiving a discount on your proxies.`)
        $('[cta="member_discount_apply"]').hide()
        $('[tog="member_discount"]').css('display', 'flex');
        $('[is_member="false"]').attr('is_member', 'true');
    }
}


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
        let items = resJson.data;
        let totalProxies = 0;

        // Calculate total proxies across all locations
        items.forEach(item => {
            if (item.open) {
                totalProxies += item.att + item.verizon + item.tmobile;
            }
        });

        $(".loc_crds_container").empty(); // Clearing the container

        items.forEach(item => {
            let {
                city, state, att, verizon, tmobile, status, open
            } = item;

            let locationTotal = open ? att + verizon + tmobile : 0;
            let convertedStatus;
            let statusConverter = {
                "available": `${locationTotal} Available`,
                "coming": "Coming Soon",
                "out": "Out Of Stock",
                "maintenance": "Under Maintenance"
            };
            convertedStatus = statusConverter[status] || `Contact Support`;

            let card = $('<div></div>').attr('loc_crd', city).addClass('loc_crd');
            if (!open || status !== 'available') {
                card.addClass('disabled').attr('disabled', 'disabled');
            }
            let content = $('<div></div>').addClass('loc_crd_content w-clearfix');

            let titleContainer = $('<div></div>').addClass('loc_crd_tit--inner');
            let title = $('<div></div>').attr('loc_tit', city).addClass('loc_crd_tit').text(`${city}, ${state}`);
            let availableStock = $('<div></div>').attr({
                'loc_stock_total': city, 'stock': locationTotal
            }).addClass('sect_crd_subtxt alt1').text(convertedStatus);
            titleContainer.append(title, availableStock);
            content.append(titleContainer);

            let ispGrid = $('<div></div>').addClass('w-layout-grid loc_crd_quantity_grid');

            function createISPSection(ispName, ispStock) {
                let ispSection = $('<div></div>').addClass('quantity_change_counter w-embed');
                let ispWrap = $('<div></div>').addClass('quantity_loc_wrap');
                let ispLeft = $('<div></div>').addClass('quantity_loc_content_left');
                let ispInner = $('<div></div>').addClass('quantity_loc_content_inner');
                let ispInput = $('<input>')
                    .attr({
                        'type': 'text',
                        'value': '0',
                        'class': 'quantity_loc_input',
                        'input_isp': ispName,
                        'input_loc': city
                    })
                    .css({
                        'background': 'none',
                        '-webkit-appearance': 'none'
                    })
                    .on('input', validateInput);
                if (!open || ispStock === 0) {
                    ispInput.attr('disabled', 'disabled');
                }
                let stockText = $('<div></div>').addClass('loc_crd_quantity_stock').attr({
                    'stock_isp': ispName, 'stock_loc': city, 'stock': ispStock
                }).text(`/${ispStock}`);
                ispInner.append(ispInput, stockText);
                let ispNameIndicator = $('<div></div>').addClass('loc_crd_quantity_subtxt').attr('quantity_isp_text', ispName).text(ispName);
                ispLeft.append(ispInner, ispNameIndicator);

                let ispRight = $('<div></div>').addClass('quantity_loc_content_right');
                let addButton = $('<div></div>').attr({
                    'add_quantity_isp': ispName,
                    'add_quantity_loc': city,
                    'class': 'add_quantity_btn',
                    'style': 'background: none;'
                }).html('<img src="https://imagedelivery.net/LFzmPcWb9I2s9RbnqAbhAw/4ddc92fd-7720-4f6f-33d4-018423173500/public" />');

                let subButton = $('<div></div>').attr({
                    'sub_quantity_isp': ispName,
                    'sub_quantity_loc': city,
                    'class': 'sub_quantity_btn',
                    'style': 'background: none;'
                }).html('<img src="https://imagedelivery.net/LFzmPcWb9I2s9RbnqAbhAw/48f6ecc7-0286-40e9-e25c-b7a1162e4100/public">');
                ispRight.append(addButton, subButton);

                ispWrap.append(ispLeft, ispRight);
                ispSection.append(ispWrap);
                ispGrid.append(ispSection);
            }

            createISPSection('AT&T', att);
            createISPSection('Verizon', verizon);
            createISPSection('T-Mobile', tmobile);

            content.append(ispGrid);
            card.append(content);
            $(".loc_crds_container").append(card);
        });

        // Set total proxies display
        $('[available_proxies=total]').text(totalProxies).attr({
            'available_total': totalProxies,
            'available_att': items.reduce((a, b) => a + b.att, 0),
            'available_verizon': items.reduce((a, b) => a + b.verizon, 0),
            'available_tmobile': items.reduce((a, b) => a + b.tmobile, 0)
        });

    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}

async function refreshStock() {
    console.log("Refreshing stock!")
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
        let items = resJson.data;
        let totalProxies = 0;

        for (let i = 0; i < items.length; i++) {
            let {
                city, state, att, verizon, tmobile, status, open
            } = items[i];

            if (open) {
                totalProxies += att + verizon + tmobile;
            }
            // Calculate the total proxies for this specific location
            let locationTotal = open ? att + verizon + tmobile : 0;
            let convertedStatus;
            let statusConverter = {
                "available": `${locationTotal} Available`,
                "coming": "Coming Soon",
                "out": "Out Of Stock",
                "maintenance": "Under Maintenance"
            };
            convertedStatus = statusConverter[status] || `Contact Support`;

            let cardElem = $(`[loc_crd="${city}"]`);
            let prevTotalStockElem = $('[available_proxies=total]');

            let prevAttLocStockElem = $(`[stock_isp="AT&T"][stock_loc="${city}"]`);
            let prevTotalAttStock = parseInt(prevTotalStockElem.attr('available_att'))
            let prevAttStock = parseInt(prevAttLocStockElem.attr('stock'), 10);
            let newTotalAttStock = prevTotalAttStock + (att - prevAttStock);

            let prevVerizonLocStockElem = $(`[stock_isp="Verizon"][stock_loc="${city}"]`);
            let prevTotalVerizonStock = parseInt(prevTotalStockElem.attr('available_verizon'))
            let prevVerizonStock = parseInt(prevVerizonLocStockElem.attr('stock'), 10);
            let newTotalVerizonStock = prevTotalVerizonStock + (verizon - prevVerizonStock);

            let prevTmobileLocStockElem = $(`[stock_isp="T-Mobile"][stock_loc="${city}"]`);
            let prevTotalTmobileStock = parseInt(prevTotalStockElem.attr('available_tmobile'))
            let prevTmobileStock = parseInt(prevTmobileLocStockElem.attr('stock'), 10);
            let newTotalTmobileStock = prevTotalTmobileStock + (tmobile - prevTmobileStock);

            let prevLocStockElem = $(`[loc_stock_total="${city}"]`)
            console.log(`Location: ${city} | Total: ${locationTotal} | Status: ${status} | Open: ${open}`);

            // Correctly update the stock attribute for this location
            prevLocStockElem.attr('stock', locationTotal).text(`${convertedStatus}`);


            prevAttLocStockElem.attr('stock', att).text(`/${att}`);
            let currentAttInput = $(`[input_isp="AT&T"][input_loc="${city}"]`);
            if (currentAttInput.val() > att) {
                currentAttInput.val(att);
                if (att === 0) {
                    if (currentAttInput.val() > 0) {
                        currentAttInput.attr('disabled', 'disabled');
                        currentAttInput.val(0);
                    }
                    handleGreenClass(currentAttInput, prevAttLocStockElem, cardElem, city);
                    currentAttInput.attr('disabled', 'disabled');
                } else {
                    currentAttInput.removeAttr('disabled');
                }
                newTotalAttStock = prevTotalAttStock - (prevAttStock - att);
                collectProxySettings(`reprice`)
            } else if (att === 0) {
                currentAttInput.attr('disabled', 'disabled');
            } else {
                currentAttInput.removeAttr('disabled');
            }

            prevVerizonLocStockElem.attr('stock', verizon).text(`/${verizon}`);
            let currentVerizonInput = $(`[input_isp="Verizon"][input_loc="${city}"]`);
            if (currentVerizonInput.val() > verizon) {
                currentVerizonInput.val(verizon);
                if (verizon === 0) {
                    if (currentVerizonInput.val() > 0) {
                        currentVerizonInput.removeAttr('disabled');
                        currentVerizonInput.val(0);
                    }
                    handleGreenClass(currentVerizonInput, prevVerizonLocStockElem, cardElem, city);
                    currentVerizonInput.attr('disabled', 'disabled');
                } else {
                    currentVerizonInput.removeAttr('disabled');
                }
                newTotalVerizonStock = prevTotalVerizonStock - (prevVerizonStock - verizon);
                collectProxySettings(`reprice`)
            } else if (verizon === 0) {
                currentVerizonInput.attr('disabled', 'disabled');
            } else {
                currentVerizonInput.removeAttr('disabled');
            }

            prevTmobileLocStockElem.attr('stock', tmobile).text(`/${tmobile}`);
            let currentTmobileInput = $(`[input_isp="T-Mobile"][input_loc="${city}"]`);
            if (currentTmobileInput.val() > tmobile) {
                currentTmobileInput.val(tmobile);
                if (tmobile === 0) {
                    if (currentTmobileInput.val() > 0) {
                        currentTmobileInput.removeAttr('disabled');
                        currentTmobileInput.val(0);
                    }
                    handleGreenClass(currentTmobileInput, prevTmobileLocStockElem, cardElem, city);
                    currentTmobileInput.attr('disabled', 'disabled');
                } else {
                    currentTmobileInput.removeAttr('disabled');
                }
                newTotalTmobileStock = prevTotalTmobileStock - (prevTmobileStock - tmobile);
                collectProxySettings(`reprice`)
            } else if (tmobile === 0) {
                currentTmobileInput.attr('disabled', 'disabled');
            } else {
                currentTmobileInput.removeAttr('disabled');
            }

            const newTotalStock = newTotalAttStock + newTotalVerizonStock + newTotalTmobileStock;
            prevTotalStockElem.attr({
                'available_total': newTotalStock,
                'available_att': newTotalAttStock,
                'available_verizon': newTotalVerizonStock,
                'available_tmobile': newTotalTmobileStock
            }).text(newTotalStock);

            // Add the 'disabled' class if open is not true
            if (status !== 'available') {
                cardElem.addClass('disabled').attr('disabled', 'disabled');
            } else {
                cardElem.removeClass('disabled').removeAttr('disabled');
            }
        }

        // Remove cards that don't correspond to any of the stock items in the fetched data
        $(".loc_crds_container > .loc_crd").each(function () {
            let city = $(this).attr('loc_crd');
            if (!items.some(item => item.city === city)) {
                $(this).remove();
            }
        });

        async function otherFuntions() {
            updateTotalISP()
        }

        await otherFuntions();

    } catch (error) {
        await ErrorHandler(`${error.message}`, {}, `${error.status}`);
    }
}


/**
 ? Proxies RPC Stock method.
 * @param {Object} supabaseClient - The Supabase client object.
 ** @return {Promise} - A promise representing the completion of the method.
 */
async function rpcStock(client) {
    if (!client) {
        client = await supaClerk()
    }
    await client.channel('location_stock')
        .on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: 'location_stock'
        }, async (payload) => {
            const {
                city, state, att, verizon, tmobile, status, open,
            } = payload.new;

            console.log(payload);

            let totalProxies = 0;
            if (open) {
                totalProxies += att + verizon + tmobile;
            }
            // Calculate the total proxies for this specific location
            let locationTotal = open ? att + verizon + tmobile : 0;
            let convertedStatus;
            let statusConverter = {
                "available": `${locationTotal} Available`,
                "coming": "Coming Soon",
                "out": "Out Of Stock",
                "maintenance": "Under Maintenance"
            };
            convertedStatus = statusConverter[status] || `Contact Support`;

            let cardElem = $(`[loc_crd="${city}"]`);
            let prevTotalStockElem = $('[available_proxies=total]');

            let prevAttLocStockElem = $(`[stock_isp="AT&T"][stock_loc="${city}"]`);
            let prevTotalAttStock = parseInt(prevTotalStockElem.attr('available_att'))
            let prevAttStock = parseInt(prevAttLocStockElem.attr('stock'), 10);
            let newTotalAttStock = prevTotalAttStock + (att - prevAttStock);

            let prevVerizonLocStockElem = $(`[stock_isp="Verizon"][stock_loc="${city}"]`);
            let prevTotalVerizonStock = parseInt(prevTotalStockElem.attr('available_verizon'))
            let prevVerizonStock = parseInt(prevVerizonLocStockElem.attr('stock'), 10);
            let newTotalVerizonStock = prevTotalVerizonStock + (verizon - prevVerizonStock);

            let prevTmobileLocStockElem = $(`[stock_isp="T-Mobile"][stock_loc="${city}"]`);
            let prevTotalTmobileStock = parseInt(prevTotalStockElem.attr('available_tmobile'))
            let prevTmobileStock = parseInt(prevTmobileLocStockElem.attr('stock'), 10);
            let newTotalTmobileStock = prevTotalTmobileStock + (tmobile - prevTmobileStock);

            let prevLocStockElem = $(`[loc_stock_total="${city}"]`)
            console.log(`Location: ${city} | Total: ${locationTotal} | Status: ${status} | Open: ${open}`);

            // Correctly update the stock attribute for this location
            prevLocStockElem.attr('stock', locationTotal).text(`${convertedStatus}`);

            prevAttLocStockElem.attr('stock', att).text(`/${att}`);
            let currentAttInput = $(`[input_isp="AT&T"][input_loc="${city}"]`);
            if (currentAttInput.val() > att) {
                currentAttInput.val(att);
                if (att === 0) {
                    if (currentAttInput.val() > 0) {
                        currentAttInput.attr('disabled', 'disabled');
                        currentAttInput.val(0);
                    }
                    handleGreenClass(currentAttInput, prevAttLocStockElem, cardElem, city);
                    currentAttInput.attr('disabled', 'disabled');
                } else {
                    currentAttInput.removeAttr('disabled');
                }
                newTotalAttStock = prevTotalAttStock - (prevAttStock - att);
                collectProxySettings(`reprice`)
            } else if (att === 0) {
                currentAttInput.attr('disabled', 'disabled');
            } else {
                if (!open) {
                    currentAttInput.removeAttr('disabled');
                }
            }

            prevVerizonLocStockElem.attr('stock', verizon).text(`/${verizon}`);
            let currentVerizonInput = $(`[input_isp="Verizon"][input_loc="${city}"]`);
            if (currentVerizonInput.val() > verizon) {
                currentVerizonInput.val(verizon);
                if (verizon === 0) {
                    if (currentVerizonInput.val() > 0) {
                        currentVerizonInput.removeAttr('disabled');
                        currentVerizonInput.val(0);
                    }
                    handleGreenClass(currentVerizonInput, prevVerizonLocStockElem, cardElem, city);
                    currentVerizonInput.attr('disabled', 'disabled');
                } else {
                    currentVerizonInput.removeAttr('disabled');
                }
                newTotalVerizonStock = prevTotalVerizonStock - (prevVerizonStock - verizon);
                collectProxySettings(`reprice`)
            } else if (verizon === 0) {
                currentVerizonInput.attr('disabled', 'disabled');
            } else {
                if (!open) {
                    currentVerizonInput.removeAttr('disabled');
                }
            }

            prevTmobileLocStockElem.attr('stock', tmobile).text(`/${tmobile}`);
            let currentTmobileInput = $(`[input_isp="T-Mobile"][input_loc="${city}"]`);
            if (currentTmobileInput.val() > tmobile) {
                currentTmobileInput.val(tmobile);
                if (tmobile === 0) {
                    if (currentTmobileInput.val() > 0) {
                        currentTmobileInput.removeAttr('disabled');
                        currentTmobileInput.val(0);
                    }
                    handleGreenClass(currentTmobileInput, prevTmobileLocStockElem, cardElem, city);
                    currentTmobileInput.attr('disabled', 'disabled');
                } else {
                    currentTmobileInput.removeAttr('disabled');
                }
                newTotalTmobileStock = prevTotalTmobileStock - (prevTmobileStock - tmobile);
                collectProxySettings(`reprice`)
            } else if (tmobile === 0) {
                currentTmobileInput.attr('disabled', 'disabled');
            } else {
                if (!open) {
                    currentTmobileInput.removeAttr('disabled');
                }
            }

            const newTotalStock = newTotalAttStock + newTotalVerizonStock + newTotalTmobileStock;
            prevTotalStockElem.attr({
                'available_total': newTotalStock,
                'available_att': newTotalAttStock,
                'available_verizon': newTotalVerizonStock,
                'available_tmobile': newTotalTmobileStock
            }).text(newTotalStock);

            // Add the 'disabled' class if open is not true
            if (status !== 'available') {
                cardElem.addClass('disabled').attr('disabled', 'disabled');
            } else {
                cardElem.removeClass('disabled').removeAttr('disabled');
            }

            async function otherFuntions() {
                updateTotalISP()
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
    console.log('Removing all channels');
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
            await rpcStock(client);
            await rpcUser(client);
            rpcRefresh();
            refreshStock();
            await updateUser();
            collectProxySettings(`reprice`);
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

async function handleVisibilityChange() {
    console.log("Visibility changed:", document.visibilityState);  // Add this line
    if (document.visibilityState === 'visible') {
        clearTimeout(removeChannelsTimeout);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        const timeInBackground = Date.now() - rpcRunningTimestamp;
        if (timeInBackground >= 60000) { // 60 seconds
            refreshStock();
            await updateUser();
            collectProxySettings(`reprice`);
            runRpc(true);
        }
    }
}
async function runRpc(alert = false) {
    if (alert) {
        console.log("Alerting user");
        errAlertSmall(`Reconnecting to realtime updates`, `orange`);
        $(`[err_item_ldr="realtime"]`).css(`visibility`, `visible`);
        LottieInteractivity.create({
            player: `[err_item_ldr="realtime"]`, mode: "chain", actions: [{state: "loop"}]
        });
    }
    while (rpcIntervalCount < MAX_INTERVAL_COUNT) {
        if (document.visibilityState !== 'visible' || inactivityAlert) {
            console.log(inactivityAlert ? 'User is inactive' : 'Tab is not visible');

            if (document.visibilityState !== 'visible') {
                console.log('Tab is not visible');

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
        await sleep(SLEEP_INTERVAL);
        rpcIntervalCount++;
    }
    const client = await supaClerk();
    await rpcStock(client);
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

// Deferred functions
async function deferredActions() {
    await intervalController();

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
    setupTooltipListeners('.info_circle_duo--icon', '.info--wrap');


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
        showBody();
        const cmdbar = await identifyCmdbar(token);
        const {hmac, user_id} = cmdbar.data;
        // Start cmdbar
        await cmdbarStart(user_id, hmac);

        $(`.cmdbhelp--nav`).off('click').click(async function () {
            window.CommandBar.toggleHelpHub();
        })

        await getStock()

        // // Get funds
        await updateUser(user);

        await deferredActions();

        // Hide skel and show ui!
        $(".skel_loc_crd").hide();
        $('.loc_crds_container').show()

        // await iniIx2();
        // // await hideSkel();
        // // await pageLoader();
        //
        // // Load realtime
        const client = await supaClerk(token)
        await rpcStock(client);
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