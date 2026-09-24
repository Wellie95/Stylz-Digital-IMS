import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Tag,
  Edit3,
  X,
  Save,
  Printer,
} from "lucide-react";

import { products } from "../data/products";

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [productList, setProductList] = useState(products);

  const [form, setForm] = useState({
    name: "",
    category: "Digital Printing",
    description: "",
    price: "",
    unit: "each",
  });

  const categories = [
    "All",
    ...Array.from(
      new Set(productList.map((product) => product.category))
    ),
  ];

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [productList, searchTerm, selectedCategory]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddProduct = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.price) {
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit,
    };

    setProductList((current) => [
      ...current,
      newProduct,
    ]);

    setForm({
      name: "",
      category: "Digital Printing",
      description: "",
      price: "",
      unit: "each",
    });

    setShowAddForm(false);
  };

  const formatPrice = (price) => {
    return `R ${Number(price).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

const handlePrintPriceList = () => {
  const groupedProducts = productList.reduce(
    (groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }

      groups[product.category].push(product);

      return groups;
    },
    {}
  );

  const formatPrintPrice = (price) => {
    return `R ${Number(price).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const categorySections = Object.entries(
    groupedProducts
  )
    .map(
      ([category, categoryProducts]) => `
        <section class="category">

          <div class="category-title">
            ${category}
          </div>

          <table>

            <thead>
              <tr>
                <th>Product / Service</th>
                <th>Description</th>
                <th>Price</th>
                <th>Unit</th>
              </tr>
            </thead>

            <tbody>

              ${categoryProducts
                .map(
                  (product) => `
                    <tr>

                      <td>
                        <strong>
                          ${product.name}
                        </strong>
                      </td>

                      <td>
                        ${product.description}
                      </td>

                      <td class="price">
                        ${formatPrintPrice(
                          product.price
                        )}
                      </td>

                      <td>
                        ${product.unit}
                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

        </section>
      `
    )
    .join("");

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  document.body.appendChild(iframe);

  const printDocument =
    iframe.contentWindow.document;

  printDocument.open();

  printDocument.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8" />

        <title>
          STYLZ Digital Solutions - Price List
        </title>

        <style>

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
          }

          body {
            padding: 8mm;
          }

          .document {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }

          /* HEADER */

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            padding-bottom: 14px;

            border-bottom: 4px solid #e11d48;

            position: relative;
          }

          .header::after {
            content: "";

            position: absolute;

            left: 0;
            bottom: -4px;

            width: 42%;
            height: 4px;

            background: #2563eb;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .logo {
            width: 68px;
            height: 68px;

            object-fit: contain;
            border-radius: 50%;
          }

          .brand h1 {
            margin: 0;

            font-size: 23px;
            font-weight: 900;

            color: #111827;
          }

          .brand p {
            margin: 5px 0 0;

            font-size: 10px;

            color: #475569;
          }

          .document-title {
            text-align: right;
          }

          .document-title small {
            display: block;

            font-size: 9px;
            font-weight: 800;

            color: #2563eb;

            letter-spacing: 2px;
          }

          .document-title strong {
            display: block;

            margin-top: 3px;

            font-size: 24px;
            font-weight: 900;

            color: #e11d48;

            letter-spacing: 1px;
          }


          /* COMPANY DETAILS */

          .company-details {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 20px;

            margin-top: 14px;

            padding: 12px 14px;

            background: #f8fafc;

            border: 1px solid #e2e8f0;
          }

          .company-column {
            display: flex;

            flex-direction: column;

            gap: 3px;
          }

          .company-column strong {
            font-size: 11px;
          }

          .company-column span {
            font-size: 8.5px;

            color: #475569;

            line-height: 1.4;
          }


          /* PRODUCTS */

          .price-content {
            margin-top: 16px;
          }

          .category {
            margin-bottom: 14px;

            page-break-inside: avoid;
            break-inside: avoid;
          }

          .category-title {
            padding: 8px 10px;

            background: #1d4ed8;

            color: #ffffff;

            border-left: 5px solid #e11d48;

            font-size: 11px;

            font-weight: 800;
          }

          table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }

          th {
            padding: 6px 8px;

            background: #eff6ff;

            border-bottom: 1px solid #cbd5e1;

            text-align: left;

            font-size: 8px;

            color: #334155;

            text-transform: uppercase;
          }

          td {
            padding: 6px 8px;

            border-bottom: 1px solid #e2e8f0;

            font-size: 8.5px;

            color: #475569;

            vertical-align: top;

            line-height: 1.35;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          th:nth-child(1),
          td:nth-child(1) {
            width: 25%;
          }

          th:nth-child(2),
          td:nth-child(2) {
            width: 42%;
          }

          th:nth-child(3),
          td:nth-child(3) {
            width: 18%;
          }

          th:nth-child(4),
          td:nth-child(4) {
            width: 15%;
          }

          td:first-child {
            color: #111827;
          }

          td.price {
            color: #e11d48;

            font-weight: 900;

            white-space: nowrap;
          }


          /* PAYMENT */

          .payment {
            display: flex;

            justify-content: space-between;

            gap: 20px;

            margin-top: 18px;

            padding: 12px 14px;

            background: #f8fafc;

            border: 1px solid #cbd5e1;

            border-left: 5px solid #e11d48;

            page-break-inside: avoid;
          }

          .payment h3 {
            margin: 0 0 6px;

            font-size: 9px;

            color: #1d4ed8;

            letter-spacing: 1px;
          }

          .payment p {
            margin: 3px 0;

            font-size: 8px;

            color: #475569;
          }

          .thank-you {
            display: flex;

            flex-direction: column;

            justify-content: center;

            text-align: right;
          }

          .thank-you strong {
            color: #e11d48;

            font-size: 9px;
          }

          .thank-you span {
            margin-top: 4px;

            color: #64748b;

            font-size: 8px;
          }


          /* FOOTER */

          .footer {
            display: flex;

            justify-content: space-between;

            gap: 15px;

            margin-top: 14px;

            padding-top: 8px;

            border-top: 2px solid #2563eb;

            page-break-inside: avoid;
          }

          .footer strong {
            font-size: 8px;

            color: #2563eb;
          }

          .footer span {
            max-width: 75%;

            text-align: right;

            font-size: 7px;

            line-height: 1.35;

            color: #64748b;
          }


          @page {
            size: A4 portrait;
            margin: 8mm;
          }

        </style>

      </head>

      <body>

        <div class="document">

          <div class="header">

            <div class="brand">

              <img
                src="${window.location.origin}/stylz_digital_logo.png"
                class="logo"
                alt="STYLZ Digital Solutions"
              />

              <div>

                <h1>
                  STYLZ DIGITAL SOLUTIONS
                </h1>

                <p>
                  Creative Printing, Branding & Digital Solutions
                </p>

              </div>

            </div>

            <div class="document-title">

              <small>
                OFFICIAL
              </small>

              <strong>
                PRICE LIST
              </strong>

            </div>

          </div>


          <div class="company-details">

            <div class="company-column">

              <strong>
                STYLZ DIGITAL SOLUTIONS
              </strong>

              <span>
                Reg No. 2023/916461/07 · Zimbabwe & South Africa
              </span>

              <span>
                118 Village Street, Randfontein, 1759, South Africa
              </span>

            </div>

            <div class="company-column">

              <span>
                Tel: 084 379 3246 / 062 617 3145 / 061 398 2106
              </span>

              <span>
                Email: info@stylzdigitalsolutions.co.za
              </span>

              <span>
                Website: www.stylzdigital.co.za
              </span>

            </div>

          </div>


          <div class="price-content">

            ${categorySections}

          </div>


          <div class="payment">

            <div>

              <h3>
                PAYMENT DETAILS
              </h3>

              <p>
                <strong>Bank:</strong> FNB
              </p>

              <p>
                <strong>Account Name:</strong>
                STYLZ DIGITAL SOLUTIONS
              </p>

              <p>
                <strong>Account Type:</strong> Savings
              </p>

              <p>
                <strong>Account Number:</strong>
                63112021413
              </p>

            </div>

            <div class="thank-you">

              <strong>
                THANK YOU FOR CHOOSING STYLZ
              </strong>

              <span>
                Professional printing, branding and digital solutions.
              </span>

            </div>

          </div>


          <div class="footer">

            <strong>
              STYLZ DIGITAL SOLUTIONS
            </strong>

            <span>
              All prices are in South African Rand (ZAR)
              and may vary based on quantity, material,
              complexity and installation requirements.
              Bulk discounts may apply.
            </span>

          </div>

        </div>

      </body>

    </html>
  `);

  printDocument.close();

  const printFrame = iframe.contentWindow;

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    setTimeout(() => {
      printFrame.focus();
      printFrame.print();
      cleanup();
    }, 500);
  };
};
  const totalProducts = productList.length;

  const categoryCount = new Set(
    productList.map((product) => product.category)
  ).size;

  const averagePrice =
    totalProducts > 0
      ? productList.reduce(
          (total, product) =>
            total + Number(product.price),
          0
        ) / totalProducts
      : 0;

  const groupedProducts = productList.reduce(
    (groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }

      groups[product.category].push(product);

      return groups;
    },
    {}
  );

  return (
    <div className="products-page">

      {/* =====================================================
          NORMAL PRODUCTS PAGE
          ===================================================== */}

      <div className="products-screen">

        <div className="products-header">
          <div>
            <h1>Products & Prices</h1>

            <p>
              Manage STYLZ Digital Solutions products,
              services and pricing.
            </p>
          </div>

          <div className="products-header-actions">

            <button
              className="secondary-button products-print-button"
              type="button"
              onClick={handlePrintPriceList}
            >
              <Printer size={18} />
              Print Price List
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={18} />
              Add Product
            </button>

          </div>
        </div>

        {/* =====================================================
            STATISTICS
            ===================================================== */}

        <div className="products-stats">

          <div className="product-stat-card">

            <div className="product-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>

          </div>

          <div className="product-stat-card">

            <div className="product-stat-icon">
              <Tag size={20} />
            </div>

            <div>
              <span>Categories</span>
              <strong>{categoryCount}</strong>
            </div>

          </div>

          <div className="product-stat-card">

            <div className="product-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>Average Price</span>
              <strong>
                {formatPrice(averagePrice)}
              </strong>
            </div>

          </div>

        </div>

        {/* =====================================================
            PRODUCT TABLE
            ===================================================== */}

        <div className="products-panel">

          <div className="products-toolbar">

            <div className="products-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search products or services..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>

            <div className="category-filter">

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
              >

                {categories.map((category) => (
                  <option
                    value={category}
                    key={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>

          </div>

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>
                  <th>Product / Service</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {filteredProducts.map((product) => (

                  <tr key={product.id}>

                    <td>

                      <div className="product-name-cell">

                        <div className="product-icon">
                          <Package size={17} />
                        </div>

                        <strong>
                          {product.name}
                        </strong>

                      </div>

                    </td>

                    <td>

                      <span className="product-category">
                        {product.category}
                      </span>

                    </td>

                    <td>

                      <span className="product-description">
                        {product.description}
                      </span>

                    </td>

                    <td>

                      <strong className="product-price">
                        {formatPrice(product.price)}
                      </strong>

                    </td>

                    <td>

                      <span className="product-unit">
                        {product.unit}
                      </span>

                    </td>

                    <td>

                      <button
                        className="product-edit-button"
                        type="button"
                        title="Edit product"
                      >
                        <Edit3 size={16} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filteredProducts.length === 0 && (

              <div className="products-empty">

                <Package size={34} />

                <h3>No products found</h3>

                <p>
                  Try another search or category.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* =====================================================
            PRICING NOTE
            ===================================================== */}

        <div className="products-note">

          <strong>Pricing note:</strong>

          <span>
            All prices are in South African Rand (ZAR)
            and may vary based on quantity, material,
            complexity and installation requirements.
            Bulk discounts may apply.
          </span>

        </div>

      </div>


      {/* =====================================================
          PRINTABLE PRICE LIST
          ===================================================== */}

      <div className="print-price-list">

        {/* HEADER */}

        <div className="price-list-top">

          <div className="price-list-brand">

            <img
              src="/stylz_digital_logo.png"
              alt="STYLZ Digital Solutions"
              className="price-list-logo"
            />

            <div>

              <h1>
                STYLZ DIGITAL SOLUTIONS
              </h1>

              <p>
                Creative Printing, Branding & Digital Solutions
              </p>

            </div>

          </div>

          <div className="price-list-title">
            <span>OFFICIAL</span>
            <strong>PRICE LIST</strong>
          </div>

        </div>

        {/* COMPANY DETAILS */}

        <div className="price-list-company">

          <div>

            <strong>
              STYLZ DIGITAL SOLUTIONS
            </strong>

            <span>
              Reg No. 2023/916461/07 · Zimbabwe & South Africa
            </span>

            <span>
              118 Village Street, Randfontein, 1759, South Africa
            </span>

          </div>

          <div>

            <span>
              Tel: 084 379 3246 / 062 617 3145 / 061 398 2106
            </span>

            <span>
              Email: info@stylzdigitalsolutions.co.za
            </span>

            <span>
              Website: www.stylzdigital.co.za
            </span>

          </div>

        </div>

        {/* PRICE TABLES */}

        <div className="price-list-content">

          {Object.entries(groupedProducts).map(
            ([category, categoryProducts]) => (

              <section
                className="price-list-category"
                key={category}
              >

                <div className="price-list-category-title">
                  {category}
                </div>

                <table>

                  <thead>

                    <tr>
                      <th>Product / Service</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Unit</th>
                    </tr>

                  </thead>

                  <tbody>

                    {categoryProducts.map(
                      (product) => (

                        <tr key={product.id}>

                          <td>
                            <strong>
                              {product.name}
                            </strong>
                          </td>

                          <td>
                            {product.description}
                          </td>

                          <td className="print-price">
                            {formatPrice(product.price)}
                          </td>

                          <td>
                            {product.unit}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </section>

            )
          )}

        </div>

        {/* BANKING */}

        <div className="price-list-payment">

          <div>

            <h3>
              PAYMENT DETAILS
            </h3>

            <p>
              <strong>Bank:</strong> FNB
            </p>

            <p>
              <strong>Account Name:</strong>{" "}
              STYLZ DIGITAL SOLUTIONS
            </p>

            <p>
              <strong>Account Type:</strong> Savings
            </p>

            <p>
              <strong>Account Number:</strong>{" "}
              63112021413
            </p>

          </div>

          <div className="price-list-thank-you">

            <strong>
              THANK YOU FOR CHOOSING STYLZ
            </strong>

            <span>
              Professional printing, branding and
              digital solutions.
            </span>

          </div>

        </div>

        {/* FOOTER */}

        <div className="price-list-footer">

          <strong>
            STYLZ DIGITAL SOLUTIONS
          </strong>

          <span>
            All prices are in South African Rand (ZAR)
            and may vary based on quantity, material,
            complexity and installation requirements.
            Bulk discounts may apply.
          </span>

        </div>

      </div>


      {/* =====================================================
          ADD PRODUCT MODAL
          ===================================================== */}

      {showAddForm && (

        <div className="product-modal-overlay">

          <div className="product-modal">

            <div className="product-modal-header">

              <div>

                <h2>
                  Add Product
                </h2>

                <p>
                  Add a new STYLZ product or service.
                </p>

              </div>

              <button
                className="modal-close-button"
                type="button"
                onClick={() => setShowAddForm(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleAddProduct}
            >

              <div className="product-form-grid">

                <div className="form-group">

                  <label>
                    Product / Service
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Business Cards"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >

                    <option>
                      Digital Printing
                    </option>

                    <option>
                      Large Format
                    </option>

                    <option>
                      Branding & Design
                    </option>

                    <option>
                      Apparel Printing
                    </option>

                    <option>
                      Vehicle Branding
                    </option>

                    <option>
                      Digital Services
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="250"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                  >

                    <option>each</option>
                    <option>per 100</option>
                    <option>per 1000</option>
                    <option>per m²</option>
                    <option>per project</option>
                    <option>per package</option>
                    <option>per shirt</option>
                    <option>per mug</option>
                    <option>per cap</option>
                    <option>per vehicle</option>
                    <option>per pair</option>
                    <option>per month</option>
                    <option>per item</option>

                  </select>

                </div>

                <div className="form-group full-width">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product or service..."
                    rows="4"
                  />

                </div>

              </div>

              <div className="product-form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Save size={17} />
                  Save Product
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Products;