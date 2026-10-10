/** Escape element values; numeric references preserve line endings through XML normalization. */
export const escapeXmlFn = (value: string): string =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;")
		.replaceAll("\r", "&#13;")
		.replaceAll("\n", "&#10;")
		.replaceAll("\t", "&#9;");
