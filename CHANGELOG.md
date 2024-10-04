# Change Log

All notable changes to the "confirma-testadapter" extension will be documented in this file.

## [Unreleased]
Target compatibility: Confirma: v0.8.0 - v0.8.1 beta

### Added
- Classes:
    - GdTestFileParser.ts
    - ECurrentFlag.ts
    - ETestStatus.ts
    - ETestType.ts
    - ITestClass.ts
    - ITestCase.ts
    - TestController.ts

### Changed
- Renamed:
    - testFileParser.ts -> CsTestFileParser.ts

### Removed
- Interfaces.ts class
- example folder

### Fixed
- no C# tests are parsed
- TypeError: this.addTestsToTree is not a function
- miss matched normal class with test class

## [0.1.0 beta 15.08.2024]

- Initial release
- compatible with godot-confirma v0.7.0-beta

## [0.0.0 09.07.2024]
- beginning of the project
