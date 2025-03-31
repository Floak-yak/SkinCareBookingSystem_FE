import apiClient from "./apiClient";

const scheduleApi = {
    getByTherapistId: (therapistId) =>
        apiClient.get(`/Schedule/GetScheduleBySkinTherapistId?skinTherapistId=${therapistId}`),
};

export default scheduleApi;