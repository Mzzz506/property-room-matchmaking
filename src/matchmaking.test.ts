import test from "node:test";
import assert from "node:assert/strict";
import { maintenanceRequest, roomForRequest } from "./room_matchmaking.ts";

test("urgent maintenance requests share the priority property room", () => {
  const request = maintenanceRequest.parse({
    propertyId: "maple-12", requestId: "maint-104", tenantId: "tenant-7",
    summary: "Leaking kitchen tap", urgency: "urgent", documentId: "doc-88", inspectionDue: "2026-11-15"
  });
  assert.equal(roomForRequest(request), "property-maple-12-priority");
});
