"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axiosInstance from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "../../../components/dataTableControls";
import WorkflowAdminSidebar from "../components/WorkflowAdminSidebar";

const FIELD_OPTIONS = [
  "serviceCode",
  "role",
  "district",
  "status",
  "amount",
  "providerGroup",
];
const OPERATOR_OPTIONS = ["=", "!=", ">", "<", "IN", "BETWEEN"];
const LOGIC_OPTIONS = ["AND", "OR"];

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

function prettyJson(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return typeof value === "string" ? value : JSON.stringify(value);
  }
}

function getInitialConditions(rule) {
  if (
    rule?.conditionJson?.conditions &&
    Array.isArray(rule.conditionJson.conditions)
  ) {
    return rule.conditionJson.conditions.map((item) => ({
      field: item.field || FIELD_OPTIONS[0],
      operator: item.operator || "=",
      value: item.value || "",
      logic: item.logic || "AND",
    }));
  }
 return [
  {
    field: "",
    operator: "=",
    value: "",
    logic: "AND",
  },];
}

function ExceptionRuleModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  duplicateCodeExists,
}) {
  const [form, setForm] = useState(initialValues);
  const [editorMode, setEditorMode] = useState("basic");
  const [jsonText, setJsonText] = useState("");
  const [conditions, setConditions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialValues);
    setJsonText(prettyJson(initialValues?.conditionJson || { conditions: [] }));
    setConditions(getInitialConditions(initialValues));
    setEditorMode("basic");
    setErrors({});
  }, [initialValues, open]);

  if (!open) return null;

  const buildJsonFromConditions = () => ({
    conditions: conditions.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
      logic: item.logic,
    })),
  });

  const validate = () => {
    const nextErrors = {};
    const code = form.exceptionRuleCode?.trim().toUpperCase() || "";

    // Validate only in edit mode
    if (mode === "edit") {
      if (!code) {
        nextErrors.exceptionRuleCode = "Exception Rule Code is required.";
      }
    }
    if (mode === "add") {
      if (code && duplicateCodeExists(code)) {
        nextErrors.exceptionRuleCode = "Exception Rule Code must be unique.";
      }
    }
    if (!form.description.trim())
      nextErrors.description = "Description is required.";

    if (editorMode === "basic") {
      const hasInvalid = conditions.some(
        (item) => !item.field || !item.operator || !item.value,
      );
      if (hasInvalid)
        nextErrors.conditionJson = "Complete all basic conditions before save.";
    } else {
      try {
        JSON.parse(jsonText);
      } catch {
        nextErrors.conditionJson = "Condition JSON is invalid.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePrettyFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrors((prev) => ({ ...prev, conditionJson: "" }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        conditionJson: "Cannot pretty format invalid JSON.",
      }));
    }
  };

  const addCondition = () => {
  setConditions((prev) => [
    ...prev,
    {
      field: "",
      operator: "=",
      value: "",
      logic: "AND",
    },
  ]);
};

  const removeCondition = (idx) => {
    setConditions((prev) => prev.filter((_, index) => index !== idx));
  };

  const updateCondition = (idx, key, value) => {
    setConditions((prev) =>
      prev.map((item, index) =>
        index === idx ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const conditionJson =
      editorMode === "basic" ? buildJsonFromConditions() : JSON.parse(jsonText);

    onSave({
      ...form,
      exceptionRuleCode: form.exceptionRuleCode.trim().toUpperCase(),
      description: form.description.trim(),
      conditionJson,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white">
            {mode === "add" ? "Add Exception Rule" : "Edit Exception Rule"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Exception Rule Code - hidden in add mode, disabled in edit mode */}
            {mode === "edit" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Exception Rule Code
                </label>
                <input
                  type="text"
                  value={form.exceptionRuleCode || ""}
                  disabled
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                />
                {errors.exceptionRuleCode && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.exceptionRuleCode}
                  </p>
                )}
              </div>
            )}

            <div className={mode === "add" ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Description
              </label>
              <input
                type="text"
                value={form.description || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Rule description"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorMode("basic")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  editorMode === "basic"
                    ? "bg-indigo-700 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                Basic Rule Builder
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("json")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  editorMode === "json"
                    ? "bg-indigo-700 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                JSON Editor
              </button>
            </div>

            {editorMode === "basic" ? (
              <div className="space-y-3">
                {conditions.map((condition, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 sm:grid-cols-12"
                  >
                    <input
                      type="text"
                      value={condition.field}
                      onChange={(e) =>
                        updateCondition(idx, "field", e.target.value)
                      }
                      placeholder="Enter field name"
                      className="sm:col-span-3 rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />

                    <select
                      value={condition.operator}
                      onChange={(e) =>
                        updateCondition(idx, "operator", e.target.value)
                      }
                      className="sm:col-span-2 rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    >
                      {OPERATOR_OPTIONS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>

                    <input
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(idx, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="sm:col-span-4 rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />

                    <select
                      value={condition.logic}
                      onChange={(e) =>
                        updateCondition(idx, "logic", e.target.value)
                      }
                      className="sm:col-span-2 rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    >
                      {LOGIC_OPTIONS.map((logic) => (
                        <option key={logic} value={logic}>
                          {logic}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeCondition(idx)}
                      className="sm:col-span-1 rounded-md bg-rose-100 px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCondition}
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
                >
                  Add Condition
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="h-56 w-full rounded-md border border-slate-300 p-3 font-mono text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handlePrettyFormat}
                    className="rounded-md bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
                  >
                    Pretty Format JSON
                  </button>
                </div>
              </div>
            )}

            {errors.conditionJson && (
              <p className="mt-2 text-xs text-red-600">
                {errors.conditionJson}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-70"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                  ? "Add Exception Rule"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExceptionRulesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingRule, setEditingRule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchExceptionRules();
  }, []);

  const fetchExceptionRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/workflow/exception-rules");
      const data = response.data?.data?.exception_rules || [];
      setRules(
        data.map((item) => ({
          id: item.id, // use backend's real id
          exceptionRuleCode: item.exception_rule_code,
          description: item.description,
          conditionJson: item.condition_json,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch exception rules:", error);
      toast.error("Failed to load exception rules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredRules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rules.filter((rule) =>
      `${rule.exceptionRuleCode} ${rule.description}`.toLowerCase().includes(q),
    );
  }, [rules, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRules.length / itemsPerPage),
  );
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const duplicateCodeExists = (ruleCode, ignoreId = null) =>
    rules.some(
      (item) =>
        item.exceptionRuleCode.trim().toLowerCase() ===
          ruleCode.trim().toLowerCase() && item.id !== ignoreId,
    );

  const openAddModal = () => {
    setModalMode("add");
    setEditingRule({
      id: null,
      exceptionRuleCode: "",
      description: "",
      conditionJson: { conditions: [] },
    });
    setModalOpen(true);
  };

  const openEditModal = (rule) => {
    setModalMode("edit");
    setEditingRule({ ...rule });
    setModalOpen(true);
  };

  const handleSaveRule = async (payload) => {
    setIsSaving(true);
    try {
      if (modalMode === "add") {
        // POST - create new rule
        await axiosInstance.post("/workflow/exception-rule", {
          description: payload.description,
          condition_json: payload.conditionJson,
        });
        toast.success("Exception rule created successfully");
      } else {
        // PUT - update existing rule (using exceptionRuleCode as path param)
        await axiosInstance.put(
          `/workflow/exception-rule/${payload.exceptionRuleCode}`,
          {
            // Note: exception_rule_code is usually not sent in body for update
            description: payload.description,
            condition_json: payload.conditionJson,
          },
        );
        toast.success("Exception rule updated successfully");
      }
      // Refresh the list from backend
      await fetchExceptionRules();
      setModalOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error("Save failed:", error);
      const errorMsg = error.response?.data?.message || "Save failed";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Sl. No",
      "Exception Rule Code",
      "Description",
      "Condition JSON preview",
      "Created At",
    ];
    const rows = filteredRules.map((item, index) => [
      index + 1,
      item.exceptionRuleCode,
      item.description,
      JSON.stringify(item.conditionJson),
      formatDateTime(item.createdAt),
    ]);
    exportToCSV("exception-rules.csv", headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      "Sl. No",
      "Exception Rule Code",
      "Description",
      "Condition JSON preview",
      "Created At",
    ];
    const rows = filteredRules.map((item, index) => [
      index + 1,
      item.exceptionRuleCode,
      item.description,
      JSON.stringify(item.conditionJson),
      formatDateTime(item.createdAt),
    ]);
    exportToPDF("Exception Rules", headers, rows, "exception-rules.pdf");
  };

  const handleExportExcel = () => {
    const rows = filteredRules.map((item, index) => ({
      "Sl. No": index + 1,
      "Exception Rule Code": item.exceptionRuleCode,
      Description: item.description,
      "Condition JSON preview": JSON.stringify(item.conditionJson),
      "Created At": formatDateTime(item.createdAt),
    }));
    exportToExcel("Exception Rules", rows, "exception-rules.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
          <WorkflowAdminSidebar />
          <main className="min-w-0">
            <div className="my-1 rounded-xl border bg-white p-3 pt-0 dark:border-gray-900 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-5 sm:px-3 dark:border-gray-900 dark:bg-gray-800">
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
                    Exception Rules
                  </h3>
                  <div className="mt-5 w-full md:w-96">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by rule code / description"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md bg-indigo-700 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    onClick={openAddModal}
                  >
                    Add Exception Rule
                    <PlusIcon aria-hidden="true" className="-mr-0.5 size-5" />
                  </button>

                  <ExportButtons
                    onCSV={handleExportCSV}
                    onPDF={handleExportPDF}
                    onExcel={handleExportExcel}
                  />
                </div>
              </div>

              <div className="px-3 py-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                  Total: {filteredRules.length}
                </span>
              </div>

              <div className="mx-auto w-full overflow-x-auto pb-1">
                <table className="min-w-[1100px] table-auto border-collapse text-left">
                  <thead className="text-sm text-gray-600">
                    <tr>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Sl. No
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Exception Rule Code
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Condition JSON preview
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Created At
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
                          colSpan={6}
                          className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                        >
                          No exception rules found.
                        </td>
                      </tr>
                    )}
                    {paginatedRules.map((item, index) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                      >
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.exceptionRuleCode}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.description}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                          <pre className="max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {JSON.stringify(item.conditionJson)}
                          </pre>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <div className="group relative">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-indigo-100"
                                onClick={() => openEditModal(item)}
                              >
                                <PencilSquareIcon className="size-5 text-indigo-700" />
                              </button>
                              <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                                Edit
                              </span>
                            </div>
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
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                onNext={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            </div>

            <ExceptionRuleModal
              open={isModalOpen}
              mode={modalMode}
              initialValues={
                editingRule || {
                  id: null,
                  exceptionRuleCode: "",
                  description: "",
                  conditionJson: { conditions: [] },
                }
              }
              onClose={() => {
                setModalOpen(false);
                setEditingRule(null);
              }}
              onSave={handleSaveRule}
              duplicateCodeExists={duplicateCodeExists}
              isSubmitting={isSaving} // <-- add this prop
            />
          </main>
        </div>
      </div>
    </div>
  );
}
