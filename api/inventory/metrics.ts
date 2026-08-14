import mockStore from "../../server/serpin-mock";

export const runtime = "nodejs";

export default function handler(_req: any, res: any) {
  try {
    const metrics = mockStore.getDashboardMetrics(1);
    res.status(200).json(metrics);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
