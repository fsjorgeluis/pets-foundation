export const keyFormatter = (key: string, value: string): string => {
	const formattedKey = `${key}#${value.replace(/\s/g, '').toUpperCase()}`;
	return formattedKey.toUpperCase();
};
