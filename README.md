# bittrex-node

[![wercker status](https://app.wercker.com/status/feb7e7d87d5a4a29ea9c04b4a1350a44/s/master "wercker status")](https://app.wercker.com/project/byKey/feb7e7d87d5a4a29ea9c04b4a1350a44)

A full-featured Bittrex API client for Node.js

- [x] 100% unit-test coverage
- [x] Heavily documented
- [x] Promise based with async/await

If you're using the Bittrex REST API, I can assure you this is the only library worth using. Here's why:

- It doesn't make you parse the Bittrex response and look for errors
- It properly parses all timestamps to JavaScript Date objects
- It uses proper JavaScript and Node conventions
- It throws proper errors when parameters are missing
- It uses a single https client with Keep-Alive enabled
- It's faster than every other node Bittrex library
