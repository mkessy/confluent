import * as tls from "tls";

const options = {
  // Necessary only if the server requires client certificate authentication.
  // Necessary only if the server uses a self-signed certificate.
  // Necessary only if the server's cert isn't for "localhost".
};

const server = tls
  .createServer(options, function (s) {
    s.write("welcome!\n");
    s.pipe(s);
  })
  .listen(8000);
