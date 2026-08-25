# UML sơ đồ website Thư viện Số Lá Xanh

Tài liệu này mô tả kiến trúc và các luồng chính được suy ra từ `src/app`, Server Actions, API Routes và Supabase hiện tại.

## 1. Sơ đồ chức năng và điều hướng

```mermaid
flowchart TD
    Visitor[Khách truy cập]
    Reader[Bạn đọc đã đăng nhập]
    Librarian[Quản trị viên / thủ thư]
    Cron[Vercel Cron]

    subgraph Public[Website công khai]
        Home[Trang chủ /]
        About[Giới thiệu /gioi-thieu]
        Books[Kho sách /books]
        Detail[Chi tiết sách /books/:id]
        Read[Đọc PDF /books/:id/read]
        Listen[Nghe audio /books/:id/listen]
        QR[Trang bản giấy QR /p/:token]
        Profile[Hồ sơ công khai /u/:id]
    end

    subgraph Auth[Xác thực]
        Login[Đăng nhập /login]
        Signup[Đăng ký /signup]
        Reset[Đặt lại mật khẩu /reset]
        Password[Cập nhật mật khẩu /update-password]
        Callback[OAuth callback /auth/callback]
        Blocked[Tài khoản bị khóa /blocked]
    end

    subgraph Community[Cộng đồng]
        Hub[Hub /community]
        Feed[Feed /community/feed]
        Chat[Chatbot thủ thư AI /community/chat]
        Challenges[Thử thách /community/challenges]
        Quotes[Trích dẫn /community/quotes]
        Suggestions[Gợi ý theo dõi /community/suggestions]
    end

    subgraph Account[Tài khoản cá nhân]
        Me[Tài khoản /me]
        Edit[Sửa hồ sơ /me/edit]
        Shelf[Tủ sách /me/shelf]
        Stats[Thống kê /me/stats]
        Loans[Mượn sách /me/loans]
    end

    subgraph Admin[Khu vực quản trị, yêu cầu is_admin]
        AdminBooks[Quản lý sách /admin/books]
        NewBook[Thêm sách /admin/books/new]
        EditBook[Sửa sách /admin/books/:id/edit]
        Copies[QR bản sao /admin/books/:id/copies]
        Import[Import CSV /admin/import]
        AdminLoans[Duyệt mượn trả /admin/loans]
        AdminUsers[Quản lý thành viên /admin/users]
        Reading[Lịch sử đọc /admin/users/:id/reading]
        Reports[Báo cáo /admin/reports]
        Settings[Cài đặt /admin/settings]
        NewChallenge[Tạo thử thách /admin/challenges/new]
    end

    Visitor --> Home
    Visitor --> About
    Visitor --> Books
    Visitor --> Detail
    Visitor --> QR
    Visitor --> Profile
    Visitor --> Login
    Visitor --> Signup
    Visitor --> Reset

    Books --> Detail
    Detail --> Read
    Detail --> Listen
    Detail --> Login
    Detail --> QR
    Home --> Books
    Home --> Hub
    About --> Chat

    Login --> Callback
    Callback --> Home
    Reset --> Password
    Login -. Tài khoản bị khóa .-> Blocked

    Reader --> Me
    Reader --> Shelf
    Reader --> Stats
    Reader --> Loans
    Reader --> Feed
    Reader --> Chat
    Reader --> Challenges
    Reader --> Quotes
    Reader --> Suggestions
    Reader --> Profile
    Reader --> QR

    Hub --> Feed
    Hub --> Chat
    Hub --> Challenges
    Hub --> Quotes
    Hub --> Suggestions
    Me --> Edit
    Me --> Shelf
    Me --> Stats
    Me --> Loans
    Profile -. Theo dõi / bỏ theo dõi .-> Feed
    QR -. Mượn / trả .-> Loans

    Librarian --> AdminBooks
    AdminBooks --> NewBook
    AdminBooks --> EditBook
    AdminBooks --> Copies
    AdminBooks --> Import
    AdminBooks --> AdminLoans
    AdminBooks --> AdminUsers
    AdminBooks --> Reports
    AdminBooks --> Settings
    AdminBooks --> NewChallenge
    AdminUsers --> Reading
    Librarian -. Duyệt mượn .-> AdminLoans

    Cron -->|Nhắc hạn trước 2 ngày| AdminLoans
```

## 2. Sơ đồ component và tích hợp

```mermaid
flowchart LR
    Browser[Trình duyệt]

    subgraph Next[Next.js App Router]
        Layout[Root layout\nNavBar + Footer]
        Pages[Server Pages\nPublic / Books / Community / Me]
        AdminPages[Admin Pages\nrequireUser + is_admin]
        Actions[Server Actions\nauth / books / loans / social / challenges]
        APIs[API Routes\nAI / PDF / Chat / Cron]
        Middleware[Middleware\nphiên đăng nhập và trạng thái tài khoản]
    end

    subgraph Services[Dịch vụ ngoài]
        SupabaseAuth[Supabase Auth]
        SupabaseDB[(Supabase Postgres)]
        SupabaseStorage[(Supabase Storage\ncovers / avatars / files)]
        AI[Gemini hoặc OpenAI]
        Email[Resend Email]
        Vercel[Vercel Cron]
    end

    Browser --> Middleware
    Browser --> Layout
    Layout --> Pages
    Layout --> AdminPages
    Pages --> Actions
    Pages --> APIs
    AdminPages --> Actions
    AdminPages --> APIs
    Middleware --> SupabaseAuth
    Pages --> SupabaseAuth
    Pages --> SupabaseDB
    AdminPages --> SupabaseDB
    Actions --> SupabaseDB
    Actions --> SupabaseStorage
    APIs --> SupabaseAuth
    APIs --> SupabaseDB
    APIs --> SupabaseStorage
    APIs --> AI
    APIs --> Email
    Vercel --> APIs

    SupabaseAuth -. session / user .-> SupabaseDB
    SupabaseDB -. public URL .-> SupabaseStorage
```

## 3. Sơ đồ use case chính

```mermaid
flowchart TB
    Reader([Bạn đọc])
    Admin([Quản trị viên])
    Scheduler([Cron scheduler])

    subgraph System[Hệ thống Thư viện Số Lá Xanh]
        UC1((Đăng ký / đăng nhập))
        UC2((Tìm kiếm và lọc sách))
        UC3((Đọc PDF / nghe audio))
        UC4((Lưu tiến độ và phiên đọc))
        UC5((Quản lý tủ sách))
        UC6((Đánh giá và trích dẫn))
        UC7((Chat với thủ thư AI))
        UC8((Tham gia thử thách))
        UC9((Theo dõi bạn đọc và xem Feed))
        UC10((Mượn / trả sách giấy bằng QR))
        UC11((Xem thống kê và huy hiệu))
        UC12((Quản lý sách và file))
        UC13((Quản lý bản sao và QR))
        UC14((Duyệt mượn / cấu hình hạn))
        UC15((Quản lý người dùng))
        UC16((Xem báo cáo))
        UC17((Tạo thử thách))
        UC18((Gửi email nhắc hạn))
    end

    Reader --> UC1
    Reader --> UC2
    Reader --> UC3
    Reader --> UC5
    Reader --> UC6
    Reader --> UC7
    Reader --> UC8
    Reader --> UC9
    Reader --> UC10
    Reader --> UC11
    UC3 -. include .-> UC4
    UC5 -. cập nhật .-> UC8

    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    UC14 -. kiểm tra .-> UC10
    Scheduler --> UC18
    UC18 -. đọc dữ liệu .-> UC14
```

## 4. Sequence: mượn sách giấy bằng QR

```mermaid
sequenceDiagram
    actor Reader as Bạn đọc
    participant QR as /p/:token
    participant Auth as Supabase Auth
    participant Action as borrowPhysicalCopyAction
    participant DB as Supabase Postgres
    participant Admin as Thủ thư

    Reader->>QR: Quét mã QR
    QR->>DB: Tìm physical_copies theo qr_token
    DB-->>QR: Bản sao + thông tin sách
    Reader->>Auth: Đăng nhập nếu chưa có phiên
    Reader->>QR: Chọn Mượn ngay
    QR->>Action: Gửi physicalCopyId, qrToken
    Action->>Auth: requireUser()
    Auth-->>Action: user
    Action->>DB: Kiểm tra bản sao đang pending/active
    Action->>DB: Đếm số sách đang mượn của user
    Action->>DB: Đọc system_settings
    alt Tự động duyệt
        Action->>DB: Insert loan(status=active, due_at)
        DB-->>Action: Thành công
    else Cần thủ thư duyệt
        Action->>DB: Insert loan(status=pending)
        DB-->>Action: Thành công
        Admin->>Action: approveLoanAdminAction(loanId)
        Action->>DB: Update loan thành active và gán hạn trả
    end
    Action-->>QR: Revalidate trang QR và /me/loans
    QR-->>Reader: Hiển thị trạng thái mượn
```

## 5. Mô hình dữ liệu nghiệp vụ chính

```mermaid
classDiagram
    class Profile {
        +uuid id
        +string display_name
        +boolean is_admin
        +boolean is_blocked
        +string[] favorite_genres
        +boolean stats_public
    }
    class Book {
        +uuid id
        +string title
        +string author
        +string genre
        +string cover_path
        +string pdf_path
        +string description
        +number view_count
        +number rating_avg
    }
    class PhysicalCopy {
        +uuid id
        +uuid book_id
        +string qr_token
        +string shelf_label
    }
    class Loan {
        +uuid id
        +uuid user_id
        +uuid physical_copy_id
        +string status
        +datetime borrowed_at
        +datetime due_at
        +datetime returned_at
    }
    class ReadingSession {
        +uuid id
        +uuid user_id
        +uuid book_id
        +datetime started_at
        +datetime ended_at
        +number seconds_spent
        +number last_pdf_page
    }
    class UserBookshelf {
        +uuid user_id
        +uuid book_id
        +string status
    }
    class ReadingChallenge {
        +uuid id
        +string title
        +datetime starts_at
        +datetime ends_at
        +number target_books
    }
    class ChallengeParticipant {
        +uuid challenge_id
        +uuid user_id
        +number books_completed
    }
    class Follow {
        +uuid follower_id
        +uuid following_id
    }
    class BookReview {
        +uuid book_id
        +uuid user_id
        +number rating
        +string content
    }

    Profile "1" --> "0..*" Loan : creates
    Book "1" --> "0..*" PhysicalCopy : has
    PhysicalCopy "1" --> "0..*" Loan : loan history
    Profile "1" --> "0..*" ReadingSession : records
    Book "1" --> "0..*" ReadingSession : read in
    Profile "1" --> "0..*" UserBookshelf : owns
    Book "1" --> "0..*" UserBookshelf : appears in
    ReadingChallenge "1" --> "0..*" ChallengeParticipant : contains
    Profile "1" --> "0..*" ChallengeParticipant : joins
    Profile "1" --> "0..*" Follow : follows
    Book "1" --> "0..*" BookReview : receives
    Profile "1" --> "0..*" BookReview : writes
```

## Ghi chú quyền truy cập

- Các trang đọc, tủ sách, thống kê, mượn sách và thao tác cộng đồng dùng `requireUser()` khi cần người dùng xác thực.
- Khu vực `/admin/*` được bảo vệ ở `src/app/admin/layout.tsx` và kiểm tra `profiles.is_admin`.
- API AI yêu cầu đăng nhập; AI sử dụng Gemini trước và có thể fallback sang OpenAI tùy biến môi trường.
- Cron nhắc hạn yêu cầu `CRON_SECRET` hoặc header `x-vercel-cron: 1`, sau đó dùng Supabase service role.
