// create pipeline to unzip and write to kafka topic
//
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { createGunzip } from "zlib";
import { configFromPath, configTE } from "./util";
import { Kafka } from "kafkajs";
import { pipe } from "fp-ts/lib/function";
import { ParsedKafkaConfig } from "./types";
import util from "util";
import { pipeline } from "stream";
import ndjson from "ndjson";
import { createFireHoseTlsSocket } from "./socket";

//

const makeFireHoseToKafkaPipeline = pipe(
  TE.bindTo("tlsSocket")(TE.of(createFireHoseTlsSocket())),
  TE.bindW("kafkaProducer", () => makeKafkaProducer),
  TE.bindW("pipeline", ({ kafkaProducer, tlsSocket }) => {
    const unzip = createGunzip();
    const pl = pipeline(
      // zipped socket data -> unzip -> parseJSON lines ->
      [tlsSocket, unzip, ndjson.parse()]
    ).on("data", (message) => {});
  })
);

const makeKafkaProducer = pipe(
  TE.bindTo("kafkaConfig")(configTE),
  TE.bindW("kafkaClient", ({ kafkaConfig }) => {
    const kafka = new Kafka({
      clientId: "test-client",
      brokers: [kafkaConfig["bootstrap.servers"]],
      authenticationTimeout: 1_000,
      connectionTimeout: parseInt(kafkaConfig["session.timeout.ms"]),
      ssl: true,
      sasl: {
        mechanism: "plain",
        username: kafkaConfig["sasl.username"],
        password: kafkaConfig["sasl.password"],
      },
    });
    return TE.of(kafka);
  }),
  TE.bindW("kafkaProducer", ({ kafkaClient }) => {
    const producer = kafkaClient.producer({});
    return TE.of(producer);
  }),
  TE.map(({ kafkaProducer }) => kafkaProducer)
);

/* (async function () {
  const configE = await configTE();
  if (E.isLeft(configE)) {
    process.exit(1);
  }

  const config = configE.right as ParsedKafkaConfig;
  console.log(config);

  const producer = kafka.producer({});
  
  console.log(`message sent? ${util.inspect(response)}`);
  await producer.disconnect();
})();
 */
