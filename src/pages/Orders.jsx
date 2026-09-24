import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  UserPlus,
  Receipt,
} from "lucide-react";

const ORDER_STORAGE_KEY = "stylz_ims_orders";
const CUSTOMER_STORAGE_KEY = "stylz_ims_customers";

const today = new Date().toISOString().split("T")[0];

const defaultCustomers = [
  {
    id: "CUS-001",
    name: "Walk-in Customer",
    phone: "—",
    whatsapp: "—",
    email: "—",
    orders: 0,
    balance: "R0.00",
    status: "Active",
    customerType: "Individual",
    companyName: "",
    address: "",
    city: "",
    notes: "",
    createdAt: today,
  },
];

const createEmptyOrder = () => ({
  orderNumber: "",
  customerId: "",
  customer: "",
  customerPhone: "",
  customerWhatsapp: "",
  customerEmail: "",
  customerCompany: "",
  customerAddress: "",
  customerCity: "",
  description: "",
  jobName: "",
  quantity: 1,
  priority: "Normal",
  status: "Pending",
  orderDate: today,
  dueDate: today,
  assignedTo: "",
  notes: "",
});

const createEmptyCustomer = () => ({
  name: "",
  companyName: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  customerType: "Individual",
  notes: "",
});

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date + "T00:00:00");

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNextOrderNumber = (orders) => {
  const numbers = orders
    .map((order) => {
      const match = String(
        order.orderNumber || ""
      ).match(/(\d+)$/);

      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);

  const next =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `ORD-${String(next).padStart(4, "0")}`;
};

const getNextCustomerNumber = (customers) => {
  const numbers = customers
    .map((customer) => {
      const match = String(
        customer.id || ""
      ).match(/(\d+)$/);

      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);

  const next =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `CUS-${String(next).padStart(3, "0")}`;
};

const getInitialOrders = () => {
  try {
    const saved = localStorage.getItem(
      ORDER_STORAGE_KEY
    );

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Could not load orders:",
      error
    );
  }

  return [];
};

const getInitialCustomers = () => {
  try {
    const saved = localStorage.getItem(
      CUSTOMER_STORAGE_KEY
    );

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Could not load customers:",
      error
    );
  }

  return defaultCustomers;
};

function Orders({
  openNewOrder: dashboardOpenNewOrder,
  setOpenNewOrder,
  isPageVisible = true,
  onCreateInvoice,
}) {
  const [orders, setOrders] =
    useState(getInitialOrders);

  const [customers, setCustomers] =
    useState(getInitialCustomers);

  const [invoiceVersion, setInvoiceVersion] =
    useState(0);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [editingOrder, setEditingOrder] =
    useState(null);

  const [formData, setFormData] =
    useState(createEmptyOrder());

  const [showNewCustomer, setShowNewCustomer] =
    useState(false);

  const [customerForm, setCustomerForm] =
    useState(createEmptyCustomer());

  useEffect(() => {
    localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(orders)
    );
  }, [orders]);

  useEffect(() => {
    const refreshInvoices = () =>
      setInvoiceVersion((value) => value + 1);

    window.addEventListener(
      "storage",
      refreshInvoices
    );
    window.addEventListener(
      "stylz-data-updated",
      refreshInvoices
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshInvoices
      );
      window.removeEventListener(
        "stylz-data-updated",
        refreshInvoices
      );
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

  /*
    Allows the Dashboard to trigger
    the existing New Order form.
  */
  useEffect(() => {
    if (dashboardOpenNewOrder) {
      openOrderForm();

      if (setOpenNewOrder) {
        setOpenNewOrder(false);
      }
    }
  }, [
    dashboardOpenNewOrder,
    setOpenNewOrder,
  ]);

  const filteredOrders = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        String(order.orderNumber)
          .toLowerCase()
          .includes(search) ||
        String(order.customer)
          .toLowerCase()
          .includes(search) ||
        String(order.jobName)
          .toLowerCase()
          .includes(search) ||
        String(order.description)
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        order.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  const getInvoiceForOrder = (order) => {
    void invoiceVersion;

    try {
      const savedInvoices = localStorage.getItem(
        "stylz_ims_invoices"
      );
      const invoices = savedInvoices
        ? JSON.parse(savedInvoices)
        : [];

      if (!Array.isArray(invoices)) return null;

      return invoices.find(
        (invoice) =>
          (order.invoiceId &&
            invoice.id === order.invoiceId) ||
          (invoice.sourceOrderId &&
            invoice.sourceOrderId === order.id) ||
          (invoice.sourceOrderNumber &&
            invoice.sourceOrderNumber === order.orderNumber)
      ) || null;
    } catch {
      return null;
    }
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "Pending"
      ).length,

      production: orders.filter(
        (order) =>
          order.status ===
          "In Production"
      ).length,

      completed: orders.filter(
        (order) =>
          order.status === "Completed"
      ).length,

      urgent: orders.filter(
        (order) =>
          order.priority === "Urgent" &&
          order.status !== "Completed"
      ).length,
    };
  }, [orders]);

  const openOrderForm = () => {
    setEditingOrder(null);

    const firstCustomer =
      customers[0];

    setFormData({
      ...createEmptyOrder(),
      orderNumber:
        getNextOrderNumber(orders),
      customerId:
        firstCustomer?.id || "",
      customer:
        firstCustomer?.name || "",
      customerPhone:
        firstCustomer?.phone || "",
      customerWhatsapp:
        firstCustomer?.whatsapp || "",
      customerEmail:
        firstCustomer?.email || "",
      customerCompany:
        firstCustomer?.companyName || "",
      customerAddress:
        firstCustomer?.address || "",
      customerCity:
        firstCustomer?.city || "",
    });

    setShowNewCustomer(false);
    setShowForm(true);
  };

  const openEditOrder = (order) => {
    setEditingOrder(order);

    setFormData({
      ...createEmptyOrder(),
      ...order,
    });

    setShowNewCustomer(false);
    setShowForm(true);
  };

  const handleCustomerChange = (
    customerId
  ) => {
    const customer =
      customers.find(
        (item) =>
          item.id === customerId
      );

    setFormData((previous) => ({
      ...previous,
      customerId,
      customer:
        customer?.name || "",
      customerPhone:
        customer?.phone || "",
      customerWhatsapp:
        customer?.whatsapp || "",
      customerEmail:
        customer?.email || "",
      customerCompany:
        customer?.companyName || "",
      customerAddress:
        customer?.address || "",
      customerCity:
        customer?.city || "",
    }));
  };

  const handleChange = (
    field,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCustomerFormChange = (
    field,
    value
  ) => {
    setCustomerForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openNewCustomer = () => {
    setCustomerForm(
      createEmptyCustomer()
    );

    setShowNewCustomer(true);
  };

  const closeNewCustomer = () => {
    setShowNewCustomer(false);
    setCustomerForm(
      createEmptyCustomer()
    );
  };

  const saveNewCustomer = () => {
    const name =
      customerForm.name.trim();

    if (!name) {
      alert(
        "Please enter the customer name."
      );
      return;
    }

    const email =
      customerForm.email
        .trim()
        .toLowerCase();

    const phone =
      customerForm.phone.trim();

    const whatsapp =
      customerForm.whatsapp.trim();

    const duplicate =
      customers.find((customer) => {
        const existingEmail =
          String(
            customer.email || ""
          )
            .trim()
            .toLowerCase();

        const existingPhone =
          String(
            customer.phone || ""
          ).trim();

        const existingWhatsapp =
          String(
            customer.whatsapp || ""
          ).trim();

        if (
          email &&
          existingEmail &&
          email === existingEmail
        ) {
          return true;
        }

        if (
          phone &&
          existingPhone &&
          phone === existingPhone
        ) {
          return true;
        }

        if (
          whatsapp &&
          existingWhatsapp &&
          whatsapp === existingWhatsapp
        ) {
          return true;
        }

        return (
          String(
            customer.name || ""
          )
            .trim()
            .toLowerCase() ===
            name.toLowerCase() &&
          String(
            customer.companyName || ""
          )
            .trim()
            .toLowerCase() ===
            String(
              customerForm.companyName ||
                ""
            )
              .trim()
              .toLowerCase()
        );
      });

    if (duplicate) {
      alert(
        "A customer with these details already exists. Please select the existing customer instead."
      );
      return;
    }

    const newCustomer = {
      id: getNextCustomerNumber(
        customers
      ),
      name,
      phone: phone || "—",
      whatsapp: whatsapp || "—",
      email: email || "—",
      orders: 0,
      balance: "R0.00",
      status: "Active",
      customerType:
        customerForm.customerType ||
        "Individual",
      companyName:
        customerForm.companyName.trim(),
      address:
        customerForm.address.trim(),
      city:
        customerForm.city.trim(),
      notes:
        customerForm.notes.trim(),
      createdAt: today,
    };

    setCustomers((previous) => [
      ...previous,
      newCustomer,
    ]);

    setFormData((previous) => ({
      ...previous,
      customerId: newCustomer.id,
      customer: newCustomer.name,
      customerPhone:
        newCustomer.phone,
      customerWhatsapp:
        newCustomer.whatsapp,
      customerEmail:
        newCustomer.email,
      customerCompany:
        newCustomer.companyName,
      customerAddress:
        newCustomer.address,
      customerCity:
        newCustomer.city,
    }));

    setShowNewCustomer(false);
    setCustomerForm(
      createEmptyCustomer()
    );
  };

  const saveOrder = () => {
    if (!formData.customer) {
      alert(
        "Please select or create a customer."
      );
      return;
    }

    if (!formData.jobName.trim()) {
      alert(
        "Please enter a job name."
      );
      return;
    }

    const order = {
      ...formData,

      id:
        editingOrder?.id ||
        `ORD-${Date.now()}`,

      orderNumber:
        formData.orderNumber ||
        getNextOrderNumber(orders),

      quantity: Number(
        formData.quantity || 1
      ),
    };

    if (editingOrder) {
      setOrders((previous) =>
        previous.map((item) =>
          item.id === editingOrder.id
            ? order
            : item
        )
      );

      // Keep the matching production job synchronized with the order.
      try {
        const savedProduction = localStorage.getItem("stylz_ims_production");
        const production = savedProduction ? JSON.parse(savedProduction) : [];
        if (Array.isArray(production)) {
          const existing = production.find((job) => job.orderId === order.id);
          if (existing) {
            const updatedProduction = production.map((job) =>
              job.orderId === order.id
                ? {
                    ...job,
                    job: order.jobName,
                    customer: order.customer,
                    status:
                      order.status === "Completed"
                        ? "Completed"
                        : order.status === "In Production"
                          ? "In Production"
                          : job.status,
                    dueDate: order.dueDate,
                    assignedTo: order.assignedTo || "",
                  }
                : job
            );
            localStorage.setItem(
              "stylz_ims_production",
              JSON.stringify(updatedProduction)
            );
            window.dispatchEvent(new Event("stylz-data-updated"));
          }
        }
      } catch (error) {
        console.error("Could not sync production job:", error);
      }
    } else {
      setOrders((previous) => [
        ...previous,
        order,
      ]);

      if (formData.customerId) {
        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id ===
            formData.customerId
              ? {
                  ...customer,
                  orders:
                    Number(
                      customer.orders ||
                        0
                    ) + 1,
                }
              : customer
          )
        );
      }

      // Every new order automatically enters the production queue.
      try {
        const savedProduction = localStorage.getItem("stylz_ims_production");
        const production = savedProduction ? JSON.parse(savedProduction) : [];
        const productionJob = {
          id: Date.now() + Math.random(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          job: order.jobName,
          customer: order.customer,
          status:
            order.status === "Completed"
              ? "Completed"
              : order.status === "In Production"
                ? "In Production"
                : "Queued",
          progress: order.status === "Completed" ? 100 : 0,
          dueDate: order.dueDate,
          assignedTo: order.assignedTo || "",
        };
        const nextProduction = Array.isArray(production)
          ? [...production, productionJob]
          : [productionJob];
        localStorage.setItem(
          "stylz_ims_production",
          JSON.stringify(nextProduction)
        );
        window.dispatchEvent(new Event("stylz-data-updated"));
      } catch (error) {
        console.error("Could not create production job:", error);
      }
    }

    setShowForm(false);
    setEditingOrder(null);
    setFormData(createEmptyOrder());
    setShowNewCustomer(false);
  };

  const deleteOrder = (order) => {
    const confirmed =
      window.confirm(
        `Delete ${order.orderNumber}? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setOrders((previous) =>
      previous.filter(
        (item) =>
          item.id !== order.id
      )
    );

    if (
      selectedOrder?.id === order.id
    ) {
      setSelectedOrder(null);
    }
  };

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Completed":
        return "completed";

      case "In Production":
        return "production";

      case "Ready":
        return "ready";

      case "Cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  };

  const getPriorityClass = (
    priority
  ) => {
    switch (priority) {
      case "Urgent":
        return "urgent";

      case "High":
        return "high";

      case "Low":
        return "low";

      default:
        return "normal";
    }
  };

  return (
    <>
      <style>{`
        .orders-page {
          padding: 24px;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .orders-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
        }

        .orders-header p {
          margin: 0;
          color: #6b7280;
        }

        .orders-primary-btn {
          border: none;
          background: #e11d2e;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .orders-primary-btn:hover {
          background: #c91425;
        }

        .orders-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .order-stat {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 17px;
        }

        .order-stat span {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 7px;
        }

        .order-stat strong {
          font-size: 23px;
        }

        .orders-toolbar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .orders-search {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .orders-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .orders-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px 11px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
        }

        .orders-filter {
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 13px;
          border-radius: 8px;
          min-width: 150px;
        }

        .orders-table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .orders-table-wrapper {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .orders-table th,
        .orders-table td {
          padding: 14px 15px;
          text-align: left;
          border-bottom: 1px solid #edf0f3;
        }

        .orders-table th {
          background: #f8fafc;
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
        }

        .orders-table td {
          font-size: 13px;
        }

        .order-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .order-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .order-status.production {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .order-status.ready {
          background: #e0e7ff;
          color: #4338ca;
        }

        .order-status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .order-status.cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .order-priority {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .order-priority.normal {
          background: #f1f5f9;
          color: #475569;
        }

        .order-priority.low {
          background: #ecfdf5;
          color: #047857;
        }

        .order-priority.high {
          background: #ffedd5;
          color: #c2410c;
        }

        .order-priority.urgent {
          background: #fee2e2;
          color: #b91c1c;
        }

        .order-actions {
          display: flex;
          gap: 6px;
        }

        .order-icon-btn {
          width: 34px;
          height: 34px;
          border: 1px solid #dbe0e6;
          background: white;
          border-radius: 7px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .order-icon-btn:hover {
          background: #f3f4f6;
        }

        .orders-empty {
          text-align: center;
          padding: 45px;
          color: #64748b;
        }

        .orders-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .62);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .orders-modal {
          background: white;
          width: min(950px, 100%);
          max-height: 94vh;
          overflow-y: auto;
          border-radius: 14px;
          box-shadow: 0 25px 70px rgba(0,0,0,.25);
        }

        .orders-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .orders-modal-header h2 {
          margin: 0;
        }

        .orders-close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
        }

        .orders-form {
          padding: 24px;
        }

        .orders-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .orders-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .orders-field.full {
          grid-column: 1 / -1;
        }

        .orders-field label {
          font-size: 12px;
          font-weight: 700;
          color: #4b5563;
        }

        .orders-field input,
        .orders-field select,
        .orders-field textarea {
          border: 1px solid #d1d5db;
          border-radius: 7px;
          padding: 10px;
          font: inherit;
          outline: none;
          box-sizing: border-box;
        }

        .orders-field input:focus,
        .orders-field select:focus,
        .orders-field textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.08);
        }

        .orders-field textarea {
          min-height: 100px;
          resize: vertical;
        }

        .customer-entry-box {
          grid-column: 1 / -1;
          border: 1px solid #dbe3ef;
          background: #f8fafc;
          border-radius: 10px;
          padding: 14px;
        }

        .customer-entry-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .customer-entry-title {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
        }

        .new-customer-btn {
          border: 1px solid #2563eb;
          background: white;
          color: #2563eb;
          padding: 8px 12px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .new-customer-btn:hover {
          background: #eff6ff;
        }

        .selected-customer-info {
          margin-top: 8px;
          font-size: 11px;
          color: #64748b;
        }

        .new-customer-panel {
          grid-column: 1 / -1;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          border-radius: 10px;
          padding: 16px;
          margin-top: 2px;
        }

        .new-customer-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .new-customer-panel-header strong {
          font-size: 14px;
          color: #1e3a8a;
        }

        .new-customer-close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
        }

        .new-customer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }

        .orders-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .orders-cancel {
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 18px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .orders-save {
          border: none;
          background: #e11d2e;
          color: white;
          padding: 11px 20px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .orders-save:hover {
          background: #c91425;
        }

        .order-view-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          padding: 24px;
        }

        .order-view-box {
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          padding: 14px;
        }

        .order-view-box.full {
          grid-column: 1 / -1;
        }

        .order-view-box span {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .order-view-box strong {
          font-size: 14px;
        }

        .customer-details-line {
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
        }

        @media (max-width: 1000px) {
          .orders-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .orders-header {
            flex-direction: column;
            align-items: stretch;
          }

          .orders-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .orders-form-grid,
          .new-customer-grid,
          .order-view-grid {
            grid-template-columns: 1fr;
          }

          .orders-field.full,
          .order-view-box.full,
          .customer-entry-box,
          .new-customer-panel {
            grid-column: auto;
          }

          .customer-entry-top {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      {isPageVisible && (
        <div className="orders-page">
          <div className="orders-header">
            <div>
              <h1>Orders / Jobs</h1>

              <p>
                Manage customer jobs from
                order intake through completion.
              </p>
            </div>

            <button
              className="orders-primary-btn"
              onClick={openOrderForm}
            >
              <Plus size={18} />
              New Order
            </button>
          </div>

          <div className="orders-stats">
            <div className="order-stat">
              <span>Total Orders</span>
              <strong>
                {stats.total}
              </strong>
            </div>

            <div className="order-stat">
              <span>Pending</span>
              <strong>
                {stats.pending}
              </strong>
            </div>

            <div className="order-stat">
              <span>In Production</span>
              <strong>
                {stats.production}
              </strong>
            </div>

            <div className="order-stat">
              <span>Completed</span>
              <strong>
                {stats.completed}
              </strong>
            </div>

            <div className="order-stat">
              <span>Urgent Jobs</span>
              <strong>
                {stats.urgent}
              </strong>
            </div>
          </div>

          <div className="orders-toolbar">
            <div className="orders-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search orders, customers or jobs..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <select
              className="orders-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Production">
                In Production
              </option>

              <option value="Ready">
                Ready
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <select
              className="orders-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Priorities
              </option>

              <option value="Normal">
                Normal
              </option>

              <option value="Low">
                Low
              </option>

              <option value="High">
                High
              </option>

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>

          <div className="orders-table-card">
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Job</th>
                    <th>Qty</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(
                    (order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>
                            {order.orderNumber}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {order.customer}
                          </strong>

                          {order.customerCompany && (
                            <div className="customer-details-line">
                              {order.customerCompany}
                            </div>
                          )}
                        </td>

                        <td>
                          <strong>
                            {order.jobName}
                          </strong>

                          {order.description && (
                            <div
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "11px",
                                marginTop:
                                  "3px",
                              }}
                            >
                              {
                                order.description
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {order.quantity}
                        </td>

                        <td>
                          {formatDate(
                            order.dueDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`order-priority ${getPriorityClass(
                              order.priority
                            )}`}
                          >
                            {order.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>
                          <div className="order-actions">
                            <button
                              className="order-icon-btn"
                              title="View"
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            {(() => {
                              const invoice =
                                getInvoiceForOrder(order);

                              return (
                                <button
                                  className="order-icon-btn"
                                  title={
                                    invoice
                                      ? `Invoiced: ${invoice.invoiceNumber}`
                                      : "Create Invoice"
                                  }
                                  onClick={() => {
                                    if (invoice) {
                                      alert(
                                        `This order already has invoice ${invoice.invoiceNumber}.`
                                      );
                                      return;
                                    }

                                    onCreateInvoice?.(order);
                                  }}
                                  style={{
                                    color: invoice
                                      ? "#166534"
                                      : "#2563eb",
                                    borderColor: invoice
                                      ? "#86efac"
                                      : "#93c5fd",
                                    background: invoice
                                      ? "#f0fdf4"
                                      : "#eff6ff",
                                  }}
                                >
                                  <Receipt size={17} />
                                </button>
                              );
                            })()}

                            <button
                              className="order-icon-btn"
                              title="Edit"
                              onClick={() =>
                                openEditOrder(
                                  order
                                )
                              }
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              className="order-icon-btn"
                              title="Delete"
                              onClick={() =>
                                deleteOrder(
                                  order
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}

                  {filteredOrders.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="orders-empty"
                      >
                        <FileText
                          size={35}
                          style={{
                            marginBottom:
                              "10px",
                          }}
                        />

                        <div>
                          No orders/jobs
                          found.
                        </div>

                        <div
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "12px",
                          }}
                        >
                          Click "New Order"
                          to create your
                          first job.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm &&
        createPortal(
          <div className="orders-modal-overlay">
            <div className="orders-modal">
              <div className="orders-modal-header">
                <h2>
                  {editingOrder
                    ? "Edit Order / Job"
                    : "New Order / Job"}
                </h2>

                <button
                  className="orders-close"
                  onClick={() => {
                    setShowForm(false);
                    setShowNewCustomer(false);
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="orders-form">
                <div className="orders-form-grid">
                  <div className="orders-field">
                    <label>
                      Order Number
                    </label>

                    <input
                      value={
                        formData.orderNumber
                      }
                      onChange={(event) =>
                        handleChange(
                          "orderNumber",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="orders-field">
                    <label>
                      Customer *
                    </label>

                    <select
                      value={
                        formData.customerId
                      }
                      onChange={(event) =>
                        handleCustomerChange(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={
                              customer.id
                            }
                            value={
                              customer.id
                            }
                          >
                            {customer.name}
                            {customer.companyName
                              ? ` — ${customer.companyName}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="customer-entry-box">
                    <div className="customer-entry-top">
                      <div>
                        <div className="customer-entry-title">
                          Customer Details
                        </div>

                        <div className="selected-customer-info">
                          {formData.customer
                            ? `Selected: ${formData.customer}`
                            : "Select an existing customer or create a new one."}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="new-customer-btn"
                        onClick={
                          openNewCustomer
                        }
                      >
                        <UserPlus
                          size={16}
                        />
                        New Customer
                      </button>
                    </div>

                    {formData.customer && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, 1fr)",
                          gap: "8px",
                          fontSize:
                            "12px",
                          color:
                            "#475569",
                        }}
                      >
                        <div>
                          <strong>
                            Phone:
                          </strong>{" "}
                          {formData.customerPhone ||
                            "—"}
                        </div>

                        <div>
                          <strong>
                            WhatsApp:
                          </strong>{" "}
                          {formData.customerWhatsapp ||
                            "—"}
                        </div>

                        <div>
                          <strong>
                            Email:
                          </strong>{" "}
                          {formData.customerEmail ||
                            "—"}
                        </div>
                      </div>
                    )}
                  </div>

                  {showNewCustomer && (
                    <div className="new-customer-panel">
                      <div className="new-customer-panel-header">
                        <strong>
                          Create New Customer
                        </strong>

                        <button
                          type="button"
                          className="new-customer-close"
                          onClick={
                            closeNewCustomer
                          }
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="new-customer-grid">
                        <div className="orders-field">
                          <label>
                            Customer Name *
                          </label>

                          <input
                            value={
                              customerForm.name
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "name",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Full name"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            Customer Type
                          </label>

                          <select
                            value={
                              customerForm.customerType
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "customerType",
                                event.target
                                  .value
                              )
                            }
                          >
                            <option value="Individual">
                              Individual
                            </option>

                            <option value="Business">
                              Business
                            </option>
                          </select>
                        </div>

                        <div className="orders-field">
                          <label>
                            Company Name
                          </label>

                          <input
                            value={
                              customerForm.companyName
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "companyName",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Business name"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            Phone
                          </label>

                          <input
                            value={
                              customerForm.phone
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "phone",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Phone number"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            WhatsApp
                          </label>

                          <input
                            value={
                              customerForm.whatsapp
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "whatsapp",
                                event.target
                                  .value
                              )
                            }
                            placeholder="WhatsApp number"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            Email
                          </label>

                          <input
                            type="email"
                            value={
                              customerForm.email
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "email",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Email address"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            City
                          </label>

                          <input
                            value={
                              customerForm.city
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "city",
                                event.target
                                  .value
                              )
                            }
                            placeholder="e.g. Randfontein"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            Address
                          </label>

                          <input
                            value={
                              customerForm.address
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "address",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Physical address"
                          />
                        </div>

                        <div className="orders-field">
                          <label>
                            Customer Notes
                          </label>

                          <input
                            value={
                              customerForm.notes
                            }
                            onChange={(event) =>
                              handleCustomerFormChange(
                                "notes",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Optional notes"
                          />
                        </div>

                        <div
                          style={{
                            gridColumn:
                              "1 / -1",
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            gap: "8px",
                            marginTop:
                              "4px",
                          }}
                        >
                          <button
                            type="button"
                            className="orders-cancel"
                            onClick={
                              closeNewCustomer
                            }
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="orders-save"
                            onClick={
                              saveNewCustomer
                            }
                          >
                            Save Customer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="orders-field">
                    <label>
                      Job Name *
                    </label>

                    <input
                      value={
                        formData.jobName
                      }
                      onChange={(event) =>
                        handleChange(
                          "jobName",
                          event.target.value
                        )
                      }
                      placeholder="e.g. ABC Shop Banner"
                    />
                  </div>

                  <div className="orders-field">
                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        formData.quantity
                      }
                      onChange={(event) =>
                        handleChange(
                          "quantity",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="orders-field">
                    <label>
                      Order Date
                    </label>

                    <input
                      type="date"
                      value={
                        formData.orderDate
                      }
                      onChange={(event) =>
                        handleChange(
                          "orderDate",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="orders-field">
                    <label>
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={
                        formData.dueDate
                      }
                      onChange={(event) =>
                        handleChange(
                          "dueDate",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="orders-field">
                    <label>
                      Priority
                    </label>

                    <select
                      value={
                        formData.priority
                      }
                      onChange={(event) =>
                        handleChange(
                          "priority",
                          event.target.value
                        )
                      }
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Normal">
                        Normal
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Urgent">
                        Urgent
                      </option>
                    </select>
                  </div>

                  <div className="orders-field">
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        formData.status
                      }
                      onChange={(event) =>
                        handleChange(
                          "status",
                          event.target.value
                        )
                      }
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Production">
                        In Production
                      </option>

                      <option value="Ready">
                        Ready
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div className="orders-field">
                    <label>
                      Assigned To
                    </label>

                    <input
                      value={
                        formData.assignedTo
                      }
                      onChange={(event) =>
                        handleChange(
                          "assignedTo",
                          event.target.value
                        )
                      }
                      placeholder="Designer / Operator"
                    />
                  </div>

                  <div className="orders-field full">
                    <label>
                      Job Description
                    </label>

                    <textarea
                      value={
                        formData.description
                      }
                      onChange={(event) =>
                        handleChange(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Describe exactly what needs to be produced..."
                    />
                  </div>

                  <div className="orders-field full">
                    <label>
                      Internal Notes
                    </label>

                    <textarea
                      value={
                        formData.notes
                      }
                      onChange={(event) =>
                        handleChange(
                          "notes",
                          event.target.value
                        )
                      }
                      placeholder="Production notes, materials, finishing, customer instructions..."
                    />
                  </div>
                </div>
              </div>

              <div className="orders-modal-actions">
                <button
                  className="orders-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setShowNewCustomer(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="orders-save"
                  onClick={saveOrder}
                >
                  {editingOrder
                    ? "Update Order"
                    : "Save Order"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {selectedOrder &&
        createPortal(
          <div className="orders-modal-overlay">
            <div className="orders-modal">
              <div className="orders-modal-header">
                <div>
                  <h2>
                    {selectedOrder.orderNumber}
                  </h2>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    {selectedOrder.jobName}
                  </div>
                </div>

                <button
                  className="orders-close"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  <X size={24} />
                </button>
              </div>

              <div className="order-view-grid">
                <div className="order-view-box">
                  <span>
                    Customer
                  </span>

                  <strong>
                    {selectedOrder.customer}
                  </strong>

                  {selectedOrder.customerCompany && (
                    <div className="customer-details-line">
                      {
                        selectedOrder.customerCompany
                      }
                    </div>
                  )}
                </div>

                <div className="order-view-box">
                  <span>
                    Quantity
                  </span>

                  <strong>
                    {selectedOrder.quantity}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    Phone
                  </span>

                  <strong>
                    {selectedOrder.customerPhone ||
                      "—"}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    WhatsApp
                  </span>

                  <strong>
                    {selectedOrder.customerWhatsapp ||
                      "—"}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    Order Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedOrder.orderDate
                    )}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedOrder.dueDate
                    )}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    Priority
                  </span>

                  <span
                    className={`order-priority ${getPriorityClass(
                      selectedOrder.priority
                    )}`}
                    style={{
                      width:
                        "fit-content",
                    }}
                  >
                    {selectedOrder.priority}
                  </span>
                </div>

                <div className="order-view-box">
                  <span>
                    Status
                  </span>

                  <span
                    className={`order-status ${getStatusClass(
                      selectedOrder.status
                    )}`}
                    style={{
                      width:
                        "fit-content",
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="order-view-box">
                  <span>
                    Assigned To
                  </span>

                  <strong>
                    {selectedOrder.assignedTo ||
                      "Not assigned"}
                  </strong>
                </div>

                <div className="order-view-box">
                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedOrder.customerEmail ||
                      "—"}
                  </strong>
                </div>

                <div className="order-view-box full">
                  <span>
                    Customer Address
                  </span>

                  <strong>
                    {selectedOrder.customerAddress ||
                      "No address provided."}
                    {selectedOrder.customerCity
                      ? `, ${selectedOrder.customerCity}`
                      : ""}
                  </strong>
                </div>

                <div className="order-view-box full">
                  <span>
                    Job Description
                  </span>

                  <strong>
                    {selectedOrder.description ||
                      "No description provided."}
                  </strong>
                </div>

                <div className="order-view-box full">
                  <span>
                    Internal Notes
                  </span>

                  <strong>
                    {selectedOrder.notes ||
                      "No notes."}
                  </strong>
                </div>
              </div>

              <div className="orders-modal-actions">
                <button
                  className="orders-cancel"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  Close
                </button>

                <button
                  className="orders-save"
                  onClick={() => {
                    openEditOrder(
                      selectedOrder
                    );

                    setSelectedOrder(
                      null
                    );
                  }}
                >
                  Edit Order
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Orders;