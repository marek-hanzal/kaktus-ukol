import type { KaktusInvoiceSchema } from "../schema/KaktusInvoiceSchema";
import { escapeXmlFn } from "./escapeXmlFn";

/** Explicit tag selection keeps internal fields out of the vendor protocol. */
export const printKaktusInvoiceFn = (record: KaktusInvoiceSchema.Type): string => {
	const tag = (name: string, value: string | null, indent = "    ") =>
		value === null ? "" : `${indent}<${name}>${escapeXmlFn(value)}</${name}>\r\n`;
	// ASCII JSON escapes prevent comment termination and encoding loss in provenance.
	const provenance = JSON.stringify(record.provenance).replace(
		/[-<>&\u007f-\uffff]/g,
		(value) => `\\u${value.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
	const supplier = record.Dodavatel;
	return (
		`  <!-- taxy ${provenance} -->\r\n  <FakturaPrijata>\r\n` +
		tag("CisloDodavatele", record.CisloDodavatele) +
		tag("VarSymbol", record.VarSymbol) +
		"    <Dodavatel>\r\n" +
		tag("Nazev", supplier.Nazev, "      ") +
		tag("ICO", supplier.ICO, "      ") +
		tag("DIC", supplier.DIC, "      ") +
		tag("Ulice", supplier.Ulice, "      ") +
		tag("Mesto", supplier.Mesto, "      ") +
		tag("PSC", supplier.PSC, "      ") +
		tag("Stat", supplier.Stat, "      ") +
		tag("Ucet", supplier.Ucet, "      ") +
		"    </Dodavatel>\r\n" +
		tag("DatumVystaveni", record.DatumVystaveni) +
		tag("DatumZdanPlneni", record.DatumZdanPlneni) +
		tag("DatumSplatnosti", record.DatumSplatnosti) +
		tag("Zaklad0", record.Zaklad0) +
		tag("Zaklad12", record.Zaklad12) +
		tag("DPH12", record.DPH12) +
		tag("Zaklad21", record.Zaklad21) +
		tag("DPH21", record.DPH21) +
		tag("Celkem", record.Celkem) +
		tag("Mena", record.Mena) +
		tag("Kurz", record.Kurz) +
		tag("Text", record.Text) +
		tag("Poznamka", record.Poznamka) +
		"  </FakturaPrijata>\r\n"
	);
};
