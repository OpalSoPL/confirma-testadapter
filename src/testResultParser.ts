
import {ETestStatus, ITestCase, ITestClass} from './Interfaces';
import * as vscode from 'vscode';
const TerminalInfoRe = /([0-9]+) passed, ([0-9]+) failed, ([0-9]+) ignored, ([0-9]+) warnings/;
const TerminalClsRe =  /\> ([A-Za-z0-9]+)\.\.\./ ;
const TerminalItemResultRe = /\| ([A-Za-z0-9_]+)(\([\[\]\{\}?,a-zA-Z0-9\.\b!\s\*\\\-\(\)\/_]+\))*\.\.\. (passed|failed|ignored)./;
const TerminalFailReasonRe = /\- ([A-Za-z\s'0-9_,]+)\./;


export const parseResult = (text: string) => {
    const lines = text.split('\n');

    let currentClassIdx:number=-1;

    let passed = 0;
    let failed: {count:number,map:Map<ITestCase,string>} = {count: 0, map: new Map()};
    let ignored = 0;
    let warnings = 0;

    let testedClasses: ITestClass[]= [];

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo].trim();

        const infoMatch = line.match(TerminalInfoRe);
        if (infoMatch) {
            console.info("info", lineNo);
            passed = parseInt(infoMatch[1], 10);
            failed.count = parseInt(infoMatch[2], 10);
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
            switch (itemMatch[3]) {
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
            const args = itemMatch[2];
            const newTestCase: ITestCase = { itemName:testName, status, args};

            if (status === ETestStatus.Failed) {
                const reason=lines[lineNo+1];
                console.log(reason);
                const ReasonMatch = reason.match(TerminalFailReasonRe);
                let reasonOut = "";
                if (!ReasonMatch) {
                    vscode.window.showErrorMessage(`test fail reason not found, for: ${testName}`);

                }
                else {
                    reasonOut = ReasonMatch[0];
                }
                failed.map.set(newTestCase,reasonOut);
            }
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