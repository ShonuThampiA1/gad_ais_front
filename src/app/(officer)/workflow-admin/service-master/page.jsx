"use client";

import { useState, useEffect, useCallback, useMemo
 } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/apiClient";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
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

function ServiceModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  duplicateCodeExists,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
  }, [initialValues, open]);

  if (!open) return null;

  const validate = () => {
  const nextErrors = {};
  const code = form.serviceCode?.trim().toUpperCase() || "";

  if (mode === "edit" && !code) {
    nextErrors.serviceCode = "Service Code is required.";
  }
  if (!form.serviceName?.trim()) {
    nextErrors.serviceName = "Service Name is mandatory.";
  }
  if (!form.categoryCode?.trim()) {
    nextErrors.categoryCode = "Category Code is required.";
  }
  if (!form.categoryName?.trim()) {
    nextErrors.categoryName = "Category Name is required.";
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload =
  mode === "add"
    ? {
        service_name: form.serviceName.trim(),
        service_category_code: form.categoryCode.trim().toUpperCase(),
        service_category_name: form.categoryName.trim(),
        is_active: form.isActive,
      }
    : {
        service_name: form.serviceName.trim(),
        service_category_code: form.categoryCode.trim().toUpperCase(),
        service_category_name: form.categoryName.trim(),
        is_active: form.isActive,
      };

      await onSave(payload, form.serviceCode);   // form.serviceCode will be null for Add
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white">
            {mode === "add" ? "Add Service" : "Edit Service"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Service Code - hidden in add mode */}
{mode === "edit" && (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
      Service Code
    </label>

    <input
      type="text"
      value={form.serviceCode || ""}
      disabled
      className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
    />

    {errors.serviceCode && (
      <p className="mt-1 text-xs text-red-600">
        {errors.serviceCode}
      </p>
    )}
  </div>
)}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.serviceName}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Service Name"
                disabled={loading}
              />
              {errors.serviceName && <p className="mt-1 text-xs text-red-600">{errors.serviceName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Category Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.categoryCode}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryCode: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="CAT-ER"
                disabled={loading}
              />
              {errors.categoryCode && <p className="mt-1 text-xs text-red-600">{errors.categoryCode}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.categoryName}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryName: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="ER Services"
                disabled={loading}
              />
              {errors.categoryName && <p className="mt-1 text-xs text-red-600">{errors.categoryName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Active
              </label>
              <select
                value={form.isActive ? "yes" : "no"}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "yes" }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                disabled={loading}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-70"
            >
              {loading ? "Saving..." : mode === "add" ? "Add Service" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServiceMasterPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingService, setEditingService] = useState(null);
  const [serviceToToggle, setServiceToToggle] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 30;

  // ==================== FETCH SERVICES ====================
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/workflow/service-all`);

      const mapped = response.data.data.services.map((s) => ({
        // id: s.service_id,
        serviceCode: s.service_code,
        serviceName: s.service_name,
        categoryCode: s.service_category_code,
        categoryName: s.service_category_name,
        isActive: s.is_active ?? true,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

      setServices(mapped);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  // ==================== CATEGORIES FOR FILTER ====================
  const categories = useMemo(() => {
    return [...new Set(services.map((item) => item.categoryName))].sort();
  }, [services]);

  // ==================== FILTERED & PAGINATED DATA ====================
  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const searchMatch = `${service.serviceCode} ${service.serviceName} ${service.categoryCode} ${service.categoryName}`
        .toLowerCase()
        .includes(q);

      const categoryMatch = !categoryFilter || service.categoryName === categoryFilter;
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && service.isActive) ||
        (statusFilter === "inactive" && !service.isActive);

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const duplicateCodeExists = (serviceCode, ignoreId = null) =>
    services.some(
      (item) => item.serviceCode.toLowerCase() === serviceCode.toLowerCase() && item.id !== ignoreId
    );

  // ==================== SAVE (Add / Edit) ====================
  const handleSaveService = async (payload, serviceCode = null) => {
  try {
    if (serviceCode) {
      // UPDATE → use service_code in URL
      await axiosInstance.put(
        `/workflow/service/${serviceCode}`,
        payload
      );
      toast.success("Service updated successfully");
    } else {
      // CREATE
      await axiosInstance.post("/workflow/service", payload);
      toast.success("Service added successfully");
    }

    fetchServices();
  } catch (error) {
    console.error("Save error:", error);
    const msg = error.response?.data?.detail || "Something went wrong";
    toast.error(msg);
    throw error; // prevents modal close
  }
};

  // ==================== TOGGLE STATUS ====================
 const toggleServiceStatus = async (service) => {
  try {
    await axiosInstance.put(`/workflow/service/${service.serviceCode}`, {   // ← Use serviceCode here
      service_code: service.serviceCode,
      service_name: service.serviceName,
      service_category_code: service.categoryCode,
      service_category_name: service.categoryName,
      is_active: !service.isActive,
    });

    toast.success(`Service ${!service.isActive ? "activated" : "deactivated"} successfully`);
    fetchServices();
  } catch (error) {
    console.error("Toggle error:", error);
    toast.error("Failed to update service status");
  }
};

  const handleStatusClick = (service) => {
    setServiceToToggle(service);
    setConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (serviceToToggle) toggleServiceStatus(serviceToToggle);
    setConfirmOpen(false);
    setServiceToToggle(null);
  };

  // ==================== MODAL HANDLERS ====================
  const openAddModal = () => {
    setModalMode("add");
    setEditingService({
      id: null,
      serviceCode: null,
      serviceName: "",
      categoryCode: "",
      categoryName: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setModalMode("edit");
    setEditingService({
      id: service.id,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      categoryCode: service.categoryCode,
      categoryName: service.categoryName,
      isActive: service.isActive,
    });
    setModalOpen(true);
  };

  // ==================== EXPORT HANDLERS ====================
  const handleExportCSV = () => {
    const headers = ["Sl. No", "Service Code", "Service Name", "Category Code", "Category Name", "Active", "Created At", "Updated At"];
    const rows = filteredServices.map((service, index) => [
      index + 1,
      service.serviceCode,
      service.serviceName,
      service.categoryCode,
      service.categoryName,
      service.isActive ? "Yes" : "No",
      formatDateTime(service.createdAt),
      formatDateTime(service.updatedAt),
    ]);
    exportToCSV("service-master.csv", headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["Sl. No", "Service Code", "Service Name", "Category Code", "Category Name", "Active", "Created At", "Updated At"];
    const rows = filteredServices.map((service, index) => [
      index + 1,
      service.serviceCode,
      service.serviceName,
      service.categoryCode,
      service.categoryName,
      service.isActive ? "Yes" : "No",
      formatDateTime(service.createdAt),
      formatDateTime(service.updatedAt),
    ]);
    exportToPDF("Services Master", headers, rows, "service-master.pdf");
  };

  const handleExportExcel = () => {
    const rows = filteredServices.map((service, index) => ({
      "Sl. No": index + 1,
      "Service Code": service.serviceCode,
      "Service Name": service.serviceName,
      "Category Code": service.categoryCode,
      "Category Name": service.categoryName,
      "Active": service.isActive ? "Yes" : "No",
      "Created At": formatDateTime(service.createdAt),
      "Updated At": formatDateTime(service.updatedAt),
    }));
    exportToExcel("Services Master", rows, "service-master.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
          <WorkflowAdminSidebar />

          <main className="min-w-0">
            <div className="my-1 rounded-xl border bg-white p-3 pt-0 dark:border-gray-900 dark:bg-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-5 sm:px-3 dark:border-gray-900 dark:bg-gray-800">
                <div>
                  <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
                    Back
                  </button>
                  <h3 className="pt-5 text-base font-semibold uppercase text-indigo-700 dark:text-white">
                    Services Master
                  </h3>
                  <div className="mt-5 w-full md:w-96">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by service code / name / category"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md bg-indigo-700 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Add Service
                    <PlusIcon aria-hidden="true" className="-mr-0.5 size-5" />
                  </button>

                  <ExportButtons
                    onCSV={handleExportCSV}
                    onPDF={handleExportPDF}
                    onExcel={handleExportExcel}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 px-3 py-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-300">
                  Total: {filteredServices.length}
                </span>
              </div>

              {/* Table */}
              <div className="mx-auto w-full overflow-x-auto pb-1">
                {isLoading ? (
                  <div className="py-12 text-center text-slate-500">Loading services...</div>
                ) : (
                  <table className="min-w-[1200px] table-auto border-collapse text-left">
                    <thead className="text-sm text-gray-600">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Sl. No</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Service Code</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Service Name</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Category Code</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Category Name</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Active</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Created At</th>
                        <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Updated At</th>
                        <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedServices.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
                            No services found.
                          </td>
                        </tr>
                      ) : (
                        paginatedServices.map((service, index) => (
  <tr 
    key={service.serviceCode} 
    className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
  >
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{service.serviceCode}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{service.serviceName}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{service.categoryCode}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{service.categoryName}</td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${service.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                {service.isActive ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{formatDateTime(service.createdAt)}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{formatDateTime(service.updatedAt)}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(service)}
                                  className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-indigo-100"
                                >
                                  <PencilSquareIcon className="size-5 text-indigo-700" />
                                </button>

                                <button
                                  onClick={() => handleStatusClick(service)}
                                  className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold ring-1 ring-inset ${
                                    service.isActive
                                      ? "ring-rose-200 hover:bg-rose-100 text-rose-700"
                                      : "ring-emerald-200 hover:bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {service.isActive ? (
                                    <NoSymbolIcon className="size-5" />
                                  ) : (
                                    <ArrowUturnLeftIcon className="size-5" />
                                  )}
                                </button>
                              </div>
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
                onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Confirm Modal for Activate / Deactivate */}
      <ConfirmModal
        isOpen={confirmOpen}
        setIsOpen={setConfirmOpen}
        onConfirm={confirmToggleStatus}
        title={serviceToToggle?.isActive ? "Deactivate Service" : "Activate Service"}
        message={`Are you sure you want to ${serviceToToggle?.isActive ? "deactivate" : "activate"} "${serviceToToggle?.serviceName}"?`}
        iconType={serviceToToggle?.isActive ? "delete" : "success"}
        confirmText={serviceToToggle?.isActive ? "Deactivate" : "Activate"}
      />

      {/* Service Modal */}
      <ServiceModal
        open={isModalOpen}
        mode={modalMode}
        initialValues={editingService || { id: null, serviceCode: "", serviceName: "", categoryCode: "", categoryName: "", isActive: true }}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        duplicateCodeExists={duplicateCodeExists}
      />
    </div>
  );
}