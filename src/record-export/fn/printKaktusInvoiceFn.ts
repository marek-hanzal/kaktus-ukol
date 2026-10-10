import type { KaktusInvoiceSchema } from "../schema/KaktusInvoiceSchema";
import { escapeXmlFn } from "./escapeXmlFn";

/** Explicit tag selection keeps internal fields out of the vendor protocol. */
export const printKaktusInvoiceFn = (record: KaktusInvoiceSchema.Type): string => {
	const tagFn = (name: string, value: string | null, indent = "    ") =>
		value === null ? "" : `${indent}<${name}>${escapeXmlFn(value)}</${name}>\r\n`;
	// ASCII JSON escapes prevent comment termination and encoding loss in provenance.
	const provenance = JSON.stringify(record.provenance).replace(
		/[-<>&\u007f-\uffff]/g,
		(value) => `\\u${value.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
	const supplier = record.Dodavatel;
	return (
		`  <!-- taxy ${provenance} -->\r\n  <FakturaPrijata>\r\n` +
		tagFn("CisloDodavatele", record.CisloDodavatele) +
		tagFn("VarSymbol", record.VarSymbol) +
		"    <Dodavatel>\r\n" +
		tagFn("Nazev", supplier.Nazev, "      ") +
		tagFn("ICO", supplier.ICO, "      ") +
		tagFn("DIC", supplier.DIC, "      ") +
		tagFn("Ulice", supplier.Ulice, "      ") +
		tagFn("Mesto", supplier.Mesto, "      ") +
		tagFn("PSC", supplier.PSC, "      ") +
		tagFn("Stat", supplier.Stat, "      ") +
		tagFn("Ucet", supplier.Ucet, "      ") +
		"    </Dodavatel>\r\n" +
		tagFn("DatumVystaveni", record.DatumVystaveni) +
		tagFn("DatumZdanPlneni", record.DatumZdanPlneni) +
		tagFn("DatumSplatnosti", record.DatumSplatnosti) +
		tagFn("Zaklad0", record.Zaklad0) +
		tagFn("Zaklad12", record.Zaklad12) +
		tagFn("DPH12", record.DPH12) +
		tagFn("Zaklad21", record.Zaklad21) +
		tagFn("DPH21", record.DPH21) +
		tagFn("Celkem", record.Celkem) +
		tagFn("Mena", record.Mena) +
		tagFn("Kurz", record.Kurz) +
		tagFn("Text", record.Text) +
		tagFn("Poznamka", record.Poznamka) +
		"  </FakturaPrijata>\r\n"
	);
};
