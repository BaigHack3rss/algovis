/// <reference types="vite/client" />

declare global {
	interface Window {
		MathJax?: {
			typesetPromise?: (elements?: Element[]) => Promise<void>
		} & Record<string, unknown>
	}
}

export {}
