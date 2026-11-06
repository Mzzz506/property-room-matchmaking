import { maintenanceRequest, roomForRequest, roomState } from "./room_matchmaking.ts";
import { InfraiRealtime } from "./infrai_realtime.ts";

const parsed = maintenanceRequest.parse({
  propertyId: "maple-12", requestId: "maint-104", tenantId: "tenant-7",
  summary: "Leaking kitchen tap", urgency: "urgent", documentId: "doc-88", inspectionDue: "2026-11-15"
});
const room = roomForRequest(parsed);
const api = new InfraiRealtime();

if (process.argv.includes("--live")) {
  await api.createRoom(room);
  await api.publishState(room, roomState(parsed), parsed.propertyId);
  const token = await api.issueClientToken(room, parsed.tenantId, "Tenant 7");
  console.log(JSON.stringify({ room, token }, null, 2));
} else {
  console.log(JSON.stringify({ room, state: roomState(parsed) }, null, 2));
}
