"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";
import axiosInstance from "@/utils/apiClient";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "@/app/components/dataTableControls";

const serviceTypeMap = {
  1: "IAS",
  2: "IPS",
  3: "IFS",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const m = moment(dateStr);
  return m.isValid() ? m.format("DD-MM-YYYY") : "";
};

const getOfficerDisplayName = (officer) => {
  const fullName = `${officer.first_name ?? ""} ${officer.last_name ?? ""}`.trim();

  if (fullName) {
    return {
      name: fullName,
      missing: false,
    };
  }

  return {
    name: "N/A",
    missing: true,
  };
};

export default function OfficialDisciplinaryActionListPage() {
  const router = useRouter();
  const [officerData, setOfficerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    sessionStorage.setItem("onboarding_active_nav", "Disciplinary Action");
  }, []);

  useEffect(() => {
    const fetchOfficers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/as-II/officers");
        setOfficerData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching officer data:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredOfficers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return officerData.filter((officer) =>
      `${officer.first_name ?? ""} ${officer.last_name ?? ""} ${officer.pen_number ?? ""} ${officer.email ?? ""} ${officer.mobile_no ?? ""} ${officer.dob ?? ""} ${serviceTypeMap[officer.service_type_id] ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [officerData, searchTerm]);

  const indexOfLastOfficer = currentPage * itemsPerPage;
  const indexOfFirstOfficer = indexOfLastOfficer - itemsPerPage;
  const currentOfficers = filteredOfficers.slice(indexOfFirstOfficer, indexOfLastOfficer);
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

  const exportRows = filteredOfficers.map((officer, index) => ({
    ...(() => {
      const nameInfo = getOfficerDisplayName(officer);
      return {
        "Sl. No": index + 1,
        Name: nameInfo.missing ? "N/A (personal information not saved)" : nameInfo.name,
        PEN: officer.pen_number ?? "",
        "Email ID": officer.email ?? "",
        "Mobile Number": officer.mobile_no ?? "",
        "Date of Birth": formatDate(officer.dob),
        "Service Type": serviceTypeMap[officer.service_type_id] ?? "Unknown",
      };
    })(),
  }));

  const handleOpenDisciplinaryAction = (officer) => {
    if (!officer?.ais_per_id) return;
    sessionStorage.setItem("officialDisciplinaryActionProfileId", officer.ais_per_id);
    router.push("/official/disciplinary-action/officer");
  };

  return (
    <div className="bg-white p-3 pt-0 rounded-xl border mb-3 dark:bg-gray-800 dark:border-gray-900">
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-3 dark:bg-gray-800 dark:border-gray-900 flex justify-between items-start gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white border border-indigo-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            Back
          </button>
          <h3 className="text-base font-semibold text-indigo-700 dark:text-white pt-5 uppercase">
            Disciplinary Action
          </h3>
          <div className="mt-5 w-full md:w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Name / PEN / Email / Mobile / DOB / Service Type"
            />
          </div>
        </div>

        <ExportButtons
          onCSV={() => exportToCSV("disciplinary-action-officers.csv", exportRows)}
          onPDF={() => exportToPDF("Disciplinary Action Officer List", exportRows, "disciplinary-action-officers.pdf")}
          onExcel={() => exportToExcel("Disciplinary Action", exportRows, "disciplinary-action-officers.xlsx")}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading officer list...</div>
      ) : (
        <div className="mx-auto w-full overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead className="text-gray-600 text-sm">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl. No</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PEN</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOfficers.map((officer, index) => (
                (() => {
                  const nameInfo = getOfficerDisplayName(officer);

                  return (
                    <tr
                      key={officer.ais_per_id ?? officer.user_id ?? index}
                      className="odd:bg-white odd:dark:bg-gray-800 even:bg-gray-50 even:dark:bg-gray-700"
                    >
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{indexOfFirstOfficer + index + 1}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="min-w-0">
                          <div>{nameInfo.name}</div>
                          {nameInfo.missing ? (
                            <div
                              className="mt-1 text-xs text-amber-700"
                              title="Officer name is showing as N/A because personal information has not been saved yet."
                            >
                              Personal information not saved
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{officer.pen_number || "N/A"}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{officer.email || "N/A"}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{officer.mobile_no || "N/A"}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{formatDate(officer.dob) || "N/A"}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                        {serviceTypeMap[officer.service_type_id] ?? "Unknown"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => handleOpenDisciplinaryAction(officer)}
                          disabled={!officer?.ais_per_id}
                          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
}
