import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, ArrowLeft, Save, X, Shield, Key } from "lucide-react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";
import { getApiKey, setApiKey, hasApiKey } from "../hooks/useSeedreamImage";

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
  } catch { return []; }
};

const getDeletedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
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
    if (isAuthed) { setArticles(getArticles()); setApiKeyInput(getApiKey()); }
  }, [isAuthed]);

  const handleLogin = () => {
    if (pinInput === "1234") { sessionStorage.setItem(ADMIN_KEY, "true"); setIsAuthed(true); }
    else { alert("\uc798\ubabb\ub41c \ube44\ubc00\ubc88\ud638\uc785\ub2c8\ub2e4."); }
  };
  const handleDelete = (id: string) => {
    if (!window.confirm("\uc774 \uae30\uc0ac\ub97c \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?")) return;
    addDeletedId(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };
  const handleEdit = (article: NewsArticle) => { setEditingId(article.id); setEditForm({ ...article }); };
  const handleSave = () => {
    if (!editingId || !editForm) return;
    const updated = articles.map((a) => a.id === editingId ? { ...a, ...editForm } : a);
    saveArticles(updated); setArticles(updated); setEditingId(null); setEditForm({});
  };
  const handleCancel = () => { setEditingId(null); setEditForm({}); };
  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim()); setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };
  const filtered = articles.filter((a) =>
    !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="mx-auto max-w-md px-4 py-20">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-bold mb-2">{"\uad00\ub9ac\uc790 \ub85c\uadf8\uc778"}</h1>
            <p className="text-sm text-muted-foreground mb-6">{"\uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694"}</p>
            <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="\ube44\ubc00\ubc88\ud638"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-4" />
            <button onClick={handleLogin}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
              {"\ub85c\uadf8\uc778"}</button>
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
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />{"\ud648\uc73c\ub85c"}</button>
            <h1 className="text-2xl font-bold">{"\ub274\uc2a4 \uad00\ub9ac"}</h1>
            <span className="text-sm text-muted-foreground">{"\ucd1d " + filtered.length + "\uac74"}</span>
          </div>
        </div>
        {/* Adsterra Ad Settings */}
          <div className="rounded-lg border border-border bg-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-sm">📢 Adsterra 광고 설정</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              <a href="https://publishers.adsterra.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">publishers.adsterra.com</a>에서 각 광고 유닛의 Zone Key를 입력하세요. (즉시 승인)
            </p>
            {[{slot:'header',label:'헤더 배너 728x90'},{slot:'sidebar',label:'사이드바 300x250'},{slot:'in-article',label:'본문 중간 300x250'},{slot:'footer',label:'하단 배너 728x90'}].map(({slot,label}) => (
              <div key={slot} className="flex gap-2 mb-2 items-center">
                <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{label}</span>
                <input
                  type="text"
                  defaultValue={localStorage.getItem('adsterra_' + slot + '_key') || ''}
                  placeholder={'Zone Key (' + slot + ')'}
                  className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => { localStorage.setItem('adsterra_' + slot + '_key', e.target.value); }}
                />
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground/60 mt-2">입력 후 포커스 아웃 시 자동 저장됩니다.</p>
          </div>
        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{"Seedream AI \uc774\ubbf8\uc9c0 \uc124\uc815"}</h2>
            {hasApiKey() && (<span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">{"\uc124\uc815\ub428"}</span>)}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {"BytePlus Seedream API \ud0a4\ub97c \uc785\ub825\ud558\uba74 AI\uac00 \ub274\uc2a4 \uae30\uc0ac\uc5d0 \ub9de\ub294 \uc2e4\uc0ac \uc774\ubbf8\uc9c0\ub97c \uc790\ub3d9 \uc0dd\uc131\ud569\ub2c8\ub2e4."}</p>
          <p className="text-xs text-muted-foreground mb-3">{"\uac00\uc785: "}
            <a href="https://console.byteplus.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">{"console.byteplus.com"}</a>
            {" \u2192 API Key \ubc1c\uae09"}</p>
          <div className="flex gap-2">
            <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="BytePlus ARK API Key"
              className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm" />
            <button onClick={handleSaveApiKey}
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium">
              {apiKeySaved ? "\u2713 \uc800\uc7a5\ub428" : "\uc800\uc7a5"}</button>
          </div>
        </div>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="\uae30\uc0ac \uac80\uc0c9 (\uc81c\ubaa9, \ucd9c\ucc98, \uce74\ud14c\uace0\ub9ac)"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-6" />
        <div className="space-y-3">
          {filtered.map((article) => (
            <div key={article.id} className="rounded-lg border border-border bg-card p-4">
              {editingId === article.id ? (
                <div className="space-y-3">
                  <input type="text" value={editForm.title || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    placeholder="\uc81c\ubaa9" />
                  <textarea value={editForm.description || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    rows={4} placeholder="\ub0b4\uc6a9" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={editForm.source || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, source: e.target.value }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder="\ucd9c\ucc98" />
                    <input type="text" value={editForm.category || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value as any }))}
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder="\uce74\ud14c\uace0\ub9ac" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white text-sm">
                      <Save className="h-3.5 w-3.5" />{"\uc800\uc7a5"}</button>
                    <button onClick={handleCancel} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-500 text-white text-sm">
                      <X className="h-3.5 w-3.5" />{"\ucde8\uc18c"}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{article.category}</span>
                      {article.isBreaking && (<span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">{"\uc18d\ubcf4"}</span>)}
                    </div>
                    <h3 className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                      onClick={() => navigate("/article/" + encodeURIComponent(article.id))}>{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(article)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="\uc218\uc815">
                      <Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500" title="\uc0ad\uc81c">
                      <Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (<div className="text-center py-12 text-muted-foreground">{"\ud45c\uc2dc\ud560 \uae30\uc0ac\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}</div>)}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
