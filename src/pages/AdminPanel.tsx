import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, ArrowLeft, Save, X, Shield, Key } from "lucide-react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";
import { getApiKey, setApiKey, hasApiKey } from "../hooks/useSeedreamImage";
import { useLanguage } from "../hooks/useLanguage";

const ARTICLE_STORE_KEY = "econojabis_articles_v1";
const ADMIN_KEY = "econojabis_admin_auth";
const DELETED_KEY = "econojabis_deleted_ids";

const UI_COPY = {
  ko: {
    wrongPin: "잘못된 비밀번호입니다.",
    confirmDelete: "이 기사를 삭제하시겠습니까?",
    adminLogin: "관리자 로그인",
    enterPin: "관리자 비밀번호를 입력하세요",
    pinPlaceholder: "비밀번호",
    login: "로그인",
    goHome: "홈으로",
    newsManage: "뉴스 관리",
    total: "총",
    items: "건",
    adsterraTitle: "Adsterra 광고 설정",
    adsterraDescPrefix: "에서 각 광고 유닛의 Zone Key를 입력하세요. (즉시 적용)",
    adHeader: "헤더 배너 728x90",
    adSidebar: "사이드바 300x250",
    adInArticle: "본문 중간 300x250",
    adFooter: "하단 배너 728x90",
    zoneKeyPlaceholder: "Zone Key",
    savedOnBlur: "입력 후 포커스 아웃 시 자동 저장됩니다.",
    seedreamTitle: "Seedream AI 이미지 설정",
    configured: "설정됨",
    seedreamDesc: "BytePlus Seedream API 키를 입력하면 AI가 뉴스 기사에 맞는 실사 이미지를 자동 생성합니다.",
    signupPrefix: "가입: ",
    signupSuffix: " -> API Key 발급",
    apiKeyPlaceholder: "BytePlus ARK API Key",
    save: "저장",
    saved: "저장됨",
    searchPlaceholder: "기사 검색 (제목, 출처, 카테고리)",
    titlePlaceholder: "제목",
    contentPlaceholder: "내용",
    sourcePlaceholder: "출처",
    categoryPlaceholder: "카테고리",
    cancel: "취소",
    breaking: "속보",
    edit: "수정",
    delete: "삭제",
    empty: "표시할 기사가 없습니다.",
  },
  en: {
    wrongPin: "Invalid password.",
    confirmDelete: "Do you want to delete this article?",
    adminLogin: "Admin Login",
    enterPin: "Enter admin password",
    pinPlaceholder: "Password",
    login: "Login",
    goHome: "Home",
    newsManage: "News Management",
    total: "Total",
    items: "items",
    adsterraTitle: "Adsterra Ad Settings",
    adsterraDescPrefix: "Enter the Zone Key for each ad unit. (Applied immediately)",
    adHeader: "Header Banner 728x90",
    adSidebar: "Sidebar 300x250",
    adInArticle: "In-Article 300x250",
    adFooter: "Footer Banner 728x90",
    zoneKeyPlaceholder: "Zone Key",
    savedOnBlur: "Auto-saved when input loses focus.",
    seedreamTitle: "Seedream AI Image Settings",
    configured: "Configured",
    seedreamDesc: "Add your BytePlus Seedream API key and AI will auto-generate realistic images for articles.",
    signupPrefix: "Sign up: ",
    signupSuffix: " -> Issue API Key",
    apiKeyPlaceholder: "BytePlus ARK API Key",
    save: "Save",
    saved: "Saved",
    searchPlaceholder: "Search articles (title, source, category)",
    titlePlaceholder: "Title",
    contentPlaceholder: "Content",
    sourcePlaceholder: "Source",
    categoryPlaceholder: "Category",
    cancel: "Cancel",
    breaking: "Breaking",
    edit: "Edit",
    delete: "Delete",
    empty: "No articles to display.",
  },
} as const;

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
  const { language } = useLanguage();
  const ui = language === "ko" ? UI_COPY.ko : UI_COPY.en;

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
      alert(ui.wrongPin);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(ui.confirmDelete)) return;
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
        <div className="mx-auto max-w-md px-4 py-20">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-bold mb-2">{ui.adminLogin}</h1>
            <p className="text-sm text-muted-foreground mb-6">{ui.enterPin}</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder={ui.pinPlaceholder}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              {ui.login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {ui.goHome}
            </button>
            <h1 className="text-2xl font-bold">{ui.newsManage}</h1>
            <span className="text-sm text-muted-foreground">
              {ui.total} {filtered.length} {ui.items}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-sm">{ui.adsterraTitle}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            <a
              href="https://publishers.adsterra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              publishers.adsterra.com
            </a>
            {ui.adsterraDescPrefix}
          </p>
          {[
            { slot: "header", label: ui.adHeader },
            { slot: "sidebar", label: ui.adSidebar },
            { slot: "in-article", label: ui.adInArticle },
            { slot: "footer", label: ui.adFooter },
          ].map(({ slot, label }) => (
            <div key={slot} className="flex gap-2 mb-2 items-center">
              <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{label}</span>
              <input
                type="text"
                defaultValue={localStorage.getItem("adsterra_" + slot + "_key") || ""}
                placeholder={`${ui.zoneKeyPlaceholder} (${slot})`}
                className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  localStorage.setItem("adsterra_" + slot + "_key", e.target.value);
                }}
              />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground/60 mt-2">{ui.savedOnBlur}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{ui.seedreamTitle}</h2>
            {hasApiKey() && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                {ui.configured}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{ui.seedreamDesc}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {ui.signupPrefix}
            <a href="https://console.byteplus.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              console.byteplus.com
            </a>
            {ui.signupSuffix}
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={ui.apiKeyPlaceholder}
              className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium"
            >
              {apiKeySaved ? `✓ ${ui.saved}` : ui.save}
            </button>
          </div>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={ui.searchPlaceholder}
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
                    placeholder={ui.titlePlaceholder}
                  />
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    rows={4}
                    placeholder={ui.contentPlaceholder}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.source || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, source: e.target.value }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder={ui.sourcePlaceholder}
                    />
                    <input
                      type="text"
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value as any }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder={ui.categoryPlaceholder}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white text-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {ui.save}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-500 text-white text-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      {ui.cancel}
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
                          {ui.breaking}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                      onClick={() => navigate("/article/" + encodeURIComponent(article.id))}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      title={ui.edit}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                      title={ui.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">{ui.empty}</div>}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
