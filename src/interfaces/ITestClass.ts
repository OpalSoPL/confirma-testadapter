import { ITestCase } from "./ITestCase";
import * as vscode from 'vscode';

export interface ITestClass {
    className: string;
    tests: ITestCase[];
    file?: vscode.Uri;
}
