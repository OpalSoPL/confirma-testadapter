# Confirma test adapter
This Extension adds ability to run Confirma unit tests.

## supported versions of Confirma

| confirma version        | supported? (*last version*)             |
| ----------------------- | --------------------------------------- |
| 0.6.x beta *or earlier* | :x:                                     |
| 0.7.x beta              | :white_check_mark: (*0.1.x*)            |
| 0.8.0 - 0.8.1 beta      | :white_check_mark: (*0.2.x*)            |
| 0.9.0+ beta             | :x:                                     |

## Requirements

Extension requires:
- Godot Engine Mono (C# support)
- Project.godot in main directory of workspace
- Godot Addon "Confirma" (see compatibility [here](#supported-versions-of-confirma)) in /addons/ directory
- env variable set for `GODOT` containing path to godot binary or set in VSCode

## Extension Settings
This extension contributes the following settings:
* `confirma-testadapter.Godot`: Sets godot path, overides system varbiable `GODOT`

## Known Issues
 see issues tab: [here](https://github.com/OpalSoPL/confirma-testadapter/issues)
