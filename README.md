# 🎫 HelpDesk Ticketing System

![Laravel](https://img.shields.io/badge/Laravel-12-red?style=flat&logo=laravel)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql)
![Python](https://img.shields.io/badge/Python-ML-3776AB?style=flat&logo=python)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat&logo=scikit-learn)

> Sistem tiket helpdesk IT cerdas dengan **Machine Learning** untuk deteksi prioritas otomatis. Cukup tulis judul dan deskripsi masalah, sistem akan memprediksi prioritas tiket secara otomatis!

---

## 🧠 Fitur Machine Learning

Sistem ini dilengkapi **Python ML Service** yang memprediksi prioritas tiket secara otomatis:

| Input User | Prediksi ML | Confidence | SLA |
|------------|-------------|------------|-----|
| "Server mati total" | 🔴 **Urgent** | 99.6% | 2 jam |
| "Bos marah minta segera" | 🔴 **Urgent** | 95%+ | 2 jam |
| "Tidak bisa login" | 🟡 **Normal** | 95.0% | 6 jam |
| "Aplikasi error terus" | 🟡 **Normal** | 93.1% | 6 jam |
| "Minta mouse baru" | 🟢 **Low** | 91.5% | 24 jam |

**📊 Akurasi Model: 86.89%** (Cross-Validation Score)

> Jika ML Service tidak tersedia, sistem otomatis **fallback ke rule-based** detection.

---

## ✨ Fitur Utama

### 🎯 Core Features
- 🤖 **ML Auto Priority Detection** - Prediksi prioritas pakai Python ML (akurasi 87%)
- ⚡ **Rule-Based Fallback** - Keyword detection jika ML tidak tersedia
- ⏱️ **SLA Tracking** - Deadline otomatis (2/6/24 jam) & breach detection
- 👥 **Role-Based Access** - Admin, Agent, User dengan batasan berbeda
- 📊 **Dashboard Analytics** - Statistik real-time & tren mingguan
- 🔄 **Ticket Lifecycle** - Open → In Progress → Resolved → Closed
- 📝 **Activity Logging** - Audit trail lengkap setiap tiket

### 🎨 UI/UX
- 🌓 **Dark/Light Mode** - Tema lengkap
- 📱 **Responsive Design** - Mobile-friendly
- ⏳ **Loading States** - Skeleton loaders
- ❌ **Error Handling** - Error boundaries
- 🔔 **Toast Notifications** - Feedback real-time
- 🧩 **Modern UI** - Komponen shadcn/ui

### 🔐 Keamanan
- 🔑 **Token-based Auth** - Laravel Sanctum
- 🎭 **Role Permissions** - Spatie Permission
- 🛡️ **CORS Protection** - Origin whitelist
- ✅ **Input Validation** - Server-side

---

## 🏗️ Tech Stack

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Laravel | 12.x | API Framework |
| PostgreSQL | 15+ | Database (Supabase) |
| Sanctum | 4.x | API Auth |
| Spatie Permission | 6.x | Role & Permission |
| Pest | 3.x | Testing |

### ML Service (Python)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Python | 3.10+ | ML Runtime |
| Flask | 3.x | ML API Server |
| scikit-learn | 1.7+ | ML Library |
| pandas | 2.x | Data Processing |
| joblib | 1.5+ | Model Serialization |

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.x | React Framework |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | UI Components |
| React Query | 5.x | Data Fetching |
| Axios | 1.x | HTTP Client |
| Sonner | Latest | Toast Notifications |

---
