import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  X,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import {
  defaultCustomers,
  CUSTOMER_STORAGE_KEY,
} from "../data/customers";

const Customers = () => {
  // =========================================================
  // CUSTOMERS
  // =========================================================

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

  // Save customers whenever the customer list changes
  useEffect(() => {
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // MODALS
  // =========================================================

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // =========================================================
  // FORM
  // =========================================================

  const [formData, setFormData] = useState({
    customerType: "Business",
    customerName: "",
    companyName: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    status: "Active",
  });

  // =========================================================
  // FILTER CUSTOMERS
  // =========================================================

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.companyName?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.whatsapp?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.city?.toLowerCase().includes(search) ||
      customer.id?.toLowerCase().includes(search)
    );
  });

  // =========================================================
  // OPEN ADD CUSTOMER
  // =========================================================

  const handleAddCustomer = () => {
    setEditingCustomer(null);

    setFormData({
      customerType: "Business",
      customerName: "",
      companyName: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
      notes: "",
      status: "Active",
    });

    setShowForm(true);
  };

  // =========================================================
  // EDIT CUSTOMER
  // =========================================================

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      customerType: customer.customerType || "Business",
      customerName: customer.name || "",
      companyName: customer.companyName || "",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      notes: customer.notes || "",
      status: customer.status || "Active",
    });

    setShowDetails(false);
    setShowForm(true);
  };

  // =========================================================
  // VIEW CUSTOMER
  // =========================================================

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedCustomer(null);
  };

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE CUSTOMER
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      alert("Please enter the customer name.");
      return;
    }

    // EDIT EXISTING CUSTOMER
    if (editingCustomer) {
      const updatedCustomers = customers.map((customer) => {
        if (customer.id === editingCustomer.id) {
          return {
            ...customer,
            name: formData.customerName.trim(),
            customerType: formData.customerType,
            companyName: formData.companyName.trim(),
            phone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            notes: formData.notes.trim(),
            status: formData.status,
          };
        }

        return customer;
      });

      setCustomers(updatedCustomers);
      closeForm();

      return;
    }

    // CREATE NEW CUSTOMER
    const newCustomerNumber = customers.length + 1;

    const newCustomer = {
      id: `CUS-${String(newCustomerNumber).padStart(3, "0")}`,
      name: formData.customerName.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim(),
      orders: 0,
      balance: "R0.00",
      status: formData.status,
      customerType: formData.customerType,
      companyName: formData.companyName.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCustomers((previous) => [
      ...previous,
      newCustomer,
    ]);

    closeForm();
  };

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDeleteCustomer = (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) {
      return;
    }

    setCustomers((previous) =>
      previous.filter((item) => item.id !== customer.id)
    );

    if (
      selectedCustomer &&
      selectedCustomer.id === customer.id
    ) {
      closeDetails();
    }
  };

  // =========================================================
  // WHATSAPP CUSTOMER
  // =========================================================

  const handleWhatsApp = (customer) => {
    if (
      !customer.whatsapp ||
      customer.whatsapp === "—"
    ) {
      alert(
        "This customer does not have a WhatsApp number saved."
      );
      return;
    }

    let number = customer.whatsapp.replace(/\D/g, "");

    // Convert South African 0XXXXXXXXX number
    // to 27XXXXXXXXX
    if (number.startsWith("0")) {
      number = "27" + number.substring(1);
    }

    const message = encodeURIComponent(
      `Hello ${customer.name}, this is STYLZ DIGITAL SOLUTIONS.`
    );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank"
    );
  };

  // =========================================================
  // EMAIL CUSTOMER
  // =========================================================

  const handleEmail = (customer) => {
    if (
      !customer.email ||
      customer.email === "—"
    ) {
      alert(
        "This customer does not have an email address saved."
      );
      return;
    }

    const subject = encodeURIComponent(
      "STYLZ DIGITAL SOLUTIONS"
    );

    const body = encodeURIComponent(
      `Hello ${customer.name},

Thank you for choosing STYLZ DIGITAL SOLUTIONS.

Kind regards,
STYLZ DIGITAL SOLUTIONS
Creative Printing, Branding & Digital Solutions`
    );

    window.location.href =
      `mailto:${customer.email}?subject=${subject}&body=${body}`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage your STYLZ DIGITAL SOLUTIONS customers
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={handleAddCustomer}
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* SEARCH */}

      <div className="card search-card">
        <div className="search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search customers by name, company, phone, email or city..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
      </div>

      {/* CUSTOMER TABLE */}

      <div className="card">

        <div className="table-header">
          <div>
            <h2>Customer List</h2>

            <span>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        <div className="table-wrapper">

          <table className="data-table">

            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="empty-state"
                  >
                    <User size={40} />

                    <h3>No customers found</h3>

                    <p>
                      Try a different search or add a
                      new customer.
                    </p>
                  </td>
                </tr>

              ) : (

                filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-name-cell">

                        <div className="customer-avatar">
                          {customer.customerType ===
                          "Business" ? (
                            <Building2 size={18} />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div>

                          <strong>
                            {customer.name}
                          </strong>

                          {customer.companyName &&
                            customer.companyName !==
                              customer.name && (
                              <small>
                                {customer.companyName}
                              </small>
                            )}

                          <small>
                            {customer.id}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td>

                      <div className="contact-cell">

                        {customer.phone &&
                          customer.phone !== "—" && (
                            <span>
                              <Phone size={14} />
                              {customer.phone}
                            </span>
                          )}

                        {customer.whatsapp &&
                          customer.whatsapp !==
                            "—" && (
                            <span>
                              <MessageCircle
                                size={14}
                              />
                              {customer.whatsapp}
                            </span>
                          )}

                        {customer.email &&
                          customer.email !== "—" && (
                            <span>
                              <Mail size={14} />
                              {customer.email}
                            </span>
                          )}

                      </div>

                    </td>

                    {/* LOCATION */}

                    <td>

                      <div className="location-cell">

                        {customer.city && (
                          <span>
                            <MapPin size={14} />
                            {customer.city}
                          </span>
                        )}

                      </div>

                    </td>

                    {/* ORDERS */}

                    <td>
                      {customer.orders || 0}
                    </td>

                    {/* BALANCE */}

                    <td>
                      <strong>
                        {customer.balance || "R0.00"}
                      </strong>
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`status-badge ${
                          customer.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {customer.status}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="icon-btn"
                          title="View Customer"
                          onClick={() =>
                            handleViewCustomer(customer)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Edit Customer"
                          onClick={() =>
                            handleEditCustomer(customer)
                          }
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          className="icon-btn whatsapp-btn"
                          title="WhatsApp"
                          onClick={() =>
                            handleWhatsApp(customer)
                          }
                        >
                          <MessageCircle size={17} />
                        </button>

                        <button
                          className="icon-btn email-btn"
                          title="Email"
                          onClick={() =>
                            handleEmail(customer)
                          }
                        >
                          <Mail size={17} />
                        </button>

                        <button
                          className="icon-btn delete-btn"
                          title="Delete Customer"
                          onClick={() =>
                            handleDeleteCustomer(customer)
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD / EDIT CUSTOMER MODAL */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal customer-form-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  Enter the customer's complete
                  information.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeForm}
                type="button"
                title="Close"
              >
                <X size={22} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* CUSTOMER TYPE */}

              <div className="form-section">

                <h3>Customer Type</h3>

                <div className="customer-type-buttons">

                  <button
                    type="button"
                    className={
                      formData.customerType ===
                      "Business"
                        ? "type-btn selected"
                        : "type-btn"
                    }
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        customerType: "Business",
                      }))
                    }
                  >
                    <Building2 size={18} />
                    Business
                  </button>

                  <button
                    type="button"
                    className={
                      formData.customerType ===
                      "Individual"
                        ? "type-btn selected"
                        : "type-btn"
                    }
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        customerType: "Individual",
                      }))
                    }
                  >
                    <User size={18} />
                    Individual
                  </button>

                </div>

              </div>

              {/* CUSTOMER INFORMATION */}

              <div className="form-section">

                <h3>Customer Information</h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Customer Name *
                    </label>

                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Company Name
                    </label>

                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                    />

                  </div>

                </div>

              </div>

              {/* CONTACT DETAILS */}

              <div className="form-section">

                <h3>Contact Details</h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 071 123 4567"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      WhatsApp Number
                    </label>

                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="e.g. 071 123 4567"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="customer@example.com"
                    />

                  </div>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-section">

                <h3>Address</h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Street Address
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Randfontein"
                    />

                  </div>

                </div>

              </div>

              {/* NOTES */}

              <div className="form-section">

                <h3>Additional Information</h3>

                <div className="form-group">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Customer notes..."
                    rows="4"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>

              {/* FORM ACTIONS */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingCustomer
                    ? "Update Customer"
                    : "Save Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* CUSTOMER DETAILS MODAL */}

      {showDetails && selectedCustomer && (

        <div className="modal-overlay">

          <div className="modal customer-details-modal">

            <div className="modal-header">

              <div>

                <h2>
                  Customer Details
                </h2>

                <p>
                  {selectedCustomer.id}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeDetails}
                type="button"
                title="Close"
              >
                <X size={22} />
              </button>

            </div>

            {/* CUSTOMER PROFILE */}

            <div className="customer-profile">

              <div className="large-customer-avatar">

                {selectedCustomer.customerType ===
                "Business" ? (
                  <Building2 size={30} />
                ) : (
                  <User size={30} />
                )}

              </div>

              <div>

                <h2>
                  {selectedCustomer.name}
                </h2>

                {selectedCustomer.companyName && (
                  <p>
                    {selectedCustomer.companyName}
                  </p>
                )}

                <span
                  className={`status-badge ${
                    selectedCustomer.status === "Active"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {selectedCustomer.status}
                </span>

              </div>

            </div>

            {/* DETAILS GRID */}

            <div className="details-grid">

              <div className="detail-item">

                <span>
                  <Phone size={16} />
                  Phone
                </span>

                <strong>
                  {selectedCustomer.phone || "—"}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  <MessageCircle size={16} />
                  WhatsApp
                </span>

                <strong>
                  {selectedCustomer.whatsapp || "—"}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  <Mail size={16} />
                  Email
                </span>

                <strong>
                  {selectedCustomer.email || "—"}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  <MapPin size={16} />
                  Address
                </span>

                <strong>
                  {selectedCustomer.address || "—"}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  City
                </span>

                <strong>
                  {selectedCustomer.city || "—"}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Customer Type
                </span>

                <strong>
                  {selectedCustomer.customerType}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Orders
                </span>

                <strong>
                  {selectedCustomer.orders || 0}
                </strong>

              </div>

              <div className="detail-item">

                <span>
                  Outstanding Balance
                </span>

                <strong>
                  {selectedCustomer.balance || "R0.00"}
                </strong>

              </div>

            </div>

            {/* NOTES */}

            {selectedCustomer.notes && (

              <div className="customer-notes">

                <h3>
                  Notes
                </h3>

                <p>
                  {selectedCustomer.notes}
                </p>

              </div>

            )}

            {/* ACTIONS */}

            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={() =>
                  handleEditCustomer(selectedCustomer)
                }
              >
                <Edit size={17} />
                Edit Customer
              </button>

              <button
                className="whatsapp-action-btn"
                onClick={() =>
                  handleWhatsApp(selectedCustomer)
                }
              >
                <MessageCircle size={17} />
                WhatsApp
              </button>

              <button
                className="email-action-btn"
                onClick={() =>
                  handleEmail(selectedCustomer)
                }
              >
                <Mail size={17} />
                Email
              </button>

              <button
                className="primary-btn"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Customers;