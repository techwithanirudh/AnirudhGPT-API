import { readFileSync } from "fs";
import { NO_RATELIMIT_IPS } from "../config/index.js";
import { event } from "./logging.js";

console.event = event;

// Inspired by Nova
export function handleWhitelist(req) {
  if (NO_RATELIMIT_IPS.includes(req.ip)) {
    const date = new Date();

    console.event("WHITELISTED", req.ip);
    const custom_key = `whitelisted-${date.getTime()}`;
    return {
      whitelisted: true,
      key: custom_key,
    };
  }

  return {
    whitelisted: false,
    key: null,
  };
}

export function getKey(headers) {
  return headers?.authorization?.split(" ")[1] || "";
}

export function getKeyInfo(headers) {
	const keys = JSON.parse(readFileSync("./keys.json", "utf-8"));
  const key = getKey(headers);

	return keys[key];
}

export function keyLimiter(req, res, next) {
  const keys = JSON.parse(readFileSync("./keys.json", "utf-8"));
  const key = getKey(req.headers);

  if (!keys[key]?.active)
    return res
      .status(401)
      .send(
        "Invalid API key, please contact the administrator, for a API Key.",
      );
  next();
}
