import { BigDecimal } from "effect";
import type { DecimalSchema } from "../schema/DecimalSchema";
import type { DecimalTextSchema } from "../schema/DecimalTextSchema";

/** Render an admitted decimal exactly; BigDecimal.format can switch large values to exponent notation. */
export const formatDecimalFn = (value: DecimalSchema.Type): DecimalTextSchema.Type => {
	const normalized = BigDecimal.normalize(value);
	const negative = normalized.value < 0n;
	const absolute = String(negative ? -normalized.value : normalized.value);
	const digits =
		normalized.scale > 0
			? absolute.padStart(normalized.scale + 1, "0")
			: absolute.padEnd(absolute.length - normalized.scale, "0");
	const point = digits.length - normalized.scale;
	const text = normalized.scale > 0 ? `${digits.slice(0, point)}.${digits.slice(point)}` : digits;
	return negative ? `-${text}` : text;
};
