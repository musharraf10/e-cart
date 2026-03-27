import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../../api/client.js";

const STALE_TIME_SECONDS = 120;

const normalizeParams = (params = {}) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

const stableParamsKey = (params = {}) =>
  normalizeParams(params)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");

const axiosBaseQuery =
  () =>
  async ({ url, method = "get", params, data, headers }) => {
    try {
      const result = await api({
        url,
        method,
        params,
        data,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: STALE_TIME_SECONDS,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ["Product", "ProductList", "Review", "Category"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({
        url: "/products",
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}|${stableParamsKey(queryArgs || {})}`,
      providesTags: (result, error, params) => [
        { type: "ProductList", id: stableParamsKey(params || {}) || "default" },
        ...(result?.items || []).map((item) => ({ type: "Product", id: item._id })),
      ],
    }),
    getProductBySlug: builder.query({
      query: (slug) => ({ url: `/products/${slug}` }),
      providesTags: (result, error, slug) => [{ type: "Product", id: result?._id || slug }],
    }),
    getCategories: builder.query({
      query: () => ({ url: "/categories" }),
      providesTags: [{ type: "Category", id: "LIST" }],
    }),
    getRelatedProducts: builder.query({
      async queryFn({ productId, categoryId }, _queryApi, _extraOptions, fetchWithBQ) {
        const [relatedRes, categoryRes] = await Promise.all([
          fetchWithBQ({ url: `/products/related/${productId}`, params: { limit: 8 } }),
          categoryId
            ? fetchWithBQ({ url: "/products", params: { category: categoryId, limit: 8 } })
            : Promise.resolve({ data: { items: [] } }),
        ]);

        if (relatedRes.error) return { error: relatedRes.error };
        if (categoryRes.error) return { error: categoryRes.error };

        const merged = [...(relatedRes.data?.items || []), ...(categoryRes.data?.items || [])];
        const unique = Array.from(new Map(merged.map((item) => [item._id, item])).values()).slice(0, 8);
        return { data: unique };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}|product:${queryArgs?.productId || ""}|category:${queryArgs?.categoryId || ""}`,
      providesTags: (result, error, args) => [
        { type: "ProductList", id: `related-${args?.productId || ""}-${args?.categoryId || ""}` },
        ...(result || []).map((item) => ({ type: "Product", id: item._id })),
      ],
    }),
    getReviews: builder.query({
      query: (productId) => ({ url: `/reviews/${productId}` }),
      providesTags: (result, error, productId) => [{ type: "Review", id: productId }],
    }),
    createReview: builder.mutation({
      query: ({ productId, payload, isMultipart = false }) => ({
        url: `/reviews/${productId}`,
        method: "post",
        data: payload,
        headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Review", id: productId }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoriesQuery,
  useGetRelatedProductsQuery,
  useGetReviewsQuery,
  useCreateReviewMutation,
} = catalogApi;

export { STALE_TIME_SECONDS };
