# [1.2.0-beta.4](https://github.com/qlub-dev/argus/compare/v1.2.0-beta.3...v1.2.0-beta.4) (2025-09-19)


### Bug Fixes

* update user timing collector to use id instead of regex and improve metric handling ([8065b43](https://github.com/qlub-dev/argus/commit/8065b4349065ef3b5b58662d4739ef389e1b29d5))

# [1.2.0-beta.3](https://github.com/qlub-dev/argus/compare/v1.2.0-beta.2...v1.2.0-beta.3) (2025-09-18)


### Bug Fixes

* correct import for user timing collector and update entry type in handler ([d4e74cf](https://github.com/qlub-dev/argus/commit/d4e74cf0bb3d4649ec6d4a12e77d10aec8ef7485))
* streamline user timing collector logic and improve metric handling ([de94651](https://github.com/qlub-dev/argus/commit/de94651c52e279f303bdb5ca55ea50b307066f8b))

# [1.2.0-beta.2](https://github.com/qlub-dev/argus/compare/v1.2.0-beta.1...v1.2.0-beta.2) (2025-09-18)


### Bug Fixes

* correct user timing collectors assignment and ensure proper shutdown ([04069f0](https://github.com/qlub-dev/argus/commit/04069f06ea2b73976a1b650f1965f4231ab12291))

# [1.2.0-beta.1](https://github.com/qlub-dev/argus/compare/v1.1.0...v1.2.0-beta.1) (2025-09-18)


### Bug Fixes

* **collectors:** disconnect proper types and return if releveant types are not matched ([06a953c](https://github.com/qlub-dev/argus/commit/06a953c8aadd2a7cdc83a8f12657f048762ff331))


### Features

* user timing metric collection added ([b76abab](https://github.com/qlub-dev/argus/commit/b76abab752ee85838b44deb5704e663e66581ea1))

# [1.1.0](https://github.com/qlub-dev/argus/compare/v1.0.3...v1.1.0) (2025-09-10)


### Bug Fixes

* add logs for monitoring ([5e55bde](https://github.com/qlub-dev/argus/commit/5e55bde54fdd6084148a3387ee2389f575e6014f))
* add more logs ([25cadf7](https://github.com/qlub-dev/argus/commit/25cadf742fd391a3f1120145e803a71dbfc24e34))
* **api-timing:** apply missed negation ([95da920](https://github.com/qlub-dev/argus/commit/95da920d4557340ef52fd3ce36c9b296f4701980))
* **build:** fix rollup build issue ([0ba769c](https://github.com/qlub-dev/argus/commit/0ba769c44fbca05cd37b81f80367ff0e9197eaa3))
* **configs:** remove cosmic configs ([38bfa1e](https://github.com/qlub-dev/argus/commit/38bfa1e387c7bd3f1222f8b7e6747d626d19facd))
* **eslint:** add missing dep required for eslint ([6054480](https://github.com/qlub-dev/argus/commit/60544806dbd9f9ef30392a56dec75e581de5c81c))
* **initiator:** convert entry to json for sending to ga ([31ddd30](https://github.com/qlub-dev/argus/commit/31ddd308b9e2a013dcc4fe09564f96849164ab87))
* **tests:** delete cosmic config tests ([88dabd1](https://github.com/qlub-dev/argus/commit/88dabd1cfbd2f4772ba501d92a537c747c87cc23))
* **tests:** update error message in test ([0ddd9a2](https://github.com/qlub-dev/argus/commit/0ddd9a2e210302d8b0b31c8439d6669e748542c1))
* **types:** export types ([d2e8142](https://github.com/qlub-dev/argus/commit/d2e8142d2e039320a095f3007abb38f82fee62b4))


### Features

* add argus intiator and refactor code ([176657c](https://github.com/qlub-dev/argus/commit/176657c1fe8389ba3e43d9d0c4f1d9b4b942e73a))
* add folder strucutre ([7af0eff](https://github.com/qlub-dev/argus/commit/7af0efff903e9932fad6a8796265a514fdfc612d))
* add label to event name ([e6da981](https://github.com/qlub-dev/argus/commit/e6da98141a64d7f60a03642c0af5082154411071))
* add sampling rate to web-vitals ([543922d](https://github.com/qlub-dev/argus/commit/543922d3587ec1be803fce6f49f2e5cd66e603df))
* add singleton to argus initiator ([e5a2d7b](https://github.com/qlub-dev/argus/commit/e5a2d7ba3f69ebeacbe9d12a413e335dde2d64fb))
* **api-timing:** add sampling ([aa45008](https://github.com/qlub-dev/argus/commit/aa45008a6f4b03e7068cf841e00ac24234766ea8))
* **api-timing:** check whether duration is within provided limits ([2044c3e](https://github.com/qlub-dev/argus/commit/2044c3e2e1eb7f188dae7858498c9ff2fa8cb75e))
* **collectors:** add api timing collector ([3b41a74](https://github.com/qlub-dev/argus/commit/3b41a74aa969c5c1262693273df58188043d3bc4))
* **configs:** add thresholds to configs ([04acd3b](https://github.com/qlub-dev/argus/commit/04acd3b607b16144553a429d3c5c569d243c26fb))
* **configs:** allow passing of configs at initation and refactor code ([a488d8c](https://github.com/qlub-dev/argus/commit/a488d8cc8350cba22475371c0a68ae50fbcd7070))
* **enums:** create an enum for performance entry types ([1b72c75](https://github.com/qlub-dev/argus/commit/1b72c759f4b3168951b0473de243611e30ca8275))
* export report web vitals ([ee9b500](https://github.com/qlub-dev/argus/commit/ee9b5003f59a29726c067ea3da3262bc19291d6a))
* **lib:** add observer mgr ([760d9b6](https://github.com/qlub-dev/argus/commit/760d9b66fc213cf30ab6ff07edd1569e02e78129))
* **lib:** add util fn to check bounds ([3a786d6](https://github.com/qlub-dev/argus/commit/3a786d6293610eb289a2505c10eef8a07dda9ec6))
* **lib:** add util for sampling ([48f9112](https://github.com/qlub-dev/argus/commit/48f9112b8d3b7023641f3b6265680e936b24645f))
* **lib:** add util to get union regex ([707a97c](https://github.com/qlub-dev/argus/commit/707a97c608b0eb14b47c642288d8c1707e196651))
* **TECH-4924:** add config loading functionality ([77151b0](https://github.com/qlub-dev/argus/commit/77151b00b98ff259e12f72a666ef465798d58856))
* **TECH-4924:** rename file ([17080b1](https://github.com/qlub-dev/argus/commit/17080b1087084d69a7296e7763ff2612546f5dd3))
* **tests:** add loader tests with mocks ([5b3f0b6](https://github.com/qlub-dev/argus/commit/5b3f0b6b2c8b3426c60a6a3a13b622b56407022f))
* **tests:** update tests after renaming fn ([69f2004](https://github.com/qlub-dev/argus/commit/69f2004184d4bff66a8f1731034bd82a6c8134bc))
* **types,enums:** update types and enums ([f30e800](https://github.com/qlub-dev/argus/commit/f30e800c0197a877ed638d12707c79f428481d9a))
* **utils:** use high precision timing ([8595109](https://github.com/qlub-dev/argus/commit/8595109ed5f90888836e6dbbe12770a150deba09))
* **web-vitals:** add transport-callback to report web vitals ([353592b](https://github.com/qlub-dev/argus/commit/353592b075c3acc97efa76840d2215c22fc37f8b))
* **web-vitals:** allow passing of metadata and refactor code ([4e096ee](https://github.com/qlub-dev/argus/commit/4e096ee68668584c60174dbcadcb4be9b7c352c7))

## [1.0.3](https://github.com/qlub-dev/argus/compare/v1.0.2...v1.0.3) (2025-09-01)


### Bug Fixes

* **ci:** remove pvt property to make npm publish to the registry ([5cfec49](https://github.com/qlub-dev/argus/commit/5cfec49a663f39be1ff188ceb97fe3b07b1c1790))

## [1.0.2](https://github.com/qlub-dev/argus/compare/v1.0.1...v1.0.2) (2025-09-01)


### Bug Fixes

* **ci:** remove registry url from action ([7a45587](https://github.com/qlub-dev/argus/commit/7a4558726722574c7f40406f752f3ce31d0ad2d1))

## [1.0.1](https://github.com/qlub-dev/argus/compare/v1.0.0...v1.0.1) (2025-09-01)


### Bug Fixes

* **ci:** add npmrc.ci ([1358c08](https://github.com/qlub-dev/argus/commit/1358c080200f77b1e843ca2fb66297de7ecf7fbf))

# 1.0.0 (2025-09-01)


### Bug Fixes

* **build:** fix build process ([0253901](https://github.com/qlub-dev/argus/commit/025390108b2ecca9896d88f63af90bad04d43284))
* **ci:** add minor and patch version for pnpm ([d894296](https://github.com/qlub-dev/argus/commit/d8942969085d60281a4d964a2f9be28a72887b51))
* **ci:** update repository in package.json ([5c77864](https://github.com/qlub-dev/argus/commit/5c778645ff818551b5711e6725c9eace1d75bcbc))
* **ci:** upgrade package version in workflow ([3b5d42f](https://github.com/qlub-dev/argus/commit/3b5d42f00957b9200808997d78058b9f1696ae9e))
* **eslint:** remove deprecated config file ([977517d](https://github.com/qlub-dev/argus/commit/977517da812fbf47085733c1c37724b9f334d958))
* **eslint:** remove react settings ([2dd6405](https://github.com/qlub-dev/argus/commit/2dd6405ea1cbf067c5ac9997492328d0a573df79))
* **test:** fix issues with jest setup ([fd2f247](https://github.com/qlub-dev/argus/commit/fd2f24735b79fe2b6ab663e1555729cad3590fda))


### Features

* add initial code to measure web-vitals ([4e61ce2](https://github.com/qlub-dev/argus/commit/4e61ce2b52fd7850d5e793b1bc025087cbc603cd))
* setup semantic release ([a16f036](https://github.com/qlub-dev/argus/commit/a16f036ba698b9896a0128d4a4bde6f481fd332d))
