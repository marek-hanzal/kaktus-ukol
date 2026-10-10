import { Effect } from "effect";
import { SaxesParser } from "saxes";
import { WriteError } from "../error/WriteError";
import { ResponseHeaderSchema } from "../schema/ResponseHeaderSchema";
import { ResponseDocumentSchema } from "../schema/ResponseDocumentSchema";

/** The vendor response is bounded by our twenty-document batch, then checked as a whole. */
export const parseResponseFx = Effect.fnUntraced(function* (
	text: string,
	companyId: string,
	count: number,
) {
	return yield* Effect.try({
		try: () => {
			const parser = new SaxesParser({
				xmlns: false,
			});
			let depth = 0;
			let header: ResponseHeaderSchema.Type | undefined;
			const documents: ResponseDocumentSchema.Type[] = [];
			parser.on("doctype", () => {
				throw new Error("DTD is forbidden in Kaktus responses");
			});
			parser.on("xmldecl", (declaration) => {
				if (declaration.encoding?.toLowerCase() !== "windows-1250")
					throw new Error("Expected Windows-1250 response declaration");
			});
			parser.on("opentag", (node) => {
				depth += 1;
				if (depth === 1 && node.name === "KaktusOdpoved")
					header = ResponseHeaderSchema.parse(node.attributes);
				else if (depth === 2 && node.name === "Doklad" && documents.length < count)
					documents.push(ResponseDocumentSchema.parse(node.attributes));
				else throw new Error("Unexpected response element or excess document result");
			});
			parser.on("closetag", () => {
				depth -= 1;
			});
			parser.on("text", (value) => {
				if (value.trim() !== "") throw new Error("Unexpected response text");
			});
			parser.on("cdata", () => {
				throw new Error("Unexpected CDATA in response");
			});
			parser.write(text).close();
			if (header === undefined || header.firma !== companyId || documents.length !== count)
				throw new Error("Response company or document count differs from submitted batch");
			let written = 0;
			for (let index = 0; index < documents.length; index += 1) {
				const document = documents[index];
				if (document?.poradi !== index + 1)
					throw new Error("Response ordinals must be complete, unique and ordered");
				if (document.stav === "OK") written += 1;
			}
			if (header.zapsano !== written || header.odmitnuto !== count - written)
				throw new Error("Response counts contradict document results");
			return documents;
		},
		catch: (cause) =>
			new WriteError({
				detail: `Unconfirmed Kaktus response: ${cause instanceof Error ? cause.message : String(cause)}`,
			}),
	});
});
