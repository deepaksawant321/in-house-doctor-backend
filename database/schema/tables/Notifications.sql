-- Table: dbo.Notifications
-- Source: reconstructed from src/entities/notification.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: notifications, bookings, payments, admin, dashboard.

CREATE TABLE dbo.Notifications (
    NotificationId    BIGINT IDENTITY(1,1) NOT NULL,
    BookingId         BIGINT        NULL,   -- FK -> Bookings.BookingId (nullable)
    UserId            BIGINT        NULL,   -- FK -> Users.UserId (nullable)
    NotificationType  VARCHAR(50)   NOT NULL,  -- e.g. BookingCreated, BookingStatusUpdate, PaymentInitiated, PaymentSuccess
    Recipient         VARCHAR(100)  NOT NULL,  -- patient/user id used as a fallback recipient key
    Message           NVARCHAR(MAX) NOT NULL,
    DeliveryStatus    VARCHAR(50)   NOT NULL CONSTRAINT DF_Notifications_DeliveryStatus DEFAULT ('Pending'),
    IsRead            BIT           NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
    SentDate          DATETIME      NOT NULL CONSTRAINT DF_Notifications_SentDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Notifications PRIMARY KEY (NotificationId),
    CONSTRAINT FK_Notifications_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);

-- Notes: this is an in-app notification log only (DeliveryStatus is always set to 'Sent' by callers —
-- there is no real SMS/email/push delivery wired to this table; NotificationsService.sendNotification
-- docstring says "In production, this would integrate with an SMS/email/push provider").
