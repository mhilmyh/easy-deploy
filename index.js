require("dotenv").config();

const express = require("express");
const app = express();
const port = 6789;
const { exec } = require("child_process");

app.get("/", (req, res) => {
	res.json({ message: "I am alive" });
});
app.post("/webhook", (req, res) => {
	const origin = `https://${process.env.USERNAME}:${process.env.PASSWORD}@github.com/mhilmyh/website-psn.git master`;
	exec(
		`cd /var/www/psn && git fetch ${origin} && git reset --hard ${origin} && npm install && npm run build`,
		(error, stdout, stderr) => {
			if (error) {
				res.status(500).json({ error, stdout, stderr });
				return;
			}
			res.status(200).json({ error, stdout, stderr });
		}
	);
});

app.listen(port, () => console.log(`Running server in port ${port}`));
