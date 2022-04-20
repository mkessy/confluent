import * as dotenv from "dotenv";
import * as tls from "tls";

const USERNAME = process.env.USERNAME;
const PW = process.env.PASSWORD;
const host = process.env.HOST!;
const port = process.env.PORT!;

export const createFireHoseTlsSocket = (
  callback?: () => void
): tls.TLSSocket => {
  console.log("Attempting connection to FlightAware Firehose API\n");

  const socket = tls.connect(parseInt(port), host, {}, () => {
    console.log(`Connected to: ${host}:${port}\n`);
    console.log(`Socket authorized? ${socket.authorized}\n`);
    console.log(`Pausing Socket\n`);
    socket.pause();
    if (callback) callback();
  });

  socket.on("data", (data) => {
    console.log(`${[Date.now().toLocaleString()]} Data Recieved\n`);
  });

  socket.on("error", (err) => {
    console.log(
      `${[Date.now().toLocaleString()]} Stream encountered an error\n`
    );
    console.log(`Error ${err} \n`);
  });

  socket.on("end", () => {
    console.log(`${[Date.now().toLocaleString()]} End event\n`);
  });

  socket.on("close", (hadError: boolean) => {
    console.log(`${[Date.now().toLocaleString()]} Connection Closed\n`);
    console.log(`Closed due to an error? ${hadError}`);
    socket.destroy();
  });

  return socket;
};
