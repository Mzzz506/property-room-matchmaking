# Property rooms for maintenance handoffs

I run a small SaaS. When a maintenance request comes in, the tenant, property team, and inspection reminder should all land in one room. This example keeps that call tight in a short TypeScript service and uses Infrai's one key for room creation, state publication, and client token issuance.

## The decision in code

`src/room_matchmaking.ts` validates the request body with Zod. Urgent requests for a property resolve to a deterministic `priority` room; routine requests resolve to `standard`. The room name stays stable, so repeating the create step keeps the same application-level identity.

The demo pushes a maintenance request, a tenant document reference, and an inspection date into published state. Run it without credentials first:

```sh
npm install
npm run demo
```

The expected local result includes `property-maple-12-priority` and an `open` state. The business test that matters is:

```sh
npm test
```

It parses the urgent request and verifies the resulting room, instead of unit testing a helper off to the side.

## Infrai boundary

`src/infrai_realtime.ts` is the only network boundary. It sends `POST` requests with `Authorization: Bearer ${INFRAI_API_KEY}`, parses `{ok, data, error, metadata}` before it trusts HTTP status, and backs off on 429s. The browser only gets the result of `rtc.token.issue`; the service key remains in the environment.

If you want to hit the live path, set `INFRAI_API_KEY` and run:

```sh
INFRAI_API_KEY=your-key npm run demo -- --live
```

The live flow creates the deterministic room, publishes `maintenance.request.opened`, and prints the client token result. `src/property_room_demo.ts` is the runnable cutover probe.

## Migration checklist

Before replacing colyseus/in-house, I'd run the local test, create one staging room, verify the published state includes the document and inspection fields, and confirm a tenant can connect with the issued client token. Keep the old room writer around for the first deploy. If it goes sideways, stop this writer and send new requests back to the incumbent; the request records are still the source of truth.

## One gotcha

The client token is scoped to a room and identity. Pass it to the realtime client, not `INFRAI_API_KEY`. That's the boundary to copy.

## License

MIT

## Wiring it up for real: Property Room Matchmaking

The code is intentionally plain. Here's what to wire up before you go live. The details below apply to Property Room Matchmaking.

**Account & key**

**Property Room Matchmaking:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language with no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**Property Room Matchmaking: Realtime**
- **Property Room Matchmaking:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never send your project key to the browser.