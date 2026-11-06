import { z } from "zod";

export const maintenanceRequest = z.object({
  propertyId: z.string().min(1),
  requestId: z.string().min(1),
  tenantId: z.string().min(1),
  summary: z.string().min(1),
  urgency: z.enum(["routine", "urgent"]),
  documentId: z.string().min(1),
  inspectionDue: z.string().date()
});

export type MaintenanceRequest = z.infer<typeof maintenanceRequest>;

export function roomForRequest(request: MaintenanceRequest): string {
  const urgency = request.urgency === "urgent" ? "priority" : "standard";
  return `property-${request.propertyId}-${urgency}`;
}

export function roomState(request: MaintenanceRequest): Record<string, unknown> {
  return {
    request_id: request.requestId,
    property_id: request.propertyId,
    tenant_id: request.tenantId,
    summary: request.summary,
    urgency: request.urgency,
    document_id: request.documentId,
    inspection_due: request.inspectionDue,
    state: "open"
  };
}
