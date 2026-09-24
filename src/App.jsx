import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Printer,
  Receipt,
  CreditCard,
  Package,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import Customers from "./pages/Customers";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Management from "./pages/Management";

import "./App.css";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Quotations", icon: FileText },
  { label: "Orders / Jobs", icon: ClipboardList },
  { label: "Production", icon: Printer },
  { label: "Invoices", icon: Receipt },
  { label: "Payments", icon: CreditCard },
  { label: "Inventory", icon: Package },
  { label: "Products & Prices", icon: Package },
  { label: "Expenses", icon: Wallet },
  { label: "Staff", icon: UserCog },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const recentOrders = [
  {
    id: "#STZ-001",
    customer: "Walk-in Customer",
    item: "Business Cards",
    amount: "R650.00",
    status: "Completed",
  },
  {
    id: "#STZ-002",
    customer: "ABC Construction",
    item: "3m x 1m Banner",
    amount: "R600.00",
    status: "In Production",
  },
  {
    id: "#STZ-003",
    customer: "Mona Driving School",
    item: "Business Branding",
    amount: "R2,400.00",
    status: "Pending",
  },
  {
    id: "#STZ-004",
    customer: "Local Business",
    item: "DTF T-Shirts",
    amount: "R1,280.00",
    status: "In Production",
  },
];

const productionQueue = [
  {
    id: "#STZ-002",
    item: "3m x 1m Banner",
    progress: 75,
  },
  {
    id: "#STZ-004",
    item: "DTF T-Shirts",
    progress: 45,
  },
  {
    id: "#STZ-005",
    item: "A5 Flyers",
    progress: 20,
  },
];

const INVOICE_FROM_ORDER_KEY =
  "stylz_ims_invoice_from_order";

function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [openNewOrder, setOpenNewOrder] =
    useState(false);

  /*
    Opens the Invoices module with
    an order ready to be converted
    into an invoice.
  */
  const handleCreateInvoiceFromOrder = (
    order
  ) => {
    try {
      localStorage.setItem(
        INVOICE_FROM_ORDER_KEY,
        JSON.stringify(order)
      );
    } catch (error) {
      console.error(
        "Could not prepare invoice from order:",
        error
      );

      alert(
        "Could not prepare this order for invoicing."
      );

      return;
    }

    setActivePage("Invoices");
  };

  const handleMenuClick = (label) => {
    setActivePage(label);
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={handleMenuClick}
      />

      <main className="main-content">
        <Topbar />

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <Dashboard
            onNewOrder={() => setOpenNewOrder(true)}
            onNavigate={handleMenuClick}
          />
        )}

        {/* CUSTOMERS */}
        {activePage === "Customers" && (
          <Customers />
        )}

        {/* QUOTATIONS */}
        {activePage === "Quotations" && (
          <Quotes />
        )}

        {/* INVOICES */}
        {activePage === "Invoices" && (
          <Invoices />
        )}

        {/* ORDERS / JOBS */}
        <div
          style={{
            display:
              activePage === "Orders / Jobs"
                ? "block"
                : "none",
          }}
        >
          <Orders
            openNewOrder={openNewOrder}
            setOpenNewOrder={setOpenNewOrder}
            isPageVisible={
              activePage === "Orders / Jobs"
            }
            onCreateInvoice={
              handleCreateInvoiceFromOrder
            }
          />
        </div>

        {/* PRODUCTS */}
        {activePage === "Products & Prices" && (
          <Products />
        )}

        {["Production", "Payments", "Inventory", "Expenses", "Staff"].includes(activePage) && (
          <Management module={activePage} />
        )}

        {activePage === "Reports" && <Reports />}

        {activePage === "Settings" && <SettingsPage />}

        {!["Dashboard", "Customers", "Quotations", "Orders / Jobs", "Invoices", "Products & Prices", "Production", "Payments", "Inventory", "Expenses", "Staff", "Reports", "Settings"].includes(activePage) && (
          <PlaceholderPage title={activePage} />
        )}
      </main>
    </div>
  );
}

function Sidebar({
  activePage,
  onNavigate,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src="/stylz_digital_logo.png"
          alt="STYLZ Digital Solutions"
          className="sidebar-logo"
        />

        <div className="brand-text">
          <strong>STYLZ</strong>
          <span>DIGITAL SOLUTIONS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={
                activePage === item.label
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                onNavigate(item.label)
              }
            >
              <Icon size={19} />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            W
          </div>

          <div>
            <strong>Welly</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search customers, orders..."
        />
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
        >
          <Bell size={19} />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">
            W
          </div>

          <div>
            <strong>Welly</strong>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ onNewOrder, onNavigate }) {
  const read = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };

  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setDataVersion((v) => v + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener("stylz-data-updated", refresh);

    const interval = window.setInterval(refresh, 1500);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("stylz-data-updated", refresh);
      window.clearInterval(interval);
    };
  }, []);

  const data = useMemo(() => {
    void dataVersion;

    const orders = read("stylz_ims_orders");
    const invoices = read("stylz_ims_invoices");
    const payments = read("stylz_ims_payments");
    const production = read("stylz_ims_production");

    const today = new Date().toISOString().slice(0, 10);

    const money = (value) =>
      "R" +
      Number(value || 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const invoiceTotal = (invoice) => {
      if (invoice.total !== undefined) {
        return Number(invoice.total || 0);
      }

      const subtotal = (invoice.items || []).reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.price || 0),
        0
      );

      return Math.max(
        subtotal - Number(invoice.discount || 0),
        0
      );
    };

    const activeOrders = orders.filter(
      (order) =>
        !["Completed", "Cancelled"].includes(
          order.status
        )
    );

    const productionActive = production.filter(
      (job) =>
        !["Completed"].includes(job.status)
    );

    const todayPayments = payments.filter(
      (payment) =>
        payment.date === today
    );

    const todayInvoicePayments = invoices
      .filter((invoice) => invoice.date === today)
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amountPaid || 0),
        0
      );

    const todaySales =
      todayPayments.reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      ) + todayInvoicePayments;

    const outstanding = invoices.reduce(
      (sum, invoice) =>
        sum +
        Math.max(
          invoiceTotal(invoice) -
            Number(invoice.amountPaid || 0),
          0
        ),
      0
    );

    const recentOrders = [...orders]
      .sort(
        (a, b) =>
          new Date(
            b.orderDate || b.createdAt || 0
          ) -
          new Date(
            a.orderDate || a.createdAt || 0
          )
      )
      .slice(0, 6)
      .map((order) => ({
        id:
          order.orderNumber ||
          order.id ||
          "—",
        customer:
          order.customer ||
          "Walk-in Customer",
        item:
          order.jobName ||
          order.description ||
          "Printing Services",
        amount:
          order.amount ||
          order.total ||
          "—",
        status:
          order.status || "Pending",
      }));

    return {
      money,
      orders,
      invoices,
      payments,
      production,
      activeOrders,
      productionActive,
      todaySales,
      outstanding,
      recentOrders,
      today,
    };
  }, [dataVersion]);

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome to your STYLZ Digital
            Solutions management system.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={onNewOrder}
        >
          <Plus size={18} />
          New Order
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Today's Sales"
          value={data.money(data.todaySales)}
          icon={CreditCard}
          description={
            data.todaySales > 0
              ? "Payments recorded today"
              : "No sales recorded today"
          }
        />

        <StatCard
          title="Active Orders"
          value={data.activeOrders.length}
          icon={ClipboardList}
          description={
            data.activeOrders.length === 1
              ? "1 order currently active"
              : "Orders currently active"
          }
        />

        <StatCard
          title="Production Queue"
          value={data.productionActive.length}
          icon={Printer}
          description={
            data.productionActive.length === 1
              ? "1 job in production"
              : "Jobs currently in production"
          }
        />

        <StatCard
          title="Outstanding"
          value={data.money(data.outstanding)}
          icon={Wallet}
          description="Unpaid customer balances"
        />
      </div>

      <div className="quick-actions">
        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Common tasks for your business.</p>
          </div>
        </div>

        <div className="quick-action-grid">
          <QuickAction
            icon={Users}
            title="New Customer"
            description="Add a customer"
            onClick={() => onNavigate("Customers")}
          />

          <QuickAction
            icon={FileText}
            title="Create Quote"
            description="Prepare a quotation"
            onClick={() => onNavigate("Quotations")}
          />

          <QuickAction
            icon={ClipboardList}
            title="New Order"
            description="Create a new job"
            onClick={onNewOrder}
          />

          <QuickAction
            icon={Printer}
            title="Production"
            description="View production jobs"
            onClick={() => onNavigate("Production")}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer orders.</p>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() =>
                onNavigate("Orders / Jobs")
              }
            >
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <span>Order</span>
              <span>Customer</span>
              <span>Item</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {data.recentOrders.length === 0 ? (
              <div className="empty-state">
                <h2>No orders yet</h2>
                <p>
                  Create your first order to see it here.
                </p>
              </div>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  className="table-row"
                  key={order.id}
                >
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                  <span>{order.item}</span>
                  <strong>
                    {typeof order.amount === "number"
                      ? data.money(order.amount)
                      : order.amount}
                  </strong>
                  <StatusBadge
                    status={order.status}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Production Queue</h2>
              <p>Current jobs in production.</p>
            </div>

            <Printer size={20} />
          </div>

          <div className="production-list">
            {data.production.length === 0 ? (
              <div className="empty-state">
                <h2>No production jobs</h2>
                <p>
                  New orders will appear here automatically.
                </p>
              </div>
            ) : (
              data.production
                .filter(
                  (job) =>
                    job.status !== "Completed"
                )
                .slice(0, 6)
                .map((job) => (
                  <div
                    className="production-item"
                    key={job.id}
                  >
                    <div className="production-top">
                      <div>
                        <strong>
                          {job.orderNumber ||
                            job.orderId ||
                            "JOB"}
                        </strong>

                        <span>
                          {job.job ||
                            job.item ||
                            "Printing Job"}
                        </span>
                      </div>

                      <strong>
                        {Number(
                          job.progress || 0
                        )}
                        %
                      </strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              Number(
                                job.progress || 0
                              ),
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="system-status">
        <div className="section-heading">
          <div>
            <h2>System Status</h2>
            <p>STYLZ IMS services.</p>
          </div>
        </div>

        <div className="status-grid">
          <SystemStatus
            title="Orders & Jobs"
            status={`${data.orders.length} records`}
          />

          <SystemStatus
            title="Production System"
            status={`${data.production.length} jobs`}
          />

          <SystemStatus
            title="Payments"
            status={`${data.payments.length} records`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={21} />
      </div>

      <div className="stat-info">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>
          {description}
        </small>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="quick-action"
      type="button"
      onClick={onClick}
    >
      <div className="quick-action-icon">
        <Icon size={20} />
      </div>

      <div>
        <strong>{title}</strong>

        <span>
          {description}
        </span>
      </div>
    </button>
  );
}

function StatusBadge({
  status,
}) {
  let className =
    "status-badge";

  if (status === "Completed") {
    className += " completed";
  }

  if (status === "In Production") {
    className += " production";
  }

  if (status === "Pending") {
    className += " pending";
  }

  return (
    <span className={className}>
      {status}
    </span>
  );
}

function SystemStatus({
  title,
  status,
}) {
  return (
    <div className="system-status-card">
      <CheckCircle2 size={20} />

      <div>
        <strong>{title}</strong>

        <span>{status}</span>
      </div>
    </div>
  );
}

function Reports() {
  const read=(key)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):[]}catch{return[]}};
  const orders=read("stylz_ims_orders"), invoices=read("stylz_ims_invoices"), payments=read("stylz_ims_payments"), expenses=read("stylz_ims_expenses"), production=read("stylz_ims_production");
  const sum=(items,key)=>items.reduce((s,x)=>s+Number(x[key]||0),0);
  return <div className="page">
    <div className="page-header"><div><h1>Reports</h1><p>Live summaries from your STYLZ-IMS browser data.</p></div><button className="secondary-button" onClick={()=>window.print()}><Printer size={17}/> Print Report</button></div>
    <div className="stats-grid">
      <StatCard title="Orders" value={orders.length} icon={ClipboardList} description="Recorded jobs"/>
      <StatCard title="Invoices" value={invoices.length} icon={Receipt} description={"Value: R "+sum(invoices,"total").toFixed(2)}/>
      <StatCard title="Payments" value={"R "+sum(payments,"amount").toFixed(2)} icon={CreditCard} description="Recorded payments"/>
      <StatCard title="Expenses" value={"R "+sum(expenses,"amount").toFixed(2)} icon={Wallet} description="Recorded expenses"/>
    </div>
    <div className="dashboard-grid">
      <div className="dashboard-panel"><div className="panel-header"><div><h2>Operations</h2><p>Current business activity.</p></div></div><div className="system-status"><div className="status-grid"><SystemStatus title="Production Jobs" status={String(production.length)}/><SystemStatus title="Orders / Jobs" status={String(orders.length)}/><SystemStatus title="Invoices" status={String(invoices.length)}/></div></div></div>
      <div className="dashboard-panel"><div className="panel-header"><div><h2>Financial Snapshot</h2><p>Recorded values only.</p></div></div><div className="production-list"><div className="production-item"><div className="production-top"><strong>Payments</strong><strong>R {sum(payments,"amount").toFixed(2)}</strong></div></div><div className="production-item"><div className="production-top"><strong>Expenses</strong><strong>R {sum(expenses,"amount").toFixed(2)}</strong></div></div></div></div>
    </div>
  </div>;
}

function SettingsPage() {
  const [form,setForm]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem("stylz_ims_settings"))||{};return {...saved,phone:saved.phone||"084 379 3246 / 062 617 3145",email:saved.email==="info@stylzdigitalsolutions.co.za"||!saved.email?"info@stylzdigital.co.za":saved.email,website:saved.website||"www.stylzdigital.co.za",address:saved.address==="118 Village Street, Randfontein, 1759, South Africa"||!saved.address?"Randfontein, Gauteng, South Africa":saved.address,registration:saved.registration||"2023/916461/07"};}catch{return{phone:"084 379 3246 / 062 617 3145",email:"info@stylzdigital.co.za",website:"www.stylzdigital.co.za",address:"Randfontein, Gauteng, South Africa",registration:"2023/916461/07"}}});
  const save=()=>{localStorage.setItem("stylz_ims_settings",JSON.stringify(form));alert("Settings saved.");};
  return <div className="page"><div className="page-header"><div><h1>Settings</h1><p>Manage the business contact information used by STYLZ-IMS.</p></div></div><div className="data-panel"><div className="panel-header"><div><h2>Business Details</h2><p>These settings are stored locally for this browser.</p></div></div><div className="form-grid">{[["phone","Phone"],["email","Email"],["website","Website"],["address","Address"],["registration","Registration Number"]].map(([k,l])=><div className="form-group" key={k}><label>{l}</label><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div><div className="modal-actions"><button className="stylz-primary-btn" onClick={save}><CheckCircle2 size={17}/> Save Settings</button></div></div></div>;
}

function PlaceholderPage({
  title,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>

          <p>
            This STYLZ IMS module is ready
            to be developed.
          </p>
        </div>
      </div>

      <div className="data-panel">
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={30} />
          </div>

          <h2>{title}</h2>

          <p>
            This module will be connected
            to the STYLZ IMS system as we
            build it.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;