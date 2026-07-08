import axios from "axios";

const ROBOFLOW_URL = process.env.ROBOFLOW_WORKFLOW_URL!;
const API_KEY = process.env.ROBOFLOW_API_KEY!;
const WORKSPACE = process.env.ROBOFLOW_WORKSPACE!;
const WORKFLOW = process.env.ROBOFLOW_WORKFLOW_ID!;

// Detect only humans
export async function detectHuman(imageUrl: string) {
  try {
    const response = await axios.post(
      `${ROBOFLOW_URL}/infer/workflows/${WORKSPACE}/${WORKFLOW}`,
      {
        api_key: API_KEY,
        inputs: {
          image: {
            type: "url",
            value: imageUrl,
          },
        },
      }
    );

    const predictions =
      response.data?.outputs?.[0]?.predictions || [];

    // Keep only person predictions
    const humans = predictions.filter(
      (p: any) =>
        (p.class === "person" ||
         p.class === "human" ||
         p.class === "worker") &&
        p.confidence >= 0.80   // 80% confidence
    );

    return {
      detected: humans.length > 0,
      count: humans.length,
      confidence:
        humans.length > 0
          ? Math.max(...humans.map((p: any) => p.confidence))
          : 0,
      predictions: humans,
    };
  } catch (error: any) {
    console.error(
      "Roboflow Error:",
      error.response?.data || error.message
    );

    return {
      detected: false,
      count: 0,
      confidence: 0,
      predictions: [],
    };
  }
}
