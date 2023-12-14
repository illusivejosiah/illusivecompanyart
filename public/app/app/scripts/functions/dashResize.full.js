/*
 * 2023.12.14.10:23:2
 */

$("#cea_mod").click(function () {
    // console.log("cea_mod clicked");
    // Get element id & attribute
    var prxMod = document.getElementById("prx_mod");
    var modOpen = Boolean(prxMod.getAttribute("open"))

    // If modal is open, close it. If closed, open it.
    if (modOpen) {
        var modOpenNew = false;
        prxMod.setAttribute("open", modOpenNew);
    } else {
        var modOpenNew = true;
        prxMod.setAttribute("open", modOpenNew);
    }
    // console.log(modOpenNew);
    // Resize dashboard
    resizeDash(modOpenNew);
});

$(".prx_crd_interact").click(function () {
    // console.log("prx_crd_interact clicked");
    // Get element id & attribute
    var prxMod = document.getElementById("prx_mod");
    var modOpen = Boolean(prxMod.getAttribute("open"))
    // If modal not open, open it.
    // console.log(modOpen);
    if (!modOpen) {
        var modOpenNew = true;
        prxMod.setAttribute("open", modOpenNew);
        // Resize dashboard
        resizeDash(modOpenNew);
    }

});


/*
 *
 *
 * * /// [Resize Dashboard v1.0.0]
 * ? Resizes cards and modal to fit screen size
 *
 *
 **/

function resizeDash(modOpen) {
    if ($(window).width() >= 1800) {
        if (modOpen) {
            $(".mod_col").css({
                display: "flex",
                width: "625px"
            });
            $(".crds_col").css({
                width: "calc(-198px + 100vw - 625px)"
            });
            $(".prx_crds").css({
                "grid-template-columns": "1fr 1fr"
            });
        } else {
            $(".mod_col").css({
                display: "none"
            });
            $(".crds_col").css({
                width: "calc(-198px + 100vw - 15px)"
            });
            $(".prx_crds").css({
                "grid-template-columns": "1fr 1fr 1fr"
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    // console.log("Resizing Dashboard");
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Check if a parameter exists
    if (urlParams.has('proxy')) {
        var modOpen = true;
    } else {
        var modOpen = false;
    }
    resizeDash(modOpen);
});