module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: 'current' } }],
    "@babel/preset-typescript"
  ],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "@domain": "./src/domain",
          "@infra": "./src/infra",
          "@application": "./src/application",
          "@errors": "./src/errors",
          "@core": "./src/core",
          "@tests": "./src/tests"
        }
      }
    ],
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ]
}