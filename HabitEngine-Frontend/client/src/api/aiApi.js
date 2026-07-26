import axiosClient from "./axiosClient";

// OpenAI structured output calls can take up to 3 minutes
const AI_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * AI Planner API client.
 * Communicates with the Spring AI backend endpoints.
 * Uses a 3-minute timeout override since OpenAI responses can be slow.
 */
const aiApi = {
  /**
   * Generates a structured plan from a free-text description.
   * Returns goal, milestones, study sources, and routine blocks.
   * Nothing is saved to the database yet.
   *
   * @param {string} planDescription - The user's free-text goal/plan description
   */
  generatePlan: (planDescription) =>
    axiosClient.post("/ai/generate", { planDescription }, { timeout: AI_TIMEOUT_MS }),

  /**
   * Saves a reviewed AI plan to the database.
   * Creates the goal, milestones, study sources, and routine blocks in one call.
   *
   * @param {object} plan - The AiPlanResponse object (may have been edited by the user)
   */
  savePlan: (plan) => axiosClient.post("/ai/save", plan, { timeout: AI_TIMEOUT_MS }),
};

export default aiApi;
