/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": "ts-jest"
    },
    transformIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    roots: ["<rootDir>/src"],
    testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"]
  };