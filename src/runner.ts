import { exec } from "child_process";
import { parseResult } from "./testResultParser";
import * as vscode from "vscode";
import { ETestStatus, ETestType, ITestCase} from "./Interfaces";
import {TestExecutor} from "./TestExecutor";
import { ParsedResult, IFailed } from "./ParsedResult";

const buildCommand = 'dotnet build';


export const  testConfigurationRun = async (request:vscode.TestRunRequest,token:vscode.CancellationToken,testCtrl: vscode.TestController) => {
    const run = testCtrl.createTestRun(request);

    let workspacePath = "";
    if (vscode.workspace.workspaceFolders !== undefined) {
        workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
    }

    const testRunner = new TestManager (run,workspacePath);

    try
    {
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
        const testItem: Map<string,vscode.TestItem> = new Map();

        if (request.include)
        {
            request.include.map(test => {
                testItem.set (test.id,test);

                let type:ETestType;
                if (!test.parent)
                {
                    type = ETestType.Class;
                }
                else
                {
                    type = ETestType.Method;
                }

                var promise = testRunner.ExecuteTest(testItem,type);
                testPromises.push(promise);
            });
        }
        else
        {
            testCtrl.items.forEach(element => {
                testItem.set(element.id,element);
            });

            var promise = testRunner.ExecuteTest(testItem,ETestType.All);
            testPromises.push(promise);
        }
        await Promise.all(testPromises);
    }
    finally {
        run.end();
        return;
    }

};


export class TestManager {

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
                const log=TestExecutor.getExecLog(stdout,stderr);
                return resolve(true);
            });
        });
    }


    ExecuteTest (testCollection: Map<string,vscode.TestItem>,type:ETestType)
    {
        return new Promise(async (resolve) => {

            const Logs:Promise<{state:boolean, log:string|undefined}> [] = [];
            const results:ParsedResult = new ParsedResult(0,0,0,{count: 0, map: new Map()},[]);

            testCollection.forEach(test => {
                this.run.started(test);
                Logs.push(TestExecutor.Run(type,test));
            });
            let everyLog= await Promise.all(Logs);

            everyLog.forEach(logInfo => {
                if (!logInfo.state)
                {
                    resolve(false);
                    return;
                }

                const result=parseResult(logInfo.log!);
                results.sum(result);
            });

            results.testedClasses.forEach(TestClass => {
                const testItemClass = testCollection.get(TestClass.className);
                if (!testItemClass) {console.error(`class: ${TestClass.className}, not found`); resolve(true); return;}

                TestClass.tests.forEach((value) => {
                    const child = testItemClass.children.get(value.itemName);

                    if (!child) {console.error(`item: ${value.itemName}, not found`); resolve(true); return;}
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