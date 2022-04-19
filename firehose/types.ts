import { string } from "fp-ts";

export interface ParsedKafkaConfig extends Record<string, string> {
  "bootstrap.servers": string;
  "security.protocol": string;
  "sasl.mechanisms": string;
  "sasl.username": string;
  "sasl.password": string;
  "session.timeout.ms": string;
}
