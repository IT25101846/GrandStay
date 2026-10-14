-- ===================================================================
-- Hotel Event Reservation Management System (SE Module)
-- Database Script for Microsoft SQL Server (SSMS)
-- Database Name: hotel_db
-- Columns aligned with Hibernate JPA entities.
-- ===================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'hotel_db')
BEGIN
    CREATE DATABASE hotel_db;
END
GO

USE hotel_db;
GO

-- 1. Users Table
IF OBJECT_ID('dbo.users', 'U') IS NULL
CREATE TABLE dbo.users (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(255) NOT NULL,
    email      NVARCHAR(255) NOT NULL UNIQUE,
    password   NVARCHAR(255) NOT NULL,
    role       NVARCHAR(50)  NOT NULL,
    created_at DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 2. Venues Table
IF OBJECT_ID('dbo.venues', 'U') IS NULL
CREATE TABLE dbo.venues (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(255) NOT NULL,
    capacity     INT           NOT NULL,
    description  TEXT          NULL,
    base_price   FLOAT         NOT NULL,
    is_available BIT           NOT NULL DEFAULT 1
);
GO

-- 3. Event Packages Table
IF OBJECT_ID('dbo.event_packages', 'U') IS NULL
CREATE TABLE dbo.event_packages (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(255) NOT NULL,
    description TEXT          NULL,
    base_price  FLOAT         NOT NULL
);
GO

-- 4. Package Venues Mapping Table
IF OBJECT_ID('dbo.package_venues', 'U') IS NULL
CREATE TABLE dbo.package_venues (
    package_id BIGINT NOT NULL,
    venue_id   BIGINT NOT NULL,
    PRIMARY KEY (package_id, venue_id),
    CONSTRAINT FK_pv_package FOREIGN KEY (package_id) REFERENCES dbo.event_packages(id) ON DELETE CASCADE,
    CONSTRAINT FK_pv_venue   FOREIGN KEY (venue_id)   REFERENCES dbo.venues(id)          ON DELETE CASCADE
);
GO

-- 5. Reservations Table
IF OBJECT_ID('dbo.reservations', 'U') IS NULL
CREATE TABLE dbo.reservations (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id      BIGINT        NOT NULL,
    venue_id         BIGINT        NOT NULL,
    package_id       BIGINT        NULL,                      -- nullable: package is optional
    event_date       DATETIME2     NOT NULL,
    guest_count      INT           NOT NULL,
    status           NVARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    rejection_reason NVARCHAR(MAX) NULL,
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2     NULL,
    CONSTRAINT FK_res_customer FOREIGN KEY (customer_id) REFERENCES dbo.users(id),
    CONSTRAINT FK_res_venue    FOREIGN KEY (venue_id)    REFERENCES dbo.venues(id),
    CONSTRAINT FK_res_package  FOREIGN KEY (package_id)  REFERENCES dbo.event_packages(id)
);
GO

-- 6. Quotations Table
IF OBJECT_ID('dbo.quotations', 'U') IS NULL
CREATE TABLE dbo.quotations (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id   BIGINT        NOT NULL,
    custom_charges   FLOAT         NOT NULL DEFAULT 0.0,
    discount_amount  FLOAT         NOT NULL DEFAULT 0.0,
    total_amount     FLOAT         NOT NULL,
    promo_code       NVARCHAR(100) NULL,
    status           NVARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    notes            NVARCHAR(MAX) NULL,
    customer_remarks NVARCHAR(MAX) NULL,
    valid_until      DATETIME2     NULL,
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2     NULL,
    CONSTRAINT FK_quot_res FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id)
);
GO

-- 7. Invoices Table  (column names match Hibernate entity)
IF OBJECT_ID('dbo.invoices', 'U') IS NULL
CREATE TABLE dbo.invoices (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id BIGINT        NOT NULL,
    invoice_number NVARCHAR(100) NOT NULL UNIQUE,
    total_amount   FLOAT         NOT NULL,
    amount_paid    FLOAT         NOT NULL DEFAULT 0.0,    -- was "paid_amount" in old script (FIXED)
    balance_due    FLOAT         NOT NULL,
    status         NVARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    issued_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_inv_res FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id)
);
GO

-- 8. Payments Table  (verified_by / verified_at added — were missing from old script)
IF OBJECT_ID('dbo.payments', 'U') IS NULL
CREATE TABLE dbo.payments (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id BIGINT        NOT NULL,
    amount         FLOAT         NOT NULL,
    type           NVARCHAR(50)  NOT NULL,
    method         NVARCHAR(50)  NOT NULL,
    status         NVARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    verified_by    NVARCHAR(255) NULL,                    -- was missing from old script (FIXED)
    verified_at    DATETIME2     NULL,                    -- was missing from old script (FIXED)
    paid_at        DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_pay_res FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id)
);
GO

-- 9. Promotions Table  (column names match Hibernate entity)
IF OBJECT_ID('dbo.promotions', 'U') IS NULL
CREATE TABLE dbo.promotions (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    code            NVARCHAR(100) NOT NULL UNIQUE,
    discount_type   NVARCHAR(50)  NOT NULL,
    discount_value  FLOAT         NOT NULL,
    valid_from      DATE          NOT NULL,               -- was "start_date" in old script (FIXED)
    valid_until     DATE          NOT NULL,               -- was "end_date" in old script (FIXED)
    max_usage_count INT           NULL,                   -- was "max_uses" in old script (FIXED)
    usage_count     INT           NOT NULL DEFAULT 0,     -- was "current_uses" in old script (FIXED)
    is_active       BIT           NOT NULL DEFAULT 1
);
GO

-- 10. Feedbacks Table  (admin_response / updated_at restored — were missing from live DB)
IF OBJECT_ID('dbo.feedbacks', 'U') IS NULL
CREATE TABLE dbo.feedbacks (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id    BIGINT    NOT NULL,
    reservation_id BIGINT    NOT NULL,
    rating         INT       NOT NULL,
    comment        TEXT      NULL,
    admin_response TEXT      NULL,                        -- was missing from live DB (FIXED)
    submitted_at   DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME2 NULL,                        -- was missing from live DB (FIXED)
    CONSTRAINT FK_fb_customer FOREIGN KEY (customer_id)    REFERENCES dbo.users(id),
    CONSTRAINT FK_fb_res      FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id)
);
GO

-- 11. Inquiries Table
IF OBJECT_ID('dbo.inquiries', 'U') IS NULL
CREATE TABLE dbo.inquiries (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id    BIGINT    NOT NULL,
    message        TEXT      NOT NULL,
    admin_response TEXT      NULL,
    status         NVARCHAR(50) NOT NULL DEFAULT 'OPEN',
    submitted_at   DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME2 NULL,
    CONSTRAINT FK_inq_customer FOREIGN KEY (customer_id) REFERENCES dbo.users(id)
);
GO

-- ===================================================================
-- NOTE: Seed data is handled by DataInitializer.java (Spring Boot)
-- which runs automatically on startup with BCrypt-encoded passwords.
-- DO NOT insert seed data manually below unless testing outside Spring.
-- ===================================================================
