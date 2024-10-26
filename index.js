require("dotenv").config();

const playwright = require("playwright");
const fs = require("fs");

const ORIGIN_URL = process.env.ORIGIN_URL ?? "https://www.frontendmentor.io";
const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? "foo@bar.com";
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD ?? "secret";
const GITHUB_2FA_CODE = process.env.GITHUB_2FA_CODE ?? "secret";
const GITHUB_2FA_ENABLED =
	(process.env.GITHUB_2FA_ENABLED ?? "false") === "true";
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? "./download";
const SCREENCASTS_DIR = process.env.SCREENCASTS_DIR ?? "./screencasts";
const SCREENCASTS_ENABLED =
	(process.env.SCREENCASTS_ENABLED ?? "false") === "true";

const delayMs = (timeout = 1000) =>
	new Promise((resolve) => {
		setTimeout(() => resolve(), timeout);
	});

(async () => {
	const isDownloadsDirExists = fs.existsSync(DOWNLOADS_DIR);
	const isScreencastsExists = fs.existsSync(SCREENCASTS_DIR);

	if (!isDownloadsDirExists) {
		fs.mkdirSync(DOWNLOADS_DIR);
	}

	if (!isScreencastsExists) {
		fs.mkdirSync(SCREENCASTS_DIR);
	}

	const browser = await playwright.chromium.launch();
	const pageOptions = !!SCREENCASTS_ENABLED
		? {
				recordVideo: {
					dir: SCREENCASTS_DIR,
				},
		  }
		: {};
	const page = await browser.newPage({
		...pageOptions,
	});

	const baseUrl = `${ORIGIN_URL}/challenges`;

	await page.goto(baseUrl);

	console.log(`Navigating to ${baseUrl}.`);

	const githubButton = page
		.locator("a", { hasText: "Log in with Github" })
		.first();

	await githubButton.click();

	console.log("Navigating to github oauth page.");

	const githubEmailInput = page.locator("input[id='login_field']").first();
	const githubPasswordInput = page.locator("input[id='password']").first();
	const githubSubmitButton = page.locator("input[name='commit']").first();

	await githubEmailInput.fill(GITHUB_USERNAME);
	await githubPasswordInput.fill(GITHUB_PASSWORD);
	await githubSubmitButton.click();

	console.log("Validating Github login form ...OK.");

	if (!!GITHUB_2FA_ENABLED) {
		const github2faInput = page.locator("input[id='app_totp']").first();
		const github2faSubmitButton = page
			.locator("button", { hasText: "Verify" })
			.first();

		await github2faInput.fill(GITHUB_2FA_CODE);

		try {
			await github2faSubmitButton.click({ timeout: 5000 });
		} catch (err) {
			console.error(err);
		}

		console.log("Validating Github 2FA form ...OK.");
	}

	const hrefs = await Promise.all(
		(
			await page.locator("a[tabindex='-1']").all()
		).map(async (element) => {
			return await element.getAttribute("href");
		})
	);
	const challengeUrls = hrefs.map((href) => `${ORIGIN_URL}${href}`);
	const hubUrls = hrefs.map((href) => `${ORIGIN_URL}${href}/hub`);

	console.log(`Starting navigate to ${challengeUrls.length} challenge's urls.`);

	for (const url of challengeUrls) {
		await page.goto(url);

		const startChallengeButton = (
			await page.locator("button", { hasText: "Start Challenge" }).all()
		)[0];

		if (startChallengeButton !== undefined) {
			try {
				await startChallengeButton.click({ timeout: 1000 });
				console.log(`Subscribing to challenge at ${url} ...OK.`);
			} catch (err) {
				console.error(err);
			}
		} else {
			console.log(`Skipping challenge ${url} ...OK.`);
		}

		await delayMs(500);
	}

	for (const url of hubUrls) {
		await page.goto(url);

		const title = (await page.locator("h2").all())[0];

		const projectName = (await title.innerText())
			.toLowerCase()
			.split(" ")
			.join("-");
		const projectPath = `${DOWNLOADS_DIR}/${projectName}`;

		const isProjectDirExists = fs.existsSync(projectPath);

		if (!isProjectDirExists) {
			fs.mkdirSync(projectPath);
		}

		const section = page.locator(
			"section.JumbotronWithImage__Wrapper-sc-1i5booq-0"
		);

		const backgroundImageUrl = await section.evaluate((el) => {
			return window
				.getComputedStyle(el, ":before")
				.getPropertyValue("background-image")
				.split('"')[1];
		});

		await page.goto(backgroundImageUrl);
		await page.screenshot({
			animations: "disabled",
			path: `${projectPath}/illustration.png`,
		});

		await page.goto(url);

		const buttonStarter = page
			.locator("button", { hasText: "Download starter" })
			.first();

		const buttonFigma = page
			.locator("button", {
				hasText: "Download Figma file",
			})
			.first();

		const buttonStarterDownloadPromise = page.waitForEvent("download");

		await buttonStarter.click();

		const downloadFileStarter = await buttonStarterDownloadPromise;

		await downloadFileStarter.saveAs(
			`${projectPath}/${downloadFileStarter.suggestedFilename()}`
		);

		console.log(`Downloading starter file from ${url} ...OK.`);

		const buttonFigmaDownloadPromise = page.waitForEvent("download");

		await buttonFigma.click();

		const downloadFileFigma = await buttonFigmaDownloadPromise;

		await downloadFileFigma.saveAs(
			`${projectPath}/${downloadFileFigma.suggestedFilename()}`
		);

		console.log(`Downloading figma file from ${url} ...OK.`);

		await delayMs(500);
	}

	await browser.close();
})();
