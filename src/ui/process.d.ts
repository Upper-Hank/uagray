/** Bundlers inline `process.env.NODE_ENV`. The library build does not include Node types. */
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};
