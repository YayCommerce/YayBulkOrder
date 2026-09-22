/**
 * Small helpers for reading/writing a whole WP option as JSON via WP-CLI —
 * used by the Phase 4 compatibility fixtures to configure the third-party
 * Yay plugins (wholesale roles, pricing rules, currencies), which all store
 * their data in plain option arrays rather than exposing a REST API this
 * plugin could call instead.
 */
import { wpCLI } from './cli.js';

/**
 * @param {string} optionName
 * @param {*} fallback Returned if the option doesn't exist yet.
 */
export async function getJSONOption( optionName, fallback ) {
	try {
		const { stdout } = await wpCLI( [
			'option',
			'get',
			optionName,
			'--format=json',
		] );
		return JSON.parse( stdout );
	} catch {
		return fallback;
	}
}

/** @param {string} optionName @param {*} value */
export async function setJSONOption( optionName, value ) {
	await wpCLI( [
		'option',
		'update',
		optionName,
		JSON.stringify( value ),
		'--format=json',
	] );
}
