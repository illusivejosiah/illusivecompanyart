/*
 * 2023.12.13.13:43:26
 */

// Set displayed & new network status!
async function setNetworkStatusColor(displayed_network_status, new_network_status) {
    let curOnlineColor, newOnlineColor;
    // Determine displayed `network_status` color
    if (displayed_network_status == "online") {
        curOnlineColor = "green";
    }
    if (displayed_network_status == "offline") {
        curOnlineColor = "grey";
    }
    if (displayed_network_status == "rebooting") {
        curOnlineColor = "orange";
    }
    if (displayed_network_status == "changing ip") {
        curOnlineColor = "orange";
    }
    if (displayed_network_status == "connecting") {
        curOnlineColor = "orange";
    }
    if (displayed_network_status == "updating") {
        curOnlineColor = "grey";
    }
    if (displayed_network_status == "provisioning") {
        curOnlineColor = "grey";
    }


    // Determine new `network_status` color
    if (new_network_status == "online") {
        newOnlineColor = "green";
    }
    if (new_network_status == "offline") {
        newOnlineColor = "grey";
    }
    if (new_network_status == "rebooting") {
        newOnlineColor = "orange";
    }
    if (new_network_status == "changing ip") {
        newOnlineColor = "orange";
    }
    if (new_network_status == "connecting") {
        newOnlineColor = "orange";
    }
    if (new_network_status == "updating") {
        newOnlineColor = "grey";
    }
    if (new_network_status == "provisioning") {
        newOnlineColor = "grey";
    }
    return {curOnlineColor, newOnlineColor}
}

// If `network_status` has changed, update it
async function updateNetworkStatus(proxy_name, displayed_network_status, new_network_status, curOnlineColor, newOnlineColor, element) {
    if (element == "crd") {
        if (displayed_network_status != new_network_status) {
            document.querySelector("[crd_online=" + proxy_name + "]").innerHTML = new_network_status;
            document.querySelector("[crd_online=" + proxy_name + "]")
                .classList.remove(curOnlineColor);
            document
                .querySelector("[crd_online=" + proxy_name + "]")
                .classList.add(newOnlineColor);
        }
    }
    if (element == "cp") {
        if (displayed_network_status != new_network_status) {
            document.getElementById("cp-header-network").innerHTML = new_network_status;
            document.getElementById("cp-header-network").classList.remove(curOnlineColor);
            document.getElementById("cp-header-network").classList.add(newOnlineColor);
        }
    }
}

async function getNetworkStatus(proxy_name, new_network_status, element) {
    let displayed_network_status;
    if (element == "crd") {
        displayed_network_status = document.querySelector("[crd_online=" + proxy_name + "]").innerHTML;
    }
    if (element == "cp") {
        displayed_network_status = document.getElementById("cp-header-network").innerHTML;
    }
    const networkColor = await setNetworkStatusColor(displayed_network_status, new_network_status);
    await updateNetworkStatus(proxy_name, displayed_network_status, new_network_status, networkColor.curOnlineColor, networkColor.newOnlineColor, element);
}