import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, ArrowLeft, Save, X, Shield, Key } from "lucide-react";
import Header from "../components/Header";
import AdBanner from "../components/AdBanner";
import { NewsArticle } from "../data/newsData";
import { getApiKey, setApiKey, hasApiKey } from "../hooks/useSeedreamImage";
import { useLanguage } from "../hooks/useLanguage";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";
const ADMIN_KEY = "econojabis_admin_auth";
const DELETED_KEY = "econojabis_deleted_ids";

const getArticles = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(ARTICLE_STORE_KEY);
    if (!raw) return [];
    const deletedIds = getDeletedIds();
    const all: NewsArticle[] = JSON.parse(raw);
    return all.filter((a) => !deletedIds.includes(a.id));
  } catch {
    return [];
  }
};

const getDeletedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveArticles = (articles: NewsArticle[]) => {
  localStorage.setItem(ARTICLE_STORE_KEY, JSON.stringify(articles));
};

const addDeletedId = (id: string) => {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  }
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NewsArticle>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem(ADMIN_KEY);
    if (auth === "true") setIsAuthed(true);
  }, []);

  useEffect(() => {
    if (isAuthed) {
      setArticles(getArticles());
      setApiKeyInput(getApiKey());
    }
  }, [isAuthed]);

  const handleLogin = () => {
    if (pinInput === "1234") {
      sessionStorage.setItem(ADMIN_KEY, "true");
      setIsAuthed(true);
    } else {
      alert(t("adminWrongPin"));
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t("adminConfirmDelete"))) return;
    addDeletedId(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setEditForm({ ...article });
  };

  const handleSave = () => {
    if (!editingId || !editForm) return;
    const updated = articles.map((a) => (a.id === editingId ? { ...a, ...editForm } : a));
    saveArticles(updated);
    setArticles(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const filtered = articles.filter(
    (a) =>
      !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2 min-h-[94px]">
          <AdBanner slotType="header" uid="admin-login-top" />
        </div>
        <div className="mx-auto max-w-md px-4 py-20">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-bold mb-2">{t("adminLogin")}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t("adminEnterPin")}</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder={t("adminPinPlaceholder")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              {t("adminLogin")}
            </button>
          </div>
        </div>
        <div className="w-full flex justify-center items-center bg-card border-t border-border py-2 min-h-[94px]">
          <AdBanner slotType="footer" uid="admin-login-bottom" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      <div className="w-full flex justify-center items-center bg-muted/30 border-b border-border py-2 min-h-[94px]">
        <AdBanner slotType="header" uid="admin-top" />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("adminGoHome")}
            </button>
            <h1 className="text-2xl font-bold">{t("adminNewsManage")}</h1>
            <span className="text-sm text-muted-foreground">
              {t("adminTotal")} {filtered.length} {t("adminItems")}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-sm">{t("adminAdsterraTitle")}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            <a
              href="https://publishers.adsterra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              publishers.adsterra.com
            </a>{" "}
            {t("adminAdsterraDescPrefix")}
          </p>
          <p className="text-[11px] text-muted-foreground mb-3">
            숫자 Zone ID(예: 28706840)가 아니라 코드의 Zone Key(예: cab28a...)를 입력해야 광고가 노출됩니다.
          </p>
          {[
            { slot: "header", label: t("adminAdHeader") },
            { slot: "sidebar", label: t("adminAdSidebar") },
            { slot: "in-article", label: t("adminAdInArticle") },
            { slot: "footer", label: t("adminAdFooter") },
          ].map(({ slot, label }) => (
            <div key={slot} className="flex gap-2 mb-2 items-center">
              <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{label}</span>
              <input
                type="text"
                defaultValue={localStorage.getItem("adsterra_" + slot + "_key") || ""}
                placeholder={`${t("adminZoneKeyPlaceholder")} (${slot})`}
                className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  localStorage.setItem("adsterra_" + slot + "_key", e.target.value);
                }}
              />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground/60 mt-2">{t("adminSavedOnBlur")}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{t("adminSeedreamTitle")}</h2>
            {hasApiKey() && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                {t("adminConfigured")}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("adminSeedreamDesc")}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {t("adminSignupPrefix")}{" "}
            <a href="https://console.byteplus.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              console.byteplus.com
            </a>{" "}
            {t("adminSignupSuffix")}
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={t("adminApiKeyPlaceholder")}
              className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium"
            >
              {apiKeySaved ? `✓ ${t("adminSaved")}` : t("save")}
            </button>
          </div>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("adminSearchPlaceholder")}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-6"
        />

        <div className="space-y-3">
          {filtered.map((article) => (
            <div key={article.id} className="rounded-lg border border-border bg-card p-4">
              {editingId === article.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    placeholder={t("adminTitlePlaceholder")}
                  />
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    rows={4}
                    placeholder={t("adminContentPlaceholder")}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.source || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, source: e.target.value }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder={t("adminSourcePlaceholder")}
                    />
                    <input
                      type="text"
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value as any }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder={t("adminCategoryPlaceholder")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white text-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {t("save")}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-500 text-white text-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("adminCancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {article.category}
                      </span>
                      {article.isBreaking && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                          {t("breaking")}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                      onClick={() => navigate("/article/" + encodeURIComponent(article.id), { state: { article } })}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      title={t("adminEdit")}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                      title={t("adminDelete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">{t("adminEmpty")}</div>}
        </div>
      </main>
      <div className="w-full flex justify-center items-center bg-card border-t border-border py-2 min-h-[94px]">
        <AdBanner slotType="footer" uid="admin-bottom" />
      </div>
    </div>
  );
};

export default AdminPanel;
