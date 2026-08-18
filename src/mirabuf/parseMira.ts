import { ungzip } from "pako";
import { mirabuf } from "./proto/mirabuf";

/**
 * Fetches and decodes a Mirabuf assembly file (.mira), the CAD interchange
 * format used by Autodesk Synthesis. Files are gzip-compressed protobufs.
 * Adapted from Autodesk/synthesis fission/src/mirabuf (Apache-2.0).
 */
export async function parseMira(url: string): Promise<mirabuf.Assembly> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] === 31 && bytes[1] === 139) {
    bytes = ungzip(bytes);
  }
  return mirabuf.Assembly.decode(bytes);
}
