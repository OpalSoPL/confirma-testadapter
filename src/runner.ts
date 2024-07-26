import { exec } from "child_process";
import { parseResult } from "./testResultParser";
import * as vscode from "vscode";
import { ETestStatus, ITestCase } from "./Interfaces";

const CompileErrRe = /ERROR: Command line option --build-solutions was passed, but the build callback failed\. Aborting\./;
const buildCommand = '"$GODOT" --build-solutions --headless --quit';


export const  testConfigurationRun = async (request:vscode.TestRunRequest,token:vscode.CancellationToken,testCtrl: vscode.TestController) => {
    const run = testCtrl.createTestRun(request);

    let workspacePath = "";
    if (vscode.workspace.workspaceFolders !== undefined) {
        workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
    }

    const testRunner = new TestRunner (run,workspacePath);

    try {
        let workspacePath = "";
        if (vscode.workspace.workspaceFolders !== undefined) {
            workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }

        //build project
        const buildStatus = vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Window,
            title: "build in progress",
            cancellable: true
        },
        async (progress) =>
        {
            const status = await testRunner.build(workspacePath);

            if (!status) {
                vscode.window.showErrorMessage("Build error");
                return false;
            }
            return true;
        });
        await buildStatus;


        //run tests in project
        let testPromises: Promise<any>[] = [];
        if (request.include){
            request.include?.map(test => {
                const promise =testRunner.runTests(test);
                testPromises.push(promise);
            });
        }
        else {
            testPromises = testRunner.runEverything(testCtrl);
        }
        await Promise.all(testPromises);
    }
    finally {
        run.end();
        return;
    }

};


export class TestRunner {

    run: vscode.TestRun;
    workspacePath: string;

    constructor(run:vscode.TestRun, workspacePath:string)
    {
        this.run = run;
        this.workspacePath = workspacePath;
    }

    /**
     *
     * @param path - path of directory containing file `project.godot`
     * @returns status of build
     * @since 0.1.0 - beta
     */
    async build(path:string) {
        return new Promise((resolve) => {
            exec(buildCommand,{cwd: path},(e,stdout,stderr) => {
                const log=getExecLog(stdout,stderr);

                const errorMatch=log.match(CompileErrRe);
                if (errorMatch) {
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }

    /**
     *
     * @param path - path of directory containing file `project.godot`
     * @since 0.1.0 - beta
     */
    async runTests(item:vscode.TestItem)
    {
        let testPromise:Promise<any>;
        //check if item is class
        if (item.parent === undefined) {testPromise = this.runClass(item);}
        else {testPromise = this.runMethod(item);}
        return testPromise;
    }

    async runEverything (testController: vscode.TestController) {
        const testPromises:Promise<any>[]=[];
        const tests = testController.items;
        tests.forEach(item => {
            testPromises.push(this.runClass(item));
        });
        await Promise.all(testPromises);
        return new Promise((resolve)=>{resolve(true);});
    }

    async runClass (item:vscode.TestItem) {
        const className = item.id;
        const runCommand = `"$GODOT" --headless -- --confirma-run=${className} --confirma-verbose --confirma-quit`;
        
        this.ExecuteTest(item,runCommand);
    }

    async runMethod (item: vscode.TestItem) {
        const parentClass = item.parent?.id;
        const methodName = item.id;
        const runCommand = `"$GODOT" --headless -- --confirma-run=${parentClass} --confirma-method=${methodName} --confirma-verbose --confirma-quit`;

        return new Promise((resolve) => {
            this.run.started(item);
            exec (runCommand,{cwd: this.workspacePath},(error,stdout,stderr) => {
                const log = getExecLog(stderr,stdout,{color:false});
                const results = parseResult(log);

                if (!results) {
                    this.run.skipped(item);
                    resolve (true);
                    return;
                }

                if (results.warnings > 0 || results.failed.count > 0) {
                    const errorMessage = this.getErrorMessage (results.failed);
                    this.run.failed(item,errorMessage);
                }
                else if (results.ignored) {this.run.skipped(item);}
                else {this.run.passed(item);}
                resolve (true);
            });
        });
    }

    ExecuteTest (item: vscode.TestItem,runCommand:string) {
        return new Promise((resolve) => {
            this.run.started(item);
            exec (runCommand,{cwd: this.workspacePath},(error,stdout,stderr) => {
                const log = getExecLog(stderr,stdout,{color: false});
                const results = parseResult(log);

                if (!results) {
                    this.run.skipped(item);
                    return;
                }

                results.testedClasses[0].tests.forEach((value) => {
                    const child = item.children.get(value.itemName);

                    if (!child) {console.error(`child: ${value.itemName}, not found`); return;}
                    switch(value.status){
                        case ETestStatus.Failed:
                            this.run.failed(child,this.getErrorMessage(results.failed,));
                            break;
                        case ETestStatus.Ignored:
                            this.run.skipped(child);
                            break;
                        case ETestStatus.Passed:
                            this.run.passed(child);
                            break;
                        default:
                            this.run.skipped;
                    }
                    resolve (true);
                });
            });
        });
    }

    getErrorMessage (results:{map:Map <ITestCase,string>},targetID?:string) :vscode.TestMessage {
        let errorMessage = "";
        
        results.map.forEach((value,key) => {
            if ((targetID && key.itemName === targetID) || !targetID) {
                errorMessage += `${key.itemName}${key.args}: ${value}\r\n`;
            }
        });
        
        return new vscode.TestMessage(errorMessage);
    }
}

function getExecLog(stderr:string,stdout:string,options?:{color?:boolean,CRLF?:boolean}) {
    let log = "";
    log += stdout + "\n";
    log += stderr + "\n";
    if (!options?.color) {log=removeColors(log);}
    if (options?.CRLF) {log=replaceLFwithCRLF(log);}
    return log;
}

function removeColors (text: string) {
    const ansiEscape = /\x1b\[[0-9;]*m/g;
    return text.replace(ansiEscape, '');
};

function replaceLFwithCRLF (text: string) {
    const lfEscape = /\n/g;
    return text.replace(lfEscape,"\r\n");
}