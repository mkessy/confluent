// create pipeline to unzip and write to kafka topic
//
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { createGunzip } from "zlib";
import { configFromPath } from "./util";
import { Kafka } from "kafkajs";
import { pipe } from "fp-ts/lib/function";
import { ParsedKafkaConfig } from "./types";
import util from "util";

//
const configTE = TE.tryCatch(
  () =>
    configFromPath(
      "/Users/mkessy/Projects/confluent_kafka_example/confluent/nodejs.config"
    ),
  (reason) => String(reason)
);

(async function () {
  const configE = await configTE();
  if (E.isLeft(configE)) {
    process.exit(1);
  }

  const config = configE.right as ParsedKafkaConfig;
  console.log(config);

  const kafka = new Kafka({
    clientId: "test-client",
    brokers: [config["bootstrap.servers"]],
    authenticationTimeout: 1_000,
    connectionTimeout: parseInt(config["session.timeout.ms"]),
    ssl: true,
    sasl: {
      mechanism: "plain",
      username: config["sasl.username"],
      password: config["sasl.password"],
    },
  });

  const producer = kafka.producer({});
  console.log("conecting producer");
  await producer.connect();
  console.log("producer connected");
  console.log("sending test message");
  const response = await producer.send({
    topic: "firehose",
    messages: [{ key: "test", value: "test" }],
  });
  console.log(`message sent? ${util.inspect(response)}`);
  await producer.disconnect();
})();
