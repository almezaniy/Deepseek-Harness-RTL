// Host (Node) half of this dual-face plugin.
//
// The DSH loader imports this file in Node when the profile's cordis.patch.yml
// names the package, so it must never touch `window`. All the work lives in
// ./client.js, which the client-modules row serves to the browser through
// exports["./client"] because package.json declares dsh.client.platform "web".
export function apply() {}
