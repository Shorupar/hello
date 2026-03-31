import { useEffect, useState, useRef } from "react";
import API from "../api";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

interface Product {
  id: number;
  name: string;
  category: string;
  image?: string;
  price?: string;
}

interface Favourite {
  id: number;
  product_id: number;
}

const categories = [
  "Electronics", 
  "Furniture", 
  "Jewelry", 
  "Books",
  "Clothing", 
  "Toys", 
  "Sports", 
  "Other"
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

export default function BuyerDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favs, setFavs] = useState<Favourite[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "favourites">("products");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [loadingFav, setLoadingFav] = useState<number | null>(null);

  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ name: payload.name, role: payload.role });
    } catch (err) {
      console.log("Invalid token");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try { 
        const r = await API.get("/products"); 
        setProducts(r.data); 
      } catch (e) { 
        console.log(e); 
      }
      try { 
        const r = await API.get("/favourites"); 
        setFavs(r.data); 
      } catch (e) { 
        console.log(e); 
      }
    };
    loadData();
  }, []);

  const toggleFav = async (product: Product) => {
    const found = favs.find((f) => f.product_id === product.id);
    setLoadingFav(product.id); 
    try {
      if (found) {
        await API.delete(`/favourites/${found.id}`);
        setFavs((prev) => prev.filter((f) => f.product_id !== product.id));
        toast.current?.show({ 
          severity: "warn", 
          summary: "Removed", 
          detail: `${product.name} 
          removed from favourites` 
        });
      } else {
        await API.post("/favourites", { product_id: product.id});
        const r = await API.get("/favourites");
        setFavs(r.data)
        toast.current?.show({ severity: "success", summary: "Added", detail: `${product.name} added to favourites` });
      }
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.response?.data?.message || "Server error" });
    } finally {
      setLoadingFav(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      padding: "6px 0" 
    }}>
      <div style={{ 
        padding: "12px 18px 32px", 
        color: colors.accentSoft, 
        fontSize: "22px", 
        fontWeight: 600 
      }}>
        hello
      </div>
      {(["products", "favourites"] as const).map((tab) => {
        const isActive = activeTab === tab;
        const label = tab === "products" ? "Products" : "My Favourites";
        const icon  = tab === "products" ? "pi-box" : "pi-heart";
        return (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSidebarVisible(false); }}
            style={{
              display: "flex", 
              alignItems: "center", 
              gap: "14px",
              width: "100%", 
              padding: "14px 18px", 
              marginBottom: "4px",
              border: "none", 
              borderRadius: "10px", 
              cursor: "pointer",
              fontSize: "15px", 
              fontWeight: isActive ? 500 : 400,
              background: isActive ? colors.card : "transparent",
              color: isActive ? colors.accentSoft : colors.textMuted,
            }}
          >
            <i className={`pi ${icon}`} style={{ fontSize: "17px" }} />
            {label}
            {tab === "favourites" && favs.length > 0 && (
              <span style={{
                marginLeft: "auto", 
                background: colors.card, 
                color: colors.accentSoft,
                fontSize: "12px", 
                padding: "2px 9px", 
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
              }}>
                {favs.length}
              </span>
            )}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button
        onClick={logout}
        style={{
          display: "flex", 
          alignItems: "center", 
          gap: "14px",
          width: "100%", 
          padding: "14px 18px", 
          border: "none",
          borderRadius: "10px", 
          cursor: "pointer", 
          fontSize: "15px",
          background: "transparent", 
          color: "#f87171",
        }}
      >
        <i className="pi pi-sign-out" style={{ 
          fontSize: "17px" 
        }} />
        Logout
      </button>
    </div>
  );

  const ProductCard = ({ p }: { p: Product }) => {
    const isFav = favs.some((f) => f.product_id === p.id);
    const isLoading = loadingFav === p.id;

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
          <Image
            src={`http://localhost:3000/uploads/${p.image}`}
            alt={p.name}
            style={{ 
              width: "100%", 
              height: "100px", 
              objectFit: "cover"
            }}
            preview
          />
        ) : (
          <div style={{
            background: colors.card, 
            borderRadius: "8px", 
            height: "120px",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
          }}>
            <i className="pi pi-image" style={{ fontSize: "26px", color: colors.borderMid }} />
          </div>
        )}
        </div>
        <div>
          <p style={{ 
            color: colors.textPrimary, 
            fontSize: "15px", fontWeight: 500, 
            margin: 0 
          }}>
            {p.name}
          </p>
          <p style={{ 
            color: colors.textDim, 
            fontSize: "13px", 
            margin: "5px 0 0" 
          }}>
            {p.category}
          </p>
        </div>

        {p.price && (
          <p style={{ 
            color: colors.accentSoft, 
            fontSize: "17px", 
            fontWeight: 600, 
            margin: 0 
          }}>
            ${p.price}
          </p>
        )}

        <button
          onClick={() => toggleFav(p)}
          disabled={isLoading}
          style={{
            width: "100%", 
            padding: "11px 16px", 
            borderRadius: "8px", 
            cursor: isLoading ? "wait" : "pointer",
            fontSize: "13px", 
            fontWeight: 500,
            border: isFav ? "1px solid #ef4444" : "1px solid #22c55e",
            background: isFav ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)",
            color: isFav ? "#ef4444" : "#22c55e",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "6px"
          }}
        >
          {isLoading && <ProgressSpinner style={{ width: '18px', height: '18px' }} strokeWidth="4" />}
          {isFav ? "♥  Remove from Favourites" : "♡  Add to Favourites"}
        </button>
      </div>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      background: colors.card, 
      border: `1px solid ${colors.border}`,
      borderRadius: "16px", 
      padding: "24px 28px",
    }}>
      <p style={{
        color: colors.accentSoft,
        fontSize: "12px", 
        fontWeight: 500,
        letterSpacing: "1.2px", 
        textTransform: "uppercase", 
        margin: "0 0 18px",
      }}>
        {title}
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
      }}>
        {children}
      </div>
    </div>
  );

  const groupedProducts = categories.map((cat) => ({
    category: cat,
    items: products.filter((p) => p.category === cat),
  }));

  const groupedFavs = categories.map((cat) => ({
    category: cat,
    items: favs
      .map((f) => products.find((p) => p.id === f.product_id))
      .filter((p) => p && p.category === cat) as Product[],
  }));

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
          <div style={{ padding: "8px" }}>
            <SidebarContent />
          </div>
        </Sidebar>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

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
              <Button
                icon="pi pi-bars"
                className="p-button-text"
                style={{ color: colors.textMuted }}
                onClick={() => setSidebarVisible(true)}
              />
            )}
            <span style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: 500 }}>
              {activeTab === "products" ? "Products" : "My Favourites"}
            </span>
            <span style={{
              background: colors.card, 
              color: colors.accentSoft,
              border: `1px solid ${colors.border}`, 
              borderRadius: "20px",
              fontSize: "12px", padding: "4px 14px",
            }}>
              {activeTab === "products" ? `${products.length} items` : `${favs.length} saved`}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ color: colors.textMuted, fontSize: "14px" }}>
              {user?.name}
              <span style={{ color: colors.textDim }}> ({user?.role})</span>
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
                fontSize: "16px",
              }}
              onClick={(e) => menu.current?.toggle(e)}
            />
            <Menu
              model={[{ label: "Logout", icon: "pi pi-sign-out", command: logout }]}
              popup
              ref={menu}
              pt={{ root: { style: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "10px" } } }}
            />
          </div>
        </div>
        
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "28px", display: "flex", flexDirection: "column", gap: "22px",
        }}>

          {activeTab === "products" && groupedProducts.map((grp) =>
            grp.items.length > 0 && (
              <Section key={grp.category} title={grp.category}>
                {grp.items.map((p) => <ProductCard key={p.id} p={p} />)}
              </Section>
            )
          )}

          {activeTab === "favourites" && (
            groupedFavs.every((g) => g.items.length === 0) ? (
              <div style={{
                flex: 1, 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                gap: "16px",
                paddingTop: "80px", 
                color: colors.textMuted,
              }}>
                <i className="pi pi-heart" style={{ fontSize: "44px", color: colors.border }} />
                <p style={{ fontSize: "16px", margin: 0 }}>No favourites yet</p>
                <button
                  onClick={() => setActiveTab("products")}
                  style={{
                    padding: "12px 28px", 
                    borderRadius: "10px", 
                    cursor: "pointer",
                    background: colors.card, 
                    border: `1px solid ${colors.border}`,
                    color: colors.accentSoft, 
                    fontSize: "14px",
                  }}
                >
                  Browse products
                </button>
              </div>
            ) : (
              groupedFavs.map((grp) =>
                grp.items.length > 0 && (
                  <Section key={grp.category} title={grp.category}>
                    {grp.items.map((p) => <ProductCard key={p.id} p={p} />)}
                  </Section>
                )
              )
            )
          )}

        </div>
      </div>

      <Toast ref={toast} />
    </div>
  );
}