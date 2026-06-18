"use client";

import PropTypes from "prop-types";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/apiClient";
import { toast } from "react-toastify";
import TiptapEditor from "@/app/components/reminder/editor/TiptapEditor";
import ConfirmModal from "@/app/components/confirmModal";

const EmailTemplateMap = [
    { id: 1, name: "Initial Reminder", body:   `
    <p>Dear Officer,</p>
    <p>
        Greetings from KARMASRI.
    </p>
    <p>
        Your KARMASRI account has been successfully activated. Kindly log in to the KARMASRI portal and complete the onboarding formalities at the earliest to ensure successful registration in the system.
    </p>
    <p>Regards,</p>
    <p>Team KARMASRI</p>
    <p>General Administration Department</p>
    <p>Government of Kerala</p>
    ` },
        { id: 2, name: "Follow-up Reminder", body:   `
    <p>Dear Officer,</p>
    <p>
        Greetings from KARMASRI.
    </p>
    <p>
        This is a reminder to activate your KARMASRI account and complete the pending onboarding activities at the earliest.
    </p>

    <p>
        If you have already completed the onboarding process, please ignore this email.
    </p>

    <p>Regards,</p>
    <p>Team KARMASRI</p>
    <p>General Administration Department</p>
    <p>Government of Kerala</p>
    ` },
        { id: 3, name: "Final Reminder", body:   `
    <p>Dear Officer,</p>
    <p>
        Greetings from KARMASRI.
    </p>
    <p>
        This is a final reminder that your KARMASRI account is yet to be activated. Kindly log in and complete the activation process at the earliest to access KARMASRI services.
    </p>

    <p>
        If you have already completed the onboarding process, please ignore this email.
    </p>

    <p>Regards,</p>
    <p>Team KARMASRI</p>
    <p>General Administration Department</p>
    <p>Government of Kerala</p>
    ` }
];

export function ModalReminderDetails({
  open = false,
  setOpen,
  officerList = [],
  selectedUsers = [],
}) {
  const [formData, setFormData] = useState({
    template: "Initial Reminder",
    officerIds: [],
    emailBody: "",
  });

  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [html, setHtml] = useState("");
  const [savedDraft, setSavedDraft] = useState(EmailTemplateMap[0].body);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showAllOfficers, setShowAllOfficers] = useState(false);
  const displayedOfficers = showAllOfficers
  ? officerList
  : officerList.slice(0, 10);

  const validateForm = () => {
    const errors = {};
    if (!formData.officerIds.length) errors.officerIds = "At least one officer is required";
    const emailContent = html || formData.emailBody || "";

          if (emailContent.trim() === "") {
              errors.emailBody = "Email body is required";
           }
    //if (!formData.emailBody && formData.emailBody.trim() === "" && !html && html.trim() === "") errors.emailBody = "Email body is required";
    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {

    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
        const payload = {
        officerIds: formData.officerIds,
        template: formData.template,
        emailBody: html || formData.emailBody,
        };

        await axiosInstance.post("admin/send-login-reminder", payload);

        toast.success("Reminder sent successfully!");
        handleClose();
    } catch (error) {
        console.error(error);

        toast.error(
        error?.response?.data?.message ||
            "Failed to send reminder. Please try again."
        );
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
        template: "Initial Reminder",
        officerIds: [],
        emailBody: "",
    });
    setSavedDraft(EmailTemplateMap[0].body);
    setError({});
    setHtml("");
    setIsSubmitting(false);
  }
  
  useEffect(() => {
    if (open) {
        setFormData((prev) => ({
            ...prev,
            officerIds: selectedUsers,
            emailBody: savedDraft,
        }));
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/40 transition-opacity" />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                    className="
                        relative
                        w-full
                        max-w-4xl
                        max-h-[90vh]
                        rounded-2xl
                        bg-white
                        shadow-xl
                        dark:bg-gray-700
                        dark:text-white
                        flex
                        flex-col
                    "
                    >

                        {/* HEADER */}
                        <div className="sticky top-0 z-10 flex px-6 py-4 border-b bg-white dark:bg-gray-700 rounded-t-2xl justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Reminder Details
                            </h2>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
                            <form 
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setConfirmModalOpen(true);
                            }}
                            >
                                {/* Officers */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">
                                        Officers
                                    </label>

                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {displayedOfficers.map((officer) => (
                                        <div
                                            key={officer.user_id}
                                            className="max-w-xs truncate rounded-md bg-slate-100 py-0.5 px-2.5 border border-transparent text-sm text-slate-600 shadow-sm"
                                            title={officer.email}
                                        >
                                            {officer.email}
                                        </div>
                                        ))}

                                        {officerList.length > 10 && !showAllOfficers && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllOfficers(true)}
                                            className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                                        >
                                            +{officerList.length - 10} more
                                        </button>
                                        )}
                                    </div>

                                    {showAllOfficers && officerList.length > 10 && (
                                        <button
                                        type="button"
                                        onClick={() => setShowAllOfficers(false)}
                                        className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                        Show Less
                                        </button>
                                    )}
                                </div>

                                {/* Template */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white ">Template</label>
                                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {EmailTemplateMap.map(template => (
                                        <div key={template.name} className={`rounded-md 
                                            flex items-center 
                                            py-2.5 pr-2.5 pl-1.5
                                            border 
                                            cursor-pointer
                                            text-sm 
                                            text-slate-600 
                                            transition-all 
                                            shadow-sm 
                                            ${formData.template === template.name ? 'bg-indigo-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
                                            htmlFor={`template-${template.name}`}
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                ...prev,
                                                template: template.name,
                                                }));
                                                setSavedDraft(template.body);
                                            }}
                                            >
                                            <div className="inline-flex items-center mr-2">
                                                <label className="flex items-center cursor-pointer relative">
                                                    <input 
                                                        type="radio"
                                                        className="cursor-pointer"
                                                        id={`template-${template.name}`}
                                                        name="template"
                                                        checked={formData.template === template.name}
                                                        onChange={() => {
                                                                setFormData((prev) => ({
                                                                ...prev,
                                                                template: template.name,
                                                                }));
                                                                setSavedDraft(template.body);
                                                            }
                                                        }
                                                    />
                                                </label>
                                            </div>
                                            {template.name}
                                        </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">Email Body</label>
                                    <TiptapEditor onChange={setHtml} initialContent={savedDraft} />
                                    {error.emailBody && (
                                    <p className="text-red-500 text-sm mt-1">{error.emailBody}</p>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
                                    <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    >
                                    Cancel
                                    </button>

                                    <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`rounded-lg px-4 py-2 text-white ${
                                                    isSubmitting
                                                    ? "cursor-not-allowed bg-gray-400"
                                                    : "bg-indigo-600 hover:bg-indigo-700"
                                                }`}
                                    >
                                        {isSubmitting ? "Sending..." : "Send"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </DialogPanel>
                </div>
            </div>
      </Dialog>
      
      <ConfirmModal
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        onConfirm={handleSubmit}
        title="Confirm"
        message={`Proceed with sending reminder`}
      />
    </>
  );
}

ModalReminderDetails.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
  reminder: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
