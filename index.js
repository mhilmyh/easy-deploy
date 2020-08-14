require("dotenv").config();

const express = require("express");
const app = express();
const port = 6789;
const { exec } = require("child_process");

app.get("/", (req, res) => {
	res.json({ message: "I am alive" });
});
app.post("/webhook", (req, res) => {
	const payload = {
		username: req.params.username ? req.params.username : process.env.USERNAME, // better use username from params
		username: req.params.password ? req.params.password : process.env.PASSWORD, // better use password from params
		name: req.params.name ? req.params.name : process.env.NAME,
		repo: req.params.repository
			? req.params.repository
			: process.env.REPOSITORY,
		branch: req.params.branch ? req.params.branch : process.env.BRANCH,
	};
	const origin = `https://${payload.username}:${payload.password}@github.com/${payload.name}/${payload.repo}.git ${payload.branch}`;
	const escapedOrigin = String(origin).replace(/([\"\'\$\`\\])/g, "\\$1");
	const cmd = `cd /var/www/psn && git pull -f ${String(escapedOrigin)}`;
	exec(cmd, (error, stdout, stderr) => {
		if (error) {
			res.status(500).json({ error: error.code, stdout, stderr });
			return;
		}
		res.status(200).json({ error: error.code, stdout, stderr });
	});
});

app.listen(port, () => console.log(`Running server in port ${port}`));
