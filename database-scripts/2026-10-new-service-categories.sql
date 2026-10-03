-- Adds the four new service categories (idempotent; safe to re-run).
-- Run against InHouseDoctorDB. NOT yet applied.
-- TODO(business): BasePrice values below are placeholders - confirm real prices before running.
-- Existing services keep their rows; only missing slugs are inserted.

DECLARE @new TABLE (ServiceName NVARCHAR(200), Slug NVARCHAR(100), Description NVARCHAR(MAX), LongDescription NVARCHAR(MAX), BasePrice DECIMAL(10,2));

INSERT INTO @new VALUES
('Orthopedic', 'orthopedic',
 'Specialist orthopedic consultation for bone, joint, fracture and post-surgery care at home in Mira Road, Bhayandar and Dahisar.',
 'Our orthopedic doctors visit you at home for joint and back pain, fractures, arthritis, sports injuries and post-operative follow-ups.' + CHAR(10) + CHAR(10) +
 'The visit includes a physical examination, review of your X-rays and reports, a treatment plan, and referrals to physiotherapy or surgery if needed.',
 800),
('Medical Equipment Rent & Sell', 'medical-equipment-rent-sell',
 'Hospital beds, oxygen concentrators, wheelchairs and other medical equipment on rent or for purchase, delivered to your home.',
 'We supply home medical equipment on a rental or purchase basis, including hospital beds, oxygen concentrators, wheelchairs, walkers, nebulizers, BiPAP/CPAP machines and air mattresses.' + CHAR(10) + CHAR(10) +
 'Equipment is cleaned, tested and delivered to your home, with set-up help and 24x7 support.',
 500),
('Lab Tests at Home', 'lab-tests-at-home',
 'Blood and diagnostic sample collection at home by trained phlebotomists, with reports delivered online.',
 'Book routine blood tests, health checkup packages and other diagnostic tests without leaving home.' + CHAR(10) + CHAR(10) +
 'A trained technician collects the sample at your preferred time and your reports are shared online.',
 300),
('ICU Setup at Home', 'icu-setup-at-home',
 'Complete home ICU setup with monitoring equipment and trained critical-care nursing staff in Mira Road, Bhayandar and Dahisar.',
 'We set up a fully equipped ICU at home, including a hospital bed, multipara monitor, oxygen support, ventilator or BiPAP where needed, and suction.' + CHAR(10) + CHAR(10) +
 'Trained ICU nurses and a visiting doctor provide round-the-clock care.',
 5000);

INSERT INTO dbo.Services (ServiceName, Slug, Description, LongDescription, BasePrice, IsActive)
SELECT n.ServiceName, n.Slug, n.Description, n.LongDescription, n.BasePrice, 1
FROM @new n
WHERE NOT EXISTS (SELECT 1 FROM dbo.Services s WHERE s.Slug = n.Slug OR s.ServiceName = n.ServiceName);
