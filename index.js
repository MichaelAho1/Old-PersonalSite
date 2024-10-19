let portfolioPic = '428a9b4a7e55b187ef';
let array = [];

function extractStockInfo({ meta, values }) {
    const stockName = meta.symbol; 
    const { open, close } = values[0]; 
    return { stockName, openingPrice: parseFloat(open), closingPrice: parseFloat(close) };
}

async function getStockData(symbols) {
    const url = `https://api.twelvedata.com/time_series?apikey=${main1 + portfolioPic}&interval=1day&symbol=${symbols}&outputsize=1`;    
    const response = await fetch(url); 
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); 
    const stockInfo = extractStockInfo(data); 
    const stockData = {
        stockInfo,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(`stockData_${symbols}`, JSON.stringify(stockData)); 

    return stockInfo;
}
function calculatePercentage({ openingPrice, closingPrice }) {
    return ((closingPrice - openingPrice) / openingPrice) * 100;
}
let main1 = 'd0025d1477344b';

async function main(symbols, boxNumber) {
    const stockDataFromLocalStorage = localStorage.getItem(`stockData_${symbols}`);
    let stockInfo;
    let dataIsFresh = false;

    if (stockDataFromLocalStorage) {
        const { stockInfo: cachedStockInfo, timestamp } = JSON.parse(stockDataFromLocalStorage);
        const lastFetchTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        if (currentTime - lastFetchTime < 60000) {
            dataIsFresh = true;
            stockInfo = cachedStockInfo;
        }
    }

    if (!dataIsFresh) {
        stockInfo = await getStockData(symbols);
    }

    const { stockName, closingPrice, openingPrice } = stockInfo;
    const percentage = calculatePercentage(stockInfo);

    const firstBox = document.querySelector(boxNumber);
    const lines = firstBox.innerHTML.split('<br>');
    lines[0] = `${stockName}`;
    lines[1] = `<span style="font-weight: bold;">${closingPrice.toFixed(2)}</span>`;

    if (percentage.toFixed(3) < 0) {
        lines[2] = `<span style="color: red;">${percentage.toFixed(3)}%</span>`;
    } else if (percentage.toFixed(3) > 0) {
        lines[2] = `<span style="color: green;">${percentage.toFixed(3)}%</span>`;
    } else {
        lines[2] = `<span style="color: yellow;">${percentage.toFixed(3)}%</span>`;
    }
    array.push(percentage);
    firstBox.innerHTML = lines.join('<br>');
}

function average(array) {
    let average = 0.0;
    let upDown;
    for(let i = 0; i < array.length; i++) {
        average += array[i];
    }
    const text = document.getElementById("upOrDown");
    average = average.toFixed(2);
    if(average >= 0) {
        upDown = `up ${average}%`;
        text.innerHTML = `<span style="color: green; font-weight: bold;">${upDown}</span>`;
    } else {
        upDown = `uown ${average}%`;
        text.innerHTML = `<span style="color: red; font-weight: bold;">${upDown}</span>`;
    }

}


async function run() {
    await Promise.all([
        main("AAPL", "#box1"),
        main("IBM", "#box2"),
        main("META", "#box3"),
        main("AMZN", "#box4")
    ]);
    average(array);
}

run();