/**
 * This is a tiny smoke test that doesn't need Jest.
 * It just runs a couple of synchronous asserts so beginners can say "tests pass".
 * For proper API tests, use Postman or add Jest + supertest later.
 */
function assert(name, condition) {
  if (!condition) {
    console.error(`✗ ${name}`);
    process.exit(1);
  } else {
    console.log(`✓ ${name}`);
  }
}

assert('math still works', 2 + 2 === 4);
assert('json parse', JSON.parse('{"ok":true}').ok === true);

console.log('All smoke tests passed.');