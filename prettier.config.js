/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
export default {
	useTabs: true,
	tabWidth: 4,
	semi: false,
	singleQuote: true,
	jsxSingleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	experimentalTernaries: true,
	plugins: [
		'@ianvs/prettier-plugin-sort-imports',
		'prettier-plugin-tailwindcss',
	],
	importOrder: [
		'<TYPES>^(node:)',
		'<BUILTIN_MODULES>', // Node.js built-in modules
		'',
		'<TYPES>',
		'<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
		'',
		'<TYPES>^[.][.]',
		'^[.][.]', // parent imports
		'',
		'<TYPES>^[.][/]',
		'^[.][/]', // sibling imports
		'',
		'<TYPES>^[.]$',
		'^[.]$', // index imports
		'',
		'<TYPES>^[#]',
		'^[#]', // aliased imports
	],
	importOrderParserPlugins: ['typescript', 'jsx'],
	importOrderTypeScriptVersion: '5.9.3',
}
