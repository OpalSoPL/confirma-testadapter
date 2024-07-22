import { exec } from "child_process";
import { parseResult } from "./testResultParser";
import * as vscode from "vscode";
import { measureTime } from 'measure-time';

const CompileErrRe = /ERROR: Command line option --build-solutions was passed, but the build callback failed\. Aborting\./;
const buildCommand = '"$GODOT" --build-solutions --headless --quit';


export const  testConfiguration = async (request:vscode.TestRunRequest,token:vscode.CancellationToken,testCtrl: vscode.TestController) => {
    const testRunner = new TestRunner;
    const run = testCtrl.createTestRun(request);

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
        if (request.include)
            {
                const testPromises = request.include?.map(test => testRunner.run(test,run,workspacePath));
                await Promise.all(testPromises);
            }
    }
    finally {
        run.end();
        return;
    }

};


export class TestRunner {
    /**
     *
     * @param path - path of directory containing file `project.godot`
     * @returns status of build
     * @since 0.1.0 - beta
     */
    async build(path:string)
    {
        let log:string = "";

        const options = {
            cwd: path
        };

        return new Promise((resolve) => {
            exec(buildCommand,options,(error,stdout,stderr) => {
                log += stdout + "\n";
                log += stderr + "\n";

                if (error!==null) {
                    log += error + "\n";
                    console.log(log);
                    resolve(true);
                }
                if (log.match(CompileErrRe)) {
                    resolve(false);
                } else {
                    resolve(true);
                    console.log("done");
                }
            });
        });
    }

    /**
     *
     * @param path - path of directory containing file `project.godot`
     * @since 0.1.0 - beta
     */
    async run(item:vscode.TestItem, run:vscode.TestRun ,path:string)
    {
        run.started(item);
        const getElapsed = measureTime();

        if (item.parent === undefined) {
            item.children.forEach((ChildItem) => {
                this.run(ChildItem,run,path).then(state => {
                    if (!state){
                        run.failed(item,new vscode.TestMessage(""));
                    }
                });
            });
            const itemPromises: Promise<any>[] = [];
            item.children.forEach(item =>
                {
                    itemPromises.push(this.run(item,run,path));
                });

            await Promise.all(itemPromises);
            return Promise.resolve();
        }

        const parentClass = item.parent.id;
        const methodName = item.id;

        
        const runCommand = `"$GODOT" --headless -- --confirma-run=${parentClass} --confirma-method=${methodName} --confirma-verbose --confirma-quit`;
        console.log(runCommand);

        return new Promise((resolve) => {

            const options = {
                cwd: path
            };
            exec (runCommand,options,(error,stdout,stderr) => {
                let log = "";
                log += stdout + "\n";
                log += stderr + "\n";
                
                log=removeColors(log);
                const results = parseResult(log);

                console.log(results);

                if (results.failed > 0 || results.warnings > 0) {
                    run.failed(item,new vscode.TestMessage("NOT IMPLEMENTED YET"),getElapsed().millisecondsTotal);
                    resolve(false);
                }
                else if (results.ignored > 0) {
                    run.skipped(item);
                    resolve(true);
                }
                else{
                    console.log(item);
                    run.passed(item,getElapsed().millisecondsTotal);
                    resolve(true);
                }
            });
        });
    }
}


const removeColors = (text: string) => {
    const ansiEscape = /\x1b\[[0-9;]*m/g;
    return text.replace(ansiEscape, '');
}