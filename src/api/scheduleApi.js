import apiClient from "./apiClient";

const scheduleApi = {
    getByTherapistId: (therapistId) =>
        apiClient.get(`/api/Schedule/GetScheduleBySkinTherapistId?skinTherapistId=${therapistId}`),
};

export default scheduleApi;