import { getAdminAuth, getAdminDb } from "./admin";

export async function verifyUserToken(header) {
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

  const token = await getAdminAuth().verifyIdToken(header.slice(7));
  const userDoc = await getAdminDb().collection("users").doc(token.uid).get();
  const role = userDoc.exists ? String(userDoc.data()?.role ?? "customer") : "customer";

  return { token, role, uid: token.uid };
}
