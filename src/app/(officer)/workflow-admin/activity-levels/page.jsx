"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import axiosInstance from "@/utils/apiClient";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from 'react-toastify';
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "../../../components/dataTableControls";
import WorkflowAdminSidebar from "../components/WorkflowAdminSidebar";



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

// ==================== ACTIVITY MODAL ====================
function ActivityModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  duplicateCodeExists,
}) {
  const [form, setForm] = useState({
  activityCode: "",
  activityName: "",
  sequenceNo: "",
  isTerminal: false,
});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  if (open) {
    setForm({
      activityCode: initialValues?.activityCode ?? "",
      activityName: initialValues?.activityName ?? "",
      sequenceNo: initialValues?.sequenceNo ?? "",
      isTerminal: initialValues?.isTerminal ?? false,
    });
    setErrors({});
  }
}, [initialValues, open]);

  if (!open) return null;

  const validate = () => {
  const nextErrors = {};
  const name = form.activityName?.trim() || "";
  const sequence = Number(form.sequenceNo);

  if (mode === "edit") {
    const code = form.activityCode?.trim().toUpperCase() || "";

    if (!code) {
      nextErrors.activityCode = "Activity Code is required.";
    } else if (duplicateCodeExists(code, initialValues?.activityCode)) {
      nextErrors.activityCode = "Activity Code must be unique.";
    }
  }

  if (!name) nextErrors.activityName = "Activity Name is required.";

  if (!form.sequenceNo && form.sequenceNo !== 0) {
    nextErrors.sequenceNo = "Sequence No is required.";
  } else if (!Number.isInteger(sequence) || sequence <= 0) {
    nextErrors.sequenceNo = "Sequence No must be a positive integer.";
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        // activity_code: form.activityCode.trim().toUpperCase(),
        activity_name: form.activityName.trim(),
        sequence_no: Number(form.sequenceNo),
        is_terminal: form.isTerminal,
      };

      const success = await onSave(
  payload,
  mode === "edit" ? form.activityCode : null
);

if (success) {
  onClose();
}
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white">
            {mode === "add" ? "Add Activity Level" : "Edit Activity Level"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "edit" && (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
      Activity Code
    </label>
    <input
      type="text"
      value={form.activityCode}
      disabled
      className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:bg-slate-700"
    />
  </div>
)}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Activity Name
              </label>
              <input
                type="text"
                value={form.activityName}
                onChange={(e) => setForm((prev) => ({ ...prev, activityName: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Activity Name"
              />
              {errors.activityName && <p className="mt-1 text-xs text-red-600">{errors.activityName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Sequence No
              </label>
              <input
                type="number"
                min={1}
                value={form.sequenceNo}
                onChange={(e) => setForm((prev) => ({ ...prev, sequenceNo: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="1"
              />
              {errors.sequenceNo && <p className="mt-1 text-xs text-red-600">{errors.sequenceNo}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Terminal Stage
              </label>
              <select
                value={form.isTerminal ? "yes" : "no"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isTerminal: e.target.value === "yes" }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
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
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {loading ? "Saving..." : mode === "add" ? "Add Activity" : "Update Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ==================== MAIN PAGE ====================

export default function ActivityLevelsPage() {
  const router = useRouter();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [terminalFilter, setTerminalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingActivity, setEditingActivity] = useState(null);

  const itemsPerPage = 30;


  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/workflow/activity-level");
      const data = response.data?.data?.activity_levels || [];
      
      setActivities(data.map(item => ({
        // id: item.activity_id || item.id,
        activityCode: item.activity_code,
        activityName: item.activity_name,
        sequenceNo: item.sequence_no,
        isTerminal: item.is_terminal,
        createdAt: item.created_at || item.registered_on,
        updatedAt: item.updated_at,
      })));
    } catch (error) {
      console.error("Failed to fetch activity levels:", error);
      toast.error("Failed to load activity levels");
    } finally {
      setIsLoading(false);
    }
  }, []);

useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, terminalFilter]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => a.sequenceNo - b.sequenceNo);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return sortedActivities.filter((activity) => {
      const matchesSearch = 
        `${activity.activityCode} ${activity.activityName} ${activity.sequenceNo}`
          .toLowerCase()
          .includes(q);

      const matchesTerminal =
        terminalFilter === "all" ||
        (terminalFilter === "terminal" && activity.isTerminal) ||
        (terminalFilter === "non-terminal" && !activity.isTerminal);

      return matchesSearch && matchesTerminal;
    });
  }, [sortedActivities, searchTerm, terminalFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / itemsPerPage));
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const duplicateCodeExists = useCallback((activityCode, ignoreId = null) => {
    return activities.some(
      (item) =>
        item.activityCode.toLowerCase() === activityCode.toLowerCase() &&
        item.activityCode !== ignoreId
    );
  }, [activities]);

  
  // ==================== SAVE (Add / Edit) ====================
  const handleSaveActivity = async (payload, activityCodeForEdit = null) => {
  try {
    if (activityCodeForEdit) {
      await axiosInstance.put(
        `/workflow/activity-level/${activityCodeForEdit}`,
        payload
      );
      toast.success("Activity level updated successfully");
    } else {
      await axiosInstance.post(
        "/workflow/activity-level",
        payload
      );
      toast.success("Activity level created successfully");
    }

    await fetchActivities();

    return true;
  } catch (error) {
    const msg =
      error.response?.data?.detail ||
      "Something went wrong";

    toast.error(msg);
    throw error;
  }
};
// ==================== MODAL HANDLERS ====================
  const openAddModal = () => {
    setModalMode("add");
    setEditingActivity({
      // id: null,
      activityCode: "",
      activityName: "",
      sequenceNo: "",
      isTerminal: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (activity) => {
  setModalMode("edit");
  setEditingActivity({
    activityCode: activity.activityCode,
    activityName: activity.activityName,
    sequenceNo: activity.sequenceNo,
    isTerminal: activity.isTerminal,
  });
  setModalOpen(true);
  };
// ==================== EXPORT HANDLERS ====================
 const handleExportCSV = () => {
    const headers = ["Sl. No", "Activity Code", "Activity Name", "Sequence No", "Terminal Stage", "Created At", "Updated At"];
    const rows = filteredActivities.map((activity, index) => [
      index + 1,
      activity.activityCode,
      activity.activityName,
      activity.sequenceNo,
      activity.isTerminal ? "Yes" : "No",
      formatDateTime(activity.createdAt),
      formatDateTime(activity.updatedAt),
    ]);
    exportToCSV("activity-levels.csv", headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["Sl. No", "Activity Code", "Activity Name", "Sequence No", "Terminal Stage", "Created At", "Updated At"];
    const rows = filteredActivities.map((activity, index) => [
      index + 1,
      activity.activityCode,
      activity.activityName,
      activity.sequenceNo,
      activity.isTerminal ? "Yes" : "No",
      formatDateTime(activity.createdAt),
      formatDateTime(activity.updatedAt),
    ]);
    exportToPDF("Activity Levels", headers, rows, "activity-levels.pdf");
  };

  const handleExportExcel = () => {
    const rows = filteredActivities.map((activity, index) => ({
      "Sl. No": index + 1,
      "Activity Code": activity.activityCode,
      "Activity Name": activity.activityName,
      "Sequence No": activity.sequenceNo,
      "Terminal Stage": activity.isTerminal ? "Yes" : "No",
      "Created At": formatDateTime(activity.createdAt),
      "Updated At": formatDateTime(activity.updatedAt),
    }));
    exportToExcel("Activity Levels", rows, "activity-levels.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
          <WorkflowAdminSidebar />

          <main className="min-w-0">
            <div className="rounded-xl border bg-white dark:border-gray-900 dark:bg-gray-800">
              {/* Header */}
              <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    onClick={() => router.back()}
                    className="group mb-4 flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    Back
                  </button>
                  <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Activity Levels</h1>
                </div>

                <div className="flex flex-col items-end gap-3 sm:flex-row">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <PlusIcon className="size-5" />
                    Add Activity
                  </button>

                  <ExportButtons
                    onCSV={handleExportCSV}
                    onPDF={handleExportPDF}
                    onExcel={handleExportExcel}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by activity code / name / sequence"
                />

                <select
                  value={terminalFilter}
                  onChange={(e) => setTerminalFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="all">All Stages</option>
                  <option value="terminal">Terminal Only</option>
                  <option value="non-terminal">Non-Terminal Only</option>
                </select>

                <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                  {filteredActivities.length} activities
                </span>
              </div>

              {/* Visual Workflow */}
              {sortedActivities.length > 0 && (
                <div className="mx-5 my-6 overflow-x-auto rounded-xl border bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex min-w-max items-center gap-3">
                    {sortedActivities.map((stage, index) => (
                      <div key={stage.activityCode} className="flex items-center gap-3">
                        <div
                          className={`w-60 rounded-xl border p-4 transition-all ${
                            stage.isTerminal
                              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                              : "border-slate-200 bg-white dark:bg-slate-800"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              #{stage.sequenceNo}
                            </span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                                stage.isTerminal
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                              }`}
                            >
                              {stage.isTerminal ? "Terminal" : "Stage"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {stage.activityCode}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                            {stage.activityName}
                          </p>
                        </div>
                        {index < sortedActivities.length - 1 && (
                          <span className="text-3xl font-light text-slate-300 dark:text-slate-600">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto px-5 pb-6">
                {isLoading ? (
                  <div className="py-20 text-center text-slate-500">Loading activity levels...</div>
                ) : (
                  <table className="min-w-full table-auto border-collapse text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Sl. No</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Activity Code</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Activity Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Sequence No</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">Terminal</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Created At</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Updated At</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {paginatedActivities.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-slate-500">
                            No activity levels found.
                          </td>
                        </tr>
                      ) : (
                        paginatedActivities.map((activity, idx) => (
                          <tr key={activity.activityCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-4">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                            <td className="px-4 py-4 font-medium">{activity.activityCode}</td>
                            <td className="px-4 py-4">{activity.activityName}</td>
                            <td className="px-4 py-4">{activity.sequenceNo}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activity.isTerminal ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                                {activity.isTerminal ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(activity.createdAt)}</td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(activity.updatedAt)}</td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => openEditModal(activity)}
                                className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                              >
                                <PencilSquareIcon className="size-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        open={isModalOpen}
        mode={modalMode}
        initialValues={editingActivity}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        duplicateCodeExists={duplicateCodeExists}
      />
    </div>
  );
}
