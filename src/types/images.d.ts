declare module '*.png' {
  const content: {
    src: string;
    width: number;
    height: number;
  };
  export default content;
}

declare module '*.jpg' {
  const content: {
    src: string;
    width: number;
    height: number;
  };
  export default content;
}

declare module '*.jpeg' {
  const content: {
    src: string;
    width: number;
    height: number;
  };
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
} 