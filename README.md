# Confirma test adapter
This Extension adds ability to run Confirma unit tests.

## supported versions of Confirma

| confirma version        | supported? (*last version*)             |
| ----------------------- | --------------------------------------- |
| 0.6.x beta *or earlier* | :x:                                     |
| 0.7.x beta              | :white_check_mark: (*0.1.x*)            |
| 0.8.x beta *(probably)* | :white_check_mark: (*0.1.x - only c# *) |

## Requirements

Extension requires:
- Godot Engine Mono (C# support)
- Project.godot in main directory of workspace
- Godot Addon "Confirma" (0.7.0 beta or Higher) in /addons/ directory
- env variable set for `GODOT` containing path to godot binary or VSCode 

## Extension Settings
This extension contributes the following settings:
* `confirma-testadapter.Godot`: Sets godot path, overides system varbiable `GODOT` 

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.
