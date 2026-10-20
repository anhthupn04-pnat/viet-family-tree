# Mô Hình Dữ Liệu Quan Hệ (ERD) — VietFamilyTree

## 1. Biểu Đồ Quan Hệ Thực Thể (Entity Relationship Diagram)

```mermaid
erDiagram
    CLAN ||--o{ CLAN_BRANCH : "chia thanh"
    CLAN ||--o{ MEMBER_PROFILE : "thuoc dong ho"
    CLAN ||--o{ CLAN_FUND : "so huu quy"
    CLAN ||--o{ CLAN_DOCUMENT : "luu tru tu lieu"
    CLAN ||--o{ CLAN_EVENT : "to chuc su kien"
    CLAN ||--o{ CHANGE_REQUEST : "nhan de xuat"
    CLAN ||--o{ AUDIT_LOG : "ghi nhat ky"

    CLAN_BRANCH ||--o{ MEMBER_PROFILE : "phan chi nhanh"

    MEMBER_PROFILE ||--o{ MEMBER_PROFILE : "father (Cha)"
    MEMBER_PROFILE ||--o{ MEMBER_PROFILE : "mother (Me)"
    MEMBER_PROFILE ||--o{ MARRIAGE : "husband (Chong)"
    MEMBER_PROFILE ||--o{ MARRIAGE : "wife (Vo)"
    MEMBER_PROFILE ||--o{ ANCESTOR_ANNIVERSARY : "ngay gio"

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        string role
        string assignedBranchId
    }

    CLAN {
        string id PK
        string name
        string couplet1
        string couplet2
        string originLocation
        string mainRegion
        string slug UK
        string ancestralHall
        string historySummary
        boolean isPublic
    }

    CLAN_BRANCH {
        string id PK
        string clanId FK
        string branchName
        int branchOrder
        string leaderName
        string description
        string residenceArea
    }

    MEMBER_PROFILE {
        string id PK
        string clanId FK
        string branchId FK
        string memberCode UK
        string fullName
        string courtesyName
        string gender
        int generation
        string birthSolar
        string birthLunar
        string deathSolar
        string deathLunar
        boolean isAlive
        string burialPlace
        string hometown
        string currentResidence
        string avatarUrl
        string biography
        string phone
        string fatherId FK
        string motherId FK
    }

    MARRIAGE {
        string id PK
        string husbandId FK
        string wifeId FK
        string marriageDate
        string status
        string notes
    }

    ANCESTOR_ANNIVERSARY {
        string id PK
        string clanId FK
        string memberId FK
        string title
        int lunarDay
        int lunarMonth
        boolean isLeapMonth
        string solarDateFixed
        string location
        string description
    }

    CLAN_FUND {
        string id PK
        string clanId FK
        string fundType
        string transactionType
        float amount
        string title
        string contributor
        string notes
        string recordedBy
    }

    CHANGE_REQUEST {
        string id PK
        string clanId FK
        string memberId FK
        string requesterName
        string requesterEmail
        string changeType
        string proposedData
        string reason
        string evidenceSource
        string status
        string reviewerNote
    }

    AUDIT_LOG {
        string id PK
        string clanId FK
        string userName
        string userEmail
        string action
        string target
        string details
        datetime createdAt
    }
```

## 2. Các Ràng Buộc Quan Hệ Đặc Thù
- **Tự tham chiếu huyết thống (Self-referential relations)**: `MemberProfile.fatherId` và `MemberProfile.motherId` trỏ về chính `MemberProfile.id`. Khi một phụ huynh bị xóa, hệ thống dùng `onDelete: SetNull` để tránh làm mất bản ghi của con cái.
- **Ràng buộc hôn phối (`Marriage`)**: Tách riêng hai quan hệ `husbandId` và `wifeId` trỏ về `MemberProfile`, cho phép một thành viên có thể có nhiều mối quan hệ hôn nhân hợp lệ trong lịch sử mà không làm sai lệch huyết thống cha mẹ.
- **Ràng buộc tính toàn vẹn**: Khi xóa một thành viên, API kiểm tra `childCount` phụ thuộc. Nếu có con cái, hệ thống từ chối xóa và yêu cầu điều chuyển cha mẹ trước.
