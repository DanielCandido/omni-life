module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Transform import.meta so Metro can bundle web without throwing
          // "Cannot use 'import.meta' outside a module".
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
