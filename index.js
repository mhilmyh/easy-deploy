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
		workdir: req.query.workdir ? req.query.workdir : process.env.WORKDIR,
		username: req.query.username ? req.query.username : process.env.USERNAME, // better use username from query
		password: req.query.password ? req.query.password : process.env.PASSWORD, // better use password from query
		name: req.query.name ? req.query.name : process.env.NAME,
		repo: req.query.repository ? req.query.repository : process.env.REPOSITORY,
		branch: req.query.branch ? req.query.branch : process.env.BRANCH,
	};
	const origin = `https://${payload.username}:${payload.password}@github.com/${payload.name}/${payload.repo}.git ${payload.branch}`;
	const escapedOrigin = String(origin).replace(/([\"\'\$\`\\])/g, "\\$1");
	const escapedWorkdir = String(payload.workdir).replace(
		/([\"\'\$\`\\])/g,
		"\\$1"
	);
	const cmd = `cd ${escapedWorkdir} && git pull -f ${String(escapedOrigin)}`;
	exec(cmd, (error, stdout, stderr) => {
		if (error) {
			res.status(500).json({ error: error.code, stdout, stderr, cmd });
			return;
		}
		res.status(200).json({ error: error.code, stdout, stderr, cmd });
	});
});

app.listen(port, () => console.log(`Running server in port ${port}`));
