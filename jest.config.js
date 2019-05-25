module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        "^.+\\.tsx?": "ts-jest",
    },
    testPathIgnorePatterns: [
        '/dist/',
    ],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    }
};