/** Target matches partners by registration number, falling back to the exact name. */
export const businessIdentityFn = (
	companyId: string,
	number: string,
	registrationNumber: string | null,
	name: string,
) => [
	companyId,
	number,
	registrationNumber === null
		? [
				"name",
				name,
			]
		: [
				"registration",
				registrationNumber,
			],
];
