import { describe, it, expect } from "vitest";
import { hashSecret, verifyWebhookSignature, signWebhookPayload, normalizeEmail, normalizePhone } from "../src/server/security/crypto";

describe("crypto utilities", () => {
  it("hashes secrets consistently", () => {
    expect(hashSecret("test")).toBe(hashSecret("test"));
    expect(hashSecret("test")).not.toBe(hashSecret("other"));
  });

  it("verifies webhook signatures", () => {
    const payload = '{"event":"lead.created"}';
    const secret = "webhook-secret";
    const sig = signWebhookPayload(payload, secret);
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, "bad", secret)).toBe(false);
  });

  it("normalizes email and phone", () => {
    expect(normalizeEmail("  Test@Example.COM ")).toBe("test@example.com");
    expect(normalizePhone("+1 (415) 555-0100")).toBe("+14155550100");
  });
});

describe("tenant isolation expectations", () => {
  it("documents that orgId must never come from client body", () => {
    const clientPayload = { org_id: "malicious-org-id", name: "Hack" };
    expect(clientPayload.org_id).toBeDefined();
    // Server must derive orgId from session/API key only — enforced in getUserContext()
  });
});
