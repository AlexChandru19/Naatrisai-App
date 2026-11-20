/** Digital Asset Links for a future Android TWA (Play Store wrapper). Inactive until TWA_PACKAGE and TWA_SHA256 are set. */
export function GET() {
  const pkg = process.env.TWA_PACKAGE, fp = process.env.TWA_SHA256;
  const body = pkg && fp ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: fp.split(",").map((s) => s.trim()) } }] : [];
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
