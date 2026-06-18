import axiosInstance from './apiClient';

/**
 * Signs a PDF file using the local PKI service[](http://127.0.0.1:1621)
 *
 * @param {File} pdfFile - The input PDF file to sign
 * @param {'submit'|'approve'} requestType - The type of request
 * @param {string} documentNumber
 * @param {string|number} [aisPerId] - Required only for 'approve'
 * 
 * @returns {Promise<{success: true, fileName: string}>} Returns on success
 * @throws {Error} - If signing fails
 */

const saveDocument = async (
    pdfFile,
    requestType,
    documentNumber,
    aisPerId
) => {
    // const signedFileName = pdfFile.name.replace(/\.pdf$/i, "_signed.pdf");
    try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("status", requestType)
        formData.append("document_number", documentNumber);
        formData.append("file_name", pdfFile.name);
        if (requestType === 'approve') {
            formData.append("selected_user_id", aisPerId)
        }
        const saveResponse = await axiosInstance.post("file-uploader/signed-pdf-save", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        if (!saveResponse.data?.success) {
            throw new Error(saveResponse.data?.detail || "Internal Server Error on Uploading Signed File");
        }
        return { success: true, fileName: pdfFile.name };
    } catch (error) {
        throw new Error(error || "Unexpected Error while Uploading Signed File")
    }
}
export default saveDocument;