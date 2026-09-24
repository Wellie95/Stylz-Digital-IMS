import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Printer,
  MessageCircle,
  Mail,
  FileText,
} from "lucide-react";

import products, {
  bankingDetails,
  companyDetails,
} from "../data/products";

const INVOICE_STORAGE_KEY = "stylz_ims_invoices";
const CUSTOMER_STORAGE_KEY = "stylz_ims_customers";
const INVOICE_FROM_ORDER_KEY =
  "stylz_ims_invoice_from_order";
const PAYMENT_STORAGE_KEY = "stylz_ims_payments";

const today = new Date().toISOString().split("T")[0];

const emptyCustomer = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  companyName: "",
  address: "",
  city: "",
};

const createEmptyItem = () => ({
  id: Date.now() + Math.random(),
  description: "",
  quantity: 1,
  price: 0,
});

const normalizeText = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const normalizePhone = (value = "") => {
  let phone = String(value).replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = "27" + phone.substring(1);
  }

  return phone;
};

const formatCurrency = (value) =>
  `R${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date + "T00:00:00");

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNextInvoiceNumber = (invoices) => {
  const numbers = invoices
    .map((invoice) => {
      const match = String(
        invoice.invoiceNumber || ""
      ).match(/(\d+)$/);

      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);

  const next = numbers.length
    ? Math.max(...numbers) + 1
    : 1;

  return `INV-${String(next).padStart(4, "0")}`;
};

const getInitialInvoices = () => {
  try {
    const saved = localStorage.getItem(
      INVOICE_STORAGE_KEY
    );

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Could not load invoices:",
      error
    );
  }

  return [
    {
      id: "INV-SEED-001",
      invoiceNumber: "INV-0001",
      customerId: "CUS-001",
      customer: "Walk-in Customer",
      customerDetails: {
        ...emptyCustomer,
        name: "Walk-in Customer",
      },
      date: today,
      dueDate: today,
      status: "Unpaid",
      items: [
        {
          id: 1,
          description: "Printing Services",
          quantity: 1,
          price: 0,
        },
      ],
      discount: 0,
      amountPaid: 0,
      notes: "50% deposit required before production.",
    },
  ];
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

  return [
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
      notes: "50% deposit required before production.",
      createdAt: today,
    },
  ];
};

const calculateSubtotal = (invoice) =>
  (invoice.items || []).reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0) *
        Number(item.price || 0),
    0
  );

const calculateTotal = (invoice) => {
  const subtotal = calculateSubtotal(invoice);
  const discount = Number(invoice.discount || 0);

  return Math.max(subtotal - discount, 0);
};

const calculateBalance = (invoice) => {
  const total = calculateTotal(invoice);
  const paid = Number(invoice.amountPaid || 0);

  return Math.max(total - paid, 0);
};

const calculateStatus = (invoice) => {
  const total = calculateTotal(invoice);
  const paid = Number(invoice.amountPaid || 0);

  if (total > 0 && paid >= total) {
    return "Paid";
  }

  if (paid > 0 && paid < total) {
    return "Partially Paid";
  }

  if (
    invoice.dueDate &&
    invoice.dueDate < today &&
    paid < total
  ) {
    return "Overdue";
  }

  return "Unpaid";
};

const findMatchingCustomer = (
  customers,
  customer
) => {
  const email = normalizeText(customer.email);
  const phone = normalizePhone(customer.phone);
  const whatsapp = normalizePhone(
    customer.whatsapp
  );
  const name = normalizeText(customer.name);
  const company = normalizeText(
    customer.companyName
  );

  if (email) {
    const match = customers.find(
      (item) =>
        normalizeText(item.email) === email
    );

    if (match) return match;
  }

  if (phone) {
    const match = customers.find((item) => {
      return (
        normalizePhone(item.phone) === phone ||
        normalizePhone(item.whatsapp) === phone
      );
    });

    if (match) return match;
  }

  if (whatsapp) {
    const match = customers.find((item) => {
      return (
        normalizePhone(item.phone) === whatsapp ||
        normalizePhone(item.whatsapp) === whatsapp
      );
    });

    if (match) return match;
  }

  if (name && company) {
    const match = customers.find(
      (item) =>
        normalizeText(item.name) === name &&
        normalizeText(item.companyName) ===
          company
    );

    if (match) return match;
  }

  if (name) {
    const matches = customers.filter(
      (item) =>
        normalizeText(item.name) === name
    );

    if (matches.length === 1) {
      return matches[0];
    }
  }

  return null;
};

const mergeCustomer = (
  existing,
  incoming
) => {
  return {
    ...existing,
    name:
      incoming.name || existing.name,
    phone:
      incoming.phone &&
      incoming.phone !== "—"
        ? incoming.phone
        : existing.phone,
    whatsapp:
      incoming.whatsapp &&
      incoming.whatsapp !== "—"
        ? incoming.whatsapp
        : existing.whatsapp,
    email:
      incoming.email &&
      incoming.email !== "—"
        ? incoming.email
        : existing.email,
    companyName:
      incoming.companyName ||
      existing.companyName ||
      "",
    address:
      incoming.address ||
      existing.address ||
      "",
    city:
      incoming.city ||
      existing.city ||
      "",
  };
};

function Invoices() {
  const [invoices, setInvoices] =
    useState(getInitialInvoices);

  const [customers, setCustomers] =
    useState(getInitialCustomers);

  const [productCatalog, setProductCatalog] =
    useState(products);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("stylz_ims_products");
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) setProductCatalog(parsed);
      }
    } catch (error) {
      console.error("Could not load product catalog:", error);
    }
  }, []);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [showPreview, setShowPreview] =
    useState(false);

  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [customerMode, setCustomerMode] =
    useState("existing");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState("CUS-001");

  const [formCustomer, setFormCustomer] =
    useState(emptyCustomer);

  const [formData, setFormData] = useState({
    sourceOrderId: "",
    sourceOrderNumber: "",
    invoiceNumber: "",
    date: today,
    dueDate: today,
    items: [createEmptyItem()],
    discount: 0,
    amountPaid: 0,
    notes: "50% deposit required before production.",
  });

  const [activeProductItemId, setActiveProductItemId] =
  useState(null);

  useEffect(() => {
    localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify(invoices)
    );
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

  /*
    ============================================================
    ORDER -> INVOICE AUTO-FILL
    ============================================================
  */
  useEffect(() => {
    try {
      const savedOrder =
        localStorage.getItem(
          INVOICE_FROM_ORDER_KEY
        );

      if (!savedOrder) {
        return;
      }

      const order = JSON.parse(savedOrder);

      if (!order) {
        localStorage.removeItem(
          INVOICE_FROM_ORDER_KEY
        );
        return;
      }

      /*
        Remove the draft immediately so that
        refreshing the Invoices page does not
        create the same invoice form again.
      */
      localStorage.removeItem(
        INVOICE_FROM_ORDER_KEY
      );

      const matchingCustomer =
        customers.find(
          (customer) =>
            customer.id === order.customerId
        ) ||
        findMatchingCustomer(customers, {
          name: order.customer || "",
          phone: order.customerPhone || "",
          whatsapp:
            order.customerWhatsapp || "",
          email: order.customerEmail || "",
          companyName:
            order.customerCompany || "",
        });

      const customerData =
        matchingCustomer || {
          ...emptyCustomer,
          name: order.customer || "",
          phone:
            order.customerPhone || "",
          whatsapp:
            order.customerWhatsapp || "",
          email:
            order.customerEmail || "",
          companyName:
            order.customerCompany || "",
          address:
            order.customerAddress || "",
          city:
            order.customerCity || "",
        };

      const description =
        order.jobName ||
        order.description ||
        "Printing Services";

      const quantity = Number(
        order.quantity || 1
      );

      const orderNotes = [
        order.orderNumber
          ? `Order: ${order.orderNumber}`
          : "",
        order.description
          ? `Job Description: ${order.description}`
          : "",
        order.notes
          ? `Internal Notes: ${order.notes}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      setEditingInvoice(null);

      setCustomerMode(
        matchingCustomer
          ? "existing"
          : "manual"
      );

      setSelectedCustomerId(
        matchingCustomer?.id || ""
      );

      setFormCustomer({
        ...emptyCustomer,
        ...customerData,
        name:
          customerData.name ||
          order.customer ||
          "",
      });

      setFormData({
        sourceOrderId: order.id || "",
        sourceOrderNumber: order.orderNumber || "",
        invoiceNumber:
          getNextInvoiceNumber(invoices),

        date:
          order.orderDate || today,

        dueDate:
          order.dueDate || today,

        items: [
          {
            id: Date.now() + Math.random(),
            description,
            quantity,
            price: 0,
          },
        ],

        discount: 0,

        amountPaid: 0,

        notes: orderNotes,
      });

      setShowForm(true);
    } catch (error) {
      console.error(
        "Could not prepare invoice from order:",
        error
      );

      localStorage.removeItem(
        INVOICE_FROM_ORDER_KEY
      );
    }
  }, []);

  const filteredInvoices = useMemo(() => {
    const search =
      normalizeText(searchTerm);

    if (!search) return invoices;

    return invoices.filter((invoice) => {
      return (
        normalizeText(
          invoice.invoiceNumber
        ).includes(search) ||
        normalizeText(
          invoice.customer
        ).includes(search) ||
        normalizeText(
          invoice.status
        ).includes(search)
      );
    });
  }, [invoices, searchTerm]);

  const stats = useMemo(() => {
    const total = invoices.reduce(
      (sum, invoice) =>
        sum + calculateTotal(invoice),
      0
    );

    const paid = invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.amountPaid || 0
        ),
      0
    );

    const outstanding =
      invoices.reduce(
        (sum, invoice) =>
          sum +
          calculateBalance(invoice),
        0
      );

    return {
      count: invoices.length,
      total,
      paid,
      outstanding,
    };
  }, [invoices]);

  const resetForm = () => {
    setEditingInvoice(null);

    setCustomerMode("existing");

    setSelectedCustomerId(
      customers[0]?.id || "CUS-001"
    );

    setFormCustomer({
      ...emptyCustomer,
      ...(customers[0] || {}),
      name:
        customers[0]?.name ||
        "Walk-in Customer",
    });

    setFormData({
      invoiceNumber:
        getNextInvoiceNumber(invoices),
      date: today,
      dueDate: today,
      items: [createEmptyItem()],
      discount: 0,
      amountPaid: 0,
      notes: "50% deposit required before production.",
    });
  };

  const openNewInvoice = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditInvoice = (
    invoice
  ) => {
    setEditingInvoice(invoice);
    setShowForm(true);

    setCustomerMode(
      invoice.customerId
        ? "existing"
        : "manual"
    );

    setSelectedCustomerId(
      invoice.customerId || ""
    );

    setFormCustomer({
      ...emptyCustomer,
      ...(invoice.customerDetails || {}),
      name:
        invoice.customerDetails?.name ||
        invoice.customer ||
        "",
    });

    setFormData({
      invoiceNumber:
        invoice.invoiceNumber,

      date:
        invoice.date || today,

      dueDate:
        invoice.dueDate || today,

      items:
        invoice.items?.length > 0
          ? invoice.items.map(
              (item) => ({
                ...item,
                id:
                  item.id ||
                  Date.now() +
                    Math.random(),
              })
            )
          : [createEmptyItem()],

      discount: Number(
        invoice.discount || 0
      ),

      amountPaid: Number(
        invoice.amountPaid || 0
      ),

      notes:
        invoice.notes || "",
    });
  };

  const handleCustomerSelect = (
    customerId
  ) => {
    setSelectedCustomerId(
      customerId
    );

    const customer =
      customers.find(
        (item) =>
          item.id === customerId
      );

    if (customer) {
      setFormCustomer({
        ...emptyCustomer,
        ...customer,
        name:
          customer.name || "",
      });
    }
  };

  const handleCustomerChange = (
    field,
    value
  ) => {
    setFormCustomer(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  const handleItemChange = (
    id,
    field,
    value
  ) => {
    setFormData(
      (previous) => ({
        ...previous,

        items:
          previous.items.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    [field]:
                      field ===
                        "quantity" ||
                      field === "price"
                        ? Number(value)
                        : value,
                  }
                : item
          ),
      })
    );
  };

  const getProductSuggestions = (searchValue) => {
  const search = normalizeText(searchValue);

  if (!search) {
    return productCatalog.slice(0, 8);
  }

  return productCatalog
    .filter((product) =>
      normalizeText(product.name).includes(search)
    )
    .slice(0, 8);
};

const selectProductForItem = (
  itemId,
  product
) => {
  setFormData((previous) => ({
    ...previous,

    items: previous.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            description: product.name,
            price: Number(product.price || 0),
          }
        : item
    ),
  }));

  setActiveProductItemId(null);
};

const handleProductDescriptionChange = (
  itemId,
  value
) => {
  const exactProduct = productCatalog.find(
    (product) =>
      normalizeText(product.name) ===
      normalizeText(value)
  );

  setFormData((previous) => ({
    ...previous,

    items: previous.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            description: value,

            /*
              If the typed description exactly
              matches a STYLZ product/service,
              automatically use its price.
            */
            ...(exactProduct
              ? {
                  price: Number(
                    exactProduct.price || 0
                  ),
                }
              : {}),
          }
        : item
    ),
  }));
};

  const addItem = () => {
    setFormData(
      (previous) => ({
        ...previous,
        items: [
          ...previous.items,
          createEmptyItem(),
        ],
      })
    );
  };

  const removeItem = (
    id
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        items:
          previous.items.length === 1
            ? previous.items
            : previous.items.filter(
                (item) =>
                  item.id !== id
              ),
      })
    );
  };

  const createOrUpdateCustomer =
    () => {
      const incoming = {
        ...emptyCustomer,
        ...formCustomer,
        name:
          formCustomer.name.trim(),
      };

      if (!incoming.name) {
        return {
          customer: null,
          customerId: null,
        };
      }

      const existing =
        findMatchingCustomer(
          customers,
          incoming
        );

      if (existing) {
        const merged =
          mergeCustomer(
            existing,
            incoming
          );

        setCustomers(
          (previous) =>
            previous.map(
              (customer) =>
                customer.id ===
                existing.id
                  ? merged
                  : customer
            )
        );

        return {
          customer: merged,
          customerId:
            existing.id,
        };
      }

      const newCustomer = {
        id: `CUS-${String(
          customers.length + 1
        ).padStart(3, "0")}`,

        name: incoming.name,

        phone:
          incoming.phone || "—",

        whatsapp:
          incoming.whatsapp ||
          "—",

        email:
          incoming.email || "—",

        orders: 0,

        balance: "R0.00",

        status: "Active",

        customerType:
          incoming.companyName
            ? "Business"
            : "Individual",

        companyName:
          incoming.companyName ||
          "",

        address:
          incoming.address || "",

        city:
          incoming.city || "",

        notes: "50% deposit required before production.",

        createdAt: today,
      };

      setCustomers(
        (previous) => [
          ...previous,
          newCustomer,
        ]
      );

      return {
        customer: newCustomer,
        customerId:
          newCustomer.id,
      };
    };

  const saveInvoice = () => {
    const {
      customer,
      customerId,
    } =
      createOrUpdateCustomer();

    if (!customer) {
      alert(
        "Please enter a customer name."
      );
      return;
    }

    const cleanedItems =
      formData.items
        .filter(
          (item) =>
            String(
              item.description
            ).trim()
        )
        .map((item) => ({
          ...item,
          quantity: Number(
            item.quantity || 0
          ),
          price: Number(
            item.price || 0
          ),
        }));

    if (
      cleanedItems.length === 0
    ) {
      alert(
        "Please add at least one invoice item."
      );
      return;
    }

    const baseInvoice = {
      sourceOrderId:
        formData.sourceOrderId || "",
      sourceOrderNumber:
        formData.sourceOrderNumber || "",
      invoiceNumber:
        formData.invoiceNumber ||
        getNextInvoiceNumber(
          invoices
        ),

      customerId,

      customer:
        customer.name,

      customerDetails: {
        name:
          customer.name || "",

        phone:
          customer.phone || "",

        whatsapp:
          customer.whatsapp || "",

        email:
          customer.email || "",

        companyName:
          customer.companyName ||
          "",

        address:
          customer.address || "",

        city:
          customer.city || "",
      },

      date: formData.date,

      dueDate:
        formData.dueDate,

      items: cleanedItems,

      discount: Number(
        formData.discount || 0
      ),

      amountPaid: Number(
        formData.amountPaid || 0
      ),

      notes:
        formData.notes || "",
    };

    const invoice = {
      ...baseInvoice,

      id:
        editingInvoice?.id ||
        `INV-${Date.now()}`,
    };

    invoice.status =
      calculateStatus(invoice);

    if (editingInvoice) {
      setInvoices(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              editingInvoice.id
                ? invoice
                : item
          )
      );
    } else {
      setInvoices(
        (previous) => [
          ...previous,
          invoice,
        ]
      );
    }

    // Sync recorded invoice payments into the Payments module.
    try {
      const savedPayments = localStorage.getItem(PAYMENT_STORAGE_KEY);
      const payments = savedPayments ? JSON.parse(savedPayments) : [];
      if (Array.isArray(payments)) {
        const paymentId = "PAY-" + invoice.id;
        const paidAmount = Number(invoice.amountPaid || 0);
        const nextPayments = payments.filter(
          (payment) =>
            payment.invoiceId !== invoice.id &&
            payment.id !== paymentId
        );

        if (paidAmount > 0) {
          nextPayments.push({
            id: paymentId,
            invoiceId: invoice.id,
            reference: invoice.invoiceNumber,
            customer: invoice.customer,
            amount: paidAmount,
            method: "Other",
            date: invoice.date || today,
            status: paidAmount >= calculateTotal(invoice) ? "Paid" : "Part Paid",
            source: "Invoice",
          });
        }

        localStorage.setItem(
          PAYMENT_STORAGE_KEY,
          JSON.stringify(nextPayments)
        );
        window.dispatchEvent(new Event("stylz-data-updated"));
      }
    } catch (error) {
      console.error("Could not sync invoice payment:", error);
    }

    setShowForm(false);
    setEditingInvoice(null);
  };

  const deleteInvoice = (
    invoice
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${invoice.invoiceNumber}? This cannot be undone.`
      );

    if (!confirmed) return;

    setInvoices(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== invoice.id
        )
    );

    if (
      selectedInvoice?.id ===
      invoice.id
    ) {
      setSelectedInvoice(null);
      setShowPreview(false);
    }
  };

  const openPreview = (
    invoice
  ) => {
    setSelectedInvoice(
      invoice
    );

    setShowPreview(true);
  };

  const printInvoice = () => {
    window.print();
  };

  const getWhatsAppUrl = (
    invoice
  ) => {
    const phone =
      normalizePhone(
        invoice.customerDetails
          ?.whatsapp ||
          invoice.customerDetails
            ?.phone ||
          ""
      );

    const message = `Hello ${
      invoice.customer ||
      "Customer"
    }, your STYLZ DIGITAL SOLUTIONS invoice ${
      invoice.invoiceNumber
    } is ${formatCurrency(
      calculateTotal(invoice)
    )}. Amount paid: ${formatCurrency(
      invoice.amountPaid
    )}. Balance: ${formatCurrency(
      calculateBalance(invoice)
    )}. Thank you for your business.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
  };

  const sendWhatsApp = (
    invoice
  ) => {
    const phone =
      normalizePhone(
        invoice.customerDetails
          ?.whatsapp ||
          invoice.customerDetails
            ?.phone ||
          ""
      );

    if (!phone) {
      alert(
        "This customer does not have a valid phone or WhatsApp number."
      );
      return;
    }

    window.open(
      getWhatsAppUrl(invoice),
      "_blank"
    );
  };

  const sendEmail = (
    invoice
  ) => {
    const email =
      invoice.customerDetails
        ?.email;

    if (
      !email ||
      email === "—"
    ) {
      alert(
        "This customer does not have an email address."
      );
      return;
    }

    const subject = `Invoice ${invoice.invoiceNumber} - STYLZ DIGITAL SOLUTIONS`;

    const body = `Hello ${
      invoice.customer ||
      "Customer"
    },

Please find your invoice details below.

Invoice: ${
      invoice.invoiceNumber
    }
Date: ${formatDate(
      invoice.date
    )}
Due Date: ${formatDate(
      invoice.dueDate
    )}

Total: ${formatCurrency(
      calculateTotal(invoice)
    )}
Amount Paid: ${formatCurrency(
      invoice.amountPaid
    )}
Balance Due: ${formatCurrency(
      calculateBalance(invoice)
    )}

Thank you for choosing STYLZ DIGITAL SOLUTIONS.

STYLZ DIGITAL SOLUTIONS
${companyDetails.phone}
${companyDetails.email}
${companyDetails.website}`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      body
    )}`;
  };

  const formSubtotal =
    formData.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ) *
          Number(
            item.price || 0
          ),
      0
    );

  const formTotal = Math.max(
    formSubtotal -
      Number(
        formData.discount || 0
      ),
    0
  );

  const formBalance = Math.max(
    formTotal -
      Number(
        formData.amountPaid || 0
      ),
    0
  );

  return (
    <div className="invoices-page">
      <style>{`
        .invoices-page {
          padding: 24px;
        }

        .invoices-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .invoices-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
        }

        .invoices-header p {
          margin: 0;
          color: #6b7280;
        }

        .invoice-primary-btn {
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

        .invoice-primary-btn:hover {
          background: #c91425;
        }

        .invoice-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .invoice-stat {
          background: white;
          border-radius: 12px;
          padding: 18px;
          border: 1px solid #e5e7eb;
        }

        .invoice-stat span {
          display: block;
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .invoice-stat strong {
          font-size: 22px;
        }

        .invoice-toolbar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .invoice-search {
          position: relative;
          max-width: 420px;
        }

        .invoice-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .invoice-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px 11px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
        }

        .invoice-table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table th,
        .invoice-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #edf0f3;
        }

        .invoice-table th {
          background: #f8fafc;
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
        }

        .invoice-actions {
          display: flex;
          gap: 6px;
        }

        .invoice-icon-btn {
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

        .invoice-icon-btn:hover {
          background: #f3f4f6;
        }

        .invoice-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .invoice-status.paid {
          background: #dcfce7;
          color: #166534;
        }

        .invoice-status.partial {
          background: #fef3c7;
          color: #92400e;
        }

        .invoice-status.unpaid {
          background: #fee2e2;
          color: #991b1b;
        }

        .invoice-status.overdue {
          background: #7f1d1d;
          color: white;
        }

        .invoice-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.62);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .invoice-form-modal {
          background: white;
          width: min(1050px, 100%);
          max-height: 94vh;
          overflow-y: auto;
          border-radius: 14px;
          box-shadow: 0 25px 70px rgba(0,0,0,.25);
        }

        .invoice-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .invoice-modal-header h2 {
          margin: 0;
        }

        .invoice-close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
        }

        .invoice-form-body {
          padding: 24px;
        }

        .invoice-section {
          margin-bottom: 24px;
        }

        .invoice-section-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 14px;
          color: #1f2937;
        }

        .customer-mode {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .customer-mode button {
          border: 1px solid #d1d5db;
          background: white;
          padding: 9px 14px;
          border-radius: 7px;
          cursor: pointer;
        }

        .customer-mode button.active {
          background: #e11d2e;
          border-color: #e11d2e;
          color: white;
        }

        .invoice-form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .invoice-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .invoice-field label {
          font-size: 12px;
          font-weight: 700;
          color: #4b5563;
        }

        .invoice-field input,
        .invoice-field select,
        .invoice-field textarea {
          border: 1px solid #d1d5db;
          border-radius: 7px;
          padding: 10px;
          font: inherit;
          outline: none;
          box-sizing: border-box;
        }

        .invoice-field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .invoice-field.full {
          grid-column: 1 / -1;
        }

        .invoice-items {
          overflow-x: auto;
        }

        .invoice-item-row {
          display: grid;
          grid-template-columns: minmax(250px, 1fr) 100px 140px 130px 42px;
          gap: 8px;
          align-items: end;
          margin-bottom: 10px;
        }

        .invoice-item-total {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          padding: 10px;
          font-weight: 700;
          min-height: 20px;
        }

        .remove-item {
          height: 40px;
          border: none;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 7px;
          cursor: pointer;
        }

        .add-item {
          border: 1px dashed #94a3b8;
          background: white;
          padding: 9px 14px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .invoice-form-summary {
          margin-left: auto;
          max-width: 350px;
          background: #f8fafc;
          border-radius: 10px;
          padding: 16px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
        }

        .summary-line.total {
          border-top: 1px solid #d1d5db;
          margin-top: 7px;
          padding-top: 12px;
          font-size: 18px;
          font-weight: 800;
        }

        .invoice-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .invoice-cancel {
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 18px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .invoice-save {
          border: none;
          background: #e11d2e;
          color: white;
          padding: 11px 20px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .invoice-document {
          background: white;
          color: #111827;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 14mm;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }

        .invoice-document-header {
          border-bottom: 2px solid #e11d2e;
          padding-bottom: 14px;
        }

        .invoice-main-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        .invoice-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .invoice-brand img {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }

        .invoice-brand-text h1 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          color: #111827;
          letter-spacing: 0.2px;
        }

        .invoice-brand-text p {
          margin: 5px 0 0;
          font-size: 10px;
          color: #64748b;
        }

        .invoice-title-block {
          text-align: right;
        }

        .invoice-title-block h2 {
          margin: 0 0 8px;
          font-size: 30px;
          letter-spacing: 1px;
          color: #e11d2e;
        }

        .invoice-number {
          font-size: 13px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
        }

        .invoice-date-line {
          font-size: 10px;
          color: #64748b;
          margin-top: 3px;
        }

        .invoice-contact-strip {
          margin-top: 12px;
          padding-top: 9px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 8.5px;
          color: #64748b;
        }

        .invoice-contact-strip span {
          white-space: nowrap;
        }

        .invoice-document-customer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 24px 0;
        }

        .invoice-document-box {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
        }

        .invoice-document-box h3 {
          margin: 0 0 8px;
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: .5px;
        }

        .invoice-customer-name {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .invoice-customer-line {
          font-size: 10px;
          color: #4b5563;
          line-height: 1.5;
        }

        .invoice-document-items {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .invoice-document-items th {
          background: #f3f4f6;
          color: #374151;
          font-size: 9px;
          text-transform: uppercase;
          padding: 9px 8px;
          text-align: left;
          border-bottom: 1px solid #d1d5db;
        }

        .invoice-document-items td {
          padding: 10px 8px;
          font-size: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .invoice-document-items .number {
          text-align: right;
        }

        .invoice-totals {
          margin-left: auto;
          width: 260px;
          margin-top: 18px;
        }

        .invoice-total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 10px;
        }

        .invoice-total-row.grand {
          border-top: 2px solid #111827;
          margin-top: 5px;
          padding-top: 9px;
          font-size: 14px;
          font-weight: 800;
        }

        .invoice-balance-row {
          color: #e11d2e;
          font-weight: 800;
        }

        .invoice-document-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 35px;
        }

        .invoice-notes h3,
        .invoice-bank h3 {
          margin: 0 0 8px;
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
        }

        .invoice-notes p {
          margin: 0;
          font-size: 9px;
          color: #4b5563;
          line-height: 1.5;
        }

        .invoice-bank {
          border-left: 2px solid #e11d2e;
          padding-left: 12px;
        }

        .invoice-bank-grid {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 4px 10px;
          font-size: 9px;
        }

        .invoice-bank-grid strong {
          color: #374151;
        }

        .invoice-document-footer {
          margin-top: 50px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 8px;
          color: #94a3b8;
        }

        .invoice-preview-modal {
          background: #e5e7eb;
          width: min(1200px, 100%);
          max-height: 95vh;
          overflow-y: auto;
          border-radius: 12px;
        }

        .invoice-preview-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: white;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid #d1d5db;
        }

        .preview-button {
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 7px;
          padding: 9px 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
        }

        .preview-button.print {
          background: #e11d2e;
          border-color: #e11d2e;
          color: white;
        }

        .preview-button.whatsapp {
          background: #16a34a;
          border-color: #16a34a;
          color: white;
        }

        .preview-button.email {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        @media (max-width: 900px) {
          .invoice-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .invoice-form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .invoice-document {
            width: 100%;
          }
        }

        @media (max-width: 650px) {
          .invoices-page {
            padding: 14px;
          }

          .invoices-header {
            flex-direction: column;
            align-items: stretch;
          }

          .invoice-stats {
            grid-template-columns: 1fr;
          }

          .invoice-form-grid {
            grid-template-columns: 1fr;
          }

          .invoice-document-customer,
          .invoice-document-bottom {
            grid-template-columns: 1fr;
          }

          .invoice-main-header {
            flex-direction: column;
          }

          .invoice-title-block {
            text-align: left;
          }

          .invoice-contact-strip {
            flex-wrap: wrap;
          }
        }

        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-document,
          .invoice-document * {
            visibility: visible !important;
          }

          .invoice-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 12mm;
          }

          .invoice-preview-toolbar {
            display: none !important;
          }

          .invoice-modal-overlay {
            display: block !important;
            position: static !important;
            inset: auto !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          .invoice-preview-modal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="invoices-header">
        <div>
          <h1>Invoices</h1>

          <p>
            Create, manage and send professional STYLZ invoices.
          </p>
        </div>

        <button
          className="invoice-primary-btn"
          onClick={openNewInvoice}
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      <div className="invoice-stats">
        <div className="invoice-stat">
          <span>Total Invoices</span>
          <strong>
            {stats.count}
          </strong>
        </div>

        <div className="invoice-stat">
          <span>Total Invoiced</span>
          <strong>
            {formatCurrency(
              stats.total
            )}
          </strong>
        </div>

        <div className="invoice-stat">
          <span>Amount Paid</span>
          <strong>
            {formatCurrency(
              stats.paid
            )}
          </strong>
        </div>

        <div className="invoice-stat">
          <span>Outstanding</span>
          <strong>
            {formatCurrency(
              stats.outstanding
            )}
          </strong>
        </div>
      </div>

      <div className="invoice-toolbar">
        <div className="invoice-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search invoices, customers or status..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div className="invoice-table-card">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map(
              (invoice) => {
                const status =
                  calculateStatus(
                    invoice
                  );

                return (
                  <tr
                    key={
                      invoice.id
                    }
                  >
                    <td>
                      <strong>
                        {
                          invoice.invoiceNumber
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        invoice.customer
                      }
                    </td>

                    <td>
                      {formatDate(
                        invoice.date
                      )}
                    </td>

                    <td>
                      {formatDate(
                        invoice.dueDate
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        calculateTotal(
                          invoice
                        )
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        calculateBalance(
                          invoice
                        )
                      )}
                    </td>

                    <td>
                      <span
                        className={`invoice-status ${
                          status ===
                          "Paid"
                            ? "paid"
                            : status ===
                              "Partially Paid"
                            ? "partial"
                            : status ===
                              "Overdue"
                            ? "overdue"
                            : "unpaid"
                        }`}
                      >
                        {
                          status
                        }
                      </span>
                    </td>

                    <td>
                      <div className="invoice-actions">
                        <button
                          className="invoice-icon-btn"
                          title="View"
                          onClick={() =>
                            openPreview(
                              invoice
                            )
                          }
                        >
                          <Eye
                            size={16}
                          />
                        </button>

                        <button
                          className="invoice-icon-btn"
                          title="Edit"
                          onClick={() =>
                            openEditInvoice(
                              invoice
                            )
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          className="invoice-icon-btn"
                          title="Delete"
                          onClick={() =>
                            deleteInvoice(
                              invoice
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
                );
              }
            )}

            {filteredInvoices.length ===
              0 && (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "40px",
                    color:
                      "#64748b",
                  }}
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="invoice-modal-overlay">
          <div className="invoice-form-modal">
            <div className="invoice-modal-header">
              <div>
                <h2>
                  {editingInvoice
                    ? "Edit Invoice"
                    : "New Invoice"}
                </h2>
              </div>

              <button
                className="invoice-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={24} />
              </button>
            </div>

            <div className="invoice-form-body">
              <div className="invoice-section">
                <div className="invoice-section-title">
                  Customer
                </div>

                <div className="customer-mode">
                  <button
                    className={
                      customerMode ===
                      "existing"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCustomerMode(
                        "existing"
                      )
                    }
                  >
                    Existing Customer
                  </button>

                  <button
                    className={
                      customerMode ===
                      "manual"
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setCustomerMode(
                        "manual"
                      );

                      setSelectedCustomerId(
                        ""
                      );

                      setFormCustomer(
                        emptyCustomer
                      );
                    }}
                  >
                    New / Manual Customer
                  </button>
                </div>

                {customerMode ===
                  "existing" && (
                  <div className="invoice-form-grid">
                    <div className="invoice-field full">
                      <label>
                        Select Customer
                      </label>

                      <select
                        value={
                          selectedCustomerId
                        }
                        onChange={(
                          event
                        ) =>
                          handleCustomerSelect(
                            event
                              .target
                              .value
                          )
                        }
                      >
                        {customers.map(
                          (
                            customer
                          ) => (
                            <option
                              key={
                                customer.id
                              }
                              value={
                                customer.id
                              }
                            >
                              {
                                customer.name
                              }
                              {customer.companyName
                                ? ` — ${customer.companyName}`
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                )}

                <div
                  className="invoice-form-grid"
                  style={{
                    marginTop: 14,
                  }}
                >
                  <div className="invoice-field">
                    <label>
                      Customer Name *
                    </label>

                    <input
                      value={
                        formCustomer.name
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "name",
                          event.target
                            .value
                        )
                      }
                      placeholder="Customer name"
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Company Name
                    </label>

                    <input
                      value={
                        formCustomer.companyName
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "companyName",
                          event.target
                            .value
                        )
                      }
                      placeholder="Company name"
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Phone
                    </label>

                    <input
                      value={
                        formCustomer.phone
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "phone",
                          event.target
                            .value
                        )
                      }
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      WhatsApp
                    </label>

                    <input
                      value={
                        formCustomer.whatsapp
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "whatsapp",
                          event.target
                            .value
                        )
                      }
                      placeholder="WhatsApp number"
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Email
                    </label>

                    <input
                      value={
                        formCustomer.email
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "email",
                          event.target
                            .value
                        )
                      }
                      placeholder="Email address"
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      City
                    </label>

                    <input
                      value={
                        formCustomer.city
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "city",
                          event.target
                            .value
                        )
                      }
                      placeholder="City"
                    />
                  </div>

                  <div className="invoice-field full">
                    <label>
                      Address
                    </label>

                    <input
                      value={
                        formCustomer.address
                      }
                      onChange={(
                        event
                      ) =>
                        handleCustomerChange(
                          "address",
                          event.target
                            .value
                        )
                      }
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </div>

              <div className="invoice-section">
                <div className="invoice-section-title">
                  Invoice Details
                </div>

                <div className="invoice-form-grid">
                  <div className="invoice-field">
                    <label>
                      Invoice Number
                    </label>

                    <input
                      value={
                        formData.invoiceNumber
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            invoiceNumber:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Invoice Date
                    </label>

                    <input
                      type="date"
                      value={
                        formData.date
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            date:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={
                        formData.dueDate
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            dueDate:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="invoice-section">
                <div className="invoice-section-title">
                  Items
                </div>

                <div
  className="invoice-items"
  style={{
    overflow: "visible",
    position: "relative",
    zIndex: 20,
  }}
>
                  {formData.items.map(
                    (item) => (
                      <div
                        className="invoice-item-row"
                        key={
                          item.id
                        }
                      >
                        <div
  className="invoice-field invoice-product-field"
  style={{
    position: "relative",
  }}
>
  <label>
    Product / Service
  </label>

  <input
    value={item.description}
    onFocus={() =>
      setActiveProductItemId(
        item.id
      )
    }
    onBlur={() => {
      setTimeout(() => {
        setActiveProductItemId(
          null
        );
      }, 200);
    }}
    onChange={(event) =>
      handleProductDescriptionChange(
        item.id,
        event.target.value
      )
    }
    placeholder="Type product or service..."
    autoComplete="off"
  />

  {activeProductItemId ===
    item.id && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        marginTop: "4px",
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.12)",
        zIndex: 99999,
        maxHeight: "260px",
        overflowY: "auto",
      }}
    >
      {getProductSuggestions(
        item.description
      ).length > 0 ? (
        getProductSuggestions(
          item.description
        ).map((product) => (
          <button
            key={product.id}
            type="button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              selectProductForItem(
                item.id,
                product
              )
            }
            style={{
              width: "100%",
              border: "none",
              background: "white",
              padding:
                "10px 12px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "12px",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "#f8fafc";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "white";
            }}
          >
            <span>
              <strong
                style={{
                  display:
                    "block",
                  color:
                    "#111827",
                }}
              >
                {product.name}
              </strong>

              {product.category && (
                <small
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  {
                    product.category
                  }
                </small>
              )}
            </span>

            <strong
              style={{
                color:
                  "#e11d2e",
                whiteSpace:
                  "nowrap",
              }}
            >
              {formatCurrency(
                product.price
              )}
            </strong>
          </button>
        ))
      ) : (
        <div
          style={{
            padding: "12px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          No matching product/service.
          You can continue typing a
          custom item.
        </div>
      )}
    </div>
  )}
</div>

                        <div className="invoice-field">
                          <label>
                            Qty
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                item.id,
                                "quantity",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="invoice-field">
                          <label>
                            Unit Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.price
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                item.id,
                                "price",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="invoice-field">
                          <label>
                            Total
                          </label>

                          <div className="invoice-item-total">
                            {formatCurrency(
                              Number(
                                item.quantity ||
                                  0
                              ) *
                                Number(
                                  item.price ||
                                    0
                                )
                            )}
                          </div>
                        </div>

                        <button
                          className="remove-item"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          title="Remove item"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>


                <button
                  className="add-item"
                  onClick={
                    addItem
                  }
                >
                  + Add Item
                </button>
              </div>

              <div className="invoice-section">
                <div className="invoice-form-grid">
                  <div className="invoice-field">
                    <label>
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.discount
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            discount:
                              Number(
                                event
                                  .target
                                  .value
                              ),
                          })
                        )
                      }
                    />
                  </div>

                  <div className="invoice-field">
                    <label>
                      Amount Paid
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.amountPaid
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            amountPaid:
                              Number(
                                event
                                  .target
                                  .value
                              ),
                          })
                        )
                      }
                    />
                  </div>

                  <div className="invoice-field full">
                    <label>
                      Notes
                    </label>

                    <textarea
                      value={
                        formData.notes
                      }
                      onChange={(
                        event
                      ) =>
                        setFormData(
                          (
                            previous
                          ) => ({
                            ...previous,
                            notes:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      placeholder="Payment terms, special instructions, etc."
                    />
                  </div>
                </div>

                <div className="invoice-form-summary">
                  <div className="summary-line">
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        formSubtotal
                      )}
                    </strong>
                  </div>

                  <div className="summary-line">
                    <span>
                      Discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        formData.discount
                      )}
                    </strong>
                  </div>

                  <div className="summary-line total">
                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        formTotal
                      )}
                    </strong>
                  </div>

                  <div className="summary-line">
                    <span>
                      Paid
                    </span>

                    <strong>
                      {formatCurrency(
                        formData.amountPaid
                      )}
                    </strong>
                  </div>

                  <div className="summary-line">
                    <span>
                      Balance
                    </span>

                    <strong>
                      {formatCurrency(
                        formBalance
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-modal-actions">
              <button
                className="invoice-cancel"
                onClick={() =>
                  setShowForm(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="invoice-save"
                onClick={
                  saveInvoice
                }
              >
                {editingInvoice
                  ? "Update Invoice"
                  : "Save Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview &&
        selectedInvoice && (
          <div className="invoice-modal-overlay">
            <div className="invoice-preview-modal">
              <div className="invoice-preview-toolbar">
                <button
                  className="preview-button"
                  onClick={() =>
                    setShowPreview(
                      false
                    )
                  }
                >
                  <X size={16} />
                  Close
                </button>

                <button
                  className="preview-button print"
                  onClick={
                    printInvoice
                  }
                >
                  <Printer
                    size={16}
                  />
                  Print / PDF
                </button>

                <button
                  className="preview-button whatsapp"
                  onClick={() =>
                    sendWhatsApp(
                      selectedInvoice
                    )
                  }
                >
                  <MessageCircle
                    size={16}
                  />
                  WhatsApp
                </button>

                <button
                  className="preview-button email"
                  onClick={() =>
                    sendEmail(
                      selectedInvoice
                    )
                  }
                >
                  <Mail size={16} />
                  Email
                </button>
              </div>

              <div className="invoice-document">
                <div className="invoice-document-header">
                  <div className="invoice-main-header">
                    <div className="invoice-brand">
                      <img
                        src="/stylz_digital_logo.png"
                        alt="STYLZ DIGITAL SOLUTIONS"
                      />

                      <div className="invoice-brand-text">
                        <h1>
                          STYLZ DIGITAL SOLUTIONS
                        </h1>

                        <p>
                          Creative Printing,
                          Branding & Digital
                          Solutions
                        </p>
                      </div>
                    </div>

                    <div className="invoice-title-block">
                      <h2>
                        INVOICE
                      </h2>

                      <div className="invoice-number">
                        {
                          selectedInvoice.invoiceNumber
                        }
                      </div>

                      <div className="invoice-date-line">
                        Date:{" "}
                        {formatDate(
                          selectedInvoice.date
                        )}
                      </div>

                      <div className="invoice-date-line">
                        Due:{" "}
                        {formatDate(
                          selectedInvoice.dueDate
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="invoice-contact-strip">
                    <span>
                      {
                        companyDetails.address
                      }
                    </span>

                    <span>
                      {
                        companyDetails.phone
                      }
                    </span>

                    <span>
                      {
                        companyDetails.email
                      }
                    </span>

                    <span>
                      {
                        companyDetails.website
                      }
                    </span>
                  </div>
                </div>

                <div className="invoice-document-customer">
                  <div className="invoice-document-box">
                    <h3>
                      Bill To
                    </h3>

                    <div className="invoice-customer-name">
                      {selectedInvoice.customerDetails
                        ?.name ||
                        selectedInvoice.customer}
                    </div>

                    {selectedInvoice.customerDetails
                      ?.companyName && (
                      <div className="invoice-customer-line">
                        {
                          selectedInvoice
                            .customerDetails
                            .companyName
                        }
                      </div>
                    )}

                    {selectedInvoice.customerDetails
                      ?.address && (
                      <div className="invoice-customer-line">
                        {
                          selectedInvoice
                            .customerDetails
                            .address
                        }
                      </div>
                    )}

                    {selectedInvoice.customerDetails
                      ?.city && (
                      <div className="invoice-customer-line">
                        {
                          selectedInvoice
                            .customerDetails
                            .city
                        }
                      </div>
                    )}
                  </div>

                  <div className="invoice-document-box">
                    <h3>
                      Customer Contact
                    </h3>

                    {selectedInvoice.customerDetails
                      ?.phone && (
                      <div className="invoice-customer-line">
                        <strong>
                          Phone:
                        </strong>{" "}
                        {
                          selectedInvoice
                            .customerDetails
                            .phone
                        }
                      </div>
                    )}

                    {selectedInvoice.customerDetails
                      ?.whatsapp && (
                      <div className="invoice-customer-line">
                        <strong>
                          WhatsApp:
                        </strong>{" "}
                        {
                          selectedInvoice
                            .customerDetails
                            .whatsapp
                        }
                      </div>
                    )}

                    {selectedInvoice.customerDetails
                      ?.email && (
                      <div className="invoice-customer-line">
                        <strong>
                          Email:
                        </strong>{" "}
                        {
                          selectedInvoice
                            .customerDetails
                            .email
                        }
                      </div>
                    )}
                  </div>
                </div>

                <table className="invoice-document-items">
                  <thead>
                    <tr>
                      <th>
                        Description
                      </th>

                      <th className="number">
                        Qty
                      </th>

                      <th className="number">
                        Unit Price
                      </th>

                      <th className="number">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedInvoice.items.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            {
                              item.description
                            }
                          </td>

                          <td className="number">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="number">
                            {formatCurrency(
                              item.price
                            )}
                          </td>

                          <td className="number">
                            {formatCurrency(
                              Number(
                                item.quantity ||
                                  0
                              ) *
                                Number(
                                  item.price ||
                                    0
                                )
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                <div className="invoice-totals">
                  <div className="invoice-total-row">
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        calculateSubtotal(
                          selectedInvoice
                        )
                      )}
                    </strong>
                  </div>

                  <div className="invoice-total-row">
                    <span>
                      Discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        selectedInvoice.discount
                      )}
                    </strong>
                  </div>

                  <div className="invoice-total-row grand">
                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        calculateTotal(
                          selectedInvoice
                        )
                      )}
                    </strong>
                  </div>

                  <div className="invoice-total-row">
                    <span>
                      Amount Paid
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedInvoice.amountPaid
                      )}
                    </strong>
                  </div>

                  <div className="invoice-total-row invoice-balance-row">
                    <span>
                      Balance Due
                    </span>

                    <strong>
                      {formatCurrency(
                        calculateBalance(
                          selectedInvoice
                        )
                      )}
                    </strong>
                  </div>
                </div>

                <div className="invoice-document-bottom">
                  <div className="invoice-notes">
                    <h3>
                      Notes
                    </h3>

                    <p>
                      {selectedInvoice.notes ||
                        "Thank you for your business."}
                    </p>
                  </div>

                  <div className="invoice-bank">
                    <h3>
                      Banking Details
                    </h3>

                    <div className="invoice-bank-grid">
                      <strong>
                        Bank
                      </strong>

                      <span>
                        {
                          bankingDetails.bankName
                        }
                      </span>

                      <strong>
                        Account Name
                      </strong>

                      <span>
                        {
                          bankingDetails.accountName
                        }
                      </span>

                      <strong>
                        Account Type
                      </strong>

                      <span>
                        {
                          bankingDetails.accountType
                        }
                      </span>

                      <strong>
                        Account No.
                      </strong>

                      <span>
                        {
                          bankingDetails.accountNumber
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="invoice-document-footer">
                  {
                    companyDetails.name
                  }{" "}
                  ·{" "}
                  {
                    companyDetails.tagline
                  }
                  <br />
                  Thank you for choosing
                  STYLZ DIGITAL
                  SOLUTIONS.
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Invoices;