import { readFileSync } from 'fs';
import { NO_RATELIMIT_IPS } from '../config/index.js';
import { event } from "./logging.js";

console.event = event;

// Inspired by Nova
export function handleWhitelist(req) {
	if (NO_RATELIMIT_IPS.includes(req.ip)) {
		const date = new Date();

		console.event('WHITELISTED', req.ip);
		const custom_key = `whitelisted-${date.getTime()}`;
		return {
			whitelisted: true,
			key: custom_key
		}
	}

	return {
		whitelisted: false,
		key: null
	}
}

export function getKey(headers) {
	return headers?.authorization?.split(' ')[1] || '';
}

export function keyLimiter(req, res, next) {
	const keys = JSON.parse(readFileSync('./keys.json', 'utf-8'));
	const key = getKey(req.headers);

	if (!keys[key]?.active) return res.sendStatus(401);
	next();
}