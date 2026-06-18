"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/16/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "../../../components/dataTableControls";
import ConfirmModal from "../../../components/confirmModal";
import WorkflowAdminSidebar from "../components/WorkflowAdminSidebar";

// const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Returned"];
const PRIORITY_OPTIONS = [
  { value: "1", label: "1 - Critical" },
  { value: "2", label: "2 - High" },
  { value: "3", label: "3 - Medium" },
  { value: "4", label: "4 - Low" },
];

const EMPTY_FORM = {
  id: null,
  routingId: "",
  serviceCode: "",
  providerGroupCode: "",
  fromActivityCode: "",
  toActivityCode: "",
  roleCode: "",
  toRoleCode: "",
  actionKey: "",
  priorityLevel: "3",
  slaHours: "",
  isActive: true,
  effectiveStart: "",
  effectiveEnd: "",
  delegated: false,
  allocatedEmployeePen: "",
  delegatedEmployeePen: "",
  exceptionRuleCode: "",
  requesterDepartment: "",
  requesterLocation: "",
  requesterDistrict: "",
  aisOfficerCategory: "",
  stateName: "",
  // status: "Pending",
  // dedupeKey: "",
  conditionJson: "{}",
  createdBy: "admin",
  createdAt: "",
  updatedBy: "admin",
  updatedAt: "",
};

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function priorityBadge(priorityLevel) {
  if (priorityLevel === "1") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  }
  if (priorityLevel === "2") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  if (priorityLevel === "3") {
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
}

function parseSafeJSON(value) {
  try {
    return { isValid: true, data: JSON.parse(value || "{}"), error: "" };
  } catch (error) {
    return { isValid: false, data: null, error: error.message };
  }
}

function isDateRangeOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = endA ? new Date(endA).getTime() : Number.POSITIVE_INFINITY;
  const bStart = new Date(startB).getTime();
  const bEnd = endB ? new Date(endB).getTime() : Number.POSITIVE_INFINITY;
  return aStart <= bEnd && bStart <= aEnd;
}

function RuleModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  findConflicts,
  helpers,
  services,
  providerGroups,
  activities,
  exceptionRules,
  roles,
  states,
  districts,
  departments,
  serviceTypes,
  isSaving,
  setIsSaving,
}) {
  const [form, setForm] = useState(initialValues);
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    setForm(initialValues);
    setActiveTab("basic");
    setErrors({});
    setWarnings([]);
    setJsonError("");
  }, [initialValues, open]);

  if (!open) return null;

  const validate = () => {
    const nextErrors = {};
    const actionKey = form.actionKey.trim().toUpperCase();

    if (!form.serviceCode) nextErrors.serviceCode = "Service is required.";
    if (!form.providerGroupCode)
      nextErrors.providerGroupCode = "Provider group is required.";
    if (!form.roleCode) nextErrors.roleCode = "Role is required.";
    if (!form.toRoleCode) nextErrors.toRoleCode = "To role is required.";
    if (!form.fromActivityCode)
      nextErrors.fromActivityCode = "From activity is required.";
    if (!form.toActivityCode)
      nextErrors.toActivityCode = "To activity is required.";
    if (!actionKey) nextErrors.actionKey = "Action key is required.";
    // if (!form.priorityLevel)
    //   nextErrors.priorityLevel = "Priority level is required.";
    if (form.slaHours === "" || Number(form.slaHours) < 0) {
      nextErrors.slaHours = "SLA hours must be 0 or greater.";
    }
    if (!form.effectiveStart)
      nextErrors.effectiveStart = "Effective start date is required.";
    if (
      form.effectiveStart &&
      form.effectiveEnd &&
      form.effectiveEnd < form.effectiveStart
    ) {
      nextErrors.effectiveEnd =
        "Effective end date cannot be before start date.";
    }
    if (form.delegated && !form.delegatedEmployeePen.trim()) {
      nextErrors.delegatedEmployeePen =
        "Delegated employee PEN is required when delegated is Yes.";
    }

    const parsed = parseSafeJSON(form.conditionJson);
    if (!parsed.isValid) {
      nextErrors.conditionJson = "Condition JSON is invalid.";
      setJsonError(parsed.error);
    } else {
      setJsonError("");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onPrettyFormat = () => {
    const parsed = parseSafeJSON(form.conditionJson);
    if (!parsed.isValid) {
      setJsonError(parsed.error);
      return;
    }
    setJsonError("");
    setForm((prev) => ({
      ...prev,
      conditionJson: JSON.stringify(parsed.data, null, 2),
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const nextPayload = {
      ...form,
      actionKey: form.actionKey.trim().toUpperCase(),
      slaHours: Number(form.slaHours),
      allocatedEmployeePen: form.allocatedEmployeePen.trim().toUpperCase(),
      delegatedEmployeePen: form.delegatedEmployeePen.trim().toUpperCase(),
      // dedupeKey: form.dedupeKey?.trim() || "",
      conditionJson: form.conditionJson.trim() || "{}",
      updatedBy: "admin",
    };

    const nextWarnings = findConflicts(nextPayload);
    if (nextWarnings.length > 0) {
      setWarnings(nextWarnings);
      return;
    }

    onSave(nextPayload);
  };

  const tabs = [
    { id: "basic", label: "Basic Rule Info" },
    { id: "context", label: "Request Context Filters" },
    { id: "exception", label: "Exception / Conditions" },
    { id: "allocation", label: "Allocation / Delegation" },
  ];

  const tabOrder = ["basic", "context", "exception", "allocation"];

  const currentStepIndex = tabOrder.indexOf(activeTab);

  const goNext = () => {
    if (currentStepIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentStepIndex + 1]);
    }
  };

  const goPrevious = () => {
    if (currentStepIndex > 0) {
      setActiveTab(tabOrder[currentStepIndex - 1]);
    }
  };

  const serviceName = helpers.serviceName(form.serviceCode);
  const fromActivityName = helpers.activityName(form.fromActivityCode);
  const toActivityName = helpers.activityName(form.toActivityCode);
  const roleName = helpers.roleName(form.roleCode);
  const toRoleName = helpers.roleName(form.toRoleCode);
  const providerName = helpers.providerName(form.providerGroupCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-3 py-4">
      <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white">
            {mode === "add"
              ? "Add Routing Rule"
              : mode === "clone"
                ? "Clone Routing Rule"
                : "Edit Routing Rule"}
          </h3>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <form onSubmit={onSubmit} className="p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "border-cyan-500 bg-cyan-100 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-900/40 dark:text-cyan-300"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {warnings.length > 0 && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <p className="font-semibold">Conflict warning</p>
                {warnings.map((message) => (
                  <p key={message} className="mt-1">
                    {message}
                  </p>
                ))}
              </div>
            )}

            {activeTab === "basic" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSelect
                  label="Service Code"
                  value={form.serviceCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, serviceCode: value }))
                  }
                  error={errors.serviceCode}
                >
                  <option value="">Select service</option>
                  {services.map((item) => (
                    <option key={item.service_code} value={item.service_code}>
                      {item.service_code} - {item.service_name}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="Provider Group Code"
                  value={form.providerGroupCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, providerGroupCode: value }))
                  }
                  error={errors.providerGroupCode}
                >
                  <option value="">Select provider group</option>
                  {providerGroups.map((item) => (
                    <option
                      key={item.provider_group_code}
                      value={item.provider_group_code}
                    >
                      {item.provider_group_code} - {item.provider_group_name}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="Role Code"
                  value={form.roleCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, roleCode: value }))
                  }
                  error={errors.roleCode}
                >
                  <option value="">Select role</option>
                  {roles.map((item) => (
                    <option key={item.role_id} value={String(item.role_id)}>
                      {item.role}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="To Role Code"
                  value={form.toRoleCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, toRoleCode: value }))
                  }
                  error={errors.toRoleCode}
                >
                  <option value="">Select to role</option>
                  {roles.map((item) => (
                    <option key={item.role_id} value={String(item.role_id)}>
                      {item.role}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="From Activity Code"
                  value={form.fromActivityCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, fromActivityCode: value }))
                  }
                  error={errors.fromActivityCode}
                >
                  <option value="">Select from activity</option>
                  {activities.map((item) => (
                    <option key={item.activity_code} value={item.activity_code}>
                      {item.activity_code} - {item.activity_name}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="To Activity Code"
                  value={form.toActivityCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, toActivityCode: value }))
                  }
                  error={errors.toActivityCode}
                >
                  <option value="">Select to activity</option>
                  {activities.map((item) => (
                    <option key={item.activity_code} value={item.activity_code}>
                      {item.activity_code} - {item.activity_name}
                    </option>
                  ))}
                </FieldSelect>

                <FieldInput
                  label="Action Key"
                  value={form.actionKey}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, actionKey: value }))
                  }
                  placeholder="SUBMIT / VERIFY / APPROVE"
                  error={errors.actionKey}
                />

                {/* <FieldSelect
                  label="Priority Level"
                  value={form.priorityLevel}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, priorityLevel: value }))
                  }
                  error={errors.priorityLevel}
                >
                  {PRIORITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </FieldSelect> */}

                <FieldInput
                  label="SLA Hours"
                  type="number"
                  value={form.slaHours}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, slaHours: value }))
                  }
                  placeholder="24"
                  error={errors.slaHours}
                />

                <FieldSelect
                  label="Is Active"
                  value={form.isActive ? "yes" : "no"}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, isActive: value === "yes" }))
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </FieldSelect>

                <FieldInput
                  label="Effective Start Date"
                  type="date"
                  value={form.effectiveStart}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, effectiveStart: value }))
                  }
                  error={errors.effectiveStart}
                />

                <FieldInput
                  label="Effective End Date"
                  type="date"
                  value={form.effectiveEnd}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, effectiveEnd: value }))
                  }
                  error={errors.effectiveEnd}
                />
              </div>
            )}

            {activeTab === "context" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSelect
                  label="Requester Department"
                  value={form.requesterDepartment}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, requesterDepartment: value }))
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((item) => (
                    <option
                      key={item.administrative_department_id}
                      value={item.administrative_department}
                    >
                      {item.administrative_department}
                    </option>
                  ))}
                </FieldSelect>

                <FieldInput
                  label="Requester Location"
                  value={form.requesterLocation}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, requesterLocation: value }))
                  }
                  placeholder="Enter requester location"
                />

                <FieldSelect
                  label="Requester District"
                  value={form.requesterDistrict}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, requesterDistrict: value }))
                  }
                >
                  <option value="">Select district</option>
                  {districts.map((item) => (
                    <option key={item.district_id} value={item.district}>
                      {item.district}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="AIS Officer Category"
                  value={form.aisOfficerCategory}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, aisOfficerCategory: value }))
                  }
                >
                  <option value="">Select category</option>
                  {serviceTypes.map((item) => (
                    <option
                      key={item.service_type_id}
                      value={item.service_type_name}
                    >
                      {item.service_type_name}
                    </option>
                  ))}
                </FieldSelect>

                <FieldSelect
                  label="State Name"
                  value={form.stateName}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, stateName: value }))
                  }
                >
                  <option value="">Select state</option>
                  {states.map((item) => (
                    <option key={item.state_id} value={item.state}>
                      {item.state}
                    </option>
                  ))}
                </FieldSelect>

                {/* <FieldSelect
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </FieldSelect> */}
              </div>
            )}

            {activeTab === "exception" && (
              <div className="grid gap-4">
                <FieldSelect
                  label="Exception Rule Code"
                  value={form.exceptionRuleCode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, exceptionRuleCode: value }))
                  }
                >
                  <option value="">Select exception rule</option>
                  {exceptionRules.map((item) => (
                    <option
                      key={item.exception_rule_code}
                      value={item.exception_rule_code}
                    >
                      {item.exception_rule_code} - {item.description}
                    </option>
                  ))}
                </FieldSelect>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Condition JSON
                    </label>
                    <button
                      type="button"
                      onClick={onPrettyFormat}
                      className="rounded-md border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300"
                    >
                      Pretty format
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={form.conditionJson}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        conditionJson: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder='{"field":"value"}'
                  />
                  {errors.conditionJson && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.conditionJson}
                    </p>
                  )}
                  {jsonError && (
                    <p className="mt-1 text-xs text-red-600">
                      JSON parse error: {jsonError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "allocation" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  label="Allocated Employee PEN"
                  value={form.allocatedEmployeePen}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      allocatedEmployeePen: value,
                    }))
                  }
                  placeholder="PEN10021"
                />

                <FieldSelect
                  label="Delegated"
                  value={form.delegated ? "yes" : "no"}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, delegated: value === "yes" }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </FieldSelect>

                {form.delegated && (
                  <FieldInput
                    label="Delegated Employee PEN"
                    value={form.delegatedEmployeePen}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        delegatedEmployeePen: value,
                      }))
                    }
                    placeholder="PEN30011"
                    error={errors.delegatedEmployeePen}
                  />
                )}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    Previous
                  </button>
                )}

                {currentStepIndex < tabOrder.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
  type="submit"
  disabled={isSaving}
  className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
>
  {isSaving ? "Saving..." : mode === "add" ? "Add Rule" : "Save Changes"}
</button>
                )}
              </div>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Rule Preview
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              For service{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {serviceName || "-"}
              </span>
              , when item moves from{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {fromActivityName || "-"}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {toActivityName || "-"}
              </span>
              , assign from role{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {roleName || "-"}
              </span>{" "}
              to role{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {toRoleName || "-"}
              </span>{" "}
              for provider group{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {providerName || "-"}
              </span>
              , SLA{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {form.slaHours || 0} hrs
              </span>
              .
            </p>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <p>
                <span className="font-semibold">Action:</span>{" "}
                {form.actionKey || "-"}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Priority:</span>{" "}
                {PRIORITY_OPTIONS.find(
                  (item) => item.value === form.priorityLevel,
                )?.label || "-"}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Effective:</span>{" "}
                {form.effectiveStart || "-"} to {form.effectiveEnd || "Open"}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Delegated:</span>{" "}
                {form.delegated ? "Yes" : "No"}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Exception:</span>{" "}
                {form.exceptionRuleCode || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function FieldSelect({ label, value, onChange, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
        {value}
      </div>
    </div>
  );
}

export default function RoutingRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [serviceFilter, setServiceFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [fromActivityFilter, setFromActivityFilter] = useState("");
  const [toActivityFilter, setToActivityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toRoleFilter, setToRoleFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [delegatedFilter, setDelegatedFilter] = useState("all");
  const [exceptionFilter, setExceptionFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingRule, setEditingRule] = useState(EMPTY_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ruleToToggle, setRuleToToggle] = useState(null);
  const [services, setServices] = useState([]);
  const [providerGroups, setProviderGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [exceptionRules, setExceptionRules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 30;

  const serviceMap = useMemo(
    () =>
      Object.fromEntries(
        services.map((item) => [item.service_code, item.service_name]),
      ),
    [services],
  );
  const providerMap = useMemo(
    () =>
      Object.fromEntries(
        providerGroups.map((item) => [
          item.provider_group_code,
          item.provider_group_name,
        ]),
      ),
    [providerGroups],
  );

  const activityMap = useMemo(
    () =>
      Object.fromEntries(
        activities.map((item) => [item.activity_code, item.activity_name]),
      ),
    [activities],
  );

  const roleMap = useMemo(
    () =>
      Object.fromEntries(
        roles.map((item) => [String(item.role_id), item.role]),
      ),
    [roles],
  );

  const serviceTypeMap = useMemo(
    () =>
      Object.fromEntries(
        serviceTypes.map((item) => [
          item.service_type_name,
          item.service_type_name,
        ]),
      ),
    [serviceTypes],
  );

  const exceptionMap = useMemo(
    () =>
      Object.fromEntries(
        exceptionRules.map((item) => [
          item.exception_rule_code,
          item.description,
        ]),
      ),
    [exceptionRules],
  );

  const helpers = {
    serviceName: (code) => serviceMap[code] || "",
    providerName: (code) => providerMap[code] || "",
    activityName: (code) => activityMap[code] || "",
    roleName: (code) => roleMap[code] || "",
    exceptionName: (code) => exceptionMap[code] || "",
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    serviceFilter,
    providerFilter,
    fromActivityFilter,
    toActivityFilter,
    roleFilter,
    toRoleFilter,
    priorityFilter,
    activeFilter,
    delegatedFilter,
    exceptionFilter,
    districtFilter,
    stateFilter,
    departmentFilter,
    locationFilter,
    // statusFilter,
    dateFrom,
    dateTo,
  ]);
  useEffect(() => {
    fetchMasterData(); // workflow masters
    fetchMasters(); // common masters
    fetchRoutingRules();
  }, []);

  const fetchRoutingRules = async () => {
    try {
      const response = await axiosInstance.get("/workflow/routing-rules");

      const data = response?.data?.data?.routing_rules || [];

      const formattedRules = data.map((item) => ({
        id: item.routing_id,
        routingId: `RTE${String(item.routing_id).padStart(3, "0")}`,

        serviceCode: item.service_code || "",
        providerGroupCode: item.provider_group_code || "",

        roleCode: item.role_code ? String(item.role_code) : "",
        toRoleCode: item.to_role_code ? String(item.to_role_code) : "",

        fromActivityCode: item.from_activity_code || "",
        toActivityCode: item.to_activity_code || "",

        actionKey: item.action_key || "",

        priorityLevel: item.priority_level ? String(item.priority_level) : "3",

        slaHours: item.sla_hours || "",

        effectiveStart: item.effective_start_date
          ? item.effective_start_date.split("T")[0]
          : "",

        effectiveEnd: item.effective_end_date
          ? item.effective_end_date.split("T")[0]
          : "",

        isActive: item.is_active ?? true,

        requesterDepartment: item.requester_department || "",
        requesterLocation: item.requester_location || "",
        requesterDistrict: item.requester_district || "",

        aisOfficerCategory: item.ais_officer_category || "",
        stateName: item.state_name || "",

        exceptionRuleCode: item.exception_rule_code || "",

        conditionJson: item.condition_json
          ? JSON.stringify(item.condition_json, null, 2)
          : "{}",

        allocatedEmployeePen: item.allocated_employee_pen || "",

        delegated: item.delegated ?? false,
        delegatedEmployeePen: item.delegated_employee_pen || "",

        // dedupeKey: item.dedupe_key || "",

        // createdBy: item.created_by || "",
        // createdAt: item.created_at || "",

        // updatedBy: item.updated_by || "",
        // updatedAt: item.updated_at || "",

        status: item.is_active ? "Active" : "Inactive",
      }));

      setRules(formattedRules);
    } catch (error) {
      console.error("Error fetching routing rules:", error);
    }
  };

  const fetchMasterData = async () => {
    try {
      const response = await axiosInstance.get("/workflow/get_service-master");

      const masters = response?.data?.data?.workflow_masters || {};

      setServices(masters.services || []);
      setProviderGroups(masters.provider_groups || []);
      setActivities(masters.activity_codes || []);
      setExceptionRules(masters.exception_rules || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const fetchMasters = async () => {
    try {
      const response = await axiosInstance.get("/masters/get-master-data");

      const masters = response?.data?.data?.master_data || {};

      setRoles(masters.roles || []);
      setStates(masters.states || []);
      setDistricts(masters.districts || []);
      setDepartments(masters.administrative_departments || []);
      setServiceTypes(masters.service_types || []);
    } catch (error) {
      console.error("Error fetching masters:", error);
    }
  };

  const createRoutingRule = async (formData) => {
  try {
    // Parse condition_json if it's a non-empty string
    let conditionJsonObj = null;
    if (formData.conditionJson && formData.conditionJson.trim()) {
      try {
        conditionJsonObj = JSON.parse(formData.conditionJson);
      } catch (e) {
        // Should not happen because validation already checks JSON validity
        console.error("Invalid condition_json:", e);
        toast.error("Condition JSON is invalid.");
        return null;
      }
    }

    const payload = {
      service_code: formData.serviceCode,
      provider_group_code: formData.providerGroupCode || null,
      role_code: formData.roleCode ? Number(formData.roleCode) : null,
      from_activity_code: formData.fromActivityCode,
      to_activity_code: formData.toActivityCode || null,
      action_key: formData.actionKey || null,
      priority_level: formData.priorityLevel ? Number(formData.priorityLevel) : 3,
      sla_hours: formData.slaHours ? Number(formData.slaHours) : null,
      effective_start_date: formData.effectiveStart,
      effective_end_date: formData.effectiveEnd,
      is_active: formData.isActive ?? true,
      requester_department: formData.requesterDepartment || null,
      requester_location: formData.requesterLocation || null,
      requester_district: formData.requesterDistrict || null,
      ais_officer_category: formData.aisOfficerCategory || null,
      state_name: formData.stateName || null,
      exception_rule_code: formData.exceptionRuleCode || null,
      condition_json: conditionJsonObj,   // ✅ send as object, not string
      allocated_employee_pen: formData.allocatedEmployeePen || null,
      delegated: formData.delegated || false,
      delegated_employee_pen: formData.delegatedEmployeePen || null,
      to_role_code: formData.toRoleCode ? Number(formData.toRoleCode) : null,
    };

      const response = await axiosInstance.post(
        "/workflow/routing-rule",
        payload,
      );

      if (response.data.success) {
        toast.success("Routing rule created successfully");
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Create Routing Rule Error:", error);

      toast.error(
        error.response?.data?.detail || "Failed to create routing rule",
      );

      throw error;
    }
  };

  const updateRoutingRule = async (routingRuleCode, formData) => {
  try {
    let conditionJsonObj = null;

    if (formData.conditionJson && formData.conditionJson.trim()) {
      try {
        conditionJsonObj = JSON.parse(formData.conditionJson);
      } catch (e) {
        toast.error("Condition JSON is invalid");
        return null;
      }
    }

    const payload = {
      service_code: formData.serviceCode,
      provider_group_code: formData.providerGroupCode || null,
      role_code: formData.roleCode ? Number(formData.roleCode) : null,
      from_activity_code: formData.fromActivityCode,
      to_activity_code: formData.toActivityCode || null,
      action_key: formData.actionKey || null,
      priority_level: formData.priorityLevel
        ? Number(formData.priorityLevel)
        : null,
      sla_hours: formData.slaHours ? Number(formData.slaHours) : null,
      effective_start_date: formData.effectiveStart,
      effective_end_date: formData.effectiveEnd,
      is_active: formData.isActive,
      requester_department: formData.requesterDepartment || null,
      requester_location: formData.requesterLocation || null,
      requester_district: formData.requesterDistrict || null,
      ais_officer_category: formData.aisOfficerCategory || null,
      state_name: formData.stateName || null,
      exception_rule_code: formData.exceptionRuleCode || null,
      condition_json: conditionJsonObj,
      allocated_employee_pen: formData.allocatedEmployeePen || null,
      delegated: formData.delegated,
      delegated_employee_pen: formData.delegatedEmployeePen || null,
      to_role_code: formData.toRoleCode
        ? Number(formData.toRoleCode)
        : null,
    };

    const response = await axiosInstance.put(
      `/workflow/routing-rule/${routingRuleCode}`,
      payload
    );

    if (response.data.success) {
      toast.success("Routing rule updated successfully");
      return response.data.data.routing_rule;
    }

    return null;
  } catch (error) {
    console.error("Update Routing Rule Error:", error);

    toast.error(
      error.response?.data?.detail || "Failed to update routing rule"
    );

    throw error;
  }
};

  const filteredRules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rules.filter((item) => {
      const searchMatch =
        `${item.routingId} ${item.serviceCode} ${helpers.serviceName(item.serviceCode)} ${item.providerGroupCode} ${helpers.providerName(item.providerGroupCode)} ${item.fromActivityCode} ${helpers.activityName(item.fromActivityCode)} ${item.toActivityCode} ${helpers.activityName(item.toActivityCode)} ${helpers.roleName(item.roleCode)} ${helpers.roleName(item.toRoleCode)} ${item.actionKey} ${item.exceptionRuleCode}`
          .toLowerCase()
          .includes(q);

      const dateMatchStart = !dateFrom || item.effectiveStart >= dateFrom;
      const dateMatchEnd =
        !dateTo || (item.effectiveEnd ? item.effectiveEnd <= dateTo : true);

      return (
        searchMatch &&
        (!serviceFilter || item.serviceCode === serviceFilter) &&
        (!providerFilter || item.providerGroupCode === providerFilter) &&
        (!fromActivityFilter || item.fromActivityCode === fromActivityFilter) &&
        (!toActivityFilter || item.toActivityCode === toActivityFilter) &&
        (!roleFilter || item.roleCode === roleFilter) &&
        (!toRoleFilter || item.toRoleCode === toRoleFilter) &&
        (!priorityFilter || item.priorityLevel === priorityFilter) &&
        (activeFilter === "all" ||
          (activeFilter === "active" && item.isActive) ||
          (activeFilter === "inactive" && !item.isActive)) &&
        (delegatedFilter === "all" ||
          (delegatedFilter === "yes" && item.delegated) ||
          (delegatedFilter === "no" && !item.delegated)) &&
        (!exceptionFilter || item.exceptionRuleCode === exceptionFilter) &&
        (!districtFilter || item.requesterDistrict === districtFilter) &&
        (!stateFilter || item.stateName === stateFilter) &&
        (!departmentFilter || item.requesterDepartment === departmentFilter) &&
        (!locationFilter || item.requesterLocation === locationFilter) &&
        // (!statusFilter || item.status === statusFilter) &&
        dateMatchStart &&
        dateMatchEnd
      );
    });
  }, [
    rules,
    searchTerm,
    serviceFilter,
    providerFilter,
    fromActivityFilter,
    toActivityFilter,
    roleFilter,
    toRoleFilter,
    priorityFilter,
    activeFilter,
    delegatedFilter,
    exceptionFilter,
    districtFilter,
    stateFilter,
    departmentFilter,
    locationFilter,
    // statusFilter,
    dateFrom,
    dateTo,
    serviceMap,
    providerMap,
    activityMap,
    roleMap,
    exceptionMap,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRules.length / itemsPerPage),
  );
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const findConflicts = (payload) => {
    const messages = [];
    const siblings = rules.filter((item) => item.id !== payload.id);
    const similarRule = siblings.find(
      (item) =>
        item.serviceCode === payload.serviceCode &&
        item.fromActivityCode === payload.fromActivityCode &&
        item.roleCode === payload.roleCode &&
        item.providerGroupCode === payload.providerGroupCode,
    );
    if (similarRule) {
      messages.push(
        `Similar rule already exists (${similarRule.routingId}) with same service + activity + role + provider group.`,
      );
    }

    const overlappingRule = siblings.find(
      (item) =>
        item.isActive &&
        payload.isActive &&
        item.serviceCode === payload.serviceCode &&
        item.providerGroupCode === payload.providerGroupCode &&
        item.fromActivityCode === payload.fromActivityCode &&
        item.toActivityCode === payload.toActivityCode &&
        item.roleCode === payload.roleCode &&
        isDateRangeOverlap(
          item.effectiveStart,
          item.effectiveEnd,
          payload.effectiveStart,
          payload.effectiveEnd,
        ),
    );
    if (overlappingRule) {
      messages.push(
        `Active date range overlaps with ${overlappingRule.routingId}.`,
      );
    }

    return messages;
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditingRule({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEditModal = (rule) => {
    setModalMode("edit");
    setEditingRule({ ...rule });
    setModalOpen(true);
  };

  const openCloneModal = (rule) => {
    const nowIso = new Date().toISOString();
    setModalMode("clone");
    setEditingRule({
      ...rule,
      id: null,
      routingId: "",
      // dedupeKey: "",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "admin",
      updatedBy: "admin",
    });
    setModalOpen(true);
  };

  const onCloneTopAction = () => {
    if (!selectedRuleId) return;
    const selected = rules.find((item) => item.id === selectedRuleId);
    if (!selected) return;
    openCloneModal(selected);
  };

  const nextRoutingId = () => {
    const max = rules.reduce((acc, item) => {
      const n = Number(item.routingId.replace("RTE", ""));
      return Number.isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    return `RTE${String(max + 1).padStart(3, "0")}`;
  };

  const onSaveRule = async (formData) => {
  setIsSaving(true);

  try {
    if (modalMode === "edit") {
      await updateRoutingRule(formData.id, formData);

      await fetchRoutingRules();

      toast.success("Rule updated successfully");
    } else {
      await createRoutingRule(formData);

      await fetchRoutingRules();

      toast.success("Rule created successfully");
    }

    setModalOpen(false);
  } catch (error) {
    console.error(error);
  } finally {
    setIsSaving(false);
  }
};        

  const requestToggleActive = (rule) => {
    setRuleToToggle(rule);
    setConfirmOpen(true);
  };

  const confirmToggleActive = () => {
    if (!ruleToToggle) return;
    const nowIso = new Date().toISOString();
    setRules((prev) =>
      prev.map((item) =>
        item.id === ruleToToggle.id
          ? { ...item, isActive: !item.isActive, updatedAt: nowIso }
          : item,
      ),
    );
    setRuleToToggle(null);
  };

  const exportRows = filteredRules.map((item, index) => [
    index + 1,
    item.routingId,
    `${item.serviceCode} - ${helpers.serviceName(item.serviceCode)}`,
    `${item.providerGroupCode} - ${helpers.providerName(item.providerGroupCode)}`,
    `${item.fromActivityCode} - ${helpers.activityName(item.fromActivityCode)}`,
    `${item.toActivityCode} - ${helpers.activityName(item.toActivityCode)}`,
    helpers.roleName(item.roleCode),
    helpers.roleName(item.toRoleCode),
    item.actionKey,
    item.priorityLevel,
    item.slaHours,
    item.effectiveStart,
    item.effectiveEnd || "-",
    item.isActive ? "Yes" : "No",
    item.delegated ? "Yes" : "No",
    item.allocatedEmployeePen || "-",
    item.exceptionRuleCode || "-",
  ]);

  const exportHeaders = [
    "Sl. No",
    "Routing ID",
    "Service",
    "Provider Group",
    "From Activity",
    "To Activity",
    "Role",
    "To Role",
    "Action Key",
    "Priority Level",
    "SLA Hours",
    "Effective Start",
    "Effective End",
    "Active",
    "Delegated",
    "Allocated Employee",
    "Exception Rule",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
          <WorkflowAdminSidebar />
          <main className="min-w-0">
            <div className="my-1 rounded-xl border bg-white p-3 pt-0 dark:border-gray-900 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-4 py-5 sm:px-3 dark:border-gray-900 dark:bg-gray-800">
                <div>
                  <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeftIcon
                      className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                      strokeWidth={2.5}
                    />
                    Back
                  </button>
                  <h3 className="pt-5 text-base font-semibold uppercase text-indigo-700 dark:text-white">
                    Routing Rules
                  </h3>
                  <div className="mt-5 w-full md:w-96">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search routing id / service / activity / role"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md bg-indigo-700 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      Add New Rule
                      <PlusIcon className="-mr-0.5 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={onCloneTopAction}
                      disabled={!selectedRuleId}
                      className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md border border-cyan-300 bg-cyan-100 px-2.5 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clone Rule
                      <DocumentDuplicateIcon className="-mr-0.5 size-5" />
                    </button>
                  </div>

                  <ExportButtons
                    onCSV={() =>
                      exportToCSV(
                        "routing-rules.csv",
                        exportHeaders,
                        exportRows,
                      )
                    }
                    onPDF={() =>
                      exportToPDF(
                        "Routing Rules",
                        exportHeaders,
                        exportRows,
                        "routing-rules.pdf",
                      )
                    }
                    onExcel={() =>
                      exportToExcel(
                        "Routing Rules",
                        filteredRules.map((item, index) => ({
                          "Sl. No": index + 1,
                          "Routing ID": item.routingId,
                          Service: `${item.serviceCode} - ${helpers.serviceName(item.serviceCode)}`,
                          "Provider Group": `${item.providerGroupCode} - ${helpers.providerName(item.providerGroupCode)}`,
                          "From Activity": `${item.fromActivityCode} - ${helpers.activityName(item.fromActivityCode)}`,
                          "To Activity": `${item.toActivityCode} - ${helpers.activityName(item.toActivityCode)}`,
                          Role: helpers.roleName(item.roleCode),
                          "To Role": helpers.roleName(item.toRoleCode),
                          "Action Key": item.actionKey,
                          "Priority Level": item.priorityLevel,
                          "SLA Hours": item.slaHours,
                          "Effective Start": item.effectiveStart,
                          "Effective End": item.effectiveEnd || "-",
                          Active: item.isActive ? "Yes" : "No",
                          Delegated: item.delegated ? "Yes" : "No",
                          "Allocated Employee":
                            item.allocatedEmployeePen || "-",
                          "Exception Rule": item.exceptionRuleCode || "-",
                        })),
                        "routing-rules.xlsx",
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 px-3 py-3 sm:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                  label="Service"
                  value={serviceFilter}
                  onChange={setServiceFilter}
                >
                  <option value="">All services</option>
                  {services.map((item) => (
                    <option key={item.service_code} value={item.service_code}>
                      {item.service_code} - {item.service_name}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Provider Group"
                  value={providerFilter}
                  onChange={setProviderFilter}
                >
                  <option value="">All provider groups</option>
                  {providerGroups.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="From Activity"
                  value={fromActivityFilter}
                  onChange={setFromActivityFilter}
                >
                  <option value="">All from activities</option>
                  {activities.map((item) => (
                    <option key={item.activity_code} value={item.activity_code}>
                      {item.activity_code} - {item.activity_name}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="To Activity"
                  value={toActivityFilter}
                  onChange={setToActivityFilter}
                >
                  <option value="">All to activities</option>
                  {activities.map((item) => (
                    <option key={item.activity_code} value={item.activity_code}>
                      {item.activity_code} - {item.activity_name}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Role"
                  value={roleFilter}
                  onChange={setRoleFilter}
                >
                  {roles.map((item) => (
                    <option key={item.role_id} value={String(item.role_id)}>
                      {item.role}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="To Role"
                  value={toRoleFilter}
                  onChange={setToRoleFilter}
                >
                  {roles.map((item) => (
                    <option key={item.role_id} value={String(item.role_id)}>
                      {item.role}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Priority"
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                >
                  <option value="">All priorities</option>
                  {PRIORITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Active"
                  value={activeFilter}
                  onChange={setActiveFilter}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </FilterSelect>
                <FilterSelect
                  label="Delegated"
                  value={delegatedFilter}
                  onChange={setDelegatedFilter}
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </FilterSelect>
                <FilterSelect
                  label="Exception Rule"
                  value={exceptionFilter}
                  onChange={setExceptionFilter}
                >
                  <option value="">All exceptions</option>
                  {exceptionRules.map((item) => (
                    <option
                      key={item.exception_rule_code}
                      value={item.exception_rule_code}
                    >
                      {item.exception_rule_code} - {item.description}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="District"
                  value={districtFilter}
                  onChange={setDistrictFilter}
                >
                  <option value="">All districts</option>
                  {districts.map((item) => (
                    <option key={item.district_id} value={item.district}>
                      {item.district}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="State"
                  value={stateFilter}
                  onChange={setStateFilter}
                >
                  <option value="">All states</option>
                  {states.map((item) => (
                    <option key={item.state_id} value={item.state}>
                      {item.state}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Requester Department"
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                >
                  <option value="">All departments</option>
                  {departments.map((item) => (
                    <option
                      key={item.administrative_department_id}
                      value={item.administrative_department}
                    >
                      {item.administrative_department}
                    </option>
                  ))}
                </FilterSelect>
                <FilterInput
                  label="Requester Location"
                  value={locationFilter}
                  onChange={setLocationFilter}
                />
                {/* <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <option value="">All status</option>
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </FilterSelect> */}
                <FilterInput
                  label="Date Range From"
                  type="date"
                  value={dateFrom}
                  onChange={setDateFrom}
                />
                <FilterInput
                  label="Date Range To"
                  type="date"
                  value={dateTo}
                  onChange={setDateTo}
                />
              </div>

              <div className="px-3 pb-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
                  Total: {filteredRules.length}
                </p>
              </div>

              <div className="mx-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-[2100px] table-auto border-collapse text-left">
                  <thead className="bg-slate-100 text-sm text-gray-600 dark:bg-slate-900/60 dark:text-slate-200">
                    <tr>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Select
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Routing ID
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Service
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Provider Group
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        From Activity
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        To Activity
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        To Role
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Action Key
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Priority
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        SLA Hours
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Effective Start
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Effective End
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Active
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Delegated
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Allocated Employee
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Exception Rule
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRules.length === 0 && (
                      <tr>
                        <td
                          colSpan={18}
                          className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                        >
                          No routing rules found.
                        </td>
                      </tr>
                    )}
                    {paginatedRules.map((item) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                      >
                        <td className="px-3 py-3">
                          <input
                            type="radio"
                            name="selectedRule"
                            checked={selectedRuleId === item.id}
                            onChange={() => setSelectedRuleId(item.id)}
                            className="h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                          {item.routingId}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.serviceName(item.serviceCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.providerName(item.providerGroupCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.activityName(item.fromActivityCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.activityName(item.toActivityCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.roleName(item.roleCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {helpers.roleName(item.toRoleCode)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.actionKey}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${priorityBadge(item.priorityLevel)}`}
                          >
                            {PRIORITY_OPTIONS.find(
                              (entry) => entry.value === item.priorityLevel,
                            )?.label || "N/A"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.slaHours}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.effectiveStart}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.effectiveEnd || "-"}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.delegated ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" : "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300"}`}
                          >
                            {item.delegated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.allocatedEmployeePen || "-"}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-100">
                          {item.exceptionRuleCode
                            ? `${item.exceptionRuleCode} - ${helpers.exceptionName(item.exceptionRuleCode)}`
                            : "-"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit rule"
                              onClick={() => openEditModal(item)}
                              className="rounded-md p-1.5 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Clone rule"
                              onClick={() => openCloneModal(item)}
                              className="rounded-md p-1.5 text-cyan-600 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-900/40"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title={item.isActive ? "Deactivate" : "Activate"}
                              onClick={() => requestToggleActive(item)}
                              className={`rounded-md p-1.5 transition ${item.isActive ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/40" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40"}`}
                            >
                              {item.isActive ? (
                                <NoSymbolIcon className="h-4 w-4" />
                              ) : (
                                <ArrowUturnLeftIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                onNext={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              />
            </div>
          </main>
        </div>
      </div>

      <RuleModal
        open={isModalOpen}
        mode={modalMode}
        initialValues={editingRule}
        onClose={() => setModalOpen(false)}
        onSave={onSaveRule}
        findConflicts={findConflicts}
        helpers={helpers}
        services={services}
        providerGroups={providerGroups}
        activities={activities}
        exceptionRules={exceptionRules}
        roles={roles}
        states={states}
        districts={districts}
        departments={departments}
        serviceTypes={serviceTypes}
        isSaving={isSaving}       
        setIsSaving={setIsSaving}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        setIsOpen={setConfirmOpen}
        onConfirm={confirmToggleActive}
        title={
          ruleToToggle?.isActive
            ? "Deactivate Routing Rule"
            : "Activate Routing Rule"
        }
        message={`Are you sure you want to ${ruleToToggle?.isActive ? "deactivate" : "activate"} ${ruleToToggle?.routingId || "this rule"}?`}
        iconType={ruleToToggle?.isActive ? "warning" : "info"}
        confirmText={ruleToToggle?.isActive ? "Deactivate" : "Activate"}
      />
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}

function FilterInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
    </label>
  );
}
