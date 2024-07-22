import {ETestStatus, ITestCase, ITestClass} from './Interfaces';

const TerminalInfoRe = /([0-9]+) passed, ([0-9]+) failed, ([0-9]+) ignored, ([0-9]+) warnings/;
const TerminalClsRe =  /\> ([A-Za-z0-9]+)\.\.\./ ;
const TerminalItemResultRe = /\| ([A-Za-z0-9_]+)(\([\[\],a-zA-Z1-9\.\b ]+\))*\.\.\. (passed|failed|ignored)./;
const TerminalFailReasonRe = /\- ([A-Za-z\s'1-9_]+)\./;


export const parseResult = (text: string) => {
    const lines = text.split('\n');

    let currentClassIdx:number=-1;

    let passed = 0;
    let failed = 0;
    let ignored = 0;
    let warnings = 0;

    let testedClasses: ITestClass[]= [];

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo].trim();

        const infoMatch = line.match(TerminalInfoRe);
        if (infoMatch) {
            console.info("info", lineNo);
            passed = parseInt(infoMatch[1], 10);
            failed = parseInt(infoMatch[2], 10);
            ignored = parseInt(infoMatch[3], 10);
            warnings = parseInt(infoMatch[4], 10);
            continue;
        }

        const classMatch = line.match(TerminalClsRe);
        if (classMatch) {
            console.info("class", lineNo);
            const className = classMatch[1];
            const newClass: ITestClass = { className, tests: []};
            testedClasses.push(newClass);
            currentClassIdx = testedClasses.length-1;
            continue;
        }

        const itemMatch = line.match(TerminalItemResultRe);
        if (itemMatch && currentClassIdx !== -1) {
            console.info("item", lineNo);
            let status:ETestStatus = ETestStatus.Unknown;

            switch (itemMatch[2]) {
                case "passed":
                    status = ETestStatus.Passed;
                    break;
                case "failed":
                    status = ETestStatus.Failed;
                    break;
                case "ignored":
                    status = ETestStatus.Ignored;
                    break;
            }
            const testName = itemMatch[1];
            const newTestCase: ITestCase = { itemName:testName, status };
            testedClasses[currentClassIdx].tests.push(newTestCase);
            continue;
        }
    }
    return {
        passed,
        failed,
        ignored,
        warnings,
        testedClasses
    };
};