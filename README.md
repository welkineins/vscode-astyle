# VSCode Astyle Format

This extension allows you to run Artistic Style(Astyle) on Visual Studio Code to format C/C++/Objective-C/C#/Java code.

## Installation

Open the command palette (Ctrl-Shift-P / Cmd-Shift-P)

> ext install vscode-astyle

## How to Start

1. Download Astyle from http://astyle.sourceforge.net/. (On Linux, you can use apt-get)
1. Prepare your style by editting astylerc and put it in the search path. (see the link first: http://astyle.sourceforge.net/astyle.html#_Options_File)
1. Make sure Astyle executable is in your system $PATH or add path to configration. 
1. Enable supported languages in configration. (C and C++ are enabled by default)
1. When you open a supoprted language file, you can find 'Format' in context menu or just shortcut Shift-Alt-F.

## Configuration

- `astyle.astylerc`: specify path of astylerc file. ${workspaceRoot} is supported to enable using different astyle file between projects. e.g. '${workspaceRoot}/.vscode/astylerc'. (default: null, lookup astylerc in original order of astyle)
- `astyle.cmd_options`: array of command line options for astyle. (You should avoid conflicted options) For example: `["--indent=tab", "--break-blocks"]`
- `astyle.additional_languages`: array of additional languages to use astyle as code formatter. For example: `["haxe"]`. (You don't have to enable the language in astyle config)

## FAQ

- Q1. How to avoid conflict with ClangFormat in C/C++ package
- A1. VSCode is not support dominate code formatter but with scores, and it two formatter has same score, it choose the later one. However, in the latest version of C/C++ package, you can disable ClangFormat with options `"C_Cpp.formatting" : "disabled"`. (Thanks to @BillDenton notes.)

## Source code

Available on github: https://github.com/welkineins/vscode-astyle
Issue on github: https://github.com/welkineins/vscode-astyle/issues