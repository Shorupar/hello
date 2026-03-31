  import { useEffect, useState, useRef } from "react";
  import API from "../api";
  import { FileUpload } from "primereact/fileupload";
  import { Button } from "primereact/button";
  import { Sidebar } from "primereact/sidebar";
  import { Toast } from "primereact/toast";
  import { Dropdown } from "primereact/dropdown";
  import { InputText } from "primereact/inputtext";
  import { Avatar } from "primereact/avatar";
  import { Menu } from "primereact/menu";
  import { Chart } from "primereact/chart";
  import { ProgressSpinner } from "primereact/progressspinner";

  interface Product {
    id?: number;
    name: string;
    category: string;
    price?: string;
    image?: string;
  }

  const categories = [
    "Electronics", 
    "Furniture", 
    "Jewelry", 
    "Books",
    "Clothing", 
    "Toys", 
    "Sports", 
    "Other",
  ];

  const colors = {
    bg:          "#0a0e1a",
    surface:     "#0f1526",
    card:        "#141c33",
    border:      "#1e2d4d",
    borderMid:   "#2e4a80",
    accentSoft:  "#a8c4f0",
    textPrimary: "#ffffff",
    textMuted:   "#7a92b8",
    textDim:     "#3d5070",
  };

  export default function SellerDashboard() {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState<Product>({ name: "", category: "", price: "" });
    const [file, setFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<"dashboard" | "products">("dashboard");
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [categoryChartData, setCategoryChartData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const toast = useRef<Toast>(null);
    const menu = useRef<Menu>(null);

    const stats = {
      products: products.length,
      categories: categories.length,
      totalOrders: 12,
      revenue: 5400,
    };

    const token = localStorage.getItem("token");

    useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ name: payload.name, role: payload.role });
      } catch (err) { console.log(err); }
    }, [token]);

    const loadProducts = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { loadProducts(); }, [token]);

    useEffect(() => {
      const counts = categories.map((cat) => products.filter((p) => p.category === cat).length);
      setCategoryChartData({
        labels: categories,
        datasets: [{
          label: "Products per Category",
          backgroundColor: "rgba(96,165,250,0.25)",
          borderColor: "#60a5fa",
          borderWidth: 2,
          borderRadius: 6,
          data: counts,
        }],
      });
    }, [products]);

    const handleFileSelect = (e: any) => {
      const selected = e.files[0];
      if (selected) {
        setFile(selected);
        const reader = new FileReader();
        reader.onload = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(selected);
      }
    };

    const addProduct = async () => {
      if (!form.name || !form.category || !form.price) {
        toast.current?.show({ severity: "warn", summary: "Warning", detail: "All fields required" });
        return;
      }
      if (!file) {
        toast.current?.show({ severity: "warn", summary: "Warning", detail: "Please select an image" });
        return;
      }
      const data = new FormData();
      data.append("name", form.name);
      data.append("category", form.category);
      data.append("price", form.price!);
      data.append("image", file);

      try {
        setLoading(true);
        await API.post("/products", data);
        setForm({ name: "", category: "", price: "" });
        setFile(null);
        setPreviewImage(null);
        loadProducts();
        toast.current?.show({ severity: "success", summary: "Success", detail: "Product added" });
      } catch (err: any) {
        toast.current?.show({ severity: "error", summary: "Error", detail: err.response?.data?.message || "Server error" });
      } finally {
        setLoading(false);
      }
    };

    const deleteProduct = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this product?")) return;
      try {
        setLoading(true);
        await API.delete(`/products/${id}`);
        loadProducts();
        toast.current?.show({ severity: "success", summary: "Deleted", detail: "Product removed" });
      } catch (err: any) {
        toast.current?.show({ severity: "error", summary: "Error", detail: err.response?.data?.message || "Server error" });
      } finally {
        setLoading(false);
      }
    };

    const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

    const SidebarContent = () => (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "6px 0" }}>
        <div style={{ padding: "12px 18px 32px", color: colors.accentSoft, fontSize: "22px", fontWeight: 600 }}>hello</div>
        {(["dashboard", "products"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === "dashboard" ? "Dashboard" : "Products";
          const icon  = tab === "dashboard" ? "pi-home" : "pi-box";
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSidebarVisible(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                width: "100%", padding: "14px 18px", marginBottom: "4px",
                border: "none", borderRadius: "10px", cursor: "pointer",
                fontSize: "15px", fontWeight: isActive ? 500 : 400,
                background: isActive ? colors.card : "transparent",
                color: isActive ? colors.accentSoft : colors.textMuted,
              }}
            >
              <i className={`pi ${icon}`} style={{ fontSize: "17px" }} />
              {label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: "14px",
            width: "100%", padding: "14px 18px", border: "none",
            borderRadius: "10px", cursor: "pointer", fontSize: "15px",
            background: "transparent", color: "#f87171",
          }}
        >
          <i className="pi pi-sign-out" style={{ fontSize: "17px" }} />
          Logout
        </button>
      </div>
    );

    const StatCard = ({ icon, value, label, iconColor }: { icon: string; value: string | number; label: string; iconColor: string }) => (
      <div style={{
        background: colors.card, 
        border: `1px solid ${colors.border}`,
        borderRadius: "14px", 
        padding: "24px 20px",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "10px",
        flex: 1, 
        minWidth: "140px",
      }}>
        <i className={`pi ${icon}`} style={{ fontSize: "28px", color: iconColor }} />
        <p style={{ color: colors.textPrimary, fontSize: "26px", fontWeight: 700, margin: 0 }}>{value}</p>
        <p style={{ color: colors.textMuted, fontSize: "13px", margin: 0 }}>{label}</p>
      </div>
    );

    const ProductCard = ({ p }: { p: Product }) => {

      return (
        <div style={{
          background: colors.surface, 
          border: `1px solid ${colors.border}`,
          borderRadius: "14px", 
          padding: "16px", 
          display: "flex",
          flexDirection: "column", 
          gap: "12px",
          transform: "0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
        <div
          style={{
            width: "100%",
            height: "140px",
            borderRadius: "10px",
            overflow: "hidden",
            background: colors.card,
          }}
        >
          {p.image ? (
            <img
              src={`http://localhost:3000/uploads/${p.image}`}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "100%" 
            }}>
              <i className="pi pi-image" style={{ color: colors.borderMid }} />
            </div>
          )}
        </div>

        <div>
          <p style={{ color: colors.textPrimary }}>{p.name}</p>
          <p style={{ color: colors.textDim, fontSize: "13px" }}>{p.category}</p>
        </div>

        {p.price && (
          <p style={{ color: colors.accentSoft, fontWeight: 600 }}>
            ${p.price}
          </p>
        )}

        <Button
          label="Delete"
          className="p-button-danger"
          onClick={() => p.id && deleteProduct(p.id)}
        />
      </div>
    );

    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div style={{
        background: colors.card, border: `1px solid ${colors.border}`,
        borderRadius: "16px", padding: "24px 28px",
      }}>
        <p style={{
          color: colors.accentSoft, fontSize: "12px", fontWeight: 500,
          letterSpacing: "1.2px", textTransform: "uppercase", margin: "0 0 18px",
        }}>{title}</p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px",
        }}>
          {children}
        </div>
      </div>
    );

    const inputStyle = {
      background: colors.card, 
      border: `1px solid ${colors.border}`,
      borderRadius: "8px", 
      color: colors.textPrimary,
      padding: "12px 14px", 
      fontSize: "14px", width: "100%",
    };

    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const groupedProducts = categories.map((cat) => ({
      category: cat,
      items: filteredProducts.filter((p) => p.category === cat),
    }));

    const chartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: colors.textMuted } } },
      scales: {
        x: { ticks: { color: colors.textMuted }, grid: { color: "rgba(30,58,95,0.6)" } },
        y: { ticks: { color: colors.textMuted }, grid: { color: "rgba(30,58,95,0.6)" } },
      },
    };

    return (
      <div style={{ display: "flex", height: "100vh", background: colors.bg, overflow: "hidden" }}>

        {isDesktop ? (
          <div style={{
            width: "260px", 
            flexShrink: 0,
            background: colors.surface, 
            borderRight: `1px solid ${colors.border}`,
            padding: "22px 16px", 
            display: "flex", 
            flexDirection: "column",
          }}>
            <SidebarContent />
          </div>
        ) : (
          <Sidebar
            visible={sidebarVisible}
            onHide={() => setSidebarVisible(false)}
            style={{ background: colors.surface, width: "260px", border: "none" }}
          >
            <div style={{ padding: "8px" }}><SidebarContent /></div>
          </Sidebar>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            height: "68px", 
            flexShrink: 0,
            background: colors.surface, 
            borderBottom: `1px solid ${colors.border}`,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "0 28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {!isDesktop && (
                <Button icon="pi pi-bars" className="p-button-text"
                  style={{ color: colors.textMuted }} onClick={() => setSidebarVisible(true)} />
              )}
              <span style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: 500 }}>
                {activeTab === "dashboard" ? "Dashboard" : "Products"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ color: colors.textMuted, fontSize: "14px" }}>
                {user?.name}<span style={{ color: colors.textDim }}> ({user?.role})</span>
              </span>
              <Avatar
                label={user?.name?.charAt(0).toUpperCase()}
                style={{ 
                  background: colors.card, 
                  color: colors.accentSoft, 
                  border: `1px solid ${colors.borderMid}`, 
                  cursor: "pointer", 
                  width: "40px", 
                  height: "40px", 
                  fontSize: "16px" 
                }}
                onClick={(e) => menu.current?.toggle(e)}
              />
              <Menu model={[{ label: "Logout", icon: "pi pi-sign-out", command: logout }]} popup ref={menu}
                pt={{ root: { style: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "10px" } } }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
            {loading && <ProgressSpinner style={{ alignSelf: "center" }} />}

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <StatCard icon="pi-box" value={stats.products} label="Total Products" iconColor="#60a5fa" />
                  <StatCard icon="pi-list" value={stats.categories} label="Categories" iconColor="#4ade80" />
                  <StatCard icon="pi-shopping-cart" value={stats.totalOrders} label="Total Orders" iconColor="#fb923c" />
                  <StatCard icon="pi-dollar" value={`$${stats.revenue}`} label="Revenue" iconColor="#c084fc" />
                </div>

                {categoryChartData && (
                  <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "24px 28px" }}>
                    <p style={{ color: colors.accentSoft, fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", margin: "0 0 20px" }}>
                      Products per Category
                    </p>
                    <Chart type="bar" data={categoryChartData} options={chartOptions} style={{ height: "280px" }} />
                  </div>
                )}

                {/* Add Product */}
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "24px 28px" }}>
                  <p style={{ color: colors.accentSoft, fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", margin: "0 0 20px" }}>
                    Add New Product
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ color: colors.textMuted, fontSize: "13px" }}>Product Name</label>
                      <InputText placeholder="e.g. Laptop Pro" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ color: colors.textMuted, fontSize: "13px" }}>Category</label>
                      <Dropdown value={form.category} options={categories} placeholder="Select category" onChange={(e) => setForm({ ...form, category: e.value })} style={inputStyle} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ color: colors.textMuted, fontSize: "13px" }}>Price ($)</label>
                      <InputText placeholder="e.g. 99.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ color: colors.textMuted, fontSize: "13px" }}>Product Image</label>
                      <FileUpload 
                        mode="basic" 
                        name="image" 
                        auto={false}  
                        accept="image/*" 
                        chooseLabel="Choose Image" 
                        onSelect={handleFileSelect}
                        style={{ width: "100%" }} 
                      />
                      {previewImage && <img src={previewImage} alt="Preview" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "8px", marginTop: "6px" }} />}
                    </div>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <button onClick={addProduct} disabled={loading} style={{ background: "#2563eb", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="pi pi-plus" style={{ fontSize: "14px" }} /> Add Product
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <>
                <InputText placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} />
                {groupedProducts.map((grp) =>
                  grp.items.length > 0 && (
                    <Section key={grp.category} title={grp.category}>
                      {grp.items.map((p, i) => <ProductCard key={i} p={p} />)}
                    </Section>
                  )
                )}
              </>
            )}
          </div>
        </div>

        <Toast ref={toast} />
      </div>
    );
  }