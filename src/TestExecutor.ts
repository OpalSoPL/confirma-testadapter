import * as vscode from 'vscode';
import { exec } from 'child_process';
import { ETestType } from './Interfaces';



export class TestExecutor
{
    static Run(type: ETestType, item:vscode.TestItem|undefined): Promise<{state:boolean, log:string|undefined}>
    {
        const godotPath = TestExecutor.getGodotPath();

        if (!godotPath)
        {
            vscode.window.showErrorMessage("unable to get a godot path");

            return new Promise(resolve => {
                resolve ({state:false, log:undefined});
            });
        }

        switch (type)
        {
            case ETestType.All:
                return TestExecutor.TestAll(godotPath);
            case ETestType.Class:
                return TestExecutor.TestClass(item!, godotPath);
            case ETestType.Method:
                return TestExecutor.TestMethod(item!, godotPath);
        }
    };

    static TestAll(godotPath:string): Promise<{state:boolean, log:string|undefined}>
    {
        return new Promise(resolve => {
            const path = TestExecutor.getWorkspacePath();
            exec (`${godotPath} --headless -- --confirma-run --confirma-verbose --confirma-disable-gd --confirma-sequential --confirma-quit`,
                {cwd: path},
                (e,stdout,stderr) => {
                    resolve({
                        state:true,
                        log:TestExecutor.getExecLog(stderr,stdout,{color:false, CRLF:true})
                    });
                }
            );
        });
    }

    static TestClass(item:vscode.TestItem,godotPath:string):Promise<{state:boolean, log:string|undefined}>
    {
        return new Promise(resolve => {
            const path = TestExecutor.getWorkspacePath();
            exec (`${godotPath} --headless -- --confirma-run=${item.id} --confirma-verbose --confirma-quit`,
                {cwd: path},
                (e,stdout,stderr) => {
                    resolve({
                        state:true,
                        log:TestExecutor.getExecLog(stderr,stdout,{color:false, CRLF:true})
                    });
                }
            );
        });
    }

    static TestMethod(item:vscode.TestItem,godotPath:string):Promise<{state:boolean, log:string|undefined}>
    {
        return new Promise(resolve => {
            const path = TestExecutor.getWorkspacePath();
            exec (`${godotPath} --headless -- --confirma-run=${item.parent!.id} --confirma-method=${item.id} --confirma-verbose --confirma-quit`,
                {cwd: path},
                (e,stdout,stderr) => {
                    resolve({
                        state:true,
                        log:TestExecutor.getExecLog(stderr,stdout,{color:false, CRLF:true})
                    });
                }
            );
        });
    }

    //todo move these to helpers.ts
    static getExecLog(stderr:string,stdout:string,options?:{color?:boolean,CRLF?:boolean})
    {
        let log = "";
        log += stdout + "\n";
        log += stderr + "\n";
        if (!options?.color) {log=this.removeColors(log);}
        if (options?.CRLF) {log=this.replaceLFwithCRLF(log);}
        return log;
    }

    static removeColors (text: string)
    {
        const ansiEscape = /\x1b\[[0-9;]*m/g;
        return text.replace(ansiEscape, '');
    };

    static replaceLFwithCRLF (text: string) {
        const lfEscape = /\n/g;
        return text.replace(lfEscape,"\r\n");
    }

    static getWorkspacePath ()
    {
        let workspacePath = "";
        if (vscode.workspace.workspaceFolders !== undefined) {
            workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }
        return workspacePath;
    }
    static getGodotPath():string | undefined {
        const config = vscode.workspace.getConfiguration();
        const godotPath = config.get<string>("confirma-testadapter.godot-path");

        if (!godotPath) {
            return process.env.GODOT;
        }
        return godotPath;
    }
}