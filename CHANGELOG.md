# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - 2023-10-06

### Added

- MAJOR Added posibility to load modules by awaiting on functions
- MINOR Adedd `destroy` event for reactive components
- MINOR Added `$children` property on reactive instances
- MINOR Added jQuery version of reactive module, generation and minifier scripts

### Changed

- BREAKING Removed components from reactive components definition. Components can be linked by id structure
- MAJOR Changed reactive update events to not run during reactive methods and events
- MINOR Changed reactive `destroy` to be able to destroy non-root components

### Fixed

- MINOR Fixed reactive var property delete
- MINOR Fixed preventing reactive components initialization with existing id

## [1.1.0] - 2023-10-02

### Changed

- BREAKING Changed reactive variables getting, setting and unsetting inside component; Direct manipulation based on proxies has been implemented
- MINOR Changed `refresh` function to async
- MINOR Changed monolithic minifier input and output ES version

### Fixed

- MINOR Fixed `listState` function to correctly return state

## [1.0.4] - 2023-04-25
 
### Fixed
 
- MINOR Fixed reactive components `init` when more levels are nested
- MINOR Fixed error on missing reactive components `data` in definition
- MINOR Fixed reactive `destroy` when 'remove' was never called

## [1.0.3] - 2022-10-12

### Added

- MINOR Added `runScripts` function to compensate the fact that scripts added in HTML strings are not automatically run
- MINOR Added and updated tests for new function and fixes
 
### Fixed
 
- MINOR Fixed `show`, `hide` and `toggle` functions when called repeatedly and used `initial` instead of empty
- MINOR Fixed `clone` function to clone deep
- MINOR Fixed type in `baseManipulation` function name

## [1.0.2] - 2021-03-30
 
### Fixed
 
- MINOR Fixed `parseHTML` response to always be array-like
- MINOR Fixed `load` function in relation to previous fix and `complete` parameter function context

## [1.0.1] - 2021-03-22
 
### Fixed
 
- MINOR Fixed `this` context for `swipe` function to point to the correct element
