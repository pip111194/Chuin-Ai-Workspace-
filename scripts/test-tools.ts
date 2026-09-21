import { toolRegistry } from "../src/lib/agent/tools/registry";
import { executeTool } from "../src/lib/agent/tools/executor";

async function main() {
  console.log("=== TOOL REGISTRY ===");
  console.log("Total tools:", toolRegistry.size());
  console.log("Names:", toolRegistry.getAll().map((t) => t.name).join(", "));
  console.log("");

  const context = {
    userId: "test-user-123",
    workspaceRoot: "/tmp/chuin-test",
  };

  // Test 1: Write a file
  console.log("=== TEST 1: filesystem.write ===");
  const writeResult = await executeTool(
    "filesystem.write",
    {
      path: "hello.txt",
      content: "Hello from Chuin AI!\nThis is a test file.\nLine 3 here.",
    },
    context
  );
  console.log("Success:", writeResult.success);
  console.log("Output:", writeResult.output);
  console.log("Duration:", writeResult.durationMs + "ms");
  console.log("");

  // Test 2: Read the file back
  console.log("=== TEST 2: filesystem.read ===");
  const readResult = await executeTool(
    "filesystem.read",
    { path: "hello.txt" },
    context
  );
  console.log("Success:", readResult.success);
  console.log("Content:", readResult.output?.content);
  console.log("Lines:", readResult.output?.lines);
  console.log("");

  // Test 3: List workspace
  console.log("=== TEST 3: filesystem.list ===");
  const listResult = await executeTool(
    "filesystem.list",
    { path: ".", depth: 2 },
    context
  );
  console.log("Success:", listResult.success);
  console.log("Total entries:", listResult.output?.total);
  console.log("Entries:", listResult.output?.entries);
  console.log("");

  // Test 4: Path traversal (should fail)
  console.log("=== TEST 4: Path Traversal (should fail) ===");
  const badResult = await executeTool(
    "filesystem.read",
    { path: "../../etc/passwd" },
    context
  );
  console.log("Success (expected false):", badResult.success);
  console.log("Error:", badResult.error);
  console.log("");

  // Test 5: Invalid input (should fail)
  console.log("=== TEST 5: Invalid Input (should fail) ===");
  const invalidResult = await executeTool(
    "filesystem.write",
    { path: 123, content: null } as any,
    context
  );
  console.log("Success (expected false):", invalidResult.success);
  console.log("Error:", invalidResult.error);
}

main()
  .then(() => {
    console.log("");
    console.log("=== ALL TESTS COMPLETE ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
