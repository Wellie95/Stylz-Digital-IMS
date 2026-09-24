import React, { useEffect, useState } from "react";
import {
  defaultCustomers,
  CUSTOMER_STORAGE_KEY,
} from "../data/customers";
import { products } from "../data/products";

const company = {
  name: "STYLZ DIGITAL SOLUTIONS",
  tagline: "Creative Printing, Branding & Digital Solutions",
  registration: "Reg No. 2023/916461/07 · Zimbabwe & South Africa",
  phone: "084 379 3246 / 062 617 3145",
  email: "info@stylzdigital.co.za",
  website: "www.stylzdigital.co.za",
  address: "Randfontein, Gauteng, South Africa",
};

const banking = {
  bank: "FNB",
  accountName: "STYLZ DIGITAL SOLUTIONS",
  accountType: "Savings",
  accountNumber: "63112021413",
};

const QUOTES_STORAGE_KEY = "stylz_ims_quotes";

const initialQuotes = [
  {
    id: "QT-0001",
    customer: "Walk-in Customer",
    customerId: "CUS-001",
    customerDetails: {
      companyName: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
    },
    date: "2026-09-16",
    validUntil: "2026-09-30",
    status: "Draft",
    items: [
      {
        description: "A5 Flyers",
        quantity: 500,
        price: 1200,
      },
    ],
    discount: 0,
    notes: "50% deposit required before production.",
  },
];

function Quotes() {
  // =====================================================
  // CUSTOMERS
  // =====================================================

  const [customers, setCustomers] = useState(() => {
    try {
      const savedCustomers = localStorage.getItem(
        CUSTOMER_STORAGE_KEY
      );

      if (savedCustomers) {
        return JSON.parse(savedCustomers);
      }

      return defaultCustomers;
    } catch (error) {
      console.error("Error loading customers:", error);
      return defaultCustomers;
    }
  });

  // =====================================================
  // QUOTES
  // =====================================================

  const [quotes, setQuotes] = useState(() => {
    try {
      const savedQuotes = localStorage.getItem(
        QUOTES_STORAGE_KEY
      );

      if (savedQuotes) {
        return JSON.parse(savedQuotes);
      }

      return initialQuotes;
    } catch (error) {
      console.error("Error loading quotes:", error);
      return initialQuotes;
    }
  });

  const [productCatalog, setProductCatalog] = useState(products);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("stylz_ims_products");
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) setProductCatalog(parsed);
      }
    } catch (error) {
      console.error("Error loading product catalog:", error);
    }
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    customer: "",
    customerId: "",
    manualCustomer: false,

    customerDetails: {
      companyName: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
    },

    date: new Date().toISOString().split("T")[0],

    validUntil: "",

    discount: 0,

    notes: "50% deposit required before production.",

    items: [
      {
        description: "",
        quantity: 1,
        price: 0,
      },
    ],
  });

  // =====================================================
  // SAVE CUSTOMERS
  // =====================================================

  const saveCustomersToStorage = (updatedCustomers) => {
    setCustomers(updatedCustomers);

    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(updatedCustomers)
    );
  };

  // =====================================================
  // SAVE QUOTES
  // =====================================================

  const saveQuotesToStorage = (updatedQuotes) => {
    setQuotes(updatedQuotes);

    localStorage.setItem(
      QUOTES_STORAGE_KEY,
      JSON.stringify(updatedQuotes)
    );
  };

  // =====================================================
  // NORMALIZE TEXT FOR CUSTOMER MATCHING
  // =====================================================

  const normalizeText = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  // =====================================================
  // NORMALIZE PHONE NUMBER
  // =====================================================

  const normalizePhone = (value) => {
    let number = String(value || "").replace(
      /\D/g,
      ""
    );

    if (number.startsWith("27")) {
      return number;
    }

    if (number.startsWith("0")) {
      return "27" + number.substring(1);
    }

    return number;
  };

  // =====================================================
  // FIND EXISTING CUSTOMER
  //
  // Matching fields:
  // - Name
  // - Company
  // - Phone
  // - WhatsApp
  // - Email
  // =====================================================

  const findExistingCustomer = (customerData) => {
    const newName = normalizeText(
      customerData.name
    );

    const newCompany = normalizeText(
      customerData.companyName
    );

    const newPhone = normalizePhone(
      customerData.phone
    );

    const newWhatsApp = normalizePhone(
      customerData.whatsapp
    );

    const newEmail = normalizeText(
      customerData.email
    );

    return customers.find((customer) => {
      const existingName = normalizeText(
        customer.name
      );

      const existingCompany = normalizeText(
        customer.companyName
      );

      const existingPhone = normalizePhone(
        customer.phone
      );

      const existingWhatsApp = normalizePhone(
        customer.whatsapp
      );

      const existingEmail = normalizeText(
        customer.email
      );

      // Exact name match
      if (
        newName &&
        existingName &&
        newName === existingName
      ) {
        return true;
      }

      // Exact company match
      if (
        newCompany &&
        existingCompany &&
        newCompany === existingCompany
      ) {
        return true;
      }

      // Phone match
      if (
        newPhone &&
        newPhone.length >= 9 &&
        existingPhone &&
        newPhone === existingPhone
      ) {
        return true;
      }

      // WhatsApp match
      if (
        newWhatsApp &&
        newWhatsApp.length >= 9 &&
        existingWhatsApp &&
        newWhatsApp === existingWhatsApp
      ) {
        return true;
      }

      // Email match
      if (
        newEmail &&
        existingEmail &&
        newEmail === existingEmail
      ) {
        return true;
      }

      return false;
    });
  };

  // =====================================================
  // CREATE NEW CUSTOMER
  // =====================================================

  const createCustomerFromQuote = () => {
    const customerData = {
      name: form.customer.trim(),

      companyName:
        form.customerDetails.companyName.trim(),

      phone:
        form.customerDetails.phone.trim(),

      whatsapp:
        form.customerDetails.whatsapp.trim(),

      email:
        form.customerDetails.email.trim(),

      address:
        form.customerDetails.address.trim(),

      city:
        form.customerDetails.city.trim(),
    };

    // First check if customer already exists
    const existingCustomer =
      findExistingCustomer(customerData);

    if (existingCustomer) {
      return {
        customer: existingCustomer,
        created: false,
      };
    }

    // ===================================================
    // GENERATE NEW CUSTOMER NUMBER
    // ===================================================

    const customerNumbers = customers
      .map((customer) => {
        const match = String(customer.id || "").match(
          /CUS-(\d+)/
        );

        return match
          ? Number(match[1])
          : 0;
      })
      .filter((number) => number > 0);

    const highestCustomerNumber =
      customerNumbers.length > 0
        ? Math.max(...customerNumbers)
        : 0;

    const nextCustomerNumber = String(
      highestCustomerNumber + 1
    ).padStart(3, "0");

    const newCustomer = {
      id: `CUS-${nextCustomerNumber}`,

      name: customerData.name,

      phone: customerData.phone || "—",

      whatsapp:
        customerData.whatsapp || "—",

      email: customerData.email || "—",

      orders: 0,

      balance: "R0.00",

      status: "Active",

      customerType:
        customerData.companyName
          ? "Business"
          : "Individual",

      companyName:
        customerData.companyName,

      address:
        customerData.address,

      city:
        customerData.city,

      notes: "",

      createdAt:
        new Date()
          .toISOString()
          .split("T")[0],
    };

    const updatedCustomers = [
      ...customers,
      newCustomer,
    ];

    saveCustomersToStorage(
      updatedCustomers
    );

    return {
      customer: newCustomer,
      created: true,
    };
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      customer: "",
      customerId: "",
      manualCustomer: false,

      customerDetails: {
        companyName: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        city: "",
      },

      date: new Date().toISOString().split("T")[0],

      validUntil: "",

      discount: 0,

      notes:
        "50% deposit required before production.",

      items: [
        {
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
    });

    setEditingQuote(null);
  };

  // =====================================================
  // NEW QUOTE
  // =====================================================

  const openNewQuote = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // =====================================================
  // EDIT QUOTE
  // =====================================================

  const openEditQuote = (quote) => {
    setEditingQuote(quote);

    // Try to find the customer in the database
    let matchedCustomer = null;

    if (quote.customerId) {
      matchedCustomer = customers.find(
        (customer) =>
          customer.id === quote.customerId
      );
    }

    if (!matchedCustomer) {
      matchedCustomer =
        findExistingCustomer({
          name: quote.customer,
          companyName:
            quote.customerDetails?.companyName,
          phone:
            quote.customerDetails?.phone,
          whatsapp:
            quote.customerDetails?.whatsapp,
          email:
            quote.customerDetails?.email,
        });
    }

    setForm({
      customer:
        matchedCustomer?.name ||
        quote.customer ||
        "",

      customerId:
        matchedCustomer?.id ||
        quote.customerId ||
        "",

      manualCustomer:
        !matchedCustomer,

      customerDetails: {
        companyName:
          matchedCustomer?.companyName ||
          quote.customerDetails?.companyName ||
          "",

        phone:
          matchedCustomer?.phone &&
          matchedCustomer.phone !== "—"
            ? matchedCustomer.phone
            : quote.customerDetails?.phone ||
              "",

        whatsapp:
          matchedCustomer?.whatsapp &&
          matchedCustomer.whatsapp !== "—"
            ? matchedCustomer.whatsapp
            : quote.customerDetails?.whatsapp ||
              "",

        email:
          matchedCustomer?.email &&
          matchedCustomer.email !== "—"
            ? matchedCustomer.email
            : quote.customerDetails?.email ||
              "",

        address:
          matchedCustomer?.address ||
          quote.customerDetails?.address ||
          "",

        city:
          matchedCustomer?.city ||
          quote.customerDetails?.city ||
          "",
      },

      date:
        quote.date ||
        new Date().toISOString().split("T")[0],

      validUntil:
        quote.validUntil || "",

      discount:
        quote.discount || 0,

      notes:
        quote.notes || "",

      items: quote.items?.length
        ? quote.items.map((item) => ({
            description:
              item.description || "",

            quantity:
              Number(item.quantity) || 1,

            price:
              Number(item.price) || 0,
          }))
        : [
            {
              description: "",
              quantity: 1,
              price: 0,
            },
          ],
    });

    setShowPreview(false);
    setShowForm(true);
  };

  // =====================================================
  // CUSTOMER SELECTED
  // =====================================================

  const handleCustomerSelect = (value) => {
    // Manual customer
    if (value === "__NEW_CUSTOMER__") {
      setForm((previous) => ({
        ...previous,

        customer: "",

        customerId: "",

        manualCustomer: true,

        customerDetails: {
          companyName: "",
          phone: "",
          whatsapp: "",
          email: "",
          address: "",
          city: "",
        },
      }));

      return;
    }

    // Nothing selected
    if (!value) {
      setForm((previous) => ({
        ...previous,

        customer: "",

        customerId: "",

        manualCustomer: false,

        customerDetails: {
          companyName: "",
          phone: "",
          whatsapp: "",
          email: "",
          address: "",
          city: "",
        },
      }));

      return;
    }

    // Existing customer
    const selectedCustomer = customers.find(
      (customer) =>
        customer.id === value
    );

    if (!selectedCustomer) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      customer:
        selectedCustomer.name || "",

      customerId:
        selectedCustomer.id || "",

      manualCustomer: false,

      customerDetails: {
        companyName:
          selectedCustomer.companyName || "",

        phone:
          selectedCustomer.phone !== "—"
            ? selectedCustomer.phone || ""
            : "",

        whatsapp:
          selectedCustomer.whatsapp !== "—"
            ? selectedCustomer.whatsapp || ""
            : "",

        email:
          selectedCustomer.email !== "—"
            ? selectedCustomer.email || ""
            : "",

        address:
          selectedCustomer.address || "",

        city:
          selectedCustomer.city || "",
      },
    }));
  };

  // =====================================================
  // UPDATE CUSTOMER DETAIL
  // =====================================================

  const updateCustomerDetail = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      customerDetails: {
        ...previous.customerDetails,

        [field]: value,
      },
    }));
  };

  // =====================================================
  // UPDATE ITEM
  // =====================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...form.items];

    const nextItem = {
      ...updatedItems[index],
      [field]:
        field === "quantity" || field === "price"
          ? Number(value)
          : value,
    };

    if (field === "description") {
      const match = productCatalog.find(
        (product) =>
          product.name.trim().toLowerCase() ===
          String(value).trim().toLowerCase()
      );

      if (match) {
        nextItem.price = Number(match.price || 0);
      }
    }

    updatedItems[index] = nextItem;

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = () => {
    setForm({
      ...form,

      items: [
        ...form.items,

        {
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
    });
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (index) => {
    if (form.items.length === 1) {
      return;
    }

    setForm({
      ...form,

      items: form.items.filter(
        (_, i) => i !== index
      ),
    });
  };

  // =====================================================
  // CALCULATE SUBTOTAL
  // =====================================================

  const calculateSubtotal = (quote) => {
    return quote.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity) *
          Number(item.price),
      0
    );
  };

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const calculateTotal = (quote) => {
    const subtotal =
      calculateSubtotal(quote);

    const discount =
      Number(quote.discount || 0);

    return Math.max(
      subtotal - discount,
      0
    );
  };

  // =====================================================
  // SAVE QUOTE
  // =====================================================

  const saveQuote = (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // CUSTOMER VALIDATION
    // ---------------------------------------------------

    if (!form.customer.trim()) {
      alert(
        "Please select a customer or enter a new customer."
      );

      return;
    }

    // ---------------------------------------------------
    // ITEM VALIDATION
    // ---------------------------------------------------

    const validItems =
      form.items.filter(
        (item) =>
          item.description.trim() !== "" &&
          Number(item.quantity) > 0
      );

    if (validItems.length === 0) {
      alert(
        "Please add at least one quote item."
      );

      return;
    }

    // ---------------------------------------------------
    // FIND OR CREATE CUSTOMER
    // ---------------------------------------------------

    let finalCustomer = null;

    // Existing customer selected
    if (form.customerId) {
      finalCustomer = customers.find(
        (customer) =>
          customer.id ===
          form.customerId
      );
    }

    // If not found, match by details
    if (!finalCustomer) {
      const customerResult =
        createCustomerFromQuote();

      finalCustomer =
        customerResult.customer;
    }

    // Safety check
    if (!finalCustomer) {
      alert(
        "Unable to save the customer. Please check the customer information."
      );

      return;
    }

    // ---------------------------------------------------
    // CUSTOMER SNAPSHOT FOR QUOTE
    // ---------------------------------------------------

    const finalCustomerDetails = {
      companyName:
        finalCustomer.companyName ||
        form.customerDetails.companyName ||
        "",

      phone:
        finalCustomer.phone &&
        finalCustomer.phone !== "—"
          ? finalCustomer.phone
          : form.customerDetails.phone ||
            "",

      whatsapp:
        finalCustomer.whatsapp &&
        finalCustomer.whatsapp !== "—"
          ? finalCustomer.whatsapp
          : form.customerDetails.whatsapp ||
            "",

      email:
        finalCustomer.email &&
        finalCustomer.email !== "—"
          ? finalCustomer.email
          : form.customerDetails.email ||
            "",

      address:
        finalCustomer.address ||
        form.customerDetails.address ||
        "",

      city:
        finalCustomer.city ||
        form.customerDetails.city ||
        "",
    };

    // ---------------------------------------------------
    // QUOTE DATA
    // ---------------------------------------------------

    const quoteData = {
      customer:
        finalCustomer.name ||
        form.customer.trim(),

      customerId:
        finalCustomer.id,

      customerDetails:
        finalCustomerDetails,

      date:
        form.date,

      validUntil:
        form.validUntil,

      status:
        editingQuote
          ? editingQuote.status
          : "Draft",

      items:
        validItems,

      discount:
        Number(form.discount || 0),

      notes:
        form.notes,
    };

    // ---------------------------------------------------
    // EDIT EXISTING QUOTE
    // ---------------------------------------------------

    if (editingQuote) {
      const updatedQuotes =
        quotes.map((quote) =>
          quote.id === editingQuote.id
            ? {
                ...quote,
                ...quoteData,
              }
            : quote
        );

      saveQuotesToStorage(
        updatedQuotes
      );

      setShowForm(false);

      setEditingQuote(null);

      alert(
        `Quote ${editingQuote.id} updated successfully.`
      );

      return;
    }

    // ---------------------------------------------------
    // CREATE NEW QUOTE
    // ---------------------------------------------------

    const quoteNumbers =
      quotes
        .map((quote) =>
          Number(
            String(quote.id).replace(
              "QT-",
              ""
            )
          )
        )
        .filter(
          (number) =>
            !Number.isNaN(number)
        );

    const highestNumber =
      quoteNumbers.length > 0
        ? Math.max(...quoteNumbers)
        : 0;

    const nextNumber =
      String(
        highestNumber + 1
      ).padStart(4, "0");

    const newQuote = {
      id: `QT-${nextNumber}`,

      ...quoteData,
    };

    saveQuotesToStorage([
      ...quotes,
      newQuote,
    ]);

    setShowForm(false);

    resetForm();

    alert(
      `Quote ${newQuote.id} created successfully.`
    );
  };

  // =====================================================
  // DELETE QUOTE
  // =====================================================

  const deleteQuote = (quote) => {
    const confirmed = window.confirm(
      `Delete quote ${quote.id}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const updatedQuotes = quotes.filter(
      (item) => item.id !== quote.id
    );

    saveQuotesToStorage(updatedQuotes);

    if (selectedQuote?.id === quote.id) {
      setShowPreview(false);
      setSelectedQuote(null);
    }

    if (editingQuote?.id === quote.id) {
      setShowForm(false);
      setEditingQuote(null);
    }

    window.dispatchEvent(
      new Event("stylz-data-updated")
    );
  };

  // =====================================================
  // CONVERT QUOTE TO ORDER
  // =====================================================

  const convertQuoteToOrder = (quote) => {
    if (quote.convertedOrderId) {
      alert(
        `This quote has already been converted to order ${quote.convertedOrderId}.`
      );
      return;
    }

    const existingOrders = (() => {
      try {
        const saved = localStorage.getItem(
          "stylz_ims_orders"
        );
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();

    const orderNumbers = existingOrders
      .map((order) => {
        const match = String(
          order.orderNumber || order.id || ""
        ).match(/STZ-(\d+)/);

        return match ? Number(match[1]) : 0;
      })
      .filter((number) => number > 0);

    const highestOrderNumber =
      orderNumbers.length > 0
        ? Math.max(...orderNumbers)
        : 0;

    const orderNumber = `STZ-${String(
      highestOrderNumber + 1
    ).padStart(3, "0")}`;

    const total = calculateTotal(quote);

    const newOrder = {
      id: orderNumber,
      orderNumber,
      quoteId: quote.id,

      customerId:
        quote.customerId || "",

      customer:
        quote.customer || "Walk-in Customer",

      customerPhone:
        quote.customerDetails?.phone || "",

      customerWhatsapp:
        quote.customerDetails?.whatsapp || "",

      customerEmail:
        quote.customerDetails?.email || "",

      customerCompany:
        quote.customerDetails?.companyName || "",

      customerAddress:
        quote.customerDetails?.address || "",

      customerCity:
        quote.customerDetails?.city || "",

      description: quote.items
        .map(
          (item) =>
            `${item.description} x ${item.quantity}`
        )
        .join(", "),

      jobName:
        quote.items.length === 1
          ? quote.items[0].description
          : `Quote ${quote.id} Production Job`,

      items: quote.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),

      quantity: quote.items.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0),
        0
      ),

      amount: total,
      total,

      priority: "Normal",
      status: "Pending",

      orderDate:
        new Date().toISOString().split("T")[0],

      dueDate:
        quote.validUntil ||
        new Date().toISOString().split("T")[0],

      assignedTo: "",
      notes:
        `Created from quotation ${quote.id}. ${quote.notes || ""}`.trim(),

      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "stylz_ims_orders",
      JSON.stringify([
        ...existingOrders,
        newOrder,
      ])
    );

    // Mark the quotation as accepted/converted.
    const updatedQuotes = quotes.map(
      (item) =>
        item.id === quote.id
          ? {
              ...item,
              status: "Accepted",
              convertedOrderId: orderNumber,
              convertedAt:
                new Date().toISOString(),
            }
          : item
    );

    saveQuotesToStorage(updatedQuotes);

    // Orders.jsx listens to this data store and creates
    // the matching production job automatically when
    // the order is created through the Orders module.
    // Create the production record here as well so
    // quote conversion is immediately visible.
    try {
      const production = JSON.parse(
        localStorage.getItem(
          "stylz_ims_production"
        ) || "[]"
      );

      const productionExists = production.some(
        (job) => job.orderId === orderNumber
      );

      if (!productionExists) {
        production.push({
          id: Date.now(),
          orderId: orderNumber,
          orderNumber,
          job:
            newOrder.jobName ||
            newOrder.description,
          customer: newOrder.customer,
          status: "Queued",
          progress: 0,
          dueDate: newOrder.dueDate,
          assignedTo: "",
        });

        localStorage.setItem(
          "stylz_ims_production",
          JSON.stringify(production)
        );
      }
    } catch (error) {
      console.error(
        "Could not create production job:",
        error
      );
    }

    window.dispatchEvent(
      new Event("stylz-data-updated")
    );

    setSelectedQuote({
      ...quote,
      status: "Accepted",
      convertedOrderId: orderNumber,
      convertedAt:
        new Date().toISOString(),
    });

    alert(
      `Quote ${quote.id} converted successfully to order ${orderNumber}.`
    );
  };

  // =====================================================
  // PREVIEW
  // =====================================================

  const openPreview = (quote) => {
    setSelectedQuote(quote);

    setShowPreview(true);
  };

  // =====================================================
  // CLOSE PREVIEW
  // =====================================================

  const closePreview = () => {
    setShowPreview(false);

    setSelectedQuote(null);
  };

  // =====================================================
  // PRINT
  // =====================================================

  const printQuote = () => {
    window.print();
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const sendQuoteWhatsApp = (
    quote
  ) => {
    const whatsapp =
      quote.customerDetails?.whatsapp;

    if (!whatsapp) {
      alert(
        "This customer does not have a WhatsApp number saved."
      );

      return;
    }

    let number =
      whatsapp.replace(
        /\D/g,
        ""
      );

    if (
      number.startsWith("0")
    ) {
      number =
        "27" +
        number.substring(1);
    }

    const total =
      calculateTotal(
        quote
      ).toFixed(2);

    const message =
      encodeURIComponent(
        `Hello ${quote.customer},

Please find your quotation from STYLZ DIGITAL SOLUTIONS.

Quote Number: ${quote.id}
Quote Total: R${total}
Valid Until: ${
          quote.validUntil ||
          "N/A"
        }

Thank you for choosing STYLZ DIGITAL SOLUTIONS.

Creative Printing, Branding & Digital Solutions

${company.phone}
${company.website}`
      );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank"
    );
  };

  // =====================================================
  // EMAIL
  // =====================================================

  const sendQuoteEmail = (
    quote
  ) => {
    const email =
      quote.customerDetails?.email;

    if (!email) {
      alert(
        "This customer does not have an email address saved."
      );

      return;
    }

    const total =
      calculateTotal(
        quote
      ).toFixed(2);

    const subject =
      encodeURIComponent(
        `Quotation ${quote.id} - STYLZ DIGITAL SOLUTIONS`
      );

    const body =
      encodeURIComponent(
        `Hello ${quote.customer},

Please find your quotation details below.

Quotation Number: ${quote.id}
Quotation Total: R${total}
Valid Until: ${
          quote.validUntil ||
          "N/A"
        }

Thank you for choosing STYLZ DIGITAL SOLUTIONS.

Kind regards,

STYLZ DIGITAL SOLUTIONS
${company.tagline}

${company.phone}
${company.email}
${company.website}`
      );

    window.location.href =
      `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="quotes-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="quotes-header">

        <div>

          <h1>
            Quotes
          </h1>

          <p>
            Create, manage, edit and print customer
            quotations.
          </p>

        </div>

        <button
          className="stylz-primary-btn"
          onClick={openNewQuote}
        >
          + New Quote
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="quotes-stats">

        <div className="quote-stat-card">

          <span>
            Total Quotes
          </span>

          <strong>
            {quotes.length}
          </strong>

        </div>

        <div className="quote-stat-card">

          <span>
            Drafts
          </span>

          <strong>
            {
              quotes.filter(
                (q) =>
                  q.status ===
                  "Draft"
              ).length
            }
          </strong>

        </div>

        <div className="quote-stat-card">

          <span>
            Accepted
          </span>

          <strong>
            {
              quotes.filter(
                (q) =>
                  q.status ===
                  "Accepted"
              ).length
            }
          </strong>

        </div>

        <div className="quote-stat-card">

          <span>
            Quoted Value
          </span>

          <strong>
            R
            {quotes
              .reduce(
                (sum, q) =>
                  sum +
                  calculateTotal(
                    q
                  ),
                0
              )
              .toFixed(2)}
          </strong>

        </div>

      </div>

      {/* =================================================
          QUOTES TABLE
      ================================================= */}

      <div className="quotes-table-card">

        <div className="table-title">

          <h2>
            Recent Quotes
          </h2>

        </div>

        {quotes.length ===
        0 ? (

          <div className="empty-quotes">

            <h3>
              No quotes yet
            </h3>

            <p>
              Create your first customer quotation.
            </p>

            <button
              className="stylz-primary-btn"
              onClick={
                openNewQuote
              }
            >
              + Create Quote
            </button>

          </div>

        ) : (

          <div className="quotes-table-wrapper">

            <table className="quotes-table">

              <thead>

                <tr>

                  <th>
                    Quote No.
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Valid Until
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {quotes.map(
                  (quote) => (

                    <tr
                      key={
                        quote.id
                      }
                    >

                      <td>
                        <strong>
                          {quote.id}
                        </strong>
                      </td>

                      <td>

                        <div>

                          <strong>
                            {
                              quote.customer
                            }
                          </strong>

                          {quote
                            .customerDetails
                            ?.companyName && (

                            <small
                              style={{
                                display:
                                  "block",
                                color:
                                  "#64748b",
                                marginTop:
                                  "3px",
                              }}
                            >
                              {
                                quote
                                  .customerDetails
                                  .companyName
                              }
                            </small>

                          )}

                        </div>

                      </td>

                      <td>
                        {
                          quote.date
                        }
                      </td>

                      <td>
                        {
                          quote.validUntil ||
                          "-"
                        }
                      </td>

                      <td>

                        <span
                          className={`quote-status ${quote.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            quote.status
                          }
                        </span>

                      </td>

                      <td>

                        <strong>
                          R
                          {calculateTotal(
                            quote
                          ).toFixed(
                            2
                          )}
                        </strong>

                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "6px",
                            flexWrap:
                              "wrap",
                          }}
                        >

                          <button
                            className="view-quote-btn"
                            onClick={() =>
                              openPreview(
                                quote
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="view-quote-btn"
                            onClick={() =>
                              openEditQuote(
                                quote
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() =>
                              deleteQuote(quote)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          CREATE / EDIT QUOTE FORM
      ================================================= */}

      {showForm && (

        <div className="stylz-modal-overlay">

          <div className="stylz-modal quote-form-modal">

            <div className="modal-header">

              <div>

                <h2>

                  {editingQuote
                    ? `Edit Quote ${editingQuote.id}`
                    : "Create New Quote"}

                </h2>

                <p>

                  {editingQuote
                    ? "Update the quotation details below."
                    : "Prepare a quotation for your customer."}

                </p>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeForm
                }
                type="button"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                saveQuote
              }
            >

              {/* =================================================
                  CUSTOMER
              ================================================= */}

              <div className="quote-form-section">

                <h3>
                  Customer Information
                </h3>

                <div className="form-group">

                  <label>
                    Customer *
                  </label>

                  <select
                    value={
                      form.manualCustomer
                        ? "__NEW_CUSTOMER__"
                        : form.customerId
                    }
                    onChange={(e) =>
                      handleCustomerSelect(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      -- Select Existing Customer --
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

                          {
                            customer.name
                          }

                          {customer
                            .companyName &&
                          customer.companyName !==
                            customer.name
                            ? ` - ${customer.companyName}`
                            : ""}

                        </option>

                      )
                    )}

                    <option value="__NEW_CUSTOMER__">
                      + Enter New Customer
                    </option>

                  </select>

                </div>

                {/* =================================================
                    MANUAL CUSTOMER
                ================================================= */}

                {form.manualCustomer && (

                  <div
                    style={{
                      marginTop:
                        "18px",
                      padding:
                        "18px",
                      border:
                        "1px solid #dbe3ef",
                      borderRadius:
                        "10px",
                      background:
                        "#f8fafc",
                    }}
                  >

                    <h4
                      style={{
                        marginTop:
                          0,
                        marginBottom:
                          "16px",
                        color:
                          "#1d4ed8",
                      }}
                    >
                      New Customer
                    </h4>

                    <div className="quote-form-grid">

                      <div className="form-group">

                        <label>
                          Customer Name *
                        </label>

                        <input
                          type="text"
                          placeholder="Enter customer name"
                          value={
                            form.customer
                          }
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customer:
                                e
                                  .target
                                  .value,
                            })
                          }
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Company Name
                        </label>

                        <input
                          type="text"
                          placeholder="Company name"
                          value={
                            form
                              .customerDetails
                              .companyName
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "companyName",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Phone
                        </label>

                        <input
                          type="tel"
                          placeholder="e.g. 071 123 4567"
                          value={
                            form
                              .customerDetails
                              .phone
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "phone",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          WhatsApp
                        </label>

                        <input
                          type="tel"
                          placeholder="e.g. 071 123 4567"
                          value={
                            form
                              .customerDetails
                              .whatsapp
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "whatsapp",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Email
                        </label>

                        <input
                          type="email"
                          placeholder="customer@email.com"
                          value={
                            form
                              .customerDetails
                              .email
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "email",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          City
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. Randfontein"
                          value={
                            form
                              .customerDetails
                              .city
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "city",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div
                        className="form-group"
                        style={{
                          gridColumn:
                            "1 / -1",
                        }}
                      >

                        <label>
                          Street Address
                        </label>

                        <input
                          type="text"
                          placeholder="Enter street address"
                          value={
                            form
                              .customerDetails
                              .address
                          }
                          onChange={(e) =>
                            updateCustomerDetail(
                              "address",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                )}

                {/* =================================================
                    EXISTING CUSTOMER DETAILS
                ================================================= */}

                {!form.manualCustomer &&
                  form.customerId && (

                    <div
                      style={{
                        marginTop:
                          "18px",
                        padding:
                          "16px",
                        border:
                          "1px solid #bfdbfe",
                        borderRadius:
                          "10px",
                        background:
                          "#eff6ff",
                      }}
                    >

                      <strong
                        style={{
                          color:
                            "#1d4ed8",
                        }}
                      >
                        Customer loaded
                      </strong>

                      <div
                        style={{
                          marginTop:
                            "8px",
                            fontSize:
                              "13px",
                            lineHeight:
                              "1.7",
                            color:
                              "#475569",
                        }}
                      >

                        <div>
                          <strong>
                            {
                              form.customer
                            }
                          </strong>
                        </div>

                        {form
                          .customerDetails
                          .companyName && (
                          <div>
                            {
                              form
                                .customerDetails
                                .companyName
                            }
                          </div>
                        )}

                        {form
                          .customerDetails
                          .phone && (
                          <div>
                            Phone:{" "}
                            {
                              form
                                .customerDetails
                                .phone
                            }
                          </div>
                        )}

                        {form
                          .customerDetails
                          .whatsapp && (
                          <div>
                            WhatsApp:{" "}
                            {
                              form
                                .customerDetails
                                .whatsapp
                            }
                          </div>
                        )}

                        {form
                          .customerDetails
                          .email && (
                          <div>
                            Email:{" "}
                            {
                              form
                                .customerDetails
                                .email
                            }
                          </div>
                        )}

                        {form
                          .customerDetails
                          .address && (
                          <div>
                            {
                              form
                                .customerDetails
                                .address
                            }
                          </div>
                        )}

                        {form
                          .customerDetails
                          .city && (
                          <div>
                            {
                              form
                                .customerDetails
                                .city
                            }
                          </div>
                        )}

                      </div>

                    </div>

                  )}

              </div>

              {/* =================================================
                  QUOTE DETAILS
              ================================================= */}

              <div className="quote-form-section">

                <h3>
                  Quote Details
                </h3>

                <div className="quote-form-grid">

                  <div className="form-group">

                    <label>
                      Quote Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          date:
                            e.target
                              .value,
                        })
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Valid Until
                    </label>

                    <input
                      type="date"
                      value={
                        form.validUntil
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          validUntil:
                            e.target
                              .value,
                        })
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Discount (R)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.discount
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discount:
                            e.target
                              .value,
                        })
                      }
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  ITEMS
              ================================================= */}

              <div className="quote-items-section">

                <div className="section-heading">

                  <h3>
                    Items / Services
                  </h3>

                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={
                      addItem
                    }
                  >
                    + Add Item
                  </button>

                </div>

                {form.items.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="quote-item-row"
                      key={
                        index
                      }
                    >

                      <div className="form-group item-description">

                        <label>
                          Description
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. A5 Flyers"
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "description",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group item-quantity">

                        <label>
                          Qty
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group item-price">

                        <label>
                          Unit Price (R)
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.price
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "price",
                              e
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="item-line-total">

                        <span>
                          Total
                        </span>

                        <strong>
                          R
                          {(
                            Number(
                              item.quantity
                            ) *
                            Number(
                              item.price
                            )
                          ).toFixed(
                            2
                          )}
                        </strong>

                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                      >
                        ×
                      </button>

                    </div>

                  )
                )}

              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="quote-summary">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    R
                    {form.items
                      .reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          Number(
                            item.quantity
                          ) *
                            Number(
                              item.price
                            ),
                        0
                      )
                      .toFixed(
                        2
                      )}
                  </strong>

                </div>

                <div>

                  <span>
                    Discount
                  </span>

                  <strong>
                    -R
                    {Number(
                      form.discount ||
                        0
                    ).toFixed(
                      2
                    )}
                  </strong>

                </div>

                <div className="grand-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    R
                    {Math.max(
                      form.items.reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          Number(
                            item.quantity
                          ) *
                            Number(
                              item.price
                            ),
                        0
                      ) -
                        Number(
                          form.discount ||
                            0
                        ),
                      0
                    ).toFixed(
                      2
                    )}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  NOTES
              ================================================= */}

              <div className="form-group">

                <label>
                  Notes / Terms
                </label>

                <textarea
                  rows="4"
                  value={
                    form.notes
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes:
                        e.target
                          .value,
                    })
                  }
                />

              </div>

              {/* =================================================
                  FORM ACTIONS
              ================================================= */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stylz-primary-btn"
                >
                  {editingQuote
                    ? "Update Quote"
                    : "Save Quote"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          QUOTE PREVIEW
      ================================================= */}

      {showPreview &&
        selectedQuote && (

          <div className="stylz-modal-overlay">

            <div className="quote-preview-modal">

              <div className="preview-actions">

                <button
                  className="cancel-btn"
                  onClick={
                    closePreview
                  }
                >
                  Close
                </button>

                <button
                  className="view-quote-btn"
                  onClick={() =>
                    openEditQuote(
                      selectedQuote
                    )
                  }
                >
                  ✏ Edit Quote
                </button>

                <button
                  className="view-quote-btn"
                  onClick={() =>
                    convertQuoteToOrder(
                      selectedQuote
                    )
                  }
                  disabled={
                    Boolean(
                      selectedQuote.convertedOrderId
                    )
                  }
                  title={
                    selectedQuote.convertedOrderId
                      ? `Already converted to ${selectedQuote.convertedOrderId}`
                      : "Convert this quote into an order"
                  }
                >
                  {selectedQuote.convertedOrderId
                    ? `✓ Order ${selectedQuote.convertedOrderId}`
                    : "Convert to Order"}
                </button>

                <button
                  className="stylz-whatsapp-btn"
                  onClick={() =>
                    sendQuoteWhatsApp(
                      selectedQuote
                    )
                  }
                >
                  💬 Send via WhatsApp
                </button>

                <button
                  className="stylz-email-btn"
                  onClick={() =>
                    sendQuoteEmail(
                      selectedQuote
                    )
                  }
                >
                  ✉ Send via Email
                </button>

                <button
                  className="stylz-primary-btn"
                  onClick={
                    printQuote
                  }
                >
                  🖨 Print Quote
                </button>

              </div>

              <div
                className="quote-document"
                id="quote-document"
              >

                {/* =================================================
                    COMPANY HEADER
                ================================================= */}

                <div className="quote-document-header">

                  <div className="company-brand">

                    <img
                      src="/stylz_digital_logo.png"
                      alt="STYLZ Digital Solutions"
                    />

                    <div>

                      <h1>
                        {
                          company.name
                        }
                      </h1>

                      <p>
                        {
                          company.tagline
                        }
                      </p>

                      <p>
                        {
                          company.registration
                        }
                      </p>

                      <p>
                        {
                          company.address
                        }
                      </p>

                      <p>
                        {
                          company.phone
                        }
                      </p>

                      <p>
                        {
                          company.email
                        }
                      </p>

                      <p>
                        {
                          company.website
                        }
                      </p>

                    </div>

                  </div>

                  <div className="document-title">

                    <h2>
                      QUOTATION
                    </h2>

                    <strong>
                      {
                        selectedQuote.id
                      }
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    CUSTOMER DETAILS
                ================================================= */}

                <div className="quote-document-info">

                  <div>

                    <span>
                      QUOTE TO
                    </span>

                    <strong>
                      {
                        selectedQuote.customer
                      }
                    </strong>

                    {selectedQuote
                      .customerDetails
                      ?.companyName && (

                      <small>
                        {
                          selectedQuote
                            .customerDetails
                            .companyName
                        }
                      </small>

                    )}

                    {selectedQuote
                      .customerDetails
                      ?.phone && (

                      <small>
                        Phone:{" "}
                        {
                          selectedQuote
                            .customerDetails
                            .phone
                        }
                      </small>

                    )}

                    {selectedQuote
                      .customerDetails
                      ?.whatsapp && (

                      <small>
                        WhatsApp:{" "}
                        {
                          selectedQuote
                            .customerDetails
                            .whatsapp
                        }
                      </small>

                    )}

                    {selectedQuote
                      .customerDetails
                      ?.email && (

                      <small>
                        Email:{" "}
                        {
                          selectedQuote
                            .customerDetails
                            .email
                        }
                      </small>

                    )}

                    {selectedQuote
                      .customerDetails
                      ?.address && (

                      <small>
                        {
                          selectedQuote
                            .customerDetails
                            .address
                        }
                      </small>

                    )}

                    {selectedQuote
                      .customerDetails
                      ?.city && (

                      <small>
                        {
                          selectedQuote
                            .customerDetails
                            .city
                        }
                      </small>

                    )}

                  </div>

                  <div>

                    <span>
                      DATE
                    </span>

                    <strong>
                      {
                        selectedQuote.date
                      }
                    </strong>

                  </div>

                  <div>

                    <span>
                      VALID UNTIL
                    </span>

                    <strong>
                      {
                        selectedQuote
                          .validUntil ||
                        "-"
                      }
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    ITEMS
                ================================================= */}

                <table className="document-items">

                  <thead>

                    <tr>

                      <th>
                        Description
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Unit Price
                      </th>

                      <th>
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedQuote.items.map(
                      (
                        item,
                        index
                      ) => (

                        <tr
                          key={
                            index
                          }
                        >

                          <td>
                            {
                              item.description
                            }
                          </td>

                          <td>
                            {
                              item.quantity
                            }
                          </td>

                          <td>
                            R
                            {Number(
                              item.price
                            ).toFixed(
                              2
                            )}
                          </td>

                          <td>
                            R
                            {(
                              Number(
                                item.quantity
                              ) *
                              Number(
                                item.price
                              )
                            ).toFixed(
                              2
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

                {/* =================================================
                    TOTALS
                ================================================= */}

                <div className="document-total-area">

                  <div>

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      R
                      {calculateSubtotal(
                        selectedQuote
                      ).toFixed(
                        2
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Discount
                    </span>

                    <strong>
                      -R
                      {Number(
                        selectedQuote.discount ||
                          0
                      ).toFixed(
                        2
                      )}
                    </strong>

                  </div>

                  <div className="document-grand-total">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      R
                      {calculateTotal(
                        selectedQuote
                      ).toFixed(
                        2
                      )}
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    NOTES
                ================================================= */}

                <div className="quote-notes">

                  <h3>
                    Notes & Terms
                  </h3>

                  <p>
                    {
                      selectedQuote.notes
                    }
                  </p>

                </div>

                {/* =================================================
                    BANKING DETAILS
                ================================================= */}

                <div className="quote-banking-details">

                  <div className="banking-header">

                    <h3>
                      PAYMENT / BANKING DETAILS
                    </h3>

                  </div>

                  <div className="banking-grid">

                    <div>

                      <span>
                        Bank
                      </span>

                      <strong>
                        {
                          banking.bank
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Account Name
                      </span>

                      <strong>
                        {
                          banking.accountName
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Account Type
                      </span>

                      <strong>
                        {
                          banking.accountType
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Account Number
                      </span>

                      <strong>
                        {
                          banking.accountNumber
                        }
                      </strong>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="quote-footer">

                  <strong>
                    Thank you for choosing
                    STYLZ DIGITAL SOLUTIONS.
                  </strong>

                  <span>
                    Professional Printing •
                    Graphic Design • Websites •
                    Branding
                  </span>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Quotes;