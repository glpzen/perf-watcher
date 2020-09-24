
async function collectPerformanceMetrics() {

    if (performance === undefined) {
        console.log("performance not supported");
        return;
    }

    var performanceMetrics = {
        ttfb: 0,
        fcp: 0,
        dom_load: 0,
        window_load_events:0
    };

    performanceMetrics.dom_load = await getDomLoadTime();
    performanceMetrics.window_load_events = await getWindowLoadTime();
    performanceMetrics.ttfb = await getTTFBTime();
    performanceMetrics.fcp = await getFCPTime();

    return performanceMetrics;

}


async function getDomLoadTime(){
    return new Promise((resolve,reject) => {
        document.addEventListener('DOMContentLoaded', function() {
            resolve(Math.floor(performance.now()));
        }, false);
    });
}


async function getWindowLoadTime(){
    return new Promise((resolve,reject) => {
        window.addEventListener('load', function() {
            resolve(Math.floor(performance.now()));
        }, false);
    });
}

async function getFCPTime(){
    let fcp = 0;
    let performance = window.performance;
    if (performance) {
        let performanceEntries = performance.getEntriesByType('paint');
        performanceEntries.forEach( (performanceEntry, i, entries) => {
            if(performanceEntry.name == "first-contentful-paint"){
                fcp = performanceEntry.startTime;
            }
        });
    } else {
        console.log('Performance timing isn\'t supported.');
    }

    return Math.floor(fcp);
}

async function getTTFBTime(){
    const responseStart = await performance.timing.responseStart;
    const requestStart = await performance.timing.requestStart;

    return Math.floor(responseStart - requestStart);
}


async function sendPerformanceMetrics() {
    const performanceMetrics = await collectPerformanceMetrics();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:3000/analytics', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(performanceMetrics));
}

module.exports.sendPerformanceMetrics = sendPerformanceMetrics;