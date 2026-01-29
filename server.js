const https = require("https");
const fs = require("fs");
const next = require("next");
const { parse } = require("url");

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  pfx: fs.readFileSync("./certs/localhost.pfx"),
  passphrase: "", // normalmente vacío
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(3000, () => {
      console.log("Next.js HTTPS en https://localhost:3000");
    });
});
