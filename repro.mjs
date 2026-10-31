// Automated reproduction: `npm run build && npm run repro`.
// Loads /ssr directly, loads /spa (ssr = false) directly, then clicks the /ssr link,
// and prints the afterNavigate log the layout records for each navigation.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const PORT = 4321;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const kit = JSON.parse(readFileSync('node_modules/@sveltejs/kit/package.json', 'utf8')).version;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
	stdio: 'ignore'
});
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

let rows;
let browser;
let chromiumVersion;
try {
	for (let i = 0; ; i++) {
		if (i === 100) throw new Error('vite preview did not start');
		try {
			if ((await fetch(ORIGIN + '/')).ok) break;
		} catch {}
		await sleep(100);
	}

	browser = await chromium.launch();
	chromiumVersion = browser.version();
	const page = await browser.newPage();
	const rowsAre = (n) => page.locator(`table[data-rows="${n}"]`).waitFor();

	await page.goto(`${ORIGIN}/ssr`);
	await rowsAre(1);
	await page.goto(`${ORIGIN}/spa`);
	await rowsAre(2);
	await page.getByRole('link', { name: '/ssr' }).click();
	await rowsAre(3);

	rows = await page.evaluate(() => JSON.parse(sessionStorage.getItem('log')));
} finally {
	await browser?.close();
	server.kill();
}

writeFileSync('results.json', JSON.stringify({ kit, rows }, null, 2));
console.log(`@sveltejs/kit ${kit}, Chromium ${chromiumVersion}`);
console.table(rows.map(({ ok, ...row }) => row));
