import { Link } from "react-router-dom";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600 hover:underline">← 홈으로 돌아가기</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">문의하기</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-semibold mb-2">문의가 접수되었습니다</h2>
              <p className="text-gray-600">빠른 시일 내에 답변 드리겠습니다.</p>
              <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">홈으로 돌아가기</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="이름을 입력해주세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="이메일을 입력해주세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문의 내용</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="문의 내용을 입력해주세요"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                문의 보내기
              </button>
            </form>
          )}
        </div>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">연락처 정보</h2>
          <div className="space-y-2 text-gray-700">
            <p>📧 이메일: contact@econojabis.com</p>
            <p>🌐 웹사이트: https://econojabis.com</p>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 EconoJabis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
