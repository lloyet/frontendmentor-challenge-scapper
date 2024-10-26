# Frontendmentor Auto-Downloads

Auto download all `challenges` from website [frontendmentor](https://www.frontendmentor.io) using GITHUB Oauth credentials.

## Installation

> **Notes**
>
> You need at least node.js pre-installed

**Before starting**

You need to create a `.env` file and define all environnement variables required.

1. Copy and past `.env.exemple` to `.env`.
2. Replace all variables your ownes.

```sh
# .env
ORIGIN_URL="https://www.frontendmentor.io"
GITHUB_USERNAME="YOUR-EMAIL@DOMAIN"
GITHUB_PASSWORD="YOUR_PASSWORD"
GITHUB_2FA_CODE="YOUR_2FA_CODE"
GITHUB_2FA_ENABLED="true"
DOWNLOADS_DIR="./download"
SCREENCASTS_DIR="./screencasts"
SCREENCASTS_ENABLED="false"
```

```sh
# install dependencies
npm ci

# start script
npm run start
```

## Environnement variables

| name                | type   | description                           |
| ------------------- | ------ | ------------------------------------- |
| GITHUB_USERNAME     | string | Github username account               |
| GITHUB_PASSWORD     | string | Github password account               |
| GITHUB_2FA_CODE     | string | (optional) Github 2FA code            |
| GITHUB_2FA_ENABLED  | string | (optional) Handle Github 2FA Oauth    |
| ORIGIN_URL          | string | Frontendmentor website URL            |
| DOWNLOADS_DIR       | string | Path to downloaded files directory    |
| SCREENCASTS_DIR     | string | Path to screencasts record playwright |
| SCREENCASTS_ENABLED | string | (optional) Allow screen recording     |
