"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/apiClient";
import { toast } from 'react-toastify';
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

function ProviderGroupModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  roles,
  statesList,
  districtsList,
  departmentsList,
  duplicateCodeExists,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Filter districts based on selected state
  const filteredDistricts = useMemo(() => {
    if (!form.state) return [];
    return districtsList.filter(
      (district) => district.state_name === form.state,
    );
  }, [form.state, districtsList]);

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
  }, [initialValues, open]);

  if (!open) return null;

  const validate = () => {
    const nextErrors = {};

    if (!form.departmentCode?.trim())
      nextErrors.departmentCode = "Department Code is required.";

    if (!form.departmentName?.trim())
      nextErrors.departmentName = "Department Name is required.";

    if (!form.location?.trim())
      nextErrors.location = "Location Name is required.";

    if (!form.district?.trim())
      nextErrors.district = "District Name is required.";

    if (!form.state?.trim()) nextErrors.state = "State Name is required.";

    if (!form.role_id) {
      nextErrors.role_id = "Role is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      departmentCode: form.departmentCode.trim().toUpperCase(),
      departmentName: form.departmentName.trim(),
      location: form.location.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      role_id: form.role_id,
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white">
            {mode === "add" ? "Add Provider Group" : "Edit Provider Group"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Department Code
              </label>
              <input
                type="text"
                value={form.departmentCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    departmentCode: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="DEPT01"
              />
              {errors.departmentCode && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.departmentCode}
                </p>
              )}
            </div>

            <div>
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
    Department Name
  </label>

  <select
    value={form.departmentName || ""}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        departmentName: e.target.value,
      }))
    }
    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
  >
    <option value="">Select Department</option>

    {departmentsList.map((department) => (
      <option
        key={department.department_id || department.id}
        value={department.administrative_department}
      >
        {department.administrative_department}
      </option>
    ))}
  </select>

  {errors.departmentName && (
    <p className="mt-1 text-xs text-red-600">
      {errors.departmentName}
    </p>
  )}
</div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Location Name
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Secretariat"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            {/* State Dropdown - from master */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                State Name
              </label>
              <select
                value={form.state}
                onChange={(e) => {
                  const newState = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    state: newState,
                    district: "", // reset district when state changes
                  }));
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select State</option>
                {statesList.map((stateObj) => (
                  <option key={stateObj.state_id} value={stateObj.state}>
                    {stateObj.state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-xs text-red-600">{errors.state}</p>
              )}
            </div>

            {/* District Dropdown - filtered by selected state */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                District Name
              </label>
              <select
                value={form.district}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, district: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                disabled={!form.state}
              >
                <option value="">
                  {!form.state ? "Select a state first" : "Select District"}
                </option>
                {filteredDistricts.map((district) => (
                  <option
                    key={district.district_name}
                    value={district.district_name}
                  >
                    {district.district_name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-xs text-red-600">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Role
              </label>
              <select
                value={form.role_id || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role_id: e.target.value ? Number(e.target.value) : "",
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="mt-1 text-xs text-red-600">{errors.role_id}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Is Active
              </label>
              <select
                value={form.isActive ? "yes" : "no"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.value === "yes",
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              {mode === "add" ? "Add Provider Group" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProviderGroupsPage() {
  const router = useRouter();
  const [providerGroups, setProviderGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [rawDistricts, setRawDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsList, setDepartmentsList] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingGroup, setEditingGroup] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [groupToToggle, setGroupToToggle] = useState(null);

  const itemsPerPage = 30;

  useEffect(() => {
  fetchProviderGroups();
  fetchMasterData();
}, []);

  const fetchProviderGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/workflow/provider-group");
      const data = response.data?.data?.provider_groups || [];
      setProviderGroups(
        data.map((item) => ({
          id: item.id,
          providerGroupCode: item.provider_group_code,
          departmentCode: item.department_code,
          departmentName: item.department_name,
          location: item.location_name,
          district: item.district_name,
          state: item.state_name,
          isActive: item.is_active,
          role_id: item.role_id,
        })),
      );
    } catch (error) {
      console.error("Error fetching provider groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMasterData = async () => {
  try {
    const response = await axiosInstance.post("/masters/bulk", {
      masters: ["state", "district", "administrative_department"],
      include_inactive: false,
    });

     // ROLE MASTER API
    const roleResponse = await axiosInstance.get(
      "/masters/get-role-master",
    );
    console.log("MASTER RESPONSE:=======================", response.data);
    const data = response.data?.data || {};
    let statesArray = [];

    if (Array.isArray(data.state)) {
      statesArray = data.state;
    } else if (Array.isArray(data.states)) {
      statesArray = data.states;
    }
    setStatesList(statesArray);

    let districtsArray = [];

    if (Array.isArray(data.district)) {
      districtsArray = data.district;
    } else if (Array.isArray(data.districts)) {
      districtsArray = data.districts;
    }

    setRawDistricts(districtsArray);

    const departmentsArray = Array.isArray(data.administrative_department)
  ? data.administrative_department
  : [];

   setDepartmentsList(departmentsArray);
   const rolesArray =
      roleResponse.data?.data?.roles || [];

    setRoles(rolesArray);

  } catch (error) {
    console.error("Error fetching master data:", error);
    toast.error("Error fetching master data");

    setStatesList([]);
    setRawDistricts([]);
    setDepartmentsList([]);
    setRoles([]);
  }
};

  useEffect(() => {
    if (statesList.length === 0 || rawDistricts.length === 0) return;

    // Create a map from state_id → state name
    const stateMap = new Map();
    statesList.forEach((stateObj) => {
      stateMap.set(stateObj.state_id, stateObj.state);
    });

    const enriched = rawDistricts.map((d) => ({
      district_name: d.district,
      state_name: stateMap.get(d.state_id) || "",
      state_id: d.state_id,
    }));
    setDistrictsList(enriched);
  }, [statesList, rawDistricts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, districtFilter, stateFilter, statusFilter]);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(providerGroups.map((item) => item.departmentName)),
      ).sort(),
    [providerGroups],
  );
  const districts = useMemo(
    () =>
      Array.from(new Set(providerGroups.map((item) => item.district))).sort(),
    [providerGroups],
  );
  const states = useMemo(
    () => Array.from(new Set(providerGroups.map((item) => item.state))).sort(),
    [providerGroups],
  );

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.role_id === roleId);
    return role ? role.role : "—";
  };

  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return providerGroups.filter((item) => {
      const matchesSearch =
        `${item.providerGroupCode} ${item.departmentCode} ${item.departmentName} ${item.location} ${item.district} ${item.state}`
          .toLowerCase()
          .includes(q);

      const matchesDepartment =
        !departmentFilter || item.departmentName === departmentFilter;
      const matchesDistrict =
        !districtFilter || item.district === districtFilter;
      const matchesState = !stateFilter || item.state === stateFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesDistrict &&
        matchesState &&
        matchesStatus
      );
    });
  }, [
    providerGroups,
    searchTerm,
    departmentFilter,
    districtFilter,
    stateFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroups.length / itemsPerPage),
  );
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const duplicateCodeExists = (providerGroupCode, ignoreId = null) =>
    providerGroups.some(
      (item) =>
        item.providerGroupCode.trim().toLowerCase() ===
          providerGroupCode.trim().toLowerCase() && item.id !== ignoreId,
    );

  const openAddModal = () => {
    setModalMode("add");
    setEditingGroup({
      id: null,
      providerGroupCode: "",
      departmentCode: "",
      departmentName: "",
      location: "",
      district: "",
      state: "",
      role_id: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (group) => {
    setModalMode("edit");
    setEditingGroup({ ...group });
    setModalOpen(true);
  };

  const handleSaveGroup = async (payload) => {
  try {
    setIsLoading(true); // optional: show a loading spinner or disable buttons

    if (modalMode === "add") {
      // CREATE – no provider_group_code in body (auto-generated)
      const requestBody = {
        department_code: payload.departmentCode,
        department_name: payload.departmentName,
        location_name: payload.location,
        district_name: payload.district,
        state_name: payload.state,
        role_id: payload.role_id,
        is_active: payload.isActive,
      };
      await axiosInstance.post("/workflow/provider-group", requestBody);
      toast.success("Provider group created successfully");
    } else {
      // UPDATE – provider_group_code is required in the URL path
      const providerGroupCode = editingGroup?.providerGroupCode;
      if (!providerGroupCode) {
        console.error("No provider group code for update");
        return;
      }
      const requestBody = {
        department_code: payload.departmentCode,
        department_name: payload.departmentName,
        location_name: payload.location,
        district_name: payload.district,
        state_name: payload.state,
        role_id: payload.role_id,
        is_active: payload.isActive,
      };
      await axiosInstance.put(`/workflow/provider-group/${providerGroupCode}`, requestBody);
      toast.success("Provider group updated successfully");
    }

    // Refresh the list from the server after successful save
    await fetchProviderGroups();

    // Close modal and clear editing state
    setModalOpen(false);
    setEditingGroup(null);
  } catch (error) {
    console.error("Error saving provider group:", error);
    const errorMsg = error.response?.data?.message || "Failed to save provider group";
    alert(errorMsg); // or use a toast notification
  } finally {
    setIsLoading(false);
  }
};

  const handleStatusClick = (group) => {
    setGroupToToggle(group);
    setConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!groupToToggle) return;
    const nowIso = new Date().toISOString();
    setProviderGroups((prev) =>
      prev.map((item) =>
        item.id === groupToToggle.id
          ? { ...item, isActive: !item.isActive, updatedAt: nowIso }
          : item,
      ),
    );
    setGroupToToggle(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Sl. No",
      "Provider Group Code",
      "Department Code",
      "Department Name",
      "Location",
      "District",
      "State",
      "Role",
      "Active",
    ];
    const rows = filteredGroups.map((item, index) => [
      index + 1,
      item.providerGroupCode,
      item.departmentCode,
      item.departmentName,
      item.location,
      item.district,
      item.state,
      getRoleName(item.role_id),
      item.isActive ? "Yes" : "No",
    ]);
    exportToCSV("provider-groups.csv", headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      "Sl. No",
      "Provider Group Code",
      "Department Code",
      "Department Name",
      "Location",
      "District",
      "State",
      "Role",
      "Active",
    ];
    const rows = filteredGroups.map((item, index) => [
      index + 1,
      item.providerGroupCode,
      item.departmentCode,
      item.departmentName,
      item.location,
      item.district,
      item.state,
      getRoleName(item.role_id),
      item.isActive ? "Yes" : "No",
    ]);
    exportToPDF("Provider Groups", headers, rows, "provider-groups.pdf");
  };

  const handleExportExcel = () => {
    const rows = filteredGroups.map((item, index) => ({
      "Sl. No": index + 1,
      "Provider Group Code": item.providerGroupCode,
      "Department Code": item.departmentCode,
      "Department Name": item.departmentName,
      Location: item.location,
      District: item.district,
      State: item.state,
      Role: getRoleName(item.role_id),
      Active: item.isActive ? "Yes" : "No",
    }));
    exportToExcel("Provider Groups", rows, "provider-groups.xlsx");
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
                    Provider Groups
                  </h3>
                  <div className="mt-5 w-full md:w-96">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by code / name / department / location / district / state"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md bg-indigo-700 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    onClick={openAddModal}
                  >
                    Add Provider Group
                    <PlusIcon aria-hidden="true" className="-mr-0.5 size-5" />
                  </button>

                  <ExportButtons
                    onCSV={handleExportCSV}
                    onPDF={handleExportPDF}
                    onExcel={handleExportExcel}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 px-3 py-3">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All departments</option>
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All districts</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {/* ✅ CORRECT STATE FILTER (uses stateFilter, not form) */}
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All states</option>
                  {states.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-w-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-300">
                  Total: {filteredGroups.length}
                </span>
              </div>

              <div className="mx-auto w-full overflow-x-auto pb-1">
                <table className="min-w-[1300px] table-auto border-collapse text-left">
                  <thead className="text-sm text-gray-600">
                    <tr>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Sl. No
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Provider Group Code
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Department Code
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Department Name
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Location
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        District
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        State
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Active
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGroups.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                        >
                          No provider groups found.
                        </td>
                      </tr>
                    )}
                    {paginatedGroups.map((item, index) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                      >
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.providerGroupCode}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.departmentCode}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.departmentName}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.location}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.district}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {item.state}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                          {getRoleName(item.role_id)}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {item.isActive ? "Yes" : "No"}
                          </span>
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

                            {item.isActive ? (
                              <div className="group relative">
                                <button
                                  type="button"
                                  onClick={() => handleStatusClick(item)}
                                  className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-rose-200 hover:bg-rose-100"
                                >
                                  <NoSymbolIcon className="size-5 text-rose-700" />
                                </button>
                                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                                  Deactivate
                                </span>
                              </div>
                            ) : (
                              <div className="group relative">
                                <button
                                  type="button"
                                  onClick={() => handleStatusClick(item)}
                                  className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100"
                                >
                                  <ArrowUturnLeftIcon className="size-5 text-emerald-700" />
                                </button>
                                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                                  Activate
                                </span>
                              </div>
                            )}
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

            <ConfirmModal
              isOpen={confirmOpen}
              setIsOpen={(isOpen) => {
                setConfirmOpen(isOpen);
                if (!isOpen) setGroupToToggle(null);
              }}
              onConfirm={confirmToggleStatus}
              title={
                groupToToggle?.isActive
                  ? "Deactivate Provider Group"
                  : "Activate Provider Group"
              }
              message={
                groupToToggle?.isActive
                  ? `Are you sure you want to deactivate ${groupToToggle?.providerGroupCode || "this provider group"}?`
                  : `Are you sure you want to activate ${groupToToggle?.providerGroupCode || "this provider group"}?`
              }
              iconType={groupToToggle?.isActive ? "delete" : "success"}
              confirmText={groupToToggle?.isActive ? "Deactivate" : "Activate"}
            />

            <ProviderGroupModal
              open={isModalOpen}
              mode={modalMode}
              initialValues={
                editingGroup || {
                  id: null,
                  providerGroupCode: "",
                  departmentCode: "",
                  departmentName: "",
                  location: "",
                  district: "",
                  state: "",
                  role_id: "",
                  isActive: true,
                }
              }
              onClose={() => {
                setModalOpen(false);
                setEditingGroup(null);
              }}
              onSave={handleSaveGroup}
              roles={roles}
              statesList={statesList}
              districtsList={districtsList}
              departmentsList={departmentsList}
              duplicateCodeExists={duplicateCodeExists}
            />
          </main>
        </div>
      </div>
    </div>
  );
}