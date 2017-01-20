const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const diffMatchPatch = require('diff-match-patch');

class AstyleFormatter {
    constructor() {
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }

    // interface required by vscode.DocumentFormattingEditProvider
    provideDocumentFormattingEdits(document, options, token) {
        return new Promise((resolve, reject) => {
            let astyleBinPath = vscode.workspace.getConfiguration('astyle')['executable'] || 'astyle';
            let astyleRcPath = vscode.workspace.getConfiguration('astyle')['astylerc'];
            let args = vscode.workspace.getConfiguration('astyle')['cmd_options'] || [];

            if (astyleRcPath) {
                args.push("--options=" + astyleRcPath.replace(/\${workspaceRoot}/g, vscode.workspace.rootPath));
            }

            let astyle = childProcess.execFile(astyleBinPath, args, {}, (err, stdout, stderr) => {
                if (err && err.code == 'ENOENT') {
                    vscode.window.showErrorMessage('Can\'t find astyle.');
                    reject(null);
                    return;
                }

                if (err) {
                    vscode.window.showErrorMessage('Failed to launch astyle. (reason: "' + stderr.split('\n')[0] + '")');
                    reject(null);
                    return;
                }

                let editors = this.generateTextEditors(document, stdout);
                this.updateStatusBar(editors);
                resolve(editors);
            });

            if (astyle.pid) {
                astyle.stdin.write(document.getText());
                astyle.stdin.end();
            }
        });
    }

    generateTextEditors(document, formattedText) {
        let dmp = new diffMatchPatch.diff_match_patch();
        let diffs = dmp.diff_main(document.getText(), formattedText);
        let editors = [];
        let line = 0, character = 0;

        diffs.forEach((diff) => {
            let op = diff[0];
            let text = diff[1];
            let start = new vscode.Position(line, character);

            for (let c of text) {
                if (c === '\n') {
                    line++;
                    character = 0;
                } else {
                    character++;
                }
            }

            switch (op) {
                case diffMatchPatch.DIFF_INSERT:
                    editors.push(vscode.TextEdit.insert(start, text));
                    // this new part should not affect counting of original document
                    line = start.line;
                    character = start.character;
                    break;
                case diffMatchPatch.DIFF_DELETE:
                    let end = new vscode.Position(line, character);
                    editors.push(vscode.TextEdit.delete(new vscode.Range(start, end)));
                    break;
                case diffMatchPatch.DIFF_EQUAL:
                    break;
            }
        });

        return editors;
    }

    updateStatusBar(editors) {
        if (editors.length == 0) {
            this.statusBar.text = 'No changes';
        } else {
            this.statusBar.text = '$(pencil) Formatted';
        }

        this.statusBar.show();

        setTimeout(() => {
            this.statusBar.hide();
        }, 500);
    }

    dispose() {
        this.statusBar.dispose();
    }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let formatter = new AstyleFormatter();

    ["c", "cpp", "objective-c", "csharp", "java"].forEach(function (language) {
        let config = vscode.workspace.getConfiguration('astyle')[language];

        if (!config.enable) {
            return;
        }

        let disposable = vscode.languages.registerDocumentFormattingEditProvider(language, formatter);
        context.subscriptions.push(disposable);
    });

    context.subscriptions.push(formatter);
}

exports.activate = activate;
