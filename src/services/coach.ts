import type { Profile, ProgressEntry } from "../types";
import { buildLocalCoachReply } from "../utils/calorie";

type CoachRequest = {
  message: string;
  profile: Profile;
  progress: ProgressEntry[];
};

type CoachResponse = {
  reply?: string;
};

const backendUrl = process.env.EXPO_PUBLIC_AI_BACKEND_URL;

export async function requestCoachReply(request: CoachRequest) {
  if (!backendUrl) {
    return buildLocalCoachReply(request.message, request.profile, request.progress);
  }

  try {
    const response = await fetch(`${backendUrl}/api/coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Coach API failed with ${response.status}`);
    }

    const data = (await response.json()) as CoachResponse;
    return data.reply ?? buildLocalCoachReply(request.message, request.profile, request.progress);
  } catch {
    return buildLocalCoachReply(request.message, request.profile, request.progress);
  }
}
