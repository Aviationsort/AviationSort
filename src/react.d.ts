import { ReactNode, CSSProperties } from 'react';

declare global {
  namespace JSX {
    interface Element {
      type: any;
      props: Record<string, any>;
    }
    interface IntrinsicElements {
      [elemName: string]: {
        children?: ReactNode;
        className?: string;
        style?: CSSProperties;
        [key: string]: any;
      };
    }
  }
}

export {};