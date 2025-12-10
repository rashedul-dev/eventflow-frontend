// Utility for building API query parameters from filters

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export function buildQueryParams(params: FilterParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

export function parseQueryParams(searchParams: URLSearchParams): FilterParams {
  const params: FilterParams = {};

  searchParams.forEach((value, key) => {
    if (key === "page" || key === "limit") {
      params[key] = Number.parseInt(value, 10);
    } else if (value === "true") {
      params[key] = true;
    } else if (value === "false") {
      params[key] = false;
    } else {
      params[key] = value;
    }
  });

  return params;
}

// Event filter options
export const eventStatusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
];

export const eventCategoryOptions = [
  { label: "Music", value: "Music" },
  { label: "Technology", value: "Technology" },
  { label: "Business", value: "Business" },
  { label: "Sports", value: "Sports" },
  { label: "Arts", value: "Arts" },
  { label: "Food & Drink", value: "Food & Drink" },
  { label: "Health", value: "Health" },
  { label: "Education", value: "Education" },
  { label: "Other", value: "Other" },
];

// User filter options
export const userRoleOptions = [
  { label: "Attendee", value: "ATTENDEE" },
  { label: "Organizer", value: "ORGANIZER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
];

// Ticket filter options
export const ticketStatusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Used", value: "USED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Refunded", value: "REFUNDED" },
];

// Payment filter options
export const paymentStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

export const paymentMethodOptions = [
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Debit Card", value: "DEBIT_CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "PayPal", value: "PAYPAL" },
];
