const express = require("express");
const app = express();
const port = 6789;
const { spawn } = require("child_process");
app.post("/webhook", (req, res) => {
	const deploy = spawn(
		"git fetch origin && git reset --hard origin/master && npm install && npm run build",
		{
			cwd: "/var/www/psn/",
			shell: true,
		}
	);

	deploy.stdout.on("data", (data) => {
		console.log(`stdout: ${data}`);
	});

	deploy.stderr.on("data", (data) => {
		console.error(`stderr: ${data}`);
	});

	deploy.on("close", (code) => {
		console.log(`child process exited with code ${code}`);
	});

	res.json({ message: "Deployment running" });
});

app.listen(port, () => console.log(`Running server in port ${port}`));
