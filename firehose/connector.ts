import * as dotenv from "dotenv";
import * as tls from "tls";

dotenv.config();

const USERNAME = process.env.USERNAME;
const PW = process.env.PASSWORD;
const host = process.env.HOST!;
const port = process.env.PORT!;

// creates a TLS socket and connects it to the Firehose API, Pausing it before return
