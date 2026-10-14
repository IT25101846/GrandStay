package com.sliit.hotel.backend.config;

import com.sliit.hotel.backend.entity.*;
import com.sliit.hotel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventPackageRepository packageRepository;
    private final PromotionRepository promotionRepository;
    private final ReservationRepository reservationRepository;
    private final QuotationRepository quotationRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final EventAddonRepository addonRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {

        // ── 1. Seed Users ──────────────────────────────────────────────────────────
        if (userRepository.count() == 0) {
            createUser("Hotel Admin",          "admin@hotel.com",    "Admin@123",    Role.HOTEL_ADMIN);
            createUser("Reservation Officer",  "officer@hotel.com",  "Officer@123",  Role.RESERVATION_OFFICER);
            createUser("Finance Officer",      "finance@hotel.com",  "Finance@123",  Role.FINANCE_OFFICER);
            createUser("Hotel Manager",        "manager@hotel.com",  "Manager@123",  Role.HOTEL_MANAGER);
            createUser("John Customer",        "customer@hotel.com", "Customer@123", Role.CUSTOMER);
        }

        // ── 2. Seed Venues (all 7) ─────────────────────────────────────────────────
        if (venueRepository.count() == 0) {
            venueRepository.saveAll(List.of(
                new Venue(null, "Grand Crystal Ballroom",       500, "Spacious luxury ballroom with crystal chandeliers, ideal for grand weddings and gala dinners.",                         250000.0, true),
                new Venue(null, "Royal Banquet Hall",           250, "Elegant indoor banquet hall with panoramic city views and ambient lighting.",                                           150000.0, true),
                new Venue(null, "Emerald Garden Pavilion",      350, "Open-air scenic garden venue surrounded by tropical landscapes and fountains.",                                         180000.0, true),
                new Venue(null, "Executive Conference Lounge",   80, "Modern corporate conference space equipped with state-of-the-art audiovisual tech.",                                    80000.0,  true),
                new Venue(null, "Sapphire Oceanside Terrace",   200, "Stunning open-air seaside terrace overlooking the ocean, perfect for sunset receptions and cocktail parties.",         220000.0, true),
                new Venue(null, "Celestial Rooftop Observatory",120, "Exclusive high-rise rooftop venue featuring 360-degree skyline views, private bar, and ambient illumination.",          190000.0, true),
                new Venue(null, "Lotus Heritage Courtyard",     300, "Traditional open courtyard with water lily ponds, colonial colonnades, and cultural ambiance.",                         160000.0, true)
            ));
        }

        // ── 3. Seed Packages (all 6) — independent of venue seeding ───────────────
        if (packageRepository.count() == 0) {
            Venue grandBallroom    = findVenueByName("Grand Crystal Ballroom");
            Venue royalHall        = findVenueByName("Royal Banquet Hall");
            Venue gardenPavilion   = findVenueByName("Emerald Garden Pavilion");
            Venue executiveLounge  = findVenueByName("Executive Conference Lounge");
            Venue oceansideTerrace = findVenueByName("Sapphire Oceanside Terrace");
            Venue rooftop          = findVenueByName("Celestial Rooftop Observatory");
            Venue heritage         = findVenueByName("Lotus Heritage Courtyard");

            if (grandBallroom != null && royalHall != null && gardenPavilion != null &&
                executiveLounge != null && oceansideTerrace != null && rooftop != null && heritage != null) {
                packageRepository.saveAll(List.of(
                    new EventPackage(null, "Royal Wedding Experience",
                        "Complete luxury wedding setup including floral decor, 5-course dinner buffet, red carpet, and champagne toast.",
                        350000.0, Set.of(grandBallroom, royalHall, heritage, gardenPavilion)),

                    new EventPackage(null, "Corporate Summit Package",
                        "Full-day conference package including welcome coffee, projector systems, delegate kits, and executive lunch.",
                        120000.0, Set.of(executiveLounge, royalHall, grandBallroom)),

                    new EventPackage(null, "Twilight Garden Gala",
                        "Romantic fairy-light decor, live acoustic station, cocktail tables, and BBQ buffet station.",
                        200000.0, Set.of(gardenPavilion, oceansideTerrace, heritage, rooftop)),

                    new EventPackage(null, "Sunset Cocktail Soirée",
                        "Gourmet canapés, signature mocktail/cocktail stations, ambient soundscape, and lounge seating.",
                        175000.0, Set.of(oceansideTerrace, rooftop, gardenPavilion, heritage)),

                    new EventPackage(null, "Golden Heritage Jubilee",
                        "Traditional grand feast, heritage brass oil lamps, welcome drum ensemble, floral stage, and cultural decor.",
                        280000.0, Set.of(heritage, grandBallroom, royalHall, gardenPavilion)),

                    new EventPackage(null, "Intimate VIP Executive Retreat",
                        "Premium corporate package with high-speed video conferencing, barista coffee station, and 3-course private dining.",
                        95000.0, Set.of(executiveLounge, rooftop, oceansideTerrace)),

                    new EventPackage(null, "Milestone Birthday Celebration",
                        "Signature celebratory decor, balloon installations, custom multi-tier cake station, live DJ soundscape, and gourmet banquet dining.",
                        210000.0, Set.of(royalHall, gardenPavilion, rooftop, oceansideTerrace, grandBallroom))
                ));
            }
        } else {
            // Ensure Milestone Birthday Celebration exists even if DB was previously seeded
            boolean hasBirthdayPkg = packageRepository.findAll().stream()
                .anyMatch(p -> p.getName() != null && p.getName().toLowerCase().contains("birthday"));
            if (!hasBirthdayPkg) {
                Venue grandBallroom = findVenueByName("Grand Crystal Ballroom");
                Venue royalHall = findVenueByName("Royal Banquet Hall");
                Venue gardenPavilion = findVenueByName("Emerald Garden Pavilion");
                Venue rooftop = findVenueByName("Celestial Rooftop Observatory");
                Venue oceansideTerrace = findVenueByName("Sapphire Oceanside Terrace");
                java.util.Set<Venue> venues = new java.util.HashSet<>();
                if (royalHall != null) venues.add(royalHall);
                if (gardenPavilion != null) venues.add(gardenPavilion);
                if (rooftop != null) venues.add(rooftop);
                if (oceansideTerrace != null) venues.add(oceansideTerrace);
                if (grandBallroom != null) venues.add(grandBallroom);
                if (!venues.isEmpty()) {
                    packageRepository.save(new EventPackage(null, "Milestone Birthday Celebration",
                        "Signature celebratory decor, balloon installations, custom multi-tier cake station, live DJ soundscape, and gourmet banquet dining.",
                        210000.0, venues));
                }
            }
        }

        // ── 4. Seed Promotions (independent check) ─────────────────────────────────
        if (promotionRepository.count() == 0) {
            promotionRepository.saveAll(List.of(
                new Promotion(null, "ROYAL20",      "PERCENTAGE",  20.0,
                    java.time.LocalDate.now().minusDays(10),
                    java.time.LocalDate.now().plusMonths(6),
                    100, 0, true),
                new Promotion(null, "WELCOME10",    "PERCENTAGE",  10.0,
                    java.time.LocalDate.now().minusDays(5),
                    java.time.LocalDate.now().plusMonths(3),
                    50, 0, true),
                new Promotion(null, "CELEBRATE50K", "FIXED_AMOUNT", 50000.0,
                    java.time.LocalDate.now().minusDays(1),
                    java.time.LocalDate.now().plusMonths(12),
                    20, 0, true)
            ));
        }

        // ── 4b. Seed Event Customization Add-ons ──────────────────────────────────
        if (addonRepository.count() == 0) {
            addonRepository.saveAll(List.of(
                new EventAddon(null, "Fairy Light Canopy", "LIGHTING", "Magical overhead warm-white fairy lights draping across the entire venue ceiling.", 15000.0, "per event", true),
                new EventAddon(null, "Ambient Candlelight Display", "LIGHTING", "Curated arrangement of elegant pillar candles and glass hurricane lanterns.", 8000.0, "per event", true),
                new EventAddon(null, "Neon Glow Lightscape", "LIGHTING", "Customizable neon accent signage with vibrant RGB mood color wash.", 12000.0, "per event", true),
                new EventAddon(null, "Architectural Uplighting Rig", "LIGHTING", "High-power wireless LED uplighters projecting architectural wash on walls and pillars.", 20000.0, "per event", true),
                new EventAddon(null, "Live DJ & Sound System", "AUDIO_TECH", "Professional club-grade audio setup with turntables, subwoofer, and sound technician.", 25000.0, "per event", true),
                new EventAddon(null, "Live Acoustic Band Setup", "AUDIO_TECH", "Stage monitoring, instrument plug-ins, and multi-channel mixer for live performance.", 35000.0, "per event", true),
                new EventAddon(null, "Wireless Microphones & PA System", "AUDIO_TECH", "Two handheld UHF wireless mics, speech audio processing, and backup batteries.", 10000.0, "per event", true),
                new EventAddon(null, "Balloon Arch & Sculpted Garland", "DECOR", "Custom dual-tone organic balloon arch tailored to your theme and color palette.", 18000.0, "per event", true),
                new EventAddon(null, "Luxury Floral Table Centerpieces", "DECOR", "Fresh seasonal blooms, elevated gold stands, and bespoke botanical styling.", 22000.0, "per event", true),
                new EventAddon(null, "Interactive Photo Booth Corner", "DECOR", "Themed photo backdrop with instant polaroid prints, digital sharing, and props.", 20000.0, "per event", true),
                new EventAddon(null, "Custom Multi-Tier Cake Station", "CATERING", "Showcase table presentation with cake pedestal, cutting cutlery, and dessert lighting.", 15000.0, "per event", true),
                new EventAddon(null, "Champagne & Sparkling Toast Tower", "CATERING", "Cascading coupe glass tower setup with dedicated sommelier pouring service.", 22000.0, "per event", true),
                new EventAddon(null, "Midnight Gourmet Snack Station", "CATERING", "Late-night hot savory bites, artisan sliders, and sweet midnight treats for guests.", 28000.0, "per event", true)
            ));
        }

        // ── 5. Seed Completed Demo Reservations (with quotations, payments, invoices)
        if (reservationRepository.count() == 0) {
            User customer = userRepository.findByEmail("customer@hotel.com").orElse(null);
            if (customer == null) return;

            // ── Reservation 1: Emerald Garden Pavilion + Twilight Garden Gala ──────
            Venue   garden = findVenueByName("Emerald Garden Pavilion");
            EventPackage gala = findPackageByName("Twilight Garden Gala");

            if (garden != null && gala != null) {
                Reservation res1 = new Reservation();
                res1.setCustomer(customer);
                res1.setVenue(garden);
                res1.setEventPackage(gala);
                res1.setEventDate(LocalDateTime.now().minusDays(25).withHour(18).withMinute(0).withSecond(0));
                res1.setGuestCount(180);
                res1.setStatus("COMPLETED");
                res1 = reservationRepository.save(res1);

                double base1   = garden.getBasePrice() + gala.getBasePrice();
                double custom1 = 35000.0;
                double disc1   = 15000.0;
                double total1  = base1 + custom1 - disc1;

                Quotation q1 = new Quotation();
                q1.setReservation(res1);
                q1.setCustomCharges(custom1);
                q1.setDiscountAmount(disc1);
                q1.setPromoCode("WELCOME10");
                q1.setNotes("Annual Corporate Twilight Gala setup with acoustic staging, ambient fairy lighting, and BBQ dinner buffet.");
                q1.setCustomerRemarks("Banquet and custom lighting specifications agreed and accepted.");
                q1.setTotalAmount(total1);
                q1.setStatus("ACCEPTED");
                q1.setValidUntil(LocalDateTime.now().minusDays(30));
                quotationRepository.save(q1);

                double deposit1 = Math.round(total1 * 0.30);

                Payment p1d = new Payment();
                p1d.setReservation(res1);
                p1d.setAmount(deposit1);
                p1d.setType("DEPOSIT");
                p1d.setMethod("BANK_TRANSFER");
                p1d.setStatus("VERIFIED");
                p1d.setVerifiedBy("finance@hotel.com");
                p1d.setVerifiedAt(LocalDateTime.now().minusDays(29));
                paymentRepository.save(p1d);

                Payment p1f = new Payment();
                p1f.setReservation(res1);
                p1f.setAmount(total1 - deposit1);
                p1f.setType("FULL");
                p1f.setMethod("BANK_TRANSFER");
                p1f.setStatus("VERIFIED");
                p1f.setVerifiedBy("finance@hotel.com");
                p1f.setVerifiedAt(LocalDateTime.now().minusDays(26));
                paymentRepository.save(p1f);

                Invoice inv1 = new Invoice();
                inv1.setReservation(res1);
                inv1.setInvoiceNumber("INV-2026-0891");
                inv1.setTotalAmount(total1);
                inv1.setAmountPaid(total1);
                inv1.setBalanceDue(0.0);
                inv1.setStatus("PAID");
                invoiceRepository.save(inv1);
            }

            // ── Reservation 2: Celestial Rooftop + Sunset Cocktail Soirée ──────────
            Venue        rooftop  = findVenueByName("Celestial Rooftop Observatory");
            EventPackage cocktail = findPackageByName("Sunset Cocktail Soirée");

            if (rooftop != null && cocktail != null) {
                Reservation res2 = new Reservation();
                res2.setCustomer(customer);
                res2.setVenue(rooftop);
                res2.setEventPackage(cocktail);
                res2.setEventDate(LocalDateTime.now().minusDays(10).withHour(17).withMinute(30).withSecond(0));
                res2.setGuestCount(75);
                res2.setStatus("COMPLETED");
                res2 = reservationRepository.save(res2);

                double base2   = rooftop.getBasePrice() + cocktail.getBasePrice();
                double custom2 = 25000.0;
                double disc2   = 20000.0;
                double total2  = base2 + custom2 - disc2;

                Quotation q2 = new Quotation();
                q2.setReservation(res2);
                q2.setCustomCharges(custom2);
                q2.setDiscountAmount(disc2);
                q2.setPromoCode("ROYAL20");
                q2.setNotes("Exclusive VIP Sunset Cocktail & Product Launch reception with panoramic skyline view and DJ lounge setup.");
                q2.setCustomerRemarks("Confirmed and accepted.");
                q2.setTotalAmount(total2);
                q2.setStatus("ACCEPTED");
                q2.setValidUntil(LocalDateTime.now().minusDays(18));
                quotationRepository.save(q2);

                double deposit2 = Math.round(total2 * 0.30);

                Payment p2d = new Payment();
                p2d.setReservation(res2);
                p2d.setAmount(deposit2);
                p2d.setType("DEPOSIT");
                p2d.setMethod("BANK_TRANSFER");
                p2d.setStatus("VERIFIED");
                p2d.setVerifiedBy("finance@hotel.com");
                p2d.setVerifiedAt(LocalDateTime.now().minusDays(15));
                paymentRepository.save(p2d);

                Payment p2f = new Payment();
                p2f.setReservation(res2);
                p2f.setAmount(total2 - deposit2);
                p2f.setType("FULL");
                p2f.setMethod("BANK_TRANSFER");
                p2f.setStatus("VERIFIED");
                p2f.setVerifiedBy("finance@hotel.com");
                p2f.setVerifiedAt(LocalDateTime.now().minusDays(11));
                paymentRepository.save(p2f);

                Invoice inv2 = new Invoice();
                inv2.setReservation(res2);
                inv2.setInvoiceNumber("INV-2026-0944");
                inv2.setTotalAmount(total2);
                inv2.setAmountPaid(total2);
                inv2.setBalanceDue(0.0);
                inv2.setStatus("PAID");
                invoiceRepository.save(inv2);
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────

    private void createUser(String name, String email, String rawPassword, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
    }

    private Venue findVenueByName(String name) {
        return venueRepository.findAll().stream()
            .filter(v -> v.getName().equals(name))
            .findFirst()
            .orElse(null);
    }

    private EventPackage findPackageByName(String name) {
        return packageRepository.findAll().stream()
            .filter(p -> p.getName().equals(name))
            .findFirst()
            .orElse(null);
    }
}
