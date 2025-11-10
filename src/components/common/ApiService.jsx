import API_BASE_URL from "../../config";

const ApiService = {
  request: async (url, options = {}, type = "RESOURCE") => {
    try {
      const token = sessionStorage.getItem("authToken");

      const defaultHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Select base URL based on type
      const baseUrl = type === "AUTH" ? API_BASE_URL.AUTH_URL : API_BASE_URL.RESOURCE_URL;
      console.log("type: "+type);
      const fullUrl = `${baseUrl}${url}`;
      console.log(`Making ${options.method || "GET"} request to:`, fullUrl);
      console.log("baseUrl:", baseUrl);

      const response = await fetch(fullUrl, {
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        method: options.method || "GET",
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if (response.status === 204) {
        return null; // No content to parse
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API request failed");
      }

      // Try to parse JSON, fallback to text
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        var jsonResponse = await response.json();
        console.log("Response JSON:", jsonResponse);
        return jsonResponse;
      }
        else {
          const text = await response.text();
          return text || null;
      }
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  get: (url, options = {}, type = "RESOURCE") => ApiService.request(url, { ...options, method: "GET" }, type),
  post: (url, body, options = {}, type = "RESOURCE") => ApiService.request(url, { ...options, method: "POST", body }, type),
  put: (url, body, options = {}, type = "RESOURCE") => ApiService.request(url, { ...options, method: "PUT", body }, type),
  delete: (url, options = {}, type = "RESOURCE") => ApiService.request(url, { ...options, method: "DELETE" }, type),
};

export default ApiService;
