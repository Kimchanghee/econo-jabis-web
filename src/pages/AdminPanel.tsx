import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, ArrowLeft, Save, X, Shield } from "lucide-react";
import Header from "../components/Header";
import { NewsArticle } from "../data/newsData";

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
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NewsArticle>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [pinInput, setPinInput] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem(ADMIN_KEY);
    if (auth === "true") setIsAuthed(true);
  }, []);

  useEffect(() => {
    if (isAuthed) setArticles(getArticles());
  }, [isAuthed]);

  const handleLogin = () => {
    if (pinInput === "1234") {
      sessionStorage.setItem(ADMIN_KEY, "true");
      setIsAuthed(true);
    } else {
      alert("잘못된 비밀번호입니다.");
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("이 기사를 삭제하시겠습니까?")) return;
    addDeletedId(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setEditForm({ ...article });
  };

  const handleSave = () => {
    if (!editingId || !editForm) return;
    const updated = articles.map((a) =>
      a.id === editingId ? { ...a, ...editForm } : a
    );
    saveArticles(updated);
    setArticles(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filtered = articles.filter(
    (a) =>
      !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <h1 className="text-xl font-bold mb-2">{"관리자 로그인"}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {"관리자 비밀번호를 입력하세요"}
            </p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="비밀번호"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              {"로그인"}
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
              {"홈으로"}
            </button>
            <h1 className="text-2xl font-bold">{"뉴스 관리"}</h1>
            <span className="text-sm text-muted-foreground">
              {"총 " + filtered.length + "건"}
            </span>
          </div>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="기사 검색 (제목, 출처, 카테고리)"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-6"
        />

        <div className="space-y-3">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              {editingId === article.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    placeholder="제목"
                  />
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                    rows={4}
                    placeholder="내용"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.source || ""}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, source: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder="출처"
                    />
                    <input
                      type="text"
                      value={editForm.category || ""}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          category: e.target.value,
                        }))
                      }
                      className="px-3 py-1.5 rounded border border-border bg-background text-foreground text-sm"
                      placeholder="카테고리"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white text-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {"저장"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-500 text-white text-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      {"취소"}
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
                          {"속보"}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                      onClick={() =>
                        navigate(
                          "/article/" + encodeURIComponent(article.id)
                        )
                      }
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.source + " · " + article.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="수정"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {"표시할 기사가 없습니다."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
