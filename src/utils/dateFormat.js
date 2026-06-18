// Utility function to convert ISO date (YYYY-MM-DD) to DD/MM/YYYY
export const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

// Utility function to convert DD/MM/YYYY to ISO date (YYYY-MM-DD)
export const parseDateFromDDMMYYYY = (ddmmyyyy) => {
  if (!ddmmyyyy || !/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) return null;
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day).toISOString().split("T")[0];
};

// Utility function to validate DD/MM/YYYY format
export const isValidDDMMYYYY = (dateStr) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

// Utility function to convert to DD/MM/YYYY HH:MM 
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};