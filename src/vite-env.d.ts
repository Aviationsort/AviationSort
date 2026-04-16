// @ts-check
/// <reference types="vite/client" />

// React JSX types
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, AriaAttributes, DOMAttributes<T> {
    className?: string;
    [key: string]: any;
  }
}

declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface IntrinsicAttributes {
      [elemName: string]: any;
    }
  }
}

interface Window {
  innerWidth: number;
}

export {};