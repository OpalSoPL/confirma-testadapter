import { exec } from "child_process";
import { parseResult } from "./testResultParser";
import * as vscode from "vscode";
import { ETestStatus, ITestCase } from "./Interfaces";

const buildCommand = 'dotnet build';


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
            testPromises.push(testRunner.runEverything(testCtrl));
        }
        await Promise.all(testPromises);
    }
    finally {
        console.log("end all");
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
        const runCommand = `${this.getGodotPath()} --headless -- --confirma-run --confirma-verbose --confirma-quit`;
        const testPromises:Promise<any>[]=[];
        const tests: Map<string,vscode.TestItem> = new Map();
        testController.items.forEach(item => {
            tests.set(item.id,item);
        });

        testPromises.push(this.ExecuteTest(tests,runCommand));
        await Promise.all(testPromises);
        console.log("Ev end");
        return new Promise(resolve=>{resolve(true);});
    }

    async runClass (item:vscode.TestItem) {
        const config = vscode.workspace.getConfiguration();
        const godotPath = this.getGodotPath();
        const className = item.id;
        const runCommand = `${godotPath} --headless -- --confirma-run=${className} --confirma-verbose --confirma-quit`;
        
        const testItem: Map<string,vscode.TestItem> = new Map();

        testItem.set(item.id,item);

        return this.ExecuteTest(testItem,runCommand);
    }

    async runMethod (item: vscode.TestItem) {
        const parentClass = item.parent?.id;
        const methodName = item.id;
        const godotPath = this.getGodotPath();
        const runCommand = `${godotPath} --headless -- --confirma-run=${parentClass} --confirma-method=${methodName} --confirma-verbose --confirma-quit`;

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

    ExecuteTest (testCollection: Map<string,vscode.TestItem>,runCommand:string) {
        return new Promise((resolve) => {
            testCollection.forEach(testClass => {
                this.run.started(testClass);
            });
            exec (runCommand,{cwd: this.workspacePath},(error,stdout,stderr) => {
                const log = getExecLog(stderr,stdout,{color: false});
                const results = parseResult(log);
                console.log(log);
                console.log(results);

                if (!results) {
                    testCollection.forEach(testClass => {
                        this.run.skipped(testClass);
                    });
                    console.error("Results are Undefined");
                    resolve (true);
                    return;
                }
                results.testedClasses.forEach(TestClass => {
                    const testItemClass = testCollection.get(TestClass.className);
                    if (!testItemClass) {console.error(`child: ${TestClass.className}, not found`); resolve(true); return;}

                    TestClass.tests.forEach((value) => {
                        const child = testItemClass.children.get(value.itemName);
    
                        if (!child) {console.error(`child: ${value.itemName}, not found`); resolve(true); return;}
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

    getGodotPath():string {
        const config = vscode.workspace.getConfiguration();
        const godotPath = config.get<string>("confirma-testadapter.godot-path");

        if (godotPath) {
            console.log(godotPath);
            return godotPath;
        }
        return '"$GODOT"';
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