# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.13.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.12.1...@weave-js/core@0.13.0) (2022-08-16)

**Note:** Version bump only for package @weave-js/core





## [0.12.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.12.0...@weave-js/core@0.12.1) (2022-05-15)

**Note:** Version bump only for package @weave-js/core





# [0.12.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.11.1...@weave-js/core@0.12.0) (2022-03-30)


### Bug Fixes

* Fixed cache key generation ([d213425](https://github.com/fachw3rk/weave/commit/d21342597c4e04472ad57113bb2548142ab99953))





## [0.11.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.11.0...@weave-js/core@0.11.1) (2022-03-07)


### Bug Fixes

* Fixed cache middleware ([d79be1f](https://github.com/fachw3rk/weave/commit/d79be1faf7c2dfe73d1a7bf299a51546c492f9c3))





# [0.11.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.10.0...@weave-js/core@0.11.0) (2022-02-19)


### Bug Fixes

* added error fields and request/response data in traces ([1fcdf9c](https://github.com/fachw3rk/weave/commit/1fcdf9c2fcf16d59817db8b04af1a0da8c66ce4b))
* Changed error code of "WEAVE_SERVICE_NOT_AVAILABLE_ERROR" from 404 to 503 ([4b2a61a](https://github.com/fachw3rk/weave/commit/4b2a61a19794129b788a6aef23b79d740481482a))
* Fixed broken metric counter incrementation ([0cd866c](https://github.com/fachw3rk/weave/commit/0cd866c46783a7d6cdf62780d8748fbbf67d3272))
* Fixed missing server closure in the TCP adapter that prevents the broker from being stopped ([6360335](https://github.com/fachw3rk/weave/commit/63603357554b330890b872aba13241a39be6418d))
* integration tests ([f8c06ae](https://github.com/fachw3rk/weave/commit/f8c06aeca772a29db83166dd5a9228440e2ba0c9))
* Typos fixed ([147237b](https://github.com/fachw3rk/weave/commit/147237bb6936eec666ebc595573c884cc6f98020))


### Features

* Added action level hook support ([86c4e28](https://github.com/fachw3rk/weave/commit/86c4e28f84bd65a8ff228ca1d9f5a4cc8c7fdab6))
* Added cache lock support for In-Memory cache. ([9a5d178](https://github.com/fachw3rk/weave/commit/9a5d1782a3d47769b69714edaf96d8f8f2c4092f))
* Added lock service with in memory store. ([f9e40a0](https://github.com/fachw3rk/weave/commit/f9e40a047f530bc888c7facae56228e65b84b8ad))
* implemented lock service with in memory store ([f53e57c](https://github.com/fachw3rk/weave/commit/f53e57c60ef3da3b616f14d0b4661180d34ad710))





# [0.10.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.4...@weave-js/core@0.10.0) (2021-10-18)


### Bug Fixes

* Event balancing ([6fa2b58](https://github.com/fachw3rk/weave/commit/6fa2b58e50a8fd471c63e5a5678831e7986b92d0))
* Fixed valdiator ([777e4e8](https://github.com/fachw3rk/weave/commit/777e4e83ae6dea34f2b32adf3b29b6eeb2cae0ed))


### Features

* Added metrics to cache module ([b4c3173](https://github.com/fachw3rk/weave/commit/b4c31737f631e300cabd3f8e55913341cdc9bd41))





## [0.9.4](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.3...@weave-js/core@0.9.4) (2021-09-09)


### Features

* Added detection for TTY and an human-readable log output. ([9434a7b](https://github.com/fachw3rk/weave/commit/9434a7b9f5722550e20a1de073a5629f204827f9))
* Implemented better human readable log output ([72d0faa](https://github.com/fachw3rk/weave/commit/72d0faa744b0e407502d90320bfc81af9e0ae866))





## [0.9.3](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.2...@weave-js/core@0.9.3) (2021-08-30)


### Bug Fixes

* Fixed log message for remote events ([32b8666](https://github.com/fachw3rk/weave/commit/32b8666f09936f0c687f95a57b7b20a4c24f544d))
* removed unnecessary module import ([5febbe7](https://github.com/fachw3rk/weave/commit/5febbe7567f9b8b1f2c2c1d23eaa2e1d93a35cb8))





## [0.9.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.1...@weave-js/core@0.9.2) (2021-08-18)


### Bug Fixes

* Fixed @weave-js/utils references ([69f2d90](https://github.com/fachw3rk/weave/commit/69f2d9010210782e42b0f168f9ac88e3d40c3150))





## [0.9.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0...@weave-js/core@0.9.1) (2021-08-17)


### Bug Fixes

* Fixed wrong gossip message constants. ([ad7ca04](https://github.com/fachw3rk/weave/commit/ad7ca04a131a7facb10cfa5a9473f167087fd894))


### Features

* **core:** The possibility to validate responses via a "responseSchema" implemented in validator middleware. ([3387fe1](https://github.com/fachw3rk/weave/commit/3387fe1e9616c4ee882b7c863b53912851fd7a1b))





# [0.9.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.13...@weave-js/core@0.9.0) (2021-08-02)


### Bug Fixes

* unit test ([d76bad7](https://github.com/fachw3rk/weave/commit/d76bad7b9a723c45c9e92951dd9aa88b976ec56e))
* **logger:** Fixed wrong service name in log object ([56bed33](https://github.com/fachw3rk/weave/commit/56bed335d7470d118e878428744a244934fcfd81))





# [0.9.0-beta.13](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.12...@weave-js/core@0.9.0-beta.13) (2021-07-26)


### Bug Fixes

* Added missing event name in Event parameter validation error message ([33c8365](https://github.com/fachw3rk/weave/commit/33c83659151f0926cdc02cbeb3aaf90dca819622))
* Fixed context tracking ([cda3a17](https://github.com/fachw3rk/weave/commit/cda3a171029f26fb059cf9eab8fdb95835282750))
* Fixed service reference for error message ([62daab6](https://github.com/fachw3rk/weave/commit/62daab6bcfa9f8bc053aa87a103c9570a9f67742))
* Fixed unit tests (new Jest version) ([6db1d40](https://github.com/fachw3rk/weave/commit/6db1d407dc0b39717d9d6cb884b0d6600144326a))


### Features

* **logger:** Added destination stream property to options. ([1c7531c](https://github.com/fachw3rk/weave/commit/1c7531c282487a1951b848f04c01495e023bb035))





# [0.9.0-beta.12](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.11...@weave-js/core@0.9.0-beta.12) (2021-06-28)


### Bug Fixes

* **core:** Fixes streaming unit test ([c39672b](https://github.com/fachw3rk/weave/commit/c39672be24e89d9af4df5c0c0cc59ea6a51fe2e6))


### Features

* **weave-core:** Added support for validator strict mode. ([8412c07](https://github.com/fachw3rk/weave/commit/8412c07df90014b15663c1effdbdcf2bd1a9fb49))





# [0.9.0-beta.11](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.10...@weave-js/core@0.9.0-beta.11) (2021-05-31)


### Bug Fixes

* Removed buggy context assignment for lifecycle hooks ([b471408](https://github.com/fachw3rk/weave/commit/b471408c481752b02da26d225119f8e18e89880d))





# [0.9.0-beta.10](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.9...@weave-js/core@0.9.0-beta.10) (2021-05-30)


### Bug Fixes

* Fixed log action names if the actionName param refers to an endpoint. ([3100b42](https://github.com/fachw3rk/weave/commit/3100b427b126cd826b6f7fd0a25208bc4ceba255))





# [0.9.0-beta.9](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.8...@weave-js/core@0.9.0-beta.9) (2021-05-27)


### Bug Fixes

* Fixed context tracker ([ab2869e](https://github.com/fachw3rk/weave/commit/ab2869e98f5459256faafa7955e5b817a611639e))
* fixed unrefed timers ([04fe50b](https://github.com/fachw3rk/weave/commit/04fe50b2e88e863f6783b4804ce4cfb74f910e3c))


### Features

* **metrics:** Added time measurement tool ([245d272](https://github.com/fachw3rk/weave/commit/245d272aa300f926df44088233ea10379008e055))
* Added validator for events ([da5044e](https://github.com/fachw3rk/weave/commit/da5044ef5acbe3bd4a9984e98e0d2caa00cb0f26))
* **core:** Added afterSchemasMerged service lifetime hook ([0f8a19a](https://github.com/fachw3rk/weave/commit/0f8a19ac592786b54621eb52486405efbcb6c126))
* **core:** Added stoping sequence to metric adapters ([cf7b657](https://github.com/fachw3rk/weave/commit/cf7b6573f93c8d3cdaa128fbc3eaf9962d529725))
* **core:** Refactoring metrics ([edf2a62](https://github.com/fachw3rk/weave/commit/edf2a62a46417a3221949519fb46c28b070f327b))
* Refactoring ([b79ca4f](https://github.com/fachw3rk/weave/commit/b79ca4fe4a07bd4c1cdf433f514d89f028fd8d9d))





# [0.9.0-beta.8](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.7...@weave-js/core@0.9.0-beta.8) (2021-04-29)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.7](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.6...@weave-js/core@0.9.0-beta.7) (2021-04-28)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.6](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.5...@weave-js/core@0.9.0-beta.6) (2021-04-23)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.5](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.4...@weave-js/core@0.9.0-beta.5) (2021-04-22)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.4](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.3...@weave-js/core@0.9.0-beta.4) (2021-04-17)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.3](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.2...@weave-js/core@0.9.0-beta.3) (2021-04-13)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.1...@weave-js/core@0.9.0-beta.2) (2021-04-12)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.9.0-beta.0...@weave-js/core@0.9.0-beta.1) (2021-04-12)

**Note:** Version bump only for package @weave-js/core





# [0.9.0-beta.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.1...@weave-js/core@0.9.0-beta.0) (2021-04-12)

**Note:** Version bump only for package @weave-js/core





## [0.8.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0...@weave-js/core@0.8.1) (2021-01-18)

**Note:** Version bump only for package @weave-js/core





# [0.8.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.7...@weave-js/core@0.8.0) (2021-01-05)


### Features

* implement a max chung size for stream chunks ([d898184](https://github.com/fachw3rk/weave/commit/d89818415c94b3ee71c37358647bb3a10c65c094))





# [0.8.0-alpha.7](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.6...@weave-js/core@0.8.0-alpha.7) (2020-11-09)


### Features

* Added custom UUID generator function in Options ([2aed695](https://github.com/fachw3rk/weave/commit/2aed695a0075d0a445b500393243f1fea9633e0f))





# [0.8.0-alpha.6](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.5...@weave-js/core@0.8.0-alpha.6) (2020-10-01)

**Note:** Version bump only for package @weave-js/core





# [0.8.0-alpha.5](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.4...@weave-js/core@0.8.0-alpha.5) (2020-10-01)


### Bug Fixes

* fixed unit test ([d58900c](https://github.com/fachw3rk/weave/commit/d58900c7ec74a4c5681d255caa07b02af68d66cb))





# [0.8.0-alpha.4](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.3...@weave-js/core@0.8.0-alpha.4) (2020-09-07)

**Note:** Version bump only for package @weave-js/core





# [0.8.0-alpha.3](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.2...@weave-js/core@0.8.0-alpha.3) (2020-09-02)

**Note:** Version bump only for package @weave-js/core





# [0.8.0-alpha.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.8.0-alpha.1...@weave-js/core@0.8.0-alpha.2) (2020-09-02)

**Note:** Version bump only for package @weave-js/core





# [0.8.0-alpha.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.25...@weave-js/core@0.8.0-alpha.1) (2020-09-02)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.25](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.24...@weave-js/core@0.7.0-rc.25) (2020-07-27)


### Bug Fixes

* Option merging for mixins ([c76996f](https://github.com/fachw3rk/weave/commit/c76996f4cced0fb27e8aaa29d5bedbb569ce90e5))





# [0.7.0-rc.24](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.23...@weave-js/core@0.7.0-rc.24) (2020-07-27)


### Bug Fixes

* Fixed merging of action hooks  if the target does not exist. ([9be8f28](https://github.com/fachw3rk/weave/commit/9be8f289be3ab3e93afb0bac5cc2ec317fa1d80e))





# [0.7.0-rc.23](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.22...@weave-js/core@0.7.0-rc.23) (2020-06-13)


### Bug Fixes

* Added missing mixin schema merge ([6b16470](https://github.com/fachw3rk/weave/commit/6b1647038bdc0094ae995c0aea70468b075b80db))


### Features

* Added support for object streams ([6b174dd](https://github.com/fachw3rk/weave/commit/6b174ddd6dd66969c79f8ce9d2fa09f9fdfd55d1))





# [0.7.0-rc.22](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.21...@weave-js/core@0.7.0-rc.22) (2020-06-11)


### Bug Fixes

* Config merge from file ([edfdc86](https://github.com/fachw3rk/weave/commit/edfdc86a86dc96582622d15a3c914c7f2c266e41))





# [0.7.0-rc.21](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.20...@weave-js/core@0.7.0-rc.21) (2020-06-09)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.20](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.19...@weave-js/core@0.7.0-rc.20) (2020-06-09)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.19](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.18...@weave-js/core@0.7.0-rc.19) (2020-04-28)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.18](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.17...@weave-js/core@0.7.0-rc.18) (2020-04-28)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.17](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.16...@weave-js/core@0.7.0-rc.17) (2020-04-28)


### Bug Fixes

* linting ([a592f35](https://github.com/fachw3rk/weave/commit/a592f35524d934b61841655bb0fc794b3bf46b99))





# [0.7.0-rc.16](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.15...@weave-js/core@0.7.0-rc.16) (2020-02-25)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.15](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.14...@weave-js/core@0.7.0-rc.15) (2020-02-25)


### Features

* Added sequence number to streams for upcoming changes ([4252a94](https://github.com/fachw3rk/weave/commit/4252a9437173b5f002682c6e8de640d49442f0ea))





# [0.7.0-rc.14](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.13...@weave-js/core@0.7.0-rc.14) (2020-01-22)


### Bug Fixes

* Another fix for meta data ([243c716](https://github.com/fachw3rk/weave/commit/243c7169b7c0d54eaffa4715a5784ebabf175cfc))





# [0.7.0-rc.13](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.12...@weave-js/core@0.7.0-rc.13) (2020-01-22)


### Bug Fixes

* Pass meta data through response ([558752a](https://github.com/fachw3rk/weave/commit/558752ad547285bcc31c8a0256d9a9dc4bc6d413))





# [0.7.0-rc.12](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.11...@weave-js/core@0.7.0-rc.12) (2020-01-22)


### Bug Fixes

* Pass meta data through response ([80fb3d7](https://github.com/fachw3rk/weave/commit/80fb3d729342dfabe60ae23ec856cbd9c959b985))





# [0.7.0-rc.11](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.10...@weave-js/core@0.7.0-rc.11) (2020-01-22)


### Bug Fixes

* Fatal error if a stream throws an error. ([7c6c847](https://github.com/fachw3rk/weave/commit/7c6c8470f01765c27f8fce46271df5b3e71a6c7f))





# [0.7.0-rc.10](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.9...@weave-js/core@0.7.0-rc.10) (2020-01-12)


### Bug Fixes

* Changed service init order. ([7b09831](https://github.com/fachw3rk/weave/commit/7b09831c8ef610351ece339dbb327a0a8b211713))





# [0.7.0-rc.9](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.8...@weave-js/core@0.7.0-rc.9) (2019-12-21)


### Bug Fixes

* Node list ([7169b20](https://github.com/fachw3rk/weave/commit/7169b202ae502ea0de8037ae16ffdceca02896ce))
* Removed raw information from node list ([fd9bad1](https://github.com/fachw3rk/weave/commit/fd9bad1a6758560d13ac2053fcc832424737eaa2))


### Features

* Added support for transport connection strings. ([c3473ba](https://github.com/fachw3rk/weave/commit/c3473baa4f40f72f6e196e6615f09a9971fc4cf5))
* Connection string support added. ([fbd2654](https://github.com/fachw3rk/weave/commit/fbd26546cc333510594b29ec13547e519a968c7c))
* getServiceList short hand method ([cb59016](https://github.com/fachw3rk/weave/commit/cb59016ae9e7040b5c6e077fac019a8e915958da))





# [0.7.0-rc.8](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.7...@weave-js/core@0.7.0-rc.8) (2019-11-27)


### Bug Fixes

* Fixed blocking waitForService method on broker stop ([1c5178e](https://github.com/fachw3rk/weave/commit/1c5178eb70fb8a86c1f8715fb06add2148defb06))
* Fixed object logs ([0f05dbe](https://github.com/fachw3rk/weave/commit/0f05dbe3b19c2c6ce4223b695f3c139aece75c25))
* Remove circular references from remote nodes ([14ae7a8](https://github.com/fachw3rk/weave/commit/14ae7a8499d175a2221854ffd9f47124158fb157))





# [0.7.0-rc.7](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.1...@weave-js/core@0.7.0-rc.7) (2019-11-06)


### Bug Fixes

* Added missing dependency ([602aafb](https://github.com/fachw3rk/weave/commit/602aafb1dcbaf55dc37d5a49e7b56edcbe20aaee))





# [0.7.0-rc.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.1...@weave-js/core@0.7.0-rc.2) (2019-11-06)


### Bug Fixes

* Added missing dependency ([602aafb](https://github.com/fachw3rk/weave/commit/602aafb1dcbaf55dc37d5a49e7b56edcbe20aaee))





# [0.7.0-rc.3](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.1...@weave-js/core@0.7.0-rc.3) (2019-11-06)


### Bug Fixes

* Added missing dependency ([602aafb](https://github.com/fachw3rk/weave/commit/602aafb1dcbaf55dc37d5a49e7b56edcbe20aaee))





# [0.7.0-rc.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.1...@weave-js/core@0.7.0-rc.2) (2019-11-06)


### Bug Fixes

* Added missing dependency ([602aafb](https://github.com/fachw3rk/weave/commit/602aafb1dcbaf55dc37d5a49e7b56edcbe20aaee))





# [0.7.0-rc.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.0...@weave-js/core@0.7.0-rc.1) (2019-11-06)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-alpha.20...@weave-js/core@0.7.0-rc.0) (2019-11-06)


### Bug Fixes

* Fixed direct call with node ID ([8cfc1cb](https://github.com/fachw3rk/weave/commit/8cfc1cb2ff1d16367d93c292fcd43688368f5867))
* Fixed silent argument fpr weave runner ([1173e9e](https://github.com/fachw3rk/weave/commit/1173e9e55aa24a679dc552eac69d0fdbda1beb9c))
* Memory leak ([c255ab2](https://github.com/fachw3rk/weave/commit/c255ab2322197b6c84009e73a5d5dbe6de7463bb))
* Throw an error if service creation fails ([b9f01f0](https://github.com/fachw3rk/weave/commit/b9f01f03bddab1c2ba83154a5866f4e0096774fd))





# [0.7.0-alpha.20](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-alpha.19...@weave-js/core@0.7.0-alpha.20) (2019-10-03)


### Bug Fixes

* made ioredis package optional for redis cache ([004c02f](https://github.com/fachw3rk/weave/commit/004c02f))





# [0.7.0-alpha.19](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.6...@weave-js/core@0.7.0-alpha.19) (2019-10-02)


### Bug Fixes

* Changed order of mixin merge ([40ac322](https://github.com/fachw3rk/weave/commit/40ac322))
* Improved logger performance. ([0be7543](https://github.com/fachw3rk/weave/commit/0be7543))
* level of trace ([84713da](https://github.com/fachw3rk/weave/commit/84713da))
* Service settings for remote services are now stored correctly ([c230f03](https://github.com/fachw3rk/weave/commit/c230f03))


### Features

*  Added "ping" function to broker ([e43ffed](https://github.com/fachw3rk/weave/commit/e43ffed))
* Added raw messages to done hook ([ad94e2f](https://github.com/fachw3rk/weave/commit/ad94e2f))





# [0.7.0-rc.6](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.5...@weave-js/core@0.7.0-rc.6) (2019-03-28)


### Bug Fixes

* Method "getNextActionEndpoint" now returns an error if no service is available ([63771b8](https://github.com/fachw3rk/weave/commit/63771b8))





# [0.7.0-rc.5](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.4...@weave-js/core@0.7.0-rc.5) (2019-03-22)


### Bug Fixes

* Added missing jsdoc schema for weave options ([78d590f](https://github.com/fachw3rk/weave/commit/78d590f))


### Features

*  Maximum offline time editable ([9528c17](https://github.com/fachw3rk/weave/commit/9528c17))





# [0.7.0-rc.4](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.3...@weave-js/core@0.7.0-rc.4) (2019-03-11)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.3](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.7.0-rc.2...@weave-js/core@0.7.0-rc.3) (2019-03-11)

**Note:** Version bump only for package @weave-js/core





# [0.7.0-rc.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.6.2...@weave-js/core@0.7.0-rc.2) (2019-03-11)


### Features

* Added the new method "multiCall" to call multiple service actions at once ([d28b969](https://github.com/fachw3rk/weave/commit/d28b969))





## [0.6.2](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.6.1...@weave-js/core@0.6.2) (2019-03-07)

**Note:** Version bump only for package @weave-js/core





## [0.6.1](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.6.0...@weave-js/core@0.6.1) (2019-02-09)


### Bug Fixes

* Service loader ([8669596](https://github.com/fachw3rk/weave/commit/8669596))





# [0.6.0](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.33...@weave-js/core@0.6.0) (2019-02-08)


### Features

* Implemented hooks by method name ([bf56291](https://github.com/fachw3rk/weave/commit/bf56291))





## [0.5.33](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.32...@weave-js/core@0.5.33) (2019-01-15)

**Note:** Version bump only for package @weave-js/core





## [0.5.32](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.31...@weave-js/core@0.5.32) (2018-12-19)

**Note:** Version bump only for package @weave-js/core





## [0.5.31](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.30...@weave-js/core@0.5.31) (2018-12-18)

**Note:** Version bump only for package @weave-js/core





## [0.5.30](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.29...@weave-js/core@0.5.30) (2018-12-15)

**Note:** Version bump only for package @weave-js/core





## [0.5.29](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.28...@weave-js/core@0.5.29) (2018-12-15)

**Note:** Version bump only for package @weave-js/core





## [0.5.28](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.27...@weave-js/core@0.5.28) (2018-12-15)

**Note:** Version bump only for package @weave-js/core





## [0.5.27](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.26...@weave-js/core@0.5.27) (2018-12-13)

**Note:** Version bump only for package @weave-js/core





## [0.5.26](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.25...@weave-js/core@0.5.26) (2018-12-11)

**Note:** Version bump only for package @weave-js/core





## [0.5.25](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.24...@weave-js/core@0.5.25) (2018-12-11)

**Note:** Version bump only for package @weave-js/core





## [0.5.24](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.23...@weave-js/core@0.5.24) (2018-12-10)

**Note:** Version bump only for package @weave-js/core





## [0.5.23](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.22...@weave-js/core@0.5.23) (2018-12-08)

**Note:** Version bump only for package @weave-js/core





## [0.5.22](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.21...@weave-js/core@0.5.22) (2018-11-30)

**Note:** Version bump only for package @weave-js/core





## [0.5.21](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.20...@weave-js/core@0.5.21) (2018-11-28)

**Note:** Version bump only for package @weave-js/core





## [0.5.20](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.19...@weave-js/core@0.5.20) (2018-11-28)

**Note:** Version bump only for package @weave-js/core





## [0.5.19](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.18...@weave-js/core@0.5.19) (2018-11-26)

**Note:** Version bump only for package @weave-js/core





## [0.5.18](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.17...@weave-js/core@0.5.18) (2018-11-01)

**Note:** Version bump only for package @weave-js/core





## [0.5.17](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.16...@weave-js/core@0.5.17) (2018-10-29)

**Note:** Version bump only for package @weave-js/core





## [0.5.16](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.15...@weave-js/core@0.5.16) (2018-10-28)

**Note:** Version bump only for package @weave-js/core





## [0.5.15](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.14...@weave-js/core@0.5.15) (2018-10-28)

**Note:** Version bump only for package @weave-js/core





## [0.5.14](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.13...@weave-js/core@0.5.14) (2018-10-23)

**Note:** Version bump only for package @weave-js/core





## [0.5.13](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.12...@weave-js/core@0.5.13) (2018-10-23)

**Note:** Version bump only for package @weave-js/core





## [0.5.12](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.11...@weave-js/core@0.5.12) (2018-10-23)

**Note:** Version bump only for package @weave-js/core





## [0.5.11](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.10...@weave-js/core@0.5.11) (2018-10-21)

**Note:** Version bump only for package @weave-js/core





## [0.5.10](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.9...@weave-js/core@0.5.10) (2018-10-21)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.9"></a>
## [0.5.9](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.8...@weave-js/core@0.5.9) (2018-10-21)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.7"></a>
## [0.5.7](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.6...@weave-js/core@0.5.7) (2018-10-02)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.6"></a>
## [0.5.6](https://github.com/fachw3rk/weave/compare/@weave-js/core@0.5.5...@weave-js/core@0.5.6) (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.5"></a>
## 0.5.5 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.4"></a>
## 0.5.4 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.3"></a>
## 0.5.3 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.2"></a>
## 0.5.2 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.1"></a>
## 0.5.1 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.0"></a>
# 0.5.0 (2018-09-18)

**Note:** Version bump only for package @weave-js/core





<a name="0.5.0"></a>
# 0.5.0 (2018-09-17)

**Note:** Version bump only for package @weave/@weave-js/core





<a name="0.5.0"></a>
# [0.5.0]() (2018-09-05)

# Breaking Changes

Changed the interface of the module. The weave factory method is now provided as a property of the module.

```js
    const { Weave, Errors, TransportAdapters, Constants } = require('@weave-js/core')

    const broker = Weave({
        nodeId: 'node-1',
        transport: TransportAdapters.Fake()
    })
```

# New


## Service watcher

Weave now supports hot reload of services. When weave detects a change in a service file, it stops the service, removes it from internal and external registries and restarts the service with the changes without stopping the node. 

```js
    const broker = Weave({
        nodeId: 'node-1',
        watchServices: true
    })
```

### weave runner example

```bash
    weave-runner services -W
```

## Support for streams

Streaming support has been implemented. Node.js streams can be transferred as params or as response. You can use it to transfer uploaded file from a gateway or encode/decode or compress/decompress streams.

### Send file example

```js
    const fileStream = fs.createReadStream(fileName)

    broker.call('storage.save', stream, { meta: { filename }})
```

### Receive file example

```js
    const fileStream = fs.createWriteStream(fileName);

    broker.createService({
        name: 'storage',
        actions: {
            save (context) {
                const fileStream = fs.createWriteStream(`/temp/${context.meta.filename}`)
                context.data.pipe(fileStream)                
            }
        }
    })
```

### Recturn stream example

```js
    const fileStream = fs.createWriteStream(fileName);

    broker.createService({
        name: 'storage',
        params: {
            filename: { type: 'string' }
        }
        actions: {
            save (context) {
                return fs.createReadStream(context.data.filename)           
            }
        }
    })
```

## New beforeCreate hook for services

Added a new hook to intercept before service is created.

```js
module.exports = {
    name: 'math',
    actions: {
        ...
    },
    beforeCreate () {
        this.actions.newAction = {
            params: {...},
            handler (context) {...}
        }
    }
}
```
# Changes
## Changed Log level for heartbeat

The broker heartbeat is now only displayed at log level "trace".


<a name="0.4.0"></a>
# [0.4.0]() (2018-07-27)

# New
## Enhanced Middlewares

Middlewares are now on state of the art. You cann use a more detailed hook system to add features to your middlewares.

## New beforeCreate hook for services

Added a new hook to intercept before service is created.

```js
module.exports = {
    name: 'math',
    actions: {
        ...
    },
    beforeCreate () {
        this.actions.newAction = {
            params: {...},
            handler (context) {...}
        }
    }
}
```

<a name="0.3.0"></a>
# [0.3.0]() (2018-05-11)

# New
## NATS transporter

New Transporter for NATS.

## New beforeCreate hook for services

Added a new hook to intercept before service is created.

```js
module.exports = {
    name: 'math',
    actions: {
        ...
    },
    beforeCreate () {
        this.actions.newAction = {
            params: {...},
            handler (context) {...}
        }
    }
}
```


## Reconnect lost nodes
If a node1 get heartbeats from a actually disconnected node2. Node1 will send a discovery request to get the current infos from node2 and reconnect it.

# Fixed

## Cleanup for TCP Transporter

Old TCP-Mesh module removed.

--------------------------------------------------
<a name="0.2.19"></a>
# [0.2.19]() (2018-02-05)

# New

## Reconnect lost nodes
If a node1 get heartbeats from a actually disconnected node2. Node1 will send a discovery request to get the current infos from node2 and reconnect it.

# Fixed

## Cleanup for TCP Transporter

Old TCP-Mesh module removed.

--------------------------------------------------
<a name="0.2.18"></a>
# [0.2.19]() (2018-02-05)

# New

# Fixed

Fixed metrics finish method.

--------------------------------------------------

<a name="0.2.18"></a>
# [0.2.18]() (2018-02-05)

# New

# Fixed

Fixed metrics for action calls.

--------------------------------------------------
<a name="0.2.17"></a>
# [0.2.17]() (2018-01-28)

# New

## Add new service setting for private services.

If you set the property $private to true, the service is only reachable from the local node.

```js
module.exports = {
    name: 'math',
    mixins: [TestMixin],
    settings: {
        $private: true
    },
    actions: {
        add: {
            params: {
                a: { type: 'number' },
                b: { type: 'number' }
            },
            handler({ params }) {
                return params.a + params.b;
            }
        }
    }
}
```

## Add new internal action $node.list

List all connected nodes.

```js
[Node {
    id: 'testnode',
    local: true,
    client: {
        type: 'nodejs',
        version: '0.2.17',
        langVersion: 'v8.7.0'
    },
    cpu: null,
    lastHeartbeatTime: 1517162496548,
    isAvailable: true,
    services: null,
    events: null,
    IPList: ['192.168.178.21', '192.168.99.1']
} ]
```

## Add new internal action $node.actions

List all actions.

```js
[{
    name: '$node.services',
    hasAvailable: true,
    hasLocal: true,
    count: 1,
    action: {
        name: '$node.services',
        version: undefined
    }
},
{
    name: '$node.actions',
    hasAvailable: true,
    hasLocal: true,
    count: 1,
    action: {
        name: '$node.actions',
        version: undefined
    }
}]
```

# Fixed

Internal registry errors.

--------------------------------------------------
<a name="0.2.16"></a>
# [0.2.16]() (2018-01-22)

# New

## Add new cache features
In action cache, you now have the possibility to override the TTL. 

```js
module.exports = {
    name: 'example',
    actions: {
        show: {
            cache: {
                keys: ['name', 'site'],
                ttl: 5  // Set ttl to 5ms.
            }
        }
    }
}
```

--------------------------------------------------

<a name="0.2.15"></a>
# [0.2.15]() (2018-01-21)

# New

## Project runner script
There is a new weave project runner script in the bin folder. You can use it if you want to create small repositories for services. In this case you needn't to create a weave instance with options. Just create a weave.config.js or weave.config.json file in the root of repository, fill it with your options and call the weave-runner within the NPM scripts. As an other solution you can put it to the environment variables instead of putting options to file.


Example to start all services from the `services` folder.

```bash
$ weave-runner services
```


Example weave.config.js file with a REDIS transport, placed in the root of your project.

```js
const Weave = require('@weave-js/core')

module.exports = {
    level: 'debug',
    cacher: true,
    metrics: false,
    requestTimeout: 2000,
    transport: Weave.transports.Redis({
        host: process.env['REDIS_HOST']
    })
}

```

--------------------------------------------------

<a name="0.2.14"></a>
# [0.2.14]() (2018-01-20)

# New

## Add Changelog to project
