import API_BASE_URL from "../../config";

const ApiService = {

  /**
   * Core request handler (DO NOT touch unless needed)
   */
  request: async (url, options = {}, type = "RESOURCE") => {
    try {
      const token = sessionStorage.getItem("authToken");

      const defaultHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const baseUrl =
        type === "AUTH"
          ? API_BASE_URL.AUTH_URL
          : API_BASE_URL.RESOURCE_URL;

      const fullUrl = `${baseUrl}${url}`;

      const response = await fetch(fullUrl, {
        method: options.method || "GET",
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (response.status === 204) return null;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API request failed");
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return (await response.text()) || null;

    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  /**
   * GENERIC GET (path + query params)
   */
  get: (
    url,
    {
      pathParams = {},
      queryParams = {},
      headers = {},
      type = "RESOURCE",
    } = {}
  ) => {

    // Replace path params: /column/{columnName}
    let resolvedUrl = url;
    Object.entries(pathParams).forEach(([key, value]) => {
      resolvedUrl = resolvedUrl.replace(
        `{${key}}`,
        encodeURIComponent(String(value))
      );
    });

    // Build query string
    const queryString =
      queryParams && Object.keys(queryParams).length
        ? "?" + new URLSearchParams(
            Object.entries(queryParams).map(([k, v]) => [k, String(v)])
          ).toString()
        : "";
    console.log('resolvedUrl+queryString: '+`${resolvedUrl}${queryString}`);
    return ApiService.request(
      `${resolvedUrl}${queryString}`,
      { method: "GET", headers },
      type
    );
  },

  /**
   * POST
   */
  post: (
    url,
    body,
    { pathParams = {}, queryParams = {}, headers = {}, type = "RESOURCE" } = {}
  ) => {

    let resolvedUrl = url;
    Object.entries(pathParams).forEach(([key, value]) => {
      resolvedUrl = resolvedUrl.replace(
        `{${key}}`,
        encodeURIComponent(String(value))
      );
    });

    const queryString =
      queryParams && Object.keys(queryParams).length
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

    return ApiService.request(
      `${resolvedUrl}${queryString}`,
      { method: "POST", body, headers },
      type
    );
  },

  /**
   * PUT
   */
  put: (
    url,
    body,
    { pathParams = {}, queryParams = {}, headers = {}, type = "RESOURCE" } = {}
  ) => {

    let resolvedUrl = url;
    Object.entries(pathParams).forEach(([key, value]) => {
      resolvedUrl = resolvedUrl.replace(
        `{${key}}`,
        encodeURIComponent(String(value))
      );
    });

    const queryString =
      queryParams && Object.keys(queryParams).length
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

    return ApiService.request(
      `${resolvedUrl}${queryString}`,
      { method: "PUT", body, headers },
      type
    );
  },

  /**
   * DELETE
   */
  delete: (
    url,
    { pathParams = {}, queryParams = {}, headers = {}, type = "RESOURCE" } = {}
  ) => {

    let resolvedUrl = url;
    Object.entries(pathParams).forEach(([key, value]) => {
      resolvedUrl = resolvedUrl.replace(
        `{${key}}`,
        encodeURIComponent(String(value))
      );
    });

    const queryString =
      queryParams && Object.keys(queryParams).length
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

    return ApiService.request(
      `${resolvedUrl}${queryString}`,
      { method: "DELETE", headers },
      type
    );
  },
};

export default ApiService;
