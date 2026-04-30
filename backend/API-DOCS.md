# 📘 API Documentation — HelpDesk System

**Base URL**: `http://localhost:8000/api`  
**Auth**: Bearer Token (Laravel Sanctum)

---

## 🔐 Authentication

### POST `/api/register`
Mendaftarkan user baru.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```
**Response `201`:**
```json
{ "token": "1|abc123..." }
```

---

### POST `/api/login`
Login dan dapatkan token.

**Request Body:**
```json
{ "email": "admin@helpdesk.com", "password": "password123" }
```
**Response `200`:**
```json
{ "token": "1|abc123..." }
```

---

### POST `/api/logout` 🔒
Logout dan invalidasi token.

**Response `200`:**
```json
{ "message": "Logged out" }
```

---

## 🎫 Tickets

> Semua endpoint di bawah membutuhkan header:  
> `Authorization: Bearer {token}`

---

### GET `/api/tickets`
Ambil daftar tiket (dengan pagination & filter).

**Query Params:**
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `status`  | string | `open`, `in_progress`, `resolved`, `closed` |
| `priority`| string | `urgent`, `normal`, `low` |
| `category`| string | `hardware`, `software`, `network`, `account`, `other` |
| `search`  | string | Cari berdasarkan judul/deskripsi/nomor |
| `per_page`| int    | Jumlah per halaman (default: 10) |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_number": "TKT-20260430-ABCDEF",
      "title": "Server down",
      "priority": "urgent",
      "status": "open",
      "sla_status": "2 jam tersisa",
      "sla_is_breached": false,
      "user": { "id": 1, "name": "User", "email": "user@example.com" }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

---

### POST `/api/tickets`
Buat tiket baru. Priority ditetapkan otomatis berdasarkan keyword.

**Auto Priority Logic:**
- `"server down"`, `"system down"`, `"critical"` → **urgent** (SLA: 2 jam)
- `"cannot login"`, `"error"`, `"not working"` → **normal** (SLA: 6 jam)
- Lainnya → **low** (SLA: 24 jam)

**Request Body:**
```json
{
  "title": "Server down production",
  "description": "Server produksi tidak bisa diakses",
  "category": "hardware"
}
```
**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "ticket_number": "TKT-20260430-XYZ123",
    "priority": "urgent",
    "sla_due_at": "2026-04-30T12:00:00Z",
    "sla_message": "Respon dalam 2 jam - Tim akan segera menangani"
  }
}
```

---

### GET `/api/tickets/{id}`
Detail tiket beserta logs aktivitas.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "logs": [
      {
        "action": "created",
        "description": "Ticket created",
        "user": { "id": 1, "name": "User" },
        "created_at": "2026-04-30T10:00:00Z"
      }
    ]
  }
}
```

---

### PATCH `/api/tickets/{id}`
Update status atau prioritas tiket.

**Request Body (partial update):**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": 2
}
```

---

### PATCH `/api/tickets/{id}/assign`
Assign tiket ke agent tertentu.

**Request Body:**
```json
{ "assigned_to": 3 }
```

---

## 📊 Dashboard

### GET `/api/dashboard`
Data ringkasan untuk halaman dashboard.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_tickets": 50,
      "open_tickets": 20,
      "in_progress_tickets": 15,
      "resolved_tickets": 14,
      "sla_breached": 3,
      "avg_resolution_hours": 4.5
    },
    "tickets_by_status": { "open": 20, "in_progress": 15, "resolved": 14, "closed": 1 },
    "tickets_by_priority": { "urgent": 5, "normal": 25, "low": 20 },
    "recent_tickets": [...],
    "weekly_trends": { "2026-04-24": 5, "2026-04-25": 8, "...": "..." }
  }
}
```

---

## 🔑 Default Login Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@helpdesk.com     | password123 |
| Agent | agent@helpdesk.com     | password123 |
| User  | user@helpdesk.com      | password123 |

---

## ❌ Error Responses

```json
{ "success": false, "message": "Unauthenticated" }           // 401
{ "success": false, "message": "Unauthorized" }              // 403
{ "success": false, "message": "Ticket not found" }          // 404
{ "success": false, "message": "The title field is required", "errors": {...} }  // 422
```
