"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "@/utils/apiClient";
import { formatDateToDDMMYYYY } from "@/utils/dateFormat";
import { extractErrorMessage, getErrorMessage, getServiceTypeName } from "@/utils/serviceTypeUtils";

const EMPTY_SUSPENSION = {
  ais_sub_id: "",
  _temp_id: "",
  from_period: "",
  to_period: "",
  suspension_details: "",
  sus_order_number: "",
  suspension_document: null,
  fields: {
    from_period: "GAD_OFFICER",
    to_period: "GAD_OFFICER",
    suspension_details: "GAD_OFFICER",
    sus_order_number: "GAD_OFFICER",
    suspension_document: "GAD_OFFICER",
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const rawValue = String(dateString).trim();
  if (!rawValue) return "N/A";

  const datePart = rawValue.split(" ")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return formatDateToDDMMYYYY(datePart);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    return datePart;
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  const isoDate = [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");

  return formatDateToDDMMYYYY(isoDate);
};

const sortSuspensions = (records = []) =>
  [...records].sort((a, b) => {
    const aFrom = new Date(a.from_period || 0).getTime() || 0;
    const bFrom = new Date(b.from_period || 0).getTime() || 0;
    if (bFrom !== aFrom) return bFrom - aFrom;

    const aTo = new Date(a.to_period || 0).getTime() || 0;
    const bTo = new Date(b.to_period || 0).getTime() || 0;
    return bTo - aTo;
  });

const getDiff = (original = {}, edited = {}) => {
  const diff = {};
  Object.keys(edited).forEach((key) => {
    if (["_temp_id"].includes(key)) return;
    if (JSON.stringify(edited[key]) !== JSON.stringify(original[key])) {
      diff[key] = edited[key];
    }
  });
  return diff;
};

const DocumentViewer = ({ documentId, documentName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const fetchDocument = async () => {
      if (!documentId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/doc-uploader/get-document/${documentId}`, {
          responseType: "blob",
        });

        objectUrl = URL.createObjectURL(response.data);
        setDocumentUrl(objectUrl);
        setIsPdf(response.data.type.includes("pdf"));
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
          <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          <button onClick={onClose} className="w-full rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="truncate text-lg font-semibold text-gray-800">{documentName}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isPdf ? (
            <iframe src={documentUrl} className="min-h-[60vh] w-full border-0" title={documentName} />
          ) : (
            <div className="flex items-center justify-center">
              <img src={documentUrl} alt={documentName} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentDisplay = ({ documentId, label }) => {
  const [open, setOpen] = useState(false);

  if (!documentId) {
    return (
      <button
        type="button"
        disabled
        title="No document"
        aria-label="No document"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 ring-1 ring-gray-200"
      >
        <DocumentTextIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View document"
        aria-label="View document"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50"
      >
        <DocumentTextIcon className="h-4 w-4" />
      </button>
      {open ? (
        <DocumentViewer documentId={documentId} documentName={label} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
};

const InputField = ({ label, type = "text", value, onChange, error, min, max }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        className={`w-full rounded-lg border p-3 text-sm text-gray-900 ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`w-full rounded-lg border p-3 text-sm text-gray-900 ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
      />
    )}
    {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
  </div>
);

const SummaryField = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
    <p className="mt-1 break-all text-sm font-medium leading-6 text-gray-900">{value || "N/A"}</p>
  </div>
);

const InfoNote = ({ message }) => (
  <div
    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800"
    title={message}
  >
    {message}
  </div>
);

const OverviewMetric = ({ label, value, accent = "indigo" }) => {
  const accentClasses = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  return (
    <div className={`rounded-2xl px-4 py-4 ring-1 ${accentClasses[accent] || accentClasses.indigo}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold leading-tight">{value || "N/A"}</p>
    </div>
  );
};

const RecordField = ({ label, value, fullWidth = false, emphasis = false }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
    <p className={`mt-1 whitespace-pre-wrap break-words leading-6 ${emphasis ? "text-[15px] font-semibold text-gray-900" : "text-sm font-medium text-gray-800"}`}>
      {value || "N/A"}
    </p>
  </div>
);

const SuspensionModal = ({
  open,
  formData,
  errors,
  joiningDate,
  saving,
  onClose,
  onChange,
  onFileChange,
  onSave,
  isEditing,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Disciplinary Action" : "Add Disciplinary Action"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="From Period *"
              type="date"
              value={formData.from_period || ""}
              onChange={(e) => onChange("from_period", e.target.value)}
              min={joiningDate}
              max="2100-12-31"
              error={errors.from_period}
            />
            <InputField
              label="To Period *"
              type="date"
              value={formData.to_period || ""}
              onChange={(e) => onChange("to_period", e.target.value)}
              min={formData.from_period || joiningDate}
              max="2100-12-31"
              error={errors.to_period}
            />
            <div className="md:col-span-2">
              <InputField
                label="Disciplinary Details *"
                type="textarea"
                value={formData.suspension_details || ""}
                onChange={(e) => onChange("suspension_details", e.target.value)}
                error={errors.suspension_details}
              />
            </div>
            <InputField
              label="Order Number *"
              value={formData.sus_order_number || ""}
              onChange={(e) => onChange("sus_order_number", e.target.value)}
              error={errors.sus_order_number}
            />
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Disciplinary Order Document</label>
              <div className="space-y-2">
                {formData.suspension_document ? (
                  <DocumentDisplay documentId={formData.suspension_document} label="Disciplinary Order" />
                ) : (
                  <p className="text-sm text-gray-400">No document uploaded</p>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => onFileChange(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500">Allowed types: PDF, JPG, JPEG, PNG. Max size: 5MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OfficialDisciplinaryActionDetailPage() {
  const router = useRouter();
  const savingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officerData, setOfficerData] = useState(null);
  const [originalSuspensions, setOriginalSuspensions] = useState([]);
  const [editedSuspensions, setEditedSuspensions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalErrors, setModalErrors] = useState({});
  const [modalForm, setModalForm] = useState(EMPTY_SUSPENSION);

  const officerInfo = officerData?.ais_officer_info || {};
  const joiningDate = officerInfo?.date_of_joining?.split("T")[0] || "";

  useEffect(() => {
    sessionStorage.setItem("onboarding_active_nav", "Disciplinary Action");
  }, []);

  useEffect(() => {
    const fetchOfficerData = async () => {
      const aisPerId = sessionStorage.getItem("officialDisciplinaryActionProfileId");

      if (!aisPerId) {
        setError("No profile selected");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/as-II/officer-preview", { ais_per_id: aisPerId });
        const data = response.data.data?.officer_data;

        if (!data) {
          throw new Error("Failed to fetch officer data");
        }

        const suspensions = sortSuspensions(data.ais_suspension_info || []);
        setOfficerData(data);
        setOriginalSuspensions(suspensions);
        setEditedSuspensions(suspensions);
      } catch (err) {
        console.error("Error fetching disciplinary action data:", err);
        setError(extractErrorMessage(err) || err.message || "Failed to fetch officer data");
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerData();
  }, []);

  const officerSummary = useMemo(() => {
    const resolvedName = `${officerInfo.first_name || ""} ${officerInfo.last_name || ""}`.trim();
    return {
      fullName: resolvedName || "N/A",
      missingName: !resolvedName,
      penNumber: officerInfo.pen_number || "N/A",
      serviceType: getServiceTypeName(String(officerInfo.service_type_id || "")),
      email: officerInfo.email || "N/A",
      mobile: officerInfo.mobile_no || "N/A",
      dateOfJoining: formatDate(officerInfo.date_of_joining),
    };
  }, [officerInfo]);

  const openAddModal = () => {
    const tempId = `new_${Date.now()}`;
    setModalErrors({});
    setModalForm({
      ...EMPTY_SUSPENSION,
      ais_sub_id: tempId,
      _temp_id: tempId,
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalErrors({});
    setModalForm({
      ...record,
      from_period: record.from_period?.split("T")[0] || "",
      to_period: record.to_period?.split("T")[0] || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (modalSaving) return;
    setModalOpen(false);
    setModalErrors({});
    setModalForm(EMPTY_SUSPENSION);
  };

  const validateSuspensionForm = (form) => {
    const errors = {};

    if (!form.from_period) {
      errors.from_period = "From Period is required";
    }

    if (!form.to_period) {
      errors.to_period = "To Period is required";
    }

    if (!form.suspension_details?.trim()) {
      errors.suspension_details = "Disciplinary Details are required";
    }

    if (!form.sus_order_number?.trim()) {
      errors.sus_order_number = "Order Number is required";
    }

    if (form.from_period && joiningDate) {
      const fromDate = new Date(form.from_period);
      const joinDate = new Date(joiningDate);
      if (fromDate < joinDate) {
        errors.from_period = "From Period cannot be before Date of Joining";
      }
    }

    if (form.from_period && form.to_period) {
      const fromDate = new Date(form.from_period);
      const toDate = new Date(form.to_period);
      if (fromDate > toDate) {
        errors.to_period = "To Period must be on or after From Period";
      }
    }

    return errors;
  };

  const handleModalChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadDocument = async (file) => {
    const metadata = {
      document_type: "ER-Profile",
      document_sub_type: "Disciplinary ",
      document_number: `SUS_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      title: file.name,
      issuing_authority: "GAD Department",
      issue_date: new Date().toISOString().split("T")[0],
      created_by: "unknown",
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await axiosInstance.post("/doc-uploader/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.message !== "Uploaded & saved") {
      throw new Error("Document upload failed");
    }

    return response.data.document_id;
  };

  const handleModalFileChange = async (file) => {
    if (!file) {
      setModalForm((prev) => ({ ...prev, suspension_document: null }));
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Only PDF, JPG, JPEG, PNG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setModalSaving(true);
      const documentId = await uploadDocument(file);
      setModalForm((prev) => ({ ...prev, suspension_document: documentId }));
      toast.success("Document uploaded successfully");
    } catch (err) {
      console.error("Error uploading document:", err);
      toast.error(extractErrorMessage(err) || "Failed to upload document");
    } finally {
      setModalSaving(false);
    }
  };

  const persistSuspension = async (record) => {
    const isNew = typeof record.ais_sub_id === "string" && record.ais_sub_id.startsWith("new_");
    const originalItem = isNew ? null : originalSuspensions.find((item) => item.ais_sub_id === record.ais_sub_id);
    const changed = isNew ? { ...record } : getDiff(originalItem, record);

    if (isNew) {
      delete changed.ais_sub_id;
      delete changed._temp_id;
      changed.ais_per_id = officerData.ais_per_id;
      changed.user_id = officerData.user_id;
      changed.fields = {
        from_period: "GAD_OFFICER",
        to_period: "GAD_OFFICER",
        suspension_details: "GAD_OFFICER",
        sus_order_number: "GAD_OFFICER",
        suspension_document: "GAD_OFFICER",
      };
    }

    if (!isNew && Object.keys(changed).length === 0) {
      return { skipped: true, data: record };
    }

    const endpoint = isNew ? "/as-II/suspension-info" : `/as-II/suspension-info/${record.ais_sub_id}`;
    const method = isNew ? axiosInstance.post : axiosInstance.put;
    const response = await method(endpoint, { user_data: changed });
    return { skipped: false, data: response.data.data?.suspension || response.data.data };
  };

  const handleModalSave = async () => {
    if (!officerData || savingRef.current) return;

    const errors = validateSuspensionForm(modalForm);
    setModalErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    savingRef.current = true;
    setModalSaving(true);

    try {
      const result = await persistSuspension(modalForm);
      const finalRecord = result.data;
      const nextRecords = sortSuspensions([
        ...editedSuspensions.filter((item) => item.ais_sub_id !== modalForm.ais_sub_id),
        finalRecord,
      ]);

      setEditedSuspensions(nextRecords);
      setOriginalSuspensions(nextRecords);
      toast.success(result.skipped ? "No changes to save" : "Disciplinary action saved successfully");
      closeModal();
    } catch (saveError) {
      console.error("Failed to save disciplinary action:", saveError);
      toast.error(
        getErrorMessage(saveError.response?.status, extractErrorMessage(saveError)) ||
          extractErrorMessage(saveError) ||
          saveError.message ||
          "Failed to save disciplinary action"
      );
    } finally {
      savingRef.current = false;
      setModalSaving(false);
    }
  };

  const handleDeleteSuspension = async (record) => {
    const suspensionId = record.ais_sub_id;
    const isSavedRecord = typeof suspensionId === "number";

    if (!window.confirm("Are you sure you want to delete this disciplinary action?")) {
      return;
    }

    try {
      if (isSavedRecord) {
        await axiosInstance.delete(`/as-II/suspension-info/${suspensionId}`);
      }

      const nextRecords = editedSuspensions.filter((item) => item.ais_sub_id !== suspensionId);
      setEditedSuspensions(nextRecords);
      setOriginalSuspensions(nextRecords);
      toast.success("Disciplinary action deleted successfully");
    } catch (err) {
      console.error("Error deleting disciplinary action:", err);
      toast.error(extractErrorMessage(err) || "Failed to delete disciplinary action");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="text-sm">Loading disciplinary action data...</p>
        </div>
      </div>
    );
  }

  if (error || !officerData) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        <div className="text-center">
          <p className="mb-4 text-sm">Error: {error || "Failed to load officer data"}</p>
          <button onClick={() => router.push("/official/disciplinary-action")} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button
                onClick={() => router.push("/official/disciplinary-action")}
                className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <h1 className="mt-4 text-[22px] font-semibold uppercase tracking-[0.06em] text-indigo-700">Disciplinary Action</h1>
              <p className="mt-1 text-sm font-medium leading-6 text-gray-600">
                {officerSummary.fullName} | PEN {officerSummary.penNumber} | {officerSummary.serviceType}
              </p>
              {officerSummary.missingName ? (
                <div className="mt-2 max-w-md">
                  <InfoNote message="Officer name is showing as N/A because personal information has not been saved yet." />
                </div>
              ) : null}
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add New Disciplinary Action
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryField label="Email" value={officerSummary.email} />
            <SummaryField label="Mobile" value={officerSummary.mobile} />
            <SummaryField label="Date of Joining" value={officerSummary.dateOfJoining} />
            <SummaryField label="Existing Records" value={String(editedSuspensions.length)} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Disciplinary Action Records</h2>
              <p className="text-sm leading-6 text-gray-500">Records are shown in reverse chronological order.</p>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total {editedSuspensions.length}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {editedSuspensions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-10 text-center sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                <p className="text-sm text-gray-500">No disciplinary action records available.</p>
              </div>
            ) : null}

            {editedSuspensions.map((record, index) => {
              const isNew = typeof record.ais_sub_id === "string" && record.ais_sub_id.startsWith("new_");

              return (
                <div key={`disciplinary-${record.ais_sub_id}-${index}`} className="flex h-full flex-col rounded-xl border border-indigo-100 bg-white p-3.5 shadow-sm">
                  <div className="rounded-xl border border-indigo-100 bg-slate-50 px-4 py-4 text-center">
                    <h3 className="text-[18px] font-semibold tracking-tight text-indigo-800">
                      {formatDate(record.from_period)} to {formatDate(record.to_period)}
                    </h3>
                  </div>

                  <div className="mt-3">
                    {[
                      { label: "Order Number", value: record.sus_order_number || "N/A" },
                      {
                        label: "Officer",
                        value: officerSummary.missingName
                          ? "N/A (personal information not saved)"
                          : officerSummary.fullName,
                      },
                      { label: "Details", value: record.suspension_details || "N/A", multiline: true },
                    ].map((item) => (
                      <div
                        key={`${record.ais_sub_id}-${item.label}`}
                        className="grid grid-cols-1 gap-1.5 border-b border-gray-200 py-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3"
                      >
                        <p className="text-[12px] font-semibold text-slate-500">{item.label}</p>
                        <p className={`break-words text-[14px] font-semibold text-slate-900 ${item.multiline ? "whitespace-pre-wrap leading-6" : ""}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-3 border-t border-gray-200 pt-3">
                    <DocumentDisplay documentId={record.suspension_document} label="Disciplinary Order" />
                    <button
                      type="button"
                      onClick={() => openEditModal(record)}
                      title="Edit"
                      aria-label="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSuspension(record)}
                      title="Delete"
                      aria-label="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SuspensionModal
        open={modalOpen}
        formData={modalForm}
        errors={modalErrors}
        joiningDate={joiningDate}
        saving={modalSaving}
        onClose={closeModal}
        onChange={handleModalChange}
        onFileChange={handleModalFileChange}
        onSave={handleModalSave}
        isEditing={!(typeof modalForm.ais_sub_id === "string" && modalForm.ais_sub_id.startsWith("new_"))}
      />
    </div>
  );
}
