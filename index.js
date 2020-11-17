process.chdir(__dirname);
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.EASY_DEPLOY_PORT || 6789;

const { EventEmitter } = require("events");
const { spawn } = require("child_process");
const path = require("path");

const eventName = process.env.EVENT_NAME || "exec";

const eventHandler = new EventEmitter();

eventHandler.on(eventName, (cmd) => {
  console.log(`[${eventName}]: ${cmd}`);
  const bash = spawn("bash");

  bash.stdin.end(cmd);
  bash.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  bash.stderr.on("data", (data) => {
    console.error(data.toString());
  });
  bash.on("exit", (code) => {
    console.log(`Exit with code ${code} for '${cmd}'`);
  });
});

app.get("/ping", (_, res) => {
  res.send("PONG");
});

app.post("/pull", (req, res) => {
  // branch and remote url
  const { branch, remote } = req.body;
  const cmd = `git fetch ${remote} && git reset --hard ${remote}/${branch}`;
  eventHandler.emit(eventName, cmd);
  res.status(200).send(`Running ${cmd}`);
});

app.post("/build", (req, res) => {
  // package manager and directory
  const { pm, dir } = req.body;
  const root = path.join(__dirname, dir);
  const cmd = `cd ${root} && ${pm} run build`;
  eventHandler.emit(eventName, cmd);
  res.status(200).send(`Running ${cmd}`);
});

app.listen(port, () => console.log(`Running server in port ${port}`));
