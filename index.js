import  {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

import {appendFile, readFile} from 'fs/promises';
import path from 'path';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const urls = (await readFile(path.join(__dirname, 'input.txt'), 'utf-8')).split(',');

(async function iify() {
    let driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(new chrome.Options().headless())
    .build();

    try {
        for(const url of urls)
        {
            try {
                await home(driver);
                await scanSite(url, driver);
                const result = await saveResults(url, driver);

                await appendFile(path.join(__dirname, 'output.csv'), result);
            }
            catch(err)
            {
                await appendFile(path.join(__dirname, 'errors.csv'), ',' + url);
            }
        }

    }
    finally {
        await driver.quit();
    }
})();

async function scanSite(domain, driver)
{
    const inputs = await driver.findElements(By.id('scandomain'));
    const scanButton = await driver.findElements(By.css('button[type="submit"]'));

    if(inputs.length === 1 && scanButton.length === 1)
    {
        await inputs[0].sendKeys(domain);
        await scanButton[0].click();
        await driver.wait(until.elementLocated(By.className('reportbox')), 60000);
    }
}

async function saveResults(domain, driver)
{
    const reportBoxes = await driver.findElements(By.className('reportbox'));

    let resultString = '------------------------------------------------------------------------------\n\n';
    resultString += domain + '\n\n';

    if(reportBoxes.length === 1)
    {
        const reportBox = reportBoxes[0];

        const reportTitles = await reportBox.findElements(By.className('reporttitle'));
        const reportTables = await reportBox.findElements(By.css('.reporttable.table'));

        if(reportTitles.length === reportTables.length)
        {
            for(let index = 0; index < reportTitles.length; ++index)
            {
                resultString += await reportTitles[index].getText() + '\n\n';

                const table = reportTables[index];

                const tableHeader = await table.findElement(By.tagName('thead'));
                const tableBody = await table.findElement(By.tagName('tbody'));
                const headerCells = await tableHeader.findElements(By.tagName('th'));

                resultString += 'URL,';

                for(let index = 0; index < headerCells.length; ++index)
                {
                    resultString += await headerCells[index].getText();

                    if(index !== headerCells.length - 1)
                        resultString += ',';
                }

                resultString += '\r\n\r\n';

                const rows = await tableBody.findElements(By.css('tr:not(.firstfoundrow)'));

                for(const row of rows)
                {
                    const rowCells = await row.findElements(By.tagName('td'));

                    resultString += domain + ',';

                    for(let index = 0; index < rowCells.length; ++index)
                    {
                        const rowCell = rowCells[index];
                        const cellText = await rowCell.getText();

                        if(index !== 0)
                            resultString += cellText;
                        else
                            resultString += cellText.substring(0, cellText.indexOf('\n'));

                        if(index !== rowCells.length - 1)
                            resultString += ',';
                    }

                    resultString += '\n';
                }
            }
        }
    }

    resultString += '\n------------------------------------------------------------------------------';

    return resultString;
}

async function home(driver)
{
    await driver.get('https://cookie-script.com/');
}