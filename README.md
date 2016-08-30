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

## Release Notes

### 0.1

- Initial release
- Add ReadMe

### 0.2

- Add status bar
- Update ReadMe

### 0.3

- Add options `astyle.astylerc` for lookup astylerc path. (which is same as --options=`path`)

## Source code

Available on github: https://github.com/welkineins/vscode-astyle
Issue on github: https://github.com/welkineins/vscode-astyle/issues