"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._runApiTests = _runApiTests;
const expect_1 = require("expect");
const api_1 = require("./api");
async function testListSources() {
    // First, seed the initial sources
    await (0, api_1._seedInitialSources)();
    // Then test if we can list them
    const sources = await (0, api_1.listSources)();
    // Verify we have sources
    (0, expect_1.expect)(Array.isArray(sources)).toBe(true);
    (0, expect_1.expect)(sources.length).toBeGreaterThan(0);
    // Verify source structure
    const firstSource = sources[0];
    (0, expect_1.expect)(firstSource).toHaveProperty("id");
    (0, expect_1.expect)(firstSource).toHaveProperty("name");
    (0, expect_1.expect)(firstSource).toHaveProperty("url");
    (0, expect_1.expect)(firstSource).toHaveProperty("isEnabled");
    (0, expect_1.expect)(firstSource).toHaveProperty("type");
    return true;
}
async function testFetchAndProcessNewsWithNoKeywords() {
    // Try to fetch news with no keywords
    // This test doesn't need to modify the database directly
    const result = await (0, api_1.fetchAndProcessNews)();
    // Should return either a COMPLETED status with no task ID (if no keywords)
    // or a RUNNING status with a task ID (if there are keywords)
    if (result.status === "COMPLETED") {
        (0, expect_1.expect)(result.taskId).toBeNull();
        (0, expect_1.expect)(result.message).toBeTruthy();
    }
    else {
        (0, expect_1.expect)(result.status).toBe("RUNNING");
        (0, expect_1.expect)(result.taskId).toBeTruthy();
    }
    return true;
}
async function _runApiTests() {
    const result = {
        passedTests: [],
        failedTests: [],
    };
    try {
        await testListSources();
        result.passedTests.push("testListSources");
    }
    catch (error) {
        result.failedTests.push({
            name: "testListSources",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
    try {
        await testFetchAndProcessNewsWithNoKeywords();
        result.passedTests.push("testFetchAndProcessNewsWithNoKeywords");
    }
    catch (error) {
        result.failedTests.push({
            name: "testFetchAndProcessNewsWithNoKeywords",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
    return result;
}
