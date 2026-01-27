/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
	interface Window {
		__lunaTheme?: {
			themes: string[];
			get: () => string;
			set: (theme: string, opts?: { persist?: boolean }) => void;
		};
	}
}

export {};