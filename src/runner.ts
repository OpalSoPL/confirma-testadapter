import { ChildProcess, exec } from "child_process";
import { parseResult } from "./testResultParser";
import * as vscode from "vscode";

const CompileErrRe = /ERROR: Command line option --build-solutions was passed, but the build callback failed\. Aborting\./;
const buildCommand = '"$GODOT" --build-solutions --headless --quit';
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
                    resolve(false);
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
    run(test:vscode.TestItem, run: vscode.TestRun)
    {
    }
}