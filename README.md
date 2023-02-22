# Automated Cookie Scraper

A simple JS tool for collecting cookie information from a user-supplied set of URLs. Uses `selenium` to navigate to [https://cookie-script.com/](https://cookie-script.com/), initiate a site scan, and save the results to an output file. Each domain is separated by a "`---`" delimiter. 

## Installation

- Navigate to the root of this directory
- Run `npm install`

## Usage

- Update `input.txt` with a comma-separated list of target URLs.
- Run `npm run scrape`

## Configuration

- Optionally uncomment the following line when working in a headless environment:
```javascipt
.setChromeOptions(new chrome.Options().headless())
```

## Output

- Output is concatenated to an `output.csv` file.
