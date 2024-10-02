import * as vscode from 'vscode';
import * as runner from './runner';
import { CsParseFile } from './cs/CsTestFileParser';
import { GdParseFile } from './gd/GdTestFileParser';
import { ITestClass } from './interfaces/ITestClass';

export class TestController {

    testCtrl: vscode.TestController;


    constructor (context: vscode.ExtensionContext)
    {
        this.testCtrl = vscode.tests.createTestController('confirmaTestControler', "Confirma");
        context.subscriptions.push(this.testCtrl);

        this.testCtrl.createRunProfile(
            'Run Tests',
            vscode.TestRunProfileKind.Run,
            async (request,token) => {await runner.testConfigurationRun(request,token,this.testCtrl);},
            true);
    };

    async discoverTests(): Promise<void> {
        const testFiles = await vscode.workspace.findFiles('{**/*.cs,**/*.gd}','{**/.godot/**,**/addons/**}');

        const testClasses: ITestClass[] = [];

        for (const file of testFiles) {
            const document = await vscode.workspace.openTextDocument(file);

            switch (document.languageId) {
                case "csharp":
                    var a = CsParseFile(document.getText());

                    a.forEach(element => {
                        element.file = file;
                        testClasses.push(element);
                    });

                    break;
                case "gdscript":
                case "plaintext":
                    var b = GdParseFile(document.getText());
                    if (!b) {continue;}

                    b.file = file;
                    testClasses.push(b);
                    break;
            }

            this.addTestsToTree(testClasses);
        }
    };

    addTestsToTree(tests: ITestClass[]):void {
        tests.forEach(testCls => {
            const classItem = this.testCtrl.createTestItem(testCls.className, testCls.className, testCls.file);
            this.testCtrl.items.add(classItem);

            testCls.tests.forEach(testCase => {
                const testItem = this.testCtrl.createTestItem(testCase.itemName, testCase.itemName, testCls.file);
                classItem.children.add(testItem);
            });
        });
    }
}