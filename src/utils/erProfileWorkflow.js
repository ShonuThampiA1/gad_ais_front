const WORKFLOW_STORAGE_KEY = "er_profile_workflow_context";

const APPROVED_ACTIONS = new Set(["approve", "approve_after_approval"]);
const SUBMITTED_ACTIONS = new Set(["submit", "resubmit", "submit_after_approval", "resubmit_after_approval", "forward"]);
const RETURNED_ACTIONS = new Set(["return_for_correction", "return_after_approval"]);
const PENDING_STATUSES = new Set(["SUBMITTED", "RESUBMITTED", "FORWARDED"]);

const getLatestTimelineAction = (timeline = []) => {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return null;
  }
  const current = timeline.find((item) => item?.is_current);
  return (current || timeline[timeline.length - 1])?.action_key?.toLowerCase() || null;
};

export const readStoredErProfileWorkflowContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(WORKFLOW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to parse stored ER profile workflow context", error);
    return null;
  }
};

export const storeErProfileWorkflowContext = (context) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!context) {
    sessionStorage.removeItem(WORKFLOW_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(context));
};

export const getEnabledOfficerWorkflowActions = (context = readStoredErProfileWorkflowContext()) => {
  const actions = Array.isArray(context?.allowed_actions) ? context.allowed_actions : [];
  return actions.filter((action) => action && action.enabled !== false && action.is_visible !== false);
};

export const canEditErProfile = (context = readStoredErProfileWorkflowContext()) => {
  const hasApprovedBaseline = Boolean(context?.change_preview?.has_approved_baseline);
  const cycleStatus = context?.change_preview?.current_cycle_status?.toUpperCase?.() || null;
  const windowStatus = context?.change_preview?.window_status;

  if (hasApprovedBaseline) {
    if (windowStatus !== "ACTIVE") {
      return false;
    }

    if (!cycleStatus || cycleStatus === "DRAFT" || cycleStatus === "RETURNED") {
      return true;
    }

    return false;
  }

  return getEnabledOfficerWorkflowActions(context).length > 0;
};

export const canEditErProfilePhoto = (context = readStoredErProfileWorkflowContext()) =>
  canEditErProfile(context);

export const deriveErProfileWorkflowState = (
  context = readStoredErProfileWorkflowContext(),
  timeline = context?.status_timeline || [],
) => {
  const latestAction = getLatestTimelineAction(timeline);
  const hasApprovedBaseline = Boolean(context?.change_preview?.has_approved_baseline);
  const cycleStatus = context?.change_preview?.current_cycle_status?.toUpperCase?.() || null;

  if (hasApprovedBaseline) {
    if (cycleStatus === "APPROVED") {
      return "approved";
    }
    if (cycleStatus === "RETURNED") {
      return "correction";
    }
    if (PENDING_STATUSES.has(cycleStatus)) {
      return "pending_review";
    }
    if (canEditErProfile(context)) {
      return "editable";
    }
    return "approved_baseline";
  }

  if (APPROVED_ACTIONS.has(latestAction)) {
    return "approved";
  }
  if (RETURNED_ACTIONS.has(latestAction)) {
    return "correction";
  }
  if (SUBMITTED_ACTIONS.has(latestAction)) {
    return "pending_review";
  }
  if (canEditErProfile(context)) {
    return "editable";
  }
  return "incomplete";
};

export const deriveErProfileModalType = (
  context = readStoredErProfileWorkflowContext(),
  timeline = context?.status_timeline || [],
) => {
  const latestAction = getLatestTimelineAction(timeline);
  const state = deriveErProfileWorkflowState(context, timeline);
  const hasActiveWindow =
    context?.change_preview?.has_approved_baseline &&
    context?.change_preview?.window_status === "ACTIVE" &&
    context?.change_preview?.active_window;

  if (state === "correction") {
    return "correction";
  }
  if (state === "pending_review") {
    return latestAction === "resubmit" || latestAction === "resubmit_after_approval" ? "resubmitted" : "submitted";
  }
  if (hasActiveWindow && (state === "editable" || state === "approved_baseline")) {
    return "schedule_open";
  }
  if (state === "incomplete") {
    return "incomplete";
  }
  return null;
};

export const isApprovedErProfileState = (
  context = readStoredErProfileWorkflowContext(),
  timeline = context?.status_timeline || [],
) => deriveErProfileWorkflowState(context, timeline) === "approved";

export const getErProfileStatusPresentation = (
  context = readStoredErProfileWorkflowContext(),
  timeline = context?.status_timeline || [],
) => {
  const state = deriveErProfileWorkflowState(context, timeline);

  switch (state) {
    case "approved":
      return { label: "Verified", tone: "success", dotClass: "bg-green-500" };
    case "pending_review":
      return { label: "Pending Review", tone: "warning", dotClass: "bg-yellow-500" };
    case "correction":
      return { label: "Correction Required", tone: "warning", dotClass: "bg-amber-500" };
    case "editable":
      return { label: "Editable", tone: "info", dotClass: "bg-blue-500" };
    case "approved_baseline":
      return { label: "Baseline Approved", tone: "success", dotClass: "bg-emerald-500" };
    default:
      return { label: "Incomplete", tone: "warning", dotClass: "bg-yellow-500" };
  }
};
