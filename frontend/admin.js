// Admin Dashboard Controller

// State Management
let currentUser = null;
let inventoryList = [];
let clientsList = [];
let eventsList = [];
let galleryList = [];
let crewList = [];
let activeCrewAssignments = []; // Temporary cache during booking editing

// Search queries
let dashboardSearchQuery = "";
let warehouseSearchQuery = "";
let clientsSearchQuery = "";
let gallerySearchQuery = "";
let crewSearchQuery = "";
let financeSearchQuery = "";
let invoiceSearchQuery = "";
let eventsSearchQuery = "";

// Pagination pages (1-indexed)
let dashboardPage = 1;
let warehousePage = 1;
let clientsPage = 1;
let galleryPage = 1;
let crewPage = 1;
let financePage = 1;
let invoicePage = 1;
let eventsPage = 1;

// Global page size limit
const PAGE_SIZE = 10;

// Toast and Modals are handled via common.js

// Translation Dictionary
const TRANSLATIONS = {
    en: {
        // Sidebar & General
        "nav_dashboard": "Operations Dashboard",
        "nav_events": "Events Projects",
        "nav_warehouse": "Warehouse Catalog",
        "nav_clients": "Clients CRM",
        "nav_gallery": "Portfolio Gallery",
        "nav_crew": "Crew Ledger",
        "nav_finance": "Finance Hub",
        "nav_invoices": "Invoices Hub",
        "nav_signout": "Secure Sign Out",
        "role_admin": "Business Administrator",
        "edit": "Edit",
        "delete": "Delete",
        "save": "Save",
        "cancel": "Cancel",
        "actions": "Actions",
        "status": "Status",

        // Dashboard
        "dash_title": "Operations Dashboard",
        "dash_subtitle": "Track scheduling status, payouts, and net event balances.",
        "dash_btn_quote": "On-Walk Quote Builder",
        "dash_btn_onboard": "Onboard Crew",
        "dash_btn_booking": "Create Event Booking",
        "dash_stat_active": "Active Bookings",
        "dash_stat_tasks": "Pending Tasks",
        "dash_stat_crew": "Crew On Duty",
        "dash_stat_lowstock": "Low Stock Items",
        "dash_upcoming_title": "Upcoming Events",
        "dash_upcoming_sub": "Sorted by nearest date · Completed events are shown in the Events Projects section.",
        "dash_search_placeholder": "Search client / venue...",
        "dash_table_client": "Client / Location",
        "dash_table_dates": "Dates",
        "dash_table_total": "Invoice Total",
        "dash_table_paid": "Paid",
        "dash_table_balance": "Balance",

        // Events Projects
        "events_title": "Events Projects",
        "events_subtitle": "Track, filter, search, and manage all booked decoration projects.",
        "events_btn_booking": "Book New Event Project",
        "events_stat_total": "Total Bookings",
        "events_stat_confirmed": "Confirmed Projects",
        "events_stat_draft": "Draft Bookings",
        "events_filter_status": "Filter Status:",
        "events_filter_all": "All",
        "events_filter_draft": "Draft",
        "events_filter_confirmed": "Confirmed",
        "events_filter_completed": "Completed",
        "events_search_placeholder": "Search Client / Venue...",

        // Warehouse Catalog
        "wh_title": "Warehouse Catalog Inventory",
        "wh_subtitle": "Create, update, and manage master physical event assets.",
        "wh_btn_register": "Register Catalog Asset",
        "wh_stat_unique": "Total Unique Items",
        "wh_stat_stock": "Total Unit Stock",
        "wh_stat_low": "Low Stock Alerts",
        "wh_search_placeholder": "Search catalog assets...",
        "wh_table_id": "ID",
        "wh_table_name": "Name",
        "wh_table_category": "Category",
        "wh_table_stock": "Stock Level",
        "wh_table_rate": "Day Rate",

        // Clients CRM
        "cli_title": "Clients CRM Database",
        "cli_subtitle": "Manage client profiles and register new customer accounts.",
        "cli_btn_intake": "Intake New Client",
        "cli_stat_total": "Total Clients",
        "cli_stat_active": "Active Clients",
        "cli_stat_new": "New Leads (YTD)",
        "cli_search_placeholder": "Search clients...",
        "cli_table_id": "ID",
        "cli_table_name": "Name",
        "cli_table_email": "Email",
        "cli_table_phone": "Phone",
        "cli_table_address": "Address",

        // Portfolio Gallery
        "gal_title": "Portfolio Gallery",
        "gal_subtitle": "Upload, edit, and manage wedding showcase photos displayed on landing page.",
        "gal_btn_upload": "Upload Photo Entry",
        "gal_search_placeholder": "Search showcase entries...",
        "gal_table_photo": "Photo",
        "gal_table_title": "Title",
        "gal_table_category": "Category",
        "gal_table_desc": "Description",

        // Crew Ledger
        "crew_title": "Crew Wages & Ledger",
        "crew_subtitle": "Track internal crew profiles, base rates, payment logs, and amounts owed.",
        "crew_btn_attendance": "Daily Attendance Register",
        "crew_btn_add": "Add Team Profile",
        "crew_stat_strength": "Roster Strength",
        "crew_stat_owed": "Wages Owed",
        "crew_stat_active": "Active Assignments",
        "crew_search_placeholder": "Search team members...",
        "crew_table_id": "ID",
        "crew_table_name": "Name",
        "crew_table_role": "Role",
        "crew_table_contact": "Contact",
        "crew_table_rate": "Base Rate (₹)",
        "crew_table_days": "Days Worked",
        "crew_table_owed": "Owed Wages (₹)",

        // Finance Hub
        "fin_title": "Finance Hub",
        "fin_subtitle": "Filter sales, calculate receivables, and view payment transaction logs.",
        "fin_stat_sales": "Total Sales",
        "fin_stat_receivables": "Receivables Balance",
        "fin_stat_wages": "Total Crew Wages",
        "fin_stat_profit": "Net Profit Margin",
        "fin_filter_payment": "Filter Payment Status:",
        "fin_filter_all": "All",
        "fin_filter_fully": "Fully Paid",
        "fin_filter_partially": "Partially Paid",
        "fin_filter_unpaid": "Unpaid",
        "fin_search_placeholder": "Search client / venue...",
        "fin_table_client": "Client / Venue",
        "fin_table_date": "Event Date",
        "fin_table_total": "Invoice Total",
        "fin_table_paid": "Amount Paid",
        "fin_table_balance": "Balance",
        "fin_table_status": "Payment Status",
        "fin_table_action": "Action",

        // Invoices Hub
        "inv_title": "Invoices Hub",
        "inv_subtitle": "Manage billing, track event payment collections, and export high-fidelity PDF invoices.",
        "inv_btn_manual": "Create Manual Invoice",
        "inv_stat_total": "Total Invoiced",
        "inv_stat_collected": "Total Collected",
        "inv_stat_remaining": "Total Remaining",
        "inv_filter_status": "Filter Status:",
        "inv_filter_all": "All",
        "inv_filter_paid": "Paid",
        "inv_filter_remaining": "Remaining",
        "inv_filter_unpaid": "Unpaid",
        "inv_search_placeholder": "Search Client / Venue...",
        "inv_table_client": "Client / Location",
        "inv_table_date": "Invoice Date",
        "inv_table_status": "Status",
        "inv_table_total": "Invoice Total",
        "inv_table_paid": "Paid",
        "inv_table_balance": "Balance",
        
        // Invoices print/PDF words
        "pdf_invoice_title": "INVOICE",
        "pdf_invoice_from": "FROM:",
        "pdf_invoice_to": "BILLED TO:",
        "pdf_event_details": "EVENT LOGISTICS:",
        "pdf_venue": "Venue:",
        "pdf_start_date": "Setup Start:",
        "pdf_end_date": "Cleanup Deadline:",
        "pdf_decor_item": "Reserved Catalog Item",
        "pdf_category": "Category",
        "pdf_qty": "Qty",
        "pdf_rate": "Day Rate",
        "pdf_subtotal": "Rental Subtotal:",
        "pdf_discount": "Discount:",
        "pdf_tax": "Tax Rate:",
        "pdf_total": "Invoice Total:",
        "pdf_amount_paid": "Amount Paid:",
        "pdf_balance_due": "Balance Due:",
        "pdf_terms_title": "TERMS & CONDITIONS",
        "pdf_terms_text": "1. All reservation items are rental assets of Bhoomi Decoration.\n2. Payments should be made within the milestone dates.\n3. Any damage to physical property during the setup or event span is subject to replacement charges.",
        "pdf_invoice_no": "Invoice No:",
        "pdf_date_label": "Date:",
        "pdf_auth_sign": "Authorized Signatory",
        "pdf_client_sign": "Client Signature",
        "pdf_agreement_accept": "Acceptance of Agreement",
        "pdf_thank_you": "Thank you for choosing Bhoomi Decoration for your celebration!",
        "pdf_no_items": "No reserved catalog items found.",
        "pdf_custom_category": "Custom",
        "payout_modal_title": "Event Invoice Details",
        "payout_client_profile": "Client Profile:",
        "payout_venue": "Target Venue:",
        "payout_dates": "Dates Range:",
        "payout_days": "Days Rental",
        "payout_reserved_title": "Reserved Stock Breakdown:",
        "payout_wage_title": "Setup Crew Wages & Payroll:",
        "payout_wage_label": "Wage:",
        "payout_released": "Released",
        "payout_no_workers": "No workers assigned.",
        "payout_subtotal": "Subtotal:",
        "payout_discount": "Discount:",
        "payout_tax": "Tax",
        "payout_total": "Invoice Total:",
        "payout_paid": "Deposits Paid:",
        "payout_balance": "Remaining Balance Due:",
        "payout_record_label": "Record Cash Deposit / Payment Receipt (₹)",
        "payout_btn_record": "Record Payment",
        "payout_btn_export": "Export Contract & Receipt",
        "payout_btn_close": "Close",
        "receipt_contract_title": "EVENT DECORATION LOGISTICS CONTRACT",
        "receipt_admin": "Business Administrator",
        "receipt_client": "Customer Client:",
        "receipt_address": "Setup Address:",
        "receipt_dates": "Booked Dates:",
        "receipt_ref_code": "Invoice Reference Code:",
        "receipt_item": "Decor Item",
        "receipt_qty": "Qty",
        "receipt_rate": "Day Rate",
        "receipt_subtotal": "Subtotal Amount:",
        "receipt_discount": "Deducted Discount:",
        "receipt_tax": "Applied Tax",
        "receipt_invoice_total": "Total Invoice Amount:",
        "receipt_total_paid": "Total Paid (Receipts):",
        "receipt_remaining": "Remaining Accounts Balance:",
        
        // System Settings & Exports
        "settings_title": "System Settings",
        "settings_subtitle": "Configure booking defaults, business profile details, and appearance themes.",
        "settings_sec_defaults": "Booking Defaults",
        "settings_tax_rate": "Default Tax Rate (%)",
        "settings_discount": "Default Discount (₹)",
        "settings_sec_profile": "Company Business Profile",
        "settings_company_name": "Company Name",
        "settings_company_address": "Business Address",
        "settings_company_email": "Business Email",
        "settings_company_phone": "Contact Phone",
        "settings_company_website": "Company Website",
        "settings_sec_appearance": "Appearance Color Scheme",
        "settings_theme_label": "Theme Palette",
        "settings_theme_crimson": "Crimson Red (Default Brand)",
        "settings_theme_emerald": "Emerald Green",
        "settings_theme_midnight": "Midnight Blue",
        "settings_btn_save": "Save Settings",
        "nav_settings": "System Settings",
        "export_pdf": "Export PDF",
        "details_btn": "Details"
    },
    gu: {
        // Sidebar & General
        "nav_dashboard": "ઓપરેશન્સ ડેશબોર્ડ",
        "nav_events": "ઇવેન્ટ પ્રોજેક્ટ્સ",
        "nav_warehouse": "વેરહાઉસ કેટલોગ",
        "nav_clients": "ગ્રાહક સીઆરએમ",
        "nav_gallery": "પોર્ટફોલિયો ગેલેરી",
        "nav_crew": "ક્રૂ લેજર",
        "nav_finance": "ફાઇનાન્સ હબ",
        "nav_invoices": "ઇન્વૉઇસ હબ",
        "nav_signout": "સુરક્ષિત સાઇન આઉટ",
        "role_admin": "વ્યવસાય સંચાલક",
        "edit": "ફેરફાર કરો",
        "delete": "કાઢી નાખો",
        "save": "સાચવો",
        "cancel": "રદ કરો",
        "actions": "ક્રિયાઓ",
        "status": "સ્થિતિ",

        // Dashboard
        "dash_title": "ઓપરેશન્સ ડેશબોર્ડ",
        "dash_subtitle": "શેડ્યુલિંગ સ્થિતિ, ચુકવણીઓ અને નેટ ઇવેન્ટ બેલેન્સ ટ્રૅક કરો.",
        "dash_btn_quote": "ઓન-વોક ક્વોટ બિલ્ડર",
        "dash_btn_onboard": "ક્રૂ ઓનબોર્ડ કરો",
        "dash_btn_booking": "ઇવેન્ટ બુકિંગ બનાવો",
        "dash_stat_active": "સક્રિય બુકિંગ",
        "dash_stat_tasks": "બાકી કાર્યો",
        "dash_stat_crew": "ફરજ પર ક્રૂ",
        "dash_stat_lowstock": "ઓછો સ્ટોક ધરાવતી વસ્તુઓ",
        "dash_upcoming_title": "આગામી ઇવેન્ટ્સ",
        "dash_upcoming_sub": "સૌથી નજીકની તારીખ દ્વારા ક્રમાંકિત · પૂર્ણ થયેલ ઇવેન્ટ્સ ઇવેન્ટ પ્રોજેક્ટ્સ વિભાગમાં બતાવવામાં આવે છે.",
        "dash_search_placeholder": "ગ્રાહક / સ્થળ શોધો...",
        "dash_table_client": "ગ્રાહક / સ્થાન",
        "dash_table_dates": "તારીખો",
        "dash_table_total": "ઇન્વૉઇસ કુલ",
        "dash_table_paid": "ચૂકવેલ",
        "dash_table_balance": "બાકી રકમ",

        // Events Projects
        "events_title": "ઇવેન્ટ પ્રોજેક્ટ્સ",
        "events_subtitle": "બધા બુક કરેલા ડેકોરેશન પ્રોજેક્ટ્સ ટ્રૅક કરો, ફિલ્ટર કરો, શોધો અને સંચાલિત કરો.",
        "events_btn_booking": "નવો ઇવેન્ટ પ્રોજેક્ટ બુક કરો",
        "events_stat_total": "કુલ બુકિંગ",
        "events_stat_confirmed": "કન્ફર્મ પ્રોજેક્ટ્સ",
        "events_stat_draft": "ડ્રાફ્ટ બુકિંગ",
        "events_filter_status": "સ્થિતિ ફિલ્ટર:",
        "events_filter_all": "બધા",
        "events_filter_draft": "ડ્રાફ્ટ",
        "events_filter_confirmed": "કન્ફર્મ",
        "events_filter_completed": "પૂર્ણ થયેલ",
        "events_search_placeholder": "ગ્રાહક / સ્થળ શોધો...",

        // Warehouse Catalog
        "wh_title": "વેરહાઉસ સ્ટોક કેટલોગ",
        "wh_subtitle": "ભૌતિક ઇવેન્ટ સંપત્તિઓ બનાવો, અપડેટ કરો અને સંચાલિત કરો.",
        "wh_btn_register": "નવી સંપત્તિ રજીસ્ટર કરો",
        "wh_stat_unique": "કુલ અનન્ય વસ્તુઓ",
        "wh_stat_stock": "કુલ યુનિટ સ્ટોક",
        "wh_stat_low": "ઓછા સ્ટોકની ચેતવણીઓ",
        "wh_search_placeholder": "કેટલોગ સંપત્તિઓ શોધો...",
        "wh_table_id": "આઈડી",
        "wh_table_name": "નામ",
        "wh_table_category": "શ્રેણી",
        "wh_table_stock": "સ્ટોક લેવલ",
        "wh_table_rate": "દૈનિક દર",

        // Clients CRM
        "cli_title": "ગ્રાહક સીઆરએમ ડેટાબેઝ",
        "cli_subtitle": "ગ્રાહક પ્રોફાઇલ્સ સંચાલિત કરો અને નવા ગ્રાહક એકાઉન્ટ્સ રજીસ્ટર કરો.",
        "cli_btn_intake": "નવા ગ્રાહકની નોંધણી",
        "cli_stat_total": "કુલ ગ્રાહકો",
        "cli_stat_active": "સક્રિય ગ્રાહકો",
        "cli_stat_new": "નવા લીડ્સ (YTD)",
        "cli_search_placeholder": "ગ્રાહકો શોધો...",
        "cli_table_id": "આઈડી",
        "cli_table_name": "નામ",
        "cli_table_email": "ઈમેઈલ",
        "cli_table_phone": "ફોન",
        "cli_table_address": "સરનામું",

        // Portfolio Gallery
        "gal_title": "પોર્ટફોલિયો ગેલેરી",
        "gal_subtitle": "લેન્ડિંગ પેજ પર દર્શાવવામાં આવતા લગ્ન પ્રદર્શનના ફોટા અપલોડ અને સંપાદિત કરો.",
        "gal_btn_upload": "ફોટો અપલોડ કરો",
        "gal_search_placeholder": "પ્રદર્શન એન્ટ્રીઓ શોધો...",
        "gal_table_photo": "ફોટો",
        "gal_table_title": "શીર્ષક",
        "gal_table_category": "શ્રેણી",
        "gal_table_desc": "વર્ણન",

        // Crew Ledger
        "crew_title": "ક્રૂ વેતન અને ખાતાવહી",
        "crew_subtitle": "આંતરિક ક્રૂ પ્રોફાઇલ્સ, બેઝ રેટ, પેમેન્ટ લોગ અને બાકી રકમ ટ્રૅક કરો.",
        "crew_btn_attendance": "દૈનિક હાજરી પત્રક",
        "crew_btn_add": "નવી પ્રોફાઇલ ઉમેરો",
        "crew_stat_strength": "રોસ્ટર સભ્યો",
        "crew_stat_owed": "બાકી વેતન",
        "crew_stat_active": "સક્રિય અસાઇનમેન્ટ્સ",
        "crew_search_placeholder": "ટીમના સભ્યો શોધો...",
        "crew_table_id": "આઈડી",
        "crew_table_name": "નામ",
        "crew_table_role": "ભૂમિકા",
        "crew_table_contact": "સંપર્ક",
        "crew_table_rate": "બેઝ રેટ (₹)",
        "crew_table_days": "કામ કરેલા દિવસો",
        "crew_table_owed": "બાકી વેતન (₹)",

        // Finance Hub
        "fin_title": "નાણાકીય હબ (Finance)",
        "fin_subtitle": "વેચાણ ફિલ્ટર કરો, લેણી રકમની ગણતરી કરો અને વ્યવહારો જુઓ.",
        "fin_stat_sales": "કુલ વેચાણ",
        "fin_stat_receivables": "બાકી લેણી રકમ",
        "fin_stat_wages": "કુલ ક્રૂ વેતન",
        "fin_stat_profit": "ચોખ્ખો નફો",
        "fin_filter_payment": "ચુકવણી સ્થિતિ ફિલ્ટર કરો:",
        "fin_filter_all": "બધા",
        "fin_filter_fully": "પૂર્ણ ચૂકવેલ",
        "fin_filter_partially": "અંશતઃ ચૂકવેલ",
        "fin_filter_unpaid": "નહીં ચૂકવેલ",
        "fin_search_placeholder": "ગ્રાહક / સ્થળ શોધો...",
        "fin_table_client": "ગ્રાહક / સ્થળ",
        "fin_table_date": "ઇવેન્ટ તારીખ",
        "fin_table_total": "ઇન્વૉઇસ કુલ",
        "fin_table_paid": "ચૂકવેલ રકમ",
        "fin_table_balance": "બાકી રકમ",
        "fin_table_status": "ચુકવણી સ્થિતિ",
        "fin_table_action": "ક્રિયા",

        // Invoices Hub
        "inv_title": "ઇન્વૉઇસ હબ",
        "inv_subtitle": "બિલિંગ મેનેજ કરો, ઇવેન્ટ પેમેન્ટ કલેક્શન ટ્રૅક કરો અને પીડીએફ ઇન્વૉઇસ નિકાસ કરો.",
        "inv_btn_manual": "મેન્યુઅલ ઇન્વૉઇસ બનાવો",
        "inv_stat_total": "કુલ ઇન્વૉઇસ કરેલ",
        "inv_stat_collected": "કુલ એકત્રિત કરેલ",
        "inv_stat_remaining": "કુલ બાકી",
        "inv_filter_status": "સ્થિતિ ફિલ્ટર:",
        "inv_filter_all": "બધા",
        "inv_filter_paid": "ચૂકવેલ",
        "inv_filter_remaining": "બાકી",
        "inv_filter_unpaid": "નહીં ચૂકવેલ",
        "inv_search_placeholder": "ગ્રાહક / સ્થળ શોધો...",
        "inv_table_client": "ગ્રાહક / સ્થાન",
        "inv_table_date": "ઇન્વૉઇસ તારીખ",
        "inv_table_status": "સ્થિતિ",
        "inv_table_total": "ઇન્વૉઇસ કુલ",
        "inv_table_paid": "ચૂકવેલ",
        "inv_table_balance": "બાકી રકમ",
        
        // Invoices print/PDF words
        "pdf_invoice_title": "ઇન્વૉઇસ પહોંચ",
        "pdf_invoice_from": "તરફથી:",
        "pdf_invoice_to": "પ્રતિ:",
        "pdf_event_details": "ઇવેન્ટ વિગતો",
        "pdf_venue": "સ્થળ:",
        "pdf_start_date": "સેટઅપ શરૂઆત:",
        "pdf_end_date": "ડેડલાઇન પૂર્ણ:",
        "pdf_decor_item": "ડેકોર આઇટમ",
        "pdf_category": "શ્રેણી",
        "pdf_qty": "જથ્થો",
        "pdf_rate": "દૈનિક દર",
        "pdf_subtotal": "પેટા સરવાળો:",
        "pdf_discount": "ડિસ્કાઉન્ટ:",
        "pdf_tax": "ટેક્સ:",
        "pdf_total": "કુલ રકમ:",
        "pdf_amount_paid": "ચૂકવેલ રકમ:",
        "pdf_balance_due": "બાકી ચૂકવણી:",
        "pdf_terms_title": "નિયમો અને શરતો",
        "pdf_terms_text": "૧. બધી બુકિંગ આઇટમો ભૂમિ ડેકોરેશનની ભાડાની સંપત્તિ છે.\n૨. ચૂકવણી નિર્ધારિત સમય મર્યાદામાં થવી જોઈએ.\n૩. સેટઅપ અથવા ઇવેન્ટ દરમિયાન ભૌતિક સંપત્તિને નુકસાન થવાના કિસ્સામાં બદલી ખર્ચ લાગુ થશે.",
        "pdf_invoice_no": "ઇન્વૉઇસ નં:",
        "pdf_date_label": "તારીખ:",
        "pdf_auth_sign": "અધિકૃત હસ્તાક્ષરકર્તા",
        "pdf_client_sign": "ગ્રાહક સહી",
        "pdf_agreement_accept": "કરારની સ્વીકૃતિ",
        "pdf_thank_you": "તમારી ઉજવણી માટે ભૂમિ ડેકોરેશન પસંદ કરવા બદલ આભાર!",
        "pdf_no_items": "કોઈ આરક્ષિત કેટલોગ વસ્તુઓ મળી નથી.",
        "pdf_custom_category": "કસ્ટમ",
        "payout_modal_title": "ઇવેન્ટ ઇન્વૉઇસ વિગતો",
        "payout_client_profile": "ગ્રાહક પ્રોફાઇલ:",
        "payout_venue": "લક્ષ્ય સ્થળ:",
        "payout_dates": "તારીખ શ્રેણી:",
        "payout_days": "દિવસો ભાડું",
        "payout_reserved_title": "આરક્ષિત સ્ટોક વિગત:",
        "payout_wage_title": "સેટઅપ ક્રૂ વેતન અને પેરોલ:",
        "payout_wage_label": "વેતન:",
        "payout_released": "ચૂકવેલ",
        "payout_no_workers": "કોઈ કામદારો સોંપવામાં આવ્યા નથી.",
        "payout_subtotal": "પેટા સરવાળો:",
        "payout_discount": "ડિસ્કાઉન્ટ:",
        "payout_tax": "ટેક્સ",
        "payout_total": "કુલ ઇન્વૉઇસ રકમ:",
        "payout_paid": "ચૂકવેલ થાપણો:",
        "payout_balance": "બાકી લેણી રકમ:",
        "payout_record_label": "રોકડ ડિપોઝિટ / ચુકવણી પહોંચ નોંધો (₹)",
        "payout_btn_record": "ચુકવણી નોંધો",
        "payout_btn_export": "કરાર અને પહોંચ નિકાસ કરો",
        "payout_btn_close": "બંધ કરો",
        "receipt_contract_title": "ઇવેન્ટ ડેકોરેશન લોજિસ્ટિક્સ કરાર",
        "receipt_admin": "વ્યવસાય સંચાલક",
        "receipt_client": "ગ્રાહક અસીલ:",
        "receipt_address": "સેટઅપ સરનામું:",
        "receipt_dates": "બુક કરેલી તારીખો:",
        "receipt_ref_code": "ઇન્વૉઇસ સંદર્ભ કોડ:",
        "receipt_item": "ડેકોર આઇટમ",
        "receipt_qty": "જથ્થો",
        "receipt_rate": "દૈનિક દર",
        "receipt_subtotal": "પેટા સરવાળો રકમ:",
        "receipt_discount": "ડિસ્કાઉન્ટ રકમ:",
        "receipt_tax": "લાગુ ટેક્સ",
        "receipt_invoice_total": "કુલ ઇન્વૉઇસ રકમ:",
        "receipt_total_paid": "કુલ ચૂકવેલ (પહોંચ):",
        "receipt_remaining": "બાકી રહેતી રકમ:",
        
        // System Settings & Exports
        "settings_title": "સિસ્ટમ સેટિંગ્સ",
        "settings_subtitle": "બુકિંગ ડિફોલ્ટ્સ, વ્યવસાય પ્રોફાઇલ વિગતો અને દેખાવ થીમ્સ ગોઠવો.",
        "settings_sec_defaults": "બુકિંગ ડિફોલ્ટ્સ",
        "settings_tax_rate": "ડિફોલ્ટ ટેક્સ રેટ (%)",
        "settings_discount": "ડિફોલ્ટ ડિસ્કાઉન્ટ (₹)",
        "settings_sec_profile": "કંપની વ્યવસાય પ્રોફાઇલ",
        "settings_company_name": "કંપનીનું નામ",
        "settings_company_address": "વ્યવસાય સરનામું",
        "settings_company_email": "વ્યવસાય ઇમેઇલ",
        "settings_company_phone": "સંપર્ક ફોન",
        "settings_company_website": "કંપનીની વેબસાઇટ",
        "settings_sec_appearance": "દેખાવ રંગ યોજના",
        "settings_theme_label": "થીમ પેલેટ",
        "settings_theme_crimson": "ક્રિમસન રેડ (ડિફોલ્ટ બ્રાન્ડ)",
        "settings_theme_emerald": "એમરાલ્ડ ગ્રીન",
        "settings_theme_midnight": "મિડનાઇટ બ્લુ",
        "settings_btn_save": "સેટિંગ્સ સાચવો",
        "nav_settings": "સિસ્ટમ સેટિંગ્સ",
        "export_pdf": "PDF નિકાસ",
        "details_btn": "વિગતો"
    }
};

let currentLanguage = localStorage.getItem("admin_lang") || "en";

function t(key) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || key;
}

function translatePage() {
    // Scan all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key) {
            el.innerText = t(key);
        }
    });

    // Scan placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key) {
            el.setAttribute("placeholder", t(key));
        }
    });
}

function translateDOMNode(node) {
    node.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key) {
            el.innerText = t(key);
        }
    });
    return node;
}

// Initialize Session
async function initializeSession() {
    const token = localStorage.getItem("eventflow_token");
    const role = localStorage.getItem("eventflow_role");
    const name = localStorage.getItem("eventflow_user_name");
    
    if (!token || role !== "admin") {
        logout();
        return;
    }
    
    currentUser = { token, role, name };
    
    // Bind Profile Display Details
    document.getElementById("user-display-name").innerText = name;
    translatePage();
    
    // Set view structure without triggering loadDashboardData from switchView immediately
    const subviews = document.querySelectorAll(".app-subview");
    subviews.forEach(view => view.style.display = "none");
    document.getElementById("dashboard-subview").style.display = "block";
    
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    const activeLink = document.querySelector(`.nav-item[data-target="dashboard-view"]`);
    if (activeLink) activeLink.classList.add("active");
    
    // Show the page immediately; data loads in background
    loadDashboardData();
    hideLoadingSkeleton();
}

// Navigation Controller (Tabs switcher)
function switchView(targetViewId) {
    const subviews = document.querySelectorAll(".app-subview");
    subviews.forEach(view => view.style.display = "none");
    
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    
    if (targetViewId === "dashboard-view") {
        document.getElementById("dashboard-subview").style.display = "block";
        loadDashboardData();
    } else if (targetViewId === "events-view") {
        document.getElementById("events-subview").style.display = "block";
        loadEventsData();
    } else if (targetViewId === "warehouse-view") {
        document.getElementById("warehouse-subview").style.display = "block";
        loadWarehouseData();
    } else if (targetViewId === "clients-view") {
        document.getElementById("clients-subview").style.display = "block";
        loadClientsData();
    } else if (targetViewId === "gallery-view") {
        document.getElementById("gallery-subview").style.display = "block";
        loadGalleryData();
    } else if (targetViewId === "crew-view") {
        document.getElementById("crew-subview").style.display = "block";
        loadCrewData();
    } else if (targetViewId === "finance-view") {
        document.getElementById("finance-subview").style.display = "block";
        loadFinanceData();
    } else if (targetViewId === "invoice-view") {
        document.getElementById("invoice-subview").style.display = "block";
        loadInvoicesData();
    } else if (targetViewId === "settings-view") {
        document.getElementById("settings-subview").style.display = "block";
        loadSettingsData();
    }
    
    // Highlight nav link
    const activeLink = document.querySelector(`.nav-item[data-target="${targetViewId}"]`);
    if (activeLink) activeLink.classList.add("active");
}

function hideLoadingSkeleton() {
    const skeleton = document.getElementById("loading-skeleton");
    if (skeleton) {
        skeleton.classList.add("hidden");
    }
}

// ─── Pagination Helper ─────────────────────────────────────────────────────
function renderPaginationControls(containerId, totalItems, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) { container.innerHTML = ""; return; }
    let html = `<div class="pagination-container">`;
    html += `<button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} onclick="${onPageChange}(${currentPage - 1})">← Prev</button>`;
    for (let p = 1; p <= totalPages; p++) {
        html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="${onPageChange}(${p})">${p}</button>`;
    }
    html += `<button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="${onPageChange}(${currentPage + 1})">Next →</button>`;
    html += `</div>`;
    container.innerHTML = html;
}

// ─── 1. Warehouse Catalog Management ───────────────────────────────────────
async function loadWarehouseData(page) {
    if (page !== undefined) warehousePage = page;
    try {
        const query = `?page=${warehousePage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(warehouseSearchQuery)}`;
        const res = await apiFetch(`/api/inventory${query}`);
        
        inventoryList = res.items || [];
        const total = res.total || 0;
        const stats = res.stats || { totalUniqueItems: 0, totalStockUnits: 0, lowStockCount: 0 };

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        setVal("warehouse-stat-items", stats.totalUniqueItems);
        setVal("warehouse-stat-stock", stats.totalStockUnits);
        setVal("warehouse-stat-low", stats.lowStockCount);

        const tbody = document.getElementById("inventory-table-body");
        tbody.innerHTML = "";

        if (inventoryList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No catalog assets found.</td></tr>`;
            renderPaginationControls("warehouse-pagination", 0, warehousePage, "loadWarehouseData");
            return;
        }

        inventoryList.forEach(item => {
            const avail = item.available_stock !== undefined ? item.available_stock : item.quantity_owned;
            const cond = item.condition_status || "Excellent";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${item.id}</code></td>
                <td><strong>${item.name}</strong><br><small style="color: var(--text-muted); font-size: 0.75rem;">Condition: ${cond}</small></td>
                <td><span class="badge" style="background: rgba(107,22,35,0.05); color: var(--maroon);">${item.category}</span></td>
                <td>${avail} / ${item.quantity_owned} units</td>
                <td>₹${item.rental_price_per_day.toFixed(2)}/day</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editInventoryItem('${item.id}')">${t('edit')}</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteInventoryItem('${item.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("warehouse-pagination", total, warehousePage, "loadWarehouseData");
    } catch (err) {}
}

async function handleInventorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("inventory-id").value;
    const name = document.getElementById("inventory-name").value;
    const category = document.getElementById("inventory-category").value;
    const quantity_owned = parseInt(document.getElementById("inventory-qty").value);
    const available_stock = parseInt(document.getElementById("inventory-avail").value);
    const rental_price_per_day = parseFloat(document.getElementById("inventory-rate").value);
    const condition_status = document.getElementById("inventory-condition").value;
    
    const payload = { name, category, quantity_owned, rental_price_per_day, available_stock, condition_status };
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/inventory/${id}` : "/api/inventory";
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        showToast(id ? "Inventory asset updated." : "Catalog asset registered.");
        closeModal("modal-inventory");
        loadWarehouseData();
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function editInventoryItem(itemId) {
    const item = inventoryList.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById("inventory-modal-title").innerText = "Update Warehouse Asset";
    document.getElementById("inventory-id").value = item.id;
    document.getElementById("inventory-name").value = item.name;
    document.getElementById("inventory-category").value = item.category;
    document.getElementById("inventory-qty").value = item.quantity_owned;
    document.getElementById("inventory-avail").value = item.available_stock !== undefined ? item.available_stock : item.quantity_owned;
    document.getElementById("inventory-rate").value = item.rental_price_per_day;
    document.getElementById("inventory-condition").value = item.condition_status || "Excellent";
    
    openModal("modal-inventory");
}

async function deleteInventoryItem(itemId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to delete this warehouse catalog asset?",
        async () => {
            try {
                await apiFetch(`/api/inventory/${itemId}`, { method: "DELETE" });
                showToast("Asset deleted from catalog.");
                loadWarehouseData();
            } catch (err) {}
        }
    );
}

// 2. Client Intake Controller
let editingClientId = null;
async function handleClientSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("client-name").value;
    const email = document.getElementById("client-email").value;
    const phone = document.getElementById("client-phone").value;
    const address = document.getElementById("client-address").value;
    
    const method = editingClientId ? "PUT" : "POST";
    const endpoint = editingClientId ? `/api/clients/${editingClientId}` : "/api/clients";
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        const client = await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, address })
        });
        
        showToast(editingClientId ? "Client profile updated." : "Customer account generated.");
        closeModal("modal-client");
        editingClientId = null;
        
        // Re-load clients selectors
        await populateClientsDropdown();
        
        if (document.getElementById("clients-subview").style.display !== "none") {
            loadClientsData();
        } else {
            const select = document.getElementById("booking-client");
            if (select && client) {
                select.value = client.id;
            }
        }
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function populateClientsDropdown() {
    try {
        clientsList = await apiFetch("/api/clients");
        const select = document.getElementById("booking-client");
        if (select) {
            select.innerHTML = '<option value="">-- Choose Client --</option>';
            clientsList.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.innerText = `${c.name} (${c.email})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {}
}

// ─── 3. Operations Dashboard & Event Scheduler ─────────────────────────────
async function loadDashboardData(page) {
    if (page !== undefined) dashboardPage = page;

    const tbody    = document.getElementById("bookings-table-body");
    const alertsBox = document.getElementById("booking-alerts-box");

    // ── If we already have cached data, render it instantly ──────────────────
    if (eventsList.length > 0) {
        renderDashboardTable(tbody, alertsBox);
        // Then silently refresh in the background
        fetchDashboardData().then(() => renderDashboardTable(tbody, alertsBox));
        return;
    }

    // ── First load: show a minimal status row, then fetch ────────────────────
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.2rem;color:var(--text-muted);font-size:0.85rem;">Fetching events...</td></tr>`;
    await fetchDashboardData();
    renderDashboardTable(tbody, alertsBox);
}

// Fetches all dashboard data in parallel with an 8-second timeout
async function fetchDashboardData() {
    // Helper: wrap a fetch promise with a timeout
    function withTimeout(promise, ms) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        );
        return Promise.race([promise, timeout]);
    }

    try {
        const res = await withTimeout(apiFetch("/api/dashboard/overview"), 8000);
        if (res) {
            if (res.events) eventsList = res.events;
            const stats = res.stats || {};
            
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val !== undefined ? val : "0";
            };
            setVal("stat-active-bookings", stats.active_bookings);
            setVal("stat-pending-tasks", stats.pending_tasks);
            setVal("stat-crew-on-duty", stats.crew_on_duty);
            setVal("stat-low-stock", stats.low_stock_alerts);
        }
    } catch (err) {
        console.error("Dashboard fetch error:", err);
    }
}

// Pure render function — reads from eventsList global, no async
function renderDashboardTable(tbody, alertsBox) {
    if (!tbody) return;
    tbody.innerHTML = "";
    if (alertsBox) alertsBox.innerHTML = "";

    if (eventsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--maroon);">⚠️ Could not load events — is the backend server running?</td></tr>`;
        return;
    }

    // ── Upcoming events: all non-Completed, sorted nearest first ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Exclude Completed; fall back to all if every event is Completed
    let filtered = eventsList.filter(e => e.status !== "Completed");
    if (filtered.length === 0) filtered = [...eventsList];

    // Sort ascending by start_date (nearest first)
    filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    // Apply search
    if (dashboardSearchQuery.trim()) {
        const q = dashboardSearchQuery.toLowerCase();
        filtered = filtered.filter(e =>
            (e.client_name && e.client_name.toLowerCase().includes(q)) ||
            (e.venue_address && e.venue_address.toLowerCase().includes(q))
        );
    }

    // Update count badge
    const countEl = document.getElementById("timeline-capacity-status");
    if (countEl) countEl.innerText = `${filtered.length} Upcoming Event${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">🎉 No upcoming events scheduled. <a href="#" onclick="document.getElementById('btn-create-booking').click(); return false;" style="color: var(--maroon);">Create one?</a></td></tr>`;
        renderPaginationControls("dashboard-pagination", 0, dashboardPage, "loadDashboardData");
        return;
    }

    const start = (dashboardPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    pageItems.forEach(evt => {
        const tr = document.createElement("tr");
        const badgeClass = evt.status === "Completed" ? "badge-completed" :
                           evt.status === "Confirmed" ? "badge-confirmed" : "badge-draft";

        // Countdown chip
        const startDate = new Date(evt.start_date);
        startDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.round((startDate - today) / (1000 * 60 * 60 * 24));

        let chipLabel, chipColor, chipBg;
        if (daysUntil === 0) {
            chipLabel = "Today!"; chipColor = "#6B1623"; chipBg = "rgba(201,148,31,0.18)";
            tr.style.borderLeft = "3px solid var(--gold)";
        } else if (daysUntil === 1) {
            chipLabel = "Tomorrow"; chipColor = "#C9941F"; chipBg = "rgba(201,148,31,0.08)";
        } else if (daysUntil > 1 && daysUntil <= 7) {
            chipLabel = `In ${daysUntil} days`; chipColor = "var(--maroon)"; chipBg = "rgba(107,22,35,0.07)";
        } else if (daysUntil < 0) {
            chipLabel = `${Math.abs(daysUntil)}d ago`; chipColor = "var(--text-muted)"; chipBg = "rgba(0,0,0,0.04)";
        } else {
            chipLabel = `${daysUntil}d away`; chipColor = "var(--text-muted)"; chipBg = "rgba(0,0,0,0.04)";
        }
        const countdownChip = `<span style="display:inline-block;margin-top:0.3rem;font-size:0.7rem;font-weight:600;padding:2px 7px;border-radius:20px;color:${chipColor};background:${chipBg};letter-spacing:0.03em;">${chipLabel}</span>`;

        const totalInv = typeof evt.total_invoice_amount === "number" ? `₹${evt.total_invoice_amount.toFixed(2)}` : "—";
        const amtPaid  = typeof evt.amount_paid === "number" ? `₹${evt.amount_paid.toFixed(2)}` : "—";
        const balance  = typeof evt.remaining_balance === "number" ? evt.remaining_balance : null;
        const balHtml  = balance !== null
            ? `<strong class="${balance > 0 ? 'text-danger' : 'text-success'}" style="font-size:0.9rem;">₹${balance.toFixed(2)}</strong>`
            : `<span>—</span>`;

        tr.innerHTML = `
            <td>
                <strong>${evt.client_name}</strong><br>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${evt.venue_address}</span>
            </td>
            <td>
                <span style="font-size: 0.85rem;">${evt.start_date}</span> to <br>
                <span style="font-size: 0.85rem;">${evt.end_date}</span><br>
                ${countdownChip}
            </td>
            <td><span class="badge ${badgeClass}">${evt.status}</span></td>
            <td>${totalInv}</td>
            <td>${amtPaid}</td>
            <td>${balHtml}</td>
            <td>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <button style="padding: 0.35rem 0.65rem; font-size: 0.75rem; border-radius: 6px; background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: #2A1F1A; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''" onclick="openEventDetailsViewModal('${evt.id}')">📋 ${t('details_btn')}</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Invoice/Receipt</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openLayoutUploadModal('${evt.id}')">Upload Layout</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderPaginationControls("dashboard-pagination", filtered.length, dashboardPage, "loadDashboardData");
}

async function renderBookingInventoryItems() {
    // Lazy-load inventory only when needed
    if (inventoryList.length === 0) {
        inventoryList = await apiFetch("/api/inventory");
    }
    // Lazy-load clients dropdown only when the booking modal opens
    await populateClientsDropdown();

    const container = document.getElementById("booking-items-selector");
    container.innerHTML = "";
    
    inventoryList.forEach(item => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex: 1;">
                <input type="checkbox" class="booking-item-checkbox" value="${item.id}" onchange="toggleBookingItemInput('${item.id}')" style="width: auto;">
                <span>${item.name} (₹${item.rental_price_per_day.toFixed(2)}/day)</span>
            </label>
            <input type="number" id="qty-for-${item.id}" min="1" max="${item.quantity_owned}" value="1" disabled style="max-width: 70px; padding: 0.25rem 0.5rem; height: 30px;">
        `;
        container.appendChild(div);
    });
}

function toggleBookingItemInput(itemId) {
    const checkbox = document.querySelector(`.booking-item-checkbox[value="${itemId}"]`);
    const qtyInput = document.getElementById(`qty-for-${itemId}`);
    if (qtyInput) {
        qtyInput.disabled = !checkbox.checked;
        if (checkbox.checked && !qtyInput.value) qtyInput.value = 1;
    }
}

window.toggleBookingItemInput = toggleBookingItemInput;

// Crew Assignments Wages List Constructor
async function openCrewWagesAllocationModal() {
    const listDiv = document.getElementById("crew-list-inputs");
    listDiv.innerHTML = "Loading team members...";
    
    try {
        const crewCandidates = await apiFetch("/api/crew");
        listDiv.innerHTML = "";
        
        if (crewCandidates.length === 0) {
            listDiv.innerHTML = "<p style='font-size:0.85rem;color:var(--text-muted);'>No crew profiles registered in Crew Ledger. Add profiles first.</p>";
            openModal("modal-crew-allocation");
            return;
        }
        
        crewCandidates.forEach(worker => {
            const assigned = activeCrewAssignments.find(a => a.worker_id === worker.id);
            const checkedStr = assigned ? "checked" : "";
            const rateVal = assigned ? assigned.pay_rate : worker.base_rate;
            const paidStr = assigned && assigned.paid ? "checked" : "";
            
            const div = document.createElement("div");
            div.className = "glass-panel crew-allocation-row";
            
            div.innerHTML = `
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" class="crew-assign-checkbox" value="${worker.id}" ${checkedStr} onchange="toggleCrewWageInput('${worker.id}')" style="width: auto;">
                    <div>
                        <strong>${worker.name}</strong><br>
                        <small style="color: var(--text-muted);">${worker.role}</small>
                    </div>
                </label>
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.75rem;">Daily Pay Rate (₹)</label>
                    <input type="number" id="wage-for-${worker.id}" min="0" step="5" value="${rateVal}" ${assigned ? "" : "disabled"} style="padding: 0.25rem 0.5rem; height: 32px;">
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end;">
                    <label for="paid-for-${worker.id}" style="font-size: 0.75rem;">Paid?</label>
                    <input type="checkbox" class="crew-paid-checkbox" id="paid-for-${worker.id}" value="${worker.id}" ${paidStr} ${assigned ? "" : "disabled"} style="width: auto; height: auto;">
                </div>
            `;
            listDiv.appendChild(div);
        });
        
        openModal("modal-crew-allocation");
    } catch (err) {
        listDiv.innerHTML = "Error loading team members.";
    }
}

function toggleCrewWageInput(workerId) {
    const checkbox = document.querySelector(`.crew-assign-checkbox[value="${workerId}"]`);
    const wageInput = document.getElementById(`wage-for-${workerId}`);
    const paidCheckbox = document.getElementById(`paid-for-${workerId}`);
    if (wageInput && paidCheckbox) {
        wageInput.disabled = !checkbox.checked;
        paidCheckbox.disabled = !checkbox.checked;
    }
}

window.toggleCrewWageInput = toggleCrewWageInput;

function applyCrewAllocation() {
    activeCrewAssignments = [];
    const checkboxes = document.querySelectorAll(".crew-assign-checkbox:checked");
    
    checkboxes.forEach(cb => {
        const workerId = cb.value;
        const label = cb.closest("label");
        const name = label.querySelector("strong").innerText;
        const pay_rate = parseFloat(document.getElementById(`wage-for-${workerId}`).value) || 150.00;
        const paid = document.getElementById(`paid-for-${workerId}`).checked;
        
        activeCrewAssignments.push({
            worker_id: workerId,
            name: name,
            pay_rate: pay_rate,
            paid: paid
        });
    });
    
    showToast("Crew allocation updated.");
    closeModal("modal-crew-allocation");
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("booking-id").value;
    const client_id = document.getElementById("booking-client").value;
    
    if (!client_id) {
        showToast("Please choose or intake a client profile", "warning");
        return;
    }
    
    const client = clientsList.find(c => c.id === client_id);
    const client_name = client ? client.name : "Unknown Client";
    
    const venue_address = document.getElementById("booking-venue").value;
    const start_date = document.getElementById("booking-start").value;
    const end_date = document.getElementById("booking-end").value;
    const max_workforce_capacity = parseInt(document.getElementById("booking-capacity").value) || 4;
    const notes = document.getElementById("booking-notes").value;
    const discount = parseFloat(document.getElementById("booking-discount").value) || 0.0;
    const tax_rate = parseFloat(document.getElementById("booking-tax-rate").value) || 0.0;
    
    // Build items_booked map
    const items_booked = {};
    const checkedItems = document.querySelectorAll(".booking-item-checkbox:checked");
    checkedItems.forEach(cb => {
        const itemId = cb.value;
        items_booked[itemId] = parseInt(document.getElementById(`qty-for-${itemId}`).value) || 1;
    });
    
    // Format payload
    const payload = {
        client_id,
        client_name,
        venue_address,
        start_date,
        end_date,
        items_booked: JSON.stringify(items_booked),
        crew_assignments: JSON.stringify(activeCrewAssignments),
        max_workforce_capacity,
        notes,
        status: id ? eventsList.find(e => e.id === id).status : "Confirmed",
        discount,
        tax_rate
    };
    
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/events/${id}` : "/api/events";
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        const result = await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        showToast(id ? "Booking details updated." : "Booking scheduled successfully.");
        closeModal("modal-booking");
        await loadDashboardData();
        
        // Show conflict alerts if any returned from server
        if (result.conflict_alerts && result.conflict_alerts.length > 0) {
            let msg = "Inventory Conflict Alerts Detected: \n";
            result.conflict_alerts.forEach(al => {
                msg += `- Shortage of ${al.shortage} units for ${al.name} on ${al.date_checked}\n`;
            });
            alert(msg);
        }
        
        if (result.capacity_alert) {
            alert(result.capacity_alert.message);
        }
        
        // Add sample tasks for new bookings if they are configured
        if (!id) {
            await addSampleTasks(result.event.id);
        }
        
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function addSampleTasks(eventId) {
    const tasks = [
        `Setup Uplights coordinates exactly as per blueprint boundaries`,
        `Reinforce structural arches and hang drapes backdrops`,
        `Arrange banquet chair configurations and clean stage layout`
    ];
    
    try {
        for (const desc of tasks) {
            await apiFetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: eventId,
                    description: desc,
                    status: "Pending",
                    assigned_to: ""
                })
            });
        }
        showToast("Initial checklist tasks created.");
    } catch (err) {}
}

async function editEventBooking(eventId) {
    const evt = eventsList.find(e => e.id === eventId);
    if (!evt) return;
    
    document.getElementById("booking-modal-title").innerText = "Edit Event Booking Details";
    document.getElementById("booking-id").value = evt.id;
    document.getElementById("booking-venue").value = evt.venue_address;
    document.getElementById("booking-start").value = evt.start_date;
    document.getElementById("booking-end").value = evt.end_date;
    document.getElementById("booking-capacity").value = evt.max_workforce_capacity;
    document.getElementById("booking-notes").value = evt.notes;
    document.getElementById("booking-discount").value = evt.discount || 0;
    document.getElementById("booking-tax-rate").value = evt.tax_rate || 0;
    
    // Select Client
    document.getElementById("booking-client").value = evt.client_id;
    
    // Parse crew assignments
    try {
        activeCrewAssignments = JSON.parse(evt.crew_assignments || "[]");
    } catch (e) {
        activeCrewAssignments = [];
    }
    
    // Parse and render inventory selection checkboxes
    await renderBookingInventoryItems();
    
    let bookedMap = {};
    try {
        bookedMap = JSON.parse(evt.items_booked || "{}");
    } catch (e) {}
    
    Object.keys(bookedMap).forEach(itemId => {
        const cb = document.querySelector(`.booking-item-checkbox[value="${itemId}"]`);
        if (cb) {
            cb.checked = true;
            toggleBookingItemInput(itemId);
            const qtyInput = document.getElementById(`qty-for-${itemId}`);
            if (qtyInput) qtyInput.value = bookedMap[itemId];
        }
    });
    
    openModal("modal-booking");
}

async function deleteEventBooking(eventId) {
    showConfirmation(
        "Cancel Booking",
        "Are you sure you want to cancel and delete this event booking?",
        async () => {
            try {
                await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
                showToast("Event booking cancelled.");
                loadDashboardData();
            } catch (err) {}
        }
    );
}

// 4. On-Walk Consultation Quote Checklist Builder
async function openQuoteToolModal() {
    inventoryList = await apiFetch("/api/inventory");
    const container = document.getElementById("quote-items-calculator");
    container.innerHTML = "";
    
    inventoryList.forEach(item => {
        const div = document.createElement("div");
        div.className = "quote-item-grid";
        
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small style="color: var(--text-muted); font-size: 0.75rem;">₹${item.rental_price_per_day.toFixed(2)}/day</small>
            </div>
            <div>
                <input type="number" class="quote-qty-input" data-price="${item.rental_price_per_day}" min="0" value="0" style="padding: 0.25rem 0.5rem; height: 30px;" onchange="recalculateQuoteEstimate()">
            </div>
            <div style="text-align: right;" class="quote-item-subtotal">₹0.00</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById("quote-days").value = 1;
    document.getElementById("quote-total-price").innerText = "₹0.00";
    openModal("modal-quote");
}

function recalculateQuoteEstimate() {
    const days = parseInt(document.getElementById("quote-days").value) || 1;
    const inputs = document.querySelectorAll(".quote-qty-input");
    let grandTotal = 0.0;
    
    inputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        const rate = parseFloat(input.getAttribute("data-price"));
        const subtotal = qty * rate * days;
        
        const subtotalDiv = input.closest("div").nextElementSibling;
        if (subtotalDiv) subtotalDiv.innerText = `₹${subtotal.toFixed(2)}`;
        grandTotal += subtotal;
    });
    
    document.getElementById("quote-total-price").innerText = `₹${grandTotal.toFixed(2)}`;
}

window.recalculateQuoteEstimate = recalculateQuoteEstimate;

// 5. Invoicing & Print Export Utilities
async function openInvoiceModal(eventId) {
    const evt = await apiFetch(`/api/events/${eventId}`);
    const detailsDiv = document.getElementById("invoice-details-box");
    
    // Parse items booked
    let bookedItems = {};
    try {
        bookedItems = JSON.parse(evt.items_booked || "{}");
    } catch (e) {}
    
    // Resolve item names and rates
    let itemsHtml = "";
    inventoryList = await apiFetch("/api/inventory");
    
    // Calculate rental span
    const sDate = new Date(evt.start_date);
    const eDate = new Date(evt.end_date);
    const days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
    
    let itemsListTextForPrint = "";
    let subtotal = 0.0;
    Object.keys(bookedItems).forEach(itemId => {
        const item = inventoryList.find(i => i.id === itemId);
        if (item) {
            const qty = bookedItems[itemId];
            const cost = item.rental_price_per_day * qty * days;
            subtotal += cost;
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-glass); padding: 0.25rem 0;">
                    <span>${item.name} (${t('pdf_qty')}: ${qty})</span>
                    <span>₹${cost.toFixed(2)}</span>
                </div>
            `;
            itemsListTextForPrint += `<tr><td style="border: 1px solid #e5e7eb; padding: 8px;">${item.name}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">${qty}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${item.rental_price_per_day.toFixed(2)}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${cost.toFixed(2)}</td></tr>`;
        }
    });

    // Parse worker wages layout
    let crew = [];
    try {
        crew = JSON.parse(evt.crew_assignments || "[]");
    } catch (e) {}
    
    let crewHtml = "";
    crew.forEach((worker, index) => {
        const checked = worker.paid ? "checked" : "";
        crewHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span>${worker.name} (${t('payout_wage_label')} ₹${worker.pay_rate.toFixed(2)})</span>
                <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="crew-payroll-release" data-event-id="${evt.id}" data-index="${index}" ${checked} onchange="toggleCrewPayrollPaid('${evt.id}', ${index})" style="width: auto;">
                    ${t('payout_released')}
                </label>
            </div>
        `;
    });

    const discount = evt.discount || 0.0;
    const taxRate = evt.tax_rate || 0.0;
    const afterDiscount = Math.max(0.0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100.0);

    detailsDiv.innerHTML = `
        <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 0.75rem;">
            <strong>${t('payout_client_profile')}</strong> ${evt.client_name}<br>
            <strong>${t('payout_venue')}</strong> ${evt.venue_address}<br>
            <strong>${t('payout_dates')}</strong> ${evt.start_date} - ${evt.end_date} (${days} ${t('payout_days')})
        </div>
        
        <div>
            <h4 style="margin-bottom: 0.5rem;">${t('payout_reserved_title')}</h4>
            ${itemsHtml}
        </div>
        
        <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between;">
                <span>${t('payout_subtotal')}</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--status-danger);">
                <span>${t('payout_discount')}</span>
                <span>- ₹${discount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>${t('payout_tax')} (${taxRate}%):</span>
                <span>₹${taxAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-glass); padding-top: 0.25rem;">
                <span>${t('payout_total')}</span>
                <strong>₹${evt.total_invoice_amount.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--status-success);">
                <span>${t('payout_paid')}</span>
                <span>₹${evt.amount_paid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-glass); padding-top: 0.25rem;">
                <span>${t('payout_balance')}</span>
                <strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}" style="font-size: 1.1rem;">₹${evt.remaining_balance.toFixed(2)}</strong>
            </div>
        </div>

        <div style="border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">${t('payout_wage_title')}</h4>
            ${crewHtml || `<p style="color: var(--text-muted); font-size: 0.8rem;">${t('payout_no_workers')}</p>`}
        </div>
    `;

    // Cache the print preview block content
    const printReceiptCompHeader = document.getElementById("print-receipt-comp-header");
    if (printReceiptCompHeader) {
        const compName = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
        const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";
        printReceiptCompHeader.innerText = `${compName}, ${compAddress.split(',')[0]}`;
    }

    document.getElementById("print-content-body").innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <p><strong>${t('receipt_client')}</strong> ${evt.client_name}</p>
            <p><strong>${t('receipt_address')}</strong> ${evt.venue_address}</p>
            <p><strong>${t('receipt_dates')}</strong> ${evt.start_date} - ${evt.end_date} (${days} ${t('payout_days')})</p>
            <p><strong>${t('receipt_ref_code')}</strong> ${evt.id}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">${t('receipt_item')}</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">${t('receipt_qty')}</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">${t('receipt_rate')}</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">${t('pdf_subtotal').replace(':', '')}</th>
                </tr>
            </thead>
            <tbody>
                ${itemsListTextForPrint || `<tr><td colspan="4" style="text-align: center; padding: 8px; color: #888;">${t('pdf_no_items')}</td></tr>`}
            </tbody>
        </table>
        <div style="text-align: right; font-size: 1.1rem; line-height: 1.6;">
            <p><strong>${t('receipt_subtotal')}</strong> ₹${subtotal.toFixed(2)}</p>
            <p style="color: #b91c1c;"><strong>${t('receipt_discount')}</strong> - ₹${discount.toFixed(2)}</p>
            <p><strong>${t('receipt_tax')} (${taxRate}%):</strong> ₹${taxAmount.toFixed(2)}</p>
            <p style="border-top: 1px solid #000; padding-top: 4px;"><strong>${t('receipt_invoice_total')}</strong> ₹${evt.total_invoice_amount.toFixed(2)}</p>
            <p style="color: #15803d;"><strong>${t('receipt_total_paid')}</strong> ₹${evt.amount_paid.toFixed(2)}</p>
            <p><strong>${t('receipt_remaining')}</strong> ₹${evt.remaining_balance.toFixed(2)}</p>
        </div>
    `;

    // Setup submit payments routing values
    document.getElementById("payment-amount").value = evt.remaining_balance.toFixed(2);
    document.getElementById("payment-form").onsubmit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("payment-amount").value);
        if (!amount || amount <= 0) return;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        
        try {
            await apiFetch(`/api/events/${evt.id}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, payment_method: "Cash" })
            });
            showToast("Deposit transaction logged successfully.");
            closeModal("modal-invoice-payout");
            loadDashboardData();
        } catch (err) {}
        finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    };

    openModal("modal-invoice-payout");
}

window.openInvoiceModal = openInvoiceModal;

async function toggleCrewPayrollPaid(eventId, crewIndex) {
    try {
        await apiFetch(`/api/events/${eventId}/crew/${crewIndex}/toggle-paid`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        
        showToast("Crew wage ledger updated.");
        closeModal("modal-invoice-payout");
        openInvoiceModal(eventId);
        loadDashboardData();
    } catch (err) {}
}

window.toggleCrewPayrollPaid = toggleCrewPayrollPaid;

// Layout blueprint image uploader
function openLayoutUploadModal(eventId) {
    document.getElementById("upload-layout-event-id").value = eventId;
    document.getElementById("upload-layout-file").value = "";
    openModal("modal-upload-layout");
}

window.openLayoutUploadModal = openLayoutUploadModal;

async function handleLayoutUploadSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById("upload-layout-event-id").value;
    const fileInput = document.getElementById("upload-layout-file");
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const submitBtn = document.getElementById("btn-upload-submit");
    submitBtn.disabled = true;
    submitBtn.innerText = "Compressing & Uploading...";
    
    try {
        const compressedFile = await compressImageLocally(file);
        
        const formData = new FormData();
        formData.append("file", compressedFile, file.name);
        
        await apiFetch(`/api/events/${eventId}/upload-layout`, {
            method: "POST",
            body: formData
        });
        
        showToast("Compressed layout blueprint uploaded successfully.");
        closeModal("modal-upload-layout");
        loadDashboardData();
    } catch (err) {
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Upload Layout";
    }
}

function compressImageLocally(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            const maxDimension = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const compressed = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    });
                    resolve(compressed);
                } else {
                    reject(new Error("Canvas compression failed"));
                }
            }, "image/jpeg", 0.7);
        };
        
        img.onerror = () => reject(new Error("Failed to load blueprint file"));
    });
}

// Crew Onboarding Trigger
async function handleOnboardCrewSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("onboard-email").value;
    const password = document.getElementById("onboard-password").value;
    const full_name = document.getElementById("onboard-name").value;
    const role = document.getElementById("onboard-role").value;
    const base_daily_rate = parseFloat(document.getElementById("onboard-rate").value) || 0.0;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        await apiFetch("/api/auth/onboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role, full_name, base_daily_rate })
        });
        showToast("Manager onboarded successfully!");
        closeModal("modal-onboard-crew");
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ─── NEW MODULE CONTROLLERS ─────────────────────────────────────────────────

// Events Projects View
let currentEventsStatusFilter = "All";
async function loadEventsData(page) {
    if (page !== undefined) eventsPage = page;
    try {
        const query = `?page=${eventsPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(eventsSearchQuery)}&status=${currentEventsStatusFilter}`;
        const res = await apiFetch(`/api/events${query}`);
        
        eventsList = res.items || [];
        const total = res.total || 0;
        const stats = res.stats || { totalEvents: 0, confirmedEvents: 0, draftEvents: 0 };

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        setVal("events-stat-total", stats.totalEvents);
        setVal("events-stat-confirmed", stats.confirmedEvents);
        setVal("events-stat-draft", stats.draftEvents);

        const tbody = document.getElementById("events-table-body");
        tbody.innerHTML = "";

        // Status filter button highlight
        ["all", "draft", "confirmed", "completed"].forEach(key => {
            const btn = document.getElementById(`event-status-filter-btn-${key}`);
            if (btn) btn.classList.remove("active-filter");
        });
        const activeBtnKey = currentEventsStatusFilter.toLowerCase();
        const activeBtn = document.getElementById(`event-status-filter-btn-${activeBtnKey}`);
        if (activeBtn) activeBtn.classList.add("active-filter");

        if (eventsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No events found matching the selected filter.</td></tr>`;
            renderPaginationControls("events-pagination", 0, eventsPage, "loadEventsData");
            return;
        }

        eventsList.forEach(evt => {
            const tr = document.createElement("tr");
            const badgeClass = evt.status === "Completed" ? "badge-completed" :
                               evt.status === "Confirmed" ? "badge-confirmed" : "badge-draft";
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">${evt.venue_address}</span>
                </td>
                <td>
                    <span style="font-size: 0.85rem;">${evt.start_date}</span> to <br>
                    <span style="font-size: 0.85rem;">${evt.end_date}</span>
                </td>
                <td><span class="badge ${badgeClass}">${evt.status}</span></td>
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}" style="font-size: 0.9rem;">₹${evt.remaining_balance.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border: 1px solid var(--gold);" onclick="openEventDetailsViewModal('${evt.id}')">${t('details_btn')}</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="exportInvoiceToPDF('${evt.id}')">Export PDF</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Pay</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">${t('edit')}</button>
                        <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("events-pagination", total, eventsPage, "loadEventsData");
    } catch (err) {}
}

// 1. Clients CRM
async function loadClientsData(page) {
    if (page !== undefined) clientsPage = page;
    try {
        const query = `?page=${clientsPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(clientsSearchQuery)}`;
        const res = await apiFetch(`/api/clients${query}`);
        
        clientsList = res.items || [];
        const total = res.total || 0;
        const stats = res.stats || { totalClients: 0, activeClients: 0, newLeads: 0 };

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        setVal("clients-stat-total", stats.totalClients);
        setVal("clients-stat-active", stats.activeClients);
        setVal("clients-stat-new", stats.newLeads);

        const tbody = document.getElementById("clients-table-body");
        tbody.innerHTML = "";

        if (clientsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No client profiles found.</td></tr>`;
            renderPaginationControls("clients-pagination", 0, clientsPage, "loadClientsData");
            return;
        }

        clientsList.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${c.id}</code></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.address || ''}</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editClientItem('${c.id}')">${t('edit')}</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteClientItem('${c.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("clients-pagination", total, clientsPage, "loadClientsData");
    } catch (err) {}
}

function editClientItem(clientId) {
    const client = clientsList.find(c => c.id === clientId);
    if (!client) return;
    editingClientId = client.id;
    
    document.getElementById("client-name").value = client.name;
    document.getElementById("client-email").value = client.email;
    document.getElementById("client-phone").value = client.phone;
    document.getElementById("client-address").value = client.address || "";
    openModal("modal-client");
}

async function deleteClientItem(clientId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to delete this client profile? This will not remove their historical bookings.",
        async () => {
            try {
                await apiFetch(`/api/clients/${clientId}`, { method: "DELETE" });
                showToast("Client profile deleted.");
                loadClientsData();
            } catch (err) {}
        }
    );
}

// 2. Portfolio Gallery
async function loadGalleryData(page) {
    if (page !== undefined) galleryPage = page;
    try {
        const query = `?page=${galleryPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(gallerySearchQuery)}`;
        const res = await apiFetch(`/api/gallery${query}`);
        
        galleryList = res.items || [];
        const total = res.total || 0;
        const tbody = document.getElementById("gallery-table-body");
        tbody.innerHTML = "";

        if (galleryList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No gallery entries found.</td></tr>`;
            renderPaginationControls("gallery-pagination", 0, galleryPage, "loadGalleryData");
            return;
        }

        galleryList.forEach(g => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><img src="${g.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" alt="${g.title}"></td>
                <td><strong>${g.title}</strong></td>
                <td><span class="badge" style="background: rgba(201,148,31,0.05); color: var(--gold);">${g.category}</span></td>
                <td>${g.description || ''}</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editGalleryItem('${g.id}')">${t('edit')}</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteGalleryItem('${g.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("gallery-pagination", total, galleryPage, "loadGalleryData");
    } catch (err) {}
}

async function handleGallerySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("gallery-id").value;
    const title = document.getElementById("gallery-title").value;
    const category = document.getElementById("gallery-category").value;
    const description = document.getElementById("gallery-desc").value;
    
    const saveBtn = document.getElementById("btn-gallery-save") || e.target.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.disabled = true;
    
    if (id) {
        const image_url = document.getElementById("gallery-url").value;
        try {
            await apiFetch(`/api/gallery/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, image_url })
            });
            showToast("Gallery item details updated.");
            closeModal("modal-gallery");
            loadGalleryData();
        } catch (err) {}
        finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    } else {
        const fileInput = document.getElementById("gallery-file");
        const file = fileInput.files[0];
        if (!file) {
            showToast("Please choose an image file to upload", "warning");
            if (saveBtn) saveBtn.disabled = false;
            return;
        }
        
        if (saveBtn) saveBtn.innerText = "Uploading...";
        
        try {
            const compressedFile = await compressImageLocally(file);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("category", category);
            formData.append("description", description);
            formData.append("file", compressedFile, file.name);
            
            await apiFetch("/api/gallery", {
                method: "POST",
                body: formData
            });
            showToast("Portfolio image uploaded successfully.");
            closeModal("modal-gallery");
            loadGalleryData();
        } catch (err) {
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = "Upload & Save";
            }
        }
    }
}

function editGalleryItem(photoId) {
    const photo = galleryList.find(g => g.id === photoId);
    if (!photo) return;
    
    document.getElementById("gallery-modal-title").innerText = "Edit Gallery Item";
    document.getElementById("gallery-id").value = photo.id;
    document.getElementById("gallery-title").value = photo.title;
    document.getElementById("gallery-category").value = photo.category;
    document.getElementById("gallery-desc").value = photo.description || "";
    document.getElementById("gallery-url").value = photo.image_url;
    
    document.getElementById("gallery-file-group").style.display = "none";
    document.getElementById("gallery-url-group").style.display = "block";
    
    openModal("modal-gallery");
}

async function deleteGalleryItem(photoId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to remove this photo from the landing page portfolio?",
        async () => {
            try {
                await apiFetch(`/api/gallery/${photoId}`, { method: "DELETE" });
                showToast("Photo removed from gallery.");
                loadGalleryData();
            } catch (err) {}
        }
    );
}

// 3. Crew Ledger
async function loadCrewData(page) {
    if (page !== undefined) crewPage = page;
    try {
        const query = `?page=${crewPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(crewSearchQuery)}`;
        const res = await apiFetch(`/api/crew${query}`);
        
        crewList = res.items || [];
        const total = res.total || 0;
        const stats = res.stats || { totalCrew: 0, owedWages: 0, activeAssignments: 0 };

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        setVal("crew-stat-total", stats.totalCrew);
        setVal("crew-stat-owed", `₹${stats.owedWages.toFixed(2)}`);
        setVal("crew-stat-active", stats.activeAssignments);

        const tbody = document.getElementById("crew-table-body");
        tbody.innerHTML = "";

        if (crewList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No crew profiles found.</td></tr>`;
            renderPaginationControls("crew-pagination", 0, crewPage, "loadCrewData");
            return;
        }

        crewList.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${c.id}</code></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.role}</td>
                <td>${c.contact || ''}</td>
                <td>₹${c.base_rate.toFixed(2)}</td>
                <td><span class="badge badge-confirmed">${c.days_worked || 0} days</span></td>
                <td><strong class="${c.amount_owed > 0 ? 'text-danger' : 'text-success'}">₹${c.amount_owed.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onclick="openCrewPaymentModal('${c.id}')">Payout</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onclick="openCrewHistoryModal('${c.id}')">History</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onclick="editCrewMember('${c.id}')">${t('edit')}</button>
                        <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteCrewMember('${c.id}')">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("crew-pagination", total, crewPage, "loadCrewData");
    } catch (err) {}
}

async function handleCrewSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("crew-id").value;
    const name = document.getElementById("crew-name").value;
    const role = document.getElementById("crew-role").value;
    const contact = document.getElementById("crew-contact").value;
    const base_rate = parseFloat(document.getElementById("crew-rate").value) || 0.0;
    const half_day_rate = parseFloat(document.getElementById("crew-half-day-rate").value) || 0.0;
    const night_rate = parseFloat(document.getElementById("crew-night-rate").value) || 0.0;
    
    const payload = { name, role, contact, base_rate, half_day_rate, night_rate };
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/crew/${id}` : "/api/crew";
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        showToast(id ? "Crew profile updated." : "Crew member record generated.");
        closeModal("modal-crew");
        loadCrewData();
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function editCrewMember(crewId) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    document.getElementById("crew-modal-title").innerText = "Update Team Profile";
    document.getElementById("crew-id").value = member.id;
    document.getElementById("crew-name").value = member.name;
    document.getElementById("crew-role").value = member.role;
    document.getElementById("crew-contact").value = member.contact || "";
    document.getElementById("crew-rate").value = member.base_rate;
    document.getElementById("crew-half-day-rate").value = member.half_day_rate && member.half_day_rate > 0 ? member.half_day_rate : "";
    document.getElementById("crew-night-rate").value = member.night_rate && member.night_rate > 0 ? member.night_rate : "";
    
    openModal("modal-crew");
}

async function deleteCrewMember(crewId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to remove this crew member profile?",
        async () => {
            try {
                await apiFetch(`/api/crew/${crewId}`, { method: "DELETE" });
                showToast("Crew member removed.");
                loadCrewData();
            } catch (err) {}
        }
    );
}

function openCrewPaymentModal(crewId) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    document.getElementById("crew-payment-id").value = member.id;
    document.getElementById("crew-payment-name").innerText = member.name;
    document.getElementById("crew-payment-owed").innerText = `₹${member.amount_owed.toFixed(2)}`;
    document.getElementById("crew-payment-amount").value = member.amount_owed > 0 ? member.amount_owed.toFixed(2) : "";
    
    openModal("modal-crew-payment");
}

async function handleCrewPaymentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("crew-payment-id").value;
    const amount = parseFloat(document.getElementById("crew-payment-amount").value);
    if (!amount || amount <= 0) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        await apiFetch(`/api/crew/${id}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });
        showToast("Payout to crew member logged.");
        closeModal("modal-crew-payment");
        
        // Refresh crewList to include the new payment history
        crewList = await apiFetch("/api/crew");
        
        // Ask if they want to download the receipt
        showConfirmation("Payout Logged", "Would you like to download the PDF payout receipt?", () => {
            exportCrewPayoutPDF(id, 0); // 0 is index of newest payment
        });
        
        loadCrewData();
    } catch (err) {}
    finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function openCrewHistoryModal(crewId) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    document.getElementById("crew-history-name").innerText = member.name;
    const tbody = document.getElementById("crew-history-table-body");
    tbody.innerHTML = "";
    
    let history = [];
    try {
        history = JSON.parse(member.payment_history || "[]");
    } catch (e) {}
    
    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No past payouts logged.</td></tr>`;
        openModal("modal-crew-history");
        return;
    }
    
    // Sort descending by date (newest first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    history.forEach((pay, index) => {
        const tr = document.createElement("tr");
        const dateStr = new Date(pay.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        tr.innerHTML = `
            <td>${dateStr}</td>
            <td style="font-weight: 600;">₹${pay.amount.toFixed(2)}</td>
            <td style="text-align: right;">
                <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="exportCrewPayoutPDF('${member.id}', ${index})">PDF</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    openModal("modal-crew-history");
}

function exportCrewPayoutPDF(crewId, paymentIndex) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    let history = [];
    try {
        history = JSON.parse(member.payment_history || "[]");
    } catch (e) {}
    
    // Sort descending by date to match list indexes
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const pay = history[paymentIndex];
    if (!pay) return;
    
    const template = document.getElementById("crew-payout-pdf-template");
    if (!template) {
        showToast("Payout template not found", "error");
        return;
    }
    
    const printArea = template.cloneNode(true);
    printArea.style.display = "block";
    
    const compName = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
    const compEmail = localStorage.getItem("settings_company_email") || "hello@bhoomidecoration.com";
    const compPhone = localStorage.getItem("settings_company_phone") || "+91 99999 99999";
    const compWebsite = localStorage.getItem("settings_company_website") || "www.bhoomidecoration.com";
    const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";

    const nameEl = printArea.querySelector("#pdf-crew-comp-name");
    if (nameEl) nameEl.innerText = compName.toUpperCase();
    
    const detailsEl = printArea.querySelector("#pdf-crew-comp-details");
    if (detailsEl) {
        detailsEl.innerHTML = `${compAddress}<br>Email: ${compEmail} | Web: ${compWebsite}`;
    }
    
    const dateStr = new Date(pay.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    printArea.querySelector("#pdf-payout-date").innerText = dateStr;
    printArea.querySelector("#pdf-crew-name").innerText = member.name;
    printArea.querySelector("#pdf-crew-role").innerText = member.role;
    printArea.querySelector("#pdf-crew-contact").innerText = member.contact || "N/A";
    printArea.querySelector("#pdf-payout-amount").innerText = `₹${pay.amount.toFixed(2)}`;
    printArea.querySelector("#pdf-payout-remaining").innerText = `₹${member.amount_owed.toFixed(2)}`;
    
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Bhoomi_Payout_${member.name.replace(/\s+/g, '_')}_${pay.date.split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    showToast("Generating Payout PDF Receipt...");
    html2pdf().from(printArea).set(opt).save().then(() => {
        showToast("Payout receipt exported successfully.");
    }).catch(err => {
        console.error("PDF generation failed:", err);
        showToast("Failed to generate payout PDF.", "error");
    });
}

// ─── 4. Finance Hub ──────────────────────────────────────────────────────────
let currentFinanceFilter = "All";
async function loadFinanceData(filterType = "All", page) {
    if (typeof filterType === "number") {
        page = filterType;
        filterType = currentFinanceFilter;
    }
    currentFinanceFilter = filterType;
    if (page !== undefined) financePage = page;

    // Update active class on filter buttons
    const filters = ["all", "fully", "partially", "unpaid"];
    filters.forEach(f => {
        const btn = document.getElementById(`filter-btn-${f}`);
        if (btn) btn.classList.remove("active-filter");
    });

    let filterBtnId = "all";
    if (filterType === "Fully Paid") filterBtnId = "fully";
    else if (filterType === "Partially Paid") filterBtnId = "partially";
    else if (filterType === "Unpaid") filterBtnId = "unpaid";

    const activeBtn = document.getElementById(`filter-btn-${filterBtnId}`);
    if (activeBtn) activeBtn.classList.add("active-filter");

    try {
        const query = `?page=${financePage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(financeSearchQuery)}&payment_status=${encodeURIComponent(filterType)}`;
        const [stats, res] = await Promise.all([
            apiFetch("/api/analytics/summary"),
            apiFetch(`/api/events${query}`)
        ]);
        
        eventsList = res.items || [];
        const total = res.total || 0;

        if (stats) {
            const fmt = (v) => (typeof v === "number" ? `₹${v.toFixed(2)}` : "₹0.00");
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };
            setVal("finance-stat-sales", fmt(stats.total_sales));
            setVal("finance-stat-receivable", fmt(stats.total_receivable));
            setVal("finance-stat-wages", fmt(stats.total_wages));
            
            const profitEl = document.getElementById("finance-stat-profit");
            if (profitEl) {
                const profitVal = fmt(stats.net_profit);
                const marginVal = stats.net_margin_percentage !== undefined ? stats.net_margin_percentage : "0";
                profitEl.innerHTML = `${profitVal} (<span id="finance-stat-margin">${marginVal}</span>%)`;
            }
        }

        const tbody = document.getElementById("finance-table-body");
        tbody.innerHTML = "";

        if (eventsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No transactions found.</td></tr>`;
            renderPaginationControls("finance-pagination", 0, financePage, "loadFinanceData");
            return;
        }

        eventsList.forEach(evt => {
            const tr = document.createElement("tr");
            const pStatus = evt.payment_status || "Unpaid";
            const badgeClass = pStatus === "Fully Paid" ? "badge-completed" :
                               pStatus === "Partially Paid" ? "badge-confirmed" : "badge-draft";
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${evt.venue_address}</span>
                </td>
                <td>${evt.start_date}</td>
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}">₹${evt.remaining_balance.toFixed(2)}</strong></td>
                <td><span class="badge ${badgeClass}">${pStatus}</span></td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Payout</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("finance-pagination", total, financePage, "loadFinanceData");
    } catch (err) {}
}

// ─── 5. Invoices Hub ────────────────────────────────────────────────────────
let currentInvoiceFilter = "All";

async function loadInvoicesData(filterType = "All", page) {
    if (typeof filterType === "number") {
        page = filterType;
        filterType = currentInvoiceFilter;
    }
    currentInvoiceFilter = filterType;
    if (page !== undefined) invoicePage = page;
    
    const filterBtnIds = {
        "All": "invoice-filter-btn-all",
        "Paid": "invoice-filter-btn-paid",
        "Remaining": "invoice-filter-btn-remaining",
        "Unpaid": "invoice-filter-btn-unpaid"
    };
    
    Object.keys(filterBtnIds).forEach(fKey => {
        const btn = document.getElementById(filterBtnIds[fKey]);
        if (btn) {
            if (fKey === filterType) {
                btn.classList.add("active-filter");
            } else {
                btn.classList.remove("active-filter");
            }
        }
    });

    try {
        let backendPaymentStatus = "All";
        if (filterType === "Paid") backendPaymentStatus = "Fully Paid";
        else if (filterType === "Remaining") backendPaymentStatus = "Partially Paid";
        else if (filterType === "Unpaid") backendPaymentStatus = "Unpaid";

        const query = `?page=${invoicePage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(invoiceSearchQuery)}&payment_status=${encodeURIComponent(backendPaymentStatus)}`;
        const res = await apiFetch(`/api/events${query}`);
        
        eventsList = res.items || [];
        const total = res.total || 0;
        const stats = res.stats || { totalInvoiced: 0, totalCollected: 0, totalRemaining: 0 };
        
        document.getElementById("invoice-stat-total").innerText = `₹${stats.totalInvoiced.toFixed(2)}`;
        document.getElementById("invoice-stat-collected").innerText = `₹${stats.totalCollected.toFixed(2)}`;
        document.getElementById("invoice-stat-remaining").innerText = `₹${stats.totalRemaining.toFixed(2)}`;
        
        const tbody = document.getElementById("invoices-table-body");
        tbody.innerHTML = "";
        
        if (eventsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No invoices found.</td></tr>`;
            renderPaginationControls("invoice-pagination", 0, invoicePage, "loadInvoicesData");
            return;
        }
        
        eventsList.forEach(evt => {
            const balance = evt.remaining_balance || 0.0;
            const paid = evt.amount_paid || 0.0;
            
            let statusText = "Unpaid";
            let badgeClass = "badge-draft";
            if (balance <= 0) {
                statusText = "Paid";
                badgeClass = "badge-completed";
            } else if (paid > 0) {
                statusText = "Remaining";
                badgeClass = "badge-confirmed";
            }
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${evt.venue_address}</span>
                </td>
                <td>${evt.start_date}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${balance > 0 ? 'text-danger' : 'text-success'}">₹${balance.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="exportInvoiceToPDF('${evt.id}')">Export PDF</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Payout</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("invoice-pagination", total, invoicePage, "loadInvoicesData");
    } catch (err) {
        console.error("Failed to load invoices data:", err);
    }
}

async function exportInvoiceToPDF(eventId) {
    try {
        const evt = await apiFetch(`/api/events/${eventId}`);
        if (!evt) {
            showToast("Failed to fetch event invoice details", "error");
            return;
        }
        
        if (clientsList.length === 0) {
            clientsList = await apiFetch("/api/clients");
        }
        const client = clientsList.find(c => c.id === evt.client_id) || {};
        
        const template = document.getElementById("invoice-pdf-template");
        if (!template) {
            showToast("Invoice template not found", "error");
            return;
        }
        
        const printArea = template.cloneNode(true);
        printArea.style.display = "block";
        translateDOMNode(printArea);

        // Explicitly overwrite any data-i18n label spans that may not render correctly in cloned nodes
        const invoiceNoLabelEl = printArea.querySelector("[data-i18n='pdf_invoice_no']");
        if (invoiceNoLabelEl) invoiceNoLabelEl.innerText = t('pdf_invoice_no');
        const dateLabelEl = printArea.querySelector("[data-i18n='pdf_date_label']");
        if (dateLabelEl) dateLabelEl.innerText = t('pdf_date_label');
        const titleEl = printArea.querySelector("[data-i18n='pdf_invoice_title']");
        if (titleEl) titleEl.innerText = t('pdf_invoice_title');

        const compName = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
        const compEmail = localStorage.getItem("settings_company_email") || "hello@bhoomidecoration.com";
        const compPhone = localStorage.getItem("settings_company_phone") || "+91 99999 99999";
        const compWebsite = localStorage.getItem("settings_company_website") || "www.bhoomidecoration.com";
        const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";

        const nameEl = printArea.querySelector("#pdf-invoice-comp-name");
        if (nameEl) nameEl.innerText = compName.toUpperCase();
        
        const detailsEl = printArea.querySelector("#pdf-invoice-comp-details");
        if (detailsEl) {
            detailsEl.innerHTML = `${compAddress}<br>Email: ${compEmail} | Web: ${compWebsite}`;
        }
        
        printArea.querySelector("#pdf-invoice-id").innerText = `#${evt.id}`;
        printArea.querySelector("#pdf-invoice-date").innerText = new Date().toLocaleDateString(currentLanguage === 'gu' ? 'gu-IN' : 'en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        printArea.querySelector("#pdf-client-name").innerText = client.name || evt.client_name || "N/A";
        printArea.querySelector("#pdf-client-email").innerText = client.email || "N/A";
        printArea.querySelector("#pdf-client-phone").innerText = client.phone || "N/A";
        printArea.querySelector("#pdf-client-address").innerText = client.address || evt.venue_address || "N/A";
        
        printArea.querySelector("#pdf-event-venue").innerText = evt.venue_address || "N/A";
        printArea.querySelector("#pdf-event-start").innerText = evt.start_date || "N/A";
        printArea.querySelector("#pdf-event-end").innerText = evt.end_date || "N/A";
        
        const sDate = new Date(evt.start_date);
        const eDate = new Date(evt.end_date);
        const days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
        
        let bookedItems = {};
        try {
            bookedItems = JSON.parse(evt.items_booked || "{}");
        } catch (e) {}
        
        if (inventoryList.length === 0) {
            inventoryList = await apiFetch("/api/inventory");
        }
        
        const itemsBody = printArea.querySelector("#pdf-items-body");
        itemsBody.innerHTML = "";
        
        let subtotal = 0.0;
        let itemIndex = 0;
        
        Object.keys(bookedItems).forEach(itemId => {
            const item = inventoryList.find(i => i.id === itemId);
            if (item) {
                const qty = bookedItems[itemId];
                const cost = item.rental_price_per_day * qty * days;
                subtotal += cost;
                
                const tr = document.createElement("tr");
                tr.style.backgroundColor = itemIndex % 2 === 0 ? "#ffffff" : "#fdfaf7";
                tr.innerHTML = `
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.category}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600;">${qty}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; color: #666;">₹${item.rental_price_per_day.toFixed(2)}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #6b1623;">₹${cost.toFixed(2)}</td>
                `;
                itemsBody.appendChild(tr);
                itemIndex++;
            }
        });
        
        if (itemIndex === 0) {
            itemsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">${t('pdf_no_items')}</td></tr>`;
        }
        
        const discount = evt.discount || 0.0;
        const taxRate = evt.tax_rate || 0.0;
        const afterDiscount = Math.max(0.0, subtotal - discount);
        const taxAmount = afterDiscount * (taxRate / 100.0);
        
        printArea.querySelector("#pdf-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
        printArea.querySelector("#pdf-discount").innerText = `-₹${discount.toFixed(2)}`;
        printArea.querySelector("#pdf-tax").innerText = `${taxRate.toFixed(1)}%`;
        printArea.querySelector("#pdf-total").innerText = `₹${evt.total_invoice_amount.toFixed(2)}`;
        printArea.querySelector("#pdf-paid").innerText = `₹${evt.amount_paid.toFixed(2)}`;
        printArea.querySelector("#pdf-balance").innerText = `₹${evt.remaining_balance.toFixed(2)}`;
        
        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `Bhoomi_Invoice_${evt.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        showToast("Generating PDF Invoice...");
        html2pdf().from(printArea).set(opt).save().then(() => {
            showToast("Invoice exported successfully.");
        }).catch(err => {
            console.error("PDF generation failed:", err);
            showToast("Failed to generate PDF.", "error");
        });
        
    } catch (err) {
        console.error("Error exporting PDF:", err);
        showToast("Error generating PDF invoice.", "error");
    }
}

// ─── Manual Invoice Builder ──────────────────────────────────────────────────
let manualInvoiceItems = [];

function recalculateManualInvoiceTotal() {
    const discount = parseFloat(document.getElementById("manual-invoice-discount").value) || 0;
    const taxRate = parseFloat(document.getElementById("manual-invoice-tax-rate").value) || 0;
    const subtotal = manualInvoiceItems.reduce((sum, i) => sum + (i.qty * i.rate), 0);
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const el = document.getElementById("manual-invoice-grand-total");
    if (el) el.innerText = `₹${total.toFixed(2)}`;
    return { subtotal, discount, taxRate, taxAmount, total };
}

function renderManualInvoiceItemsList() {
    const container = document.getElementById("manual-invoice-items-list");
    if (!container) return;
    if (manualInvoiceItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">No items added yet. Click "Add" below.</div>`;
        return;
    }
    container.innerHTML = "";
    manualInvoiceItems.forEach((item, idx) => {
        const subtotal = item.qty * item.rate;
        const div = document.createElement("div");
        div.style.cssText = "display: grid; grid-template-columns: 2fr 0.7fr 1fr 1fr auto; gap: 0.4rem; align-items: center; padding: 0.35rem 0; border-bottom: 1px dashed rgba(107,22,35,0.1);";
        div.innerHTML = `
            <span style="font-size:0.85rem;">${item.desc}</span>
            <span style="font-size:0.8rem; text-align:center;">${item.qty}</span>
            <span style="font-size:0.8rem;">₹${item.rate.toFixed(2)}</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--maroon);">₹${subtotal.toFixed(2)}</span>
            <button type="button" onclick="removeManualItem(${idx})" style="background:none;border:none;cursor:pointer;color:var(--maroon);font-size:1rem;padding:0 4px;" title="Remove">✕</button>
        `;
        container.appendChild(div);
    });
}

window.removeManualItem = function(idx) {
    manualInvoiceItems.splice(idx, 1);
    renderManualInvoiceItemsList();
    recalculateManualInvoiceTotal();
};

function openManualInvoiceModal() {
    manualInvoiceItems = [];
    document.getElementById("manual-invoice-form").reset();
    document.getElementById("manual-invoice-id").value = "";
    document.getElementById("manual-invoice-discount").value = localStorage.getItem("settings_default_discount") || 0;
    document.getElementById("manual-invoice-tax-rate").value = localStorage.getItem("settings_default_tax_rate") || 18;
    renderManualInvoiceItemsList();
    recalculateManualInvoiceTotal();

    // Populate client dropdown
    const sel = document.getElementById("manual-invoice-client-select");
    if (sel) {
        sel.innerHTML = `<option value="">-- None / Manual Entry --</option>`;
        clientsList.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.innerText = `${c.name} (${c.email})`;
            sel.appendChild(opt);
        });
        sel.onchange = () => {
            const chosen = clientsList.find(c => c.id === sel.value);
            if (chosen) {
                document.getElementById("manual-invoice-client-name").value = chosen.name;
                document.getElementById("manual-invoice-client-email").value = chosen.email;
                document.getElementById("manual-invoice-client-phone").value = chosen.phone || "";
                document.getElementById("manual-invoice-client-address").value = chosen.address || "";
            }
        };
    }
    openModal("modal-manual-invoice");
}

async function handleManualInvoiceSubmit(e) {
    e.preventDefault();
    if (manualInvoiceItems.length === 0) {
        showToast("Please add at least one line item to the invoice.", "warning");
        return;
    }

    const client_name = document.getElementById("manual-invoice-client-name").value.trim();
    const client_email = document.getElementById("manual-invoice-client-email").value.trim();
    const client_phone = document.getElementById("manual-invoice-client-phone").value.trim();
    const client_address = document.getElementById("manual-invoice-client-address").value.trim();
    const venue_address = document.getElementById("manual-invoice-venue").value.trim();
    const start_date = document.getElementById("manual-invoice-start").value;
    const end_date = document.getElementById("manual-invoice-end").value;
    const discount = parseFloat(document.getElementById("manual-invoice-discount").value) || 0;
    const tax_rate = parseFloat(document.getElementById("manual-invoice-tax-rate").value) || 0;
    const amount_paid = parseFloat(document.getElementById("manual-invoice-paid").value) || 0;
    const status = document.getElementById("manual-invoice-status").value;
    const memoNotes = document.getElementById("manual-invoice-notes").value.trim();

    const saveBtn = document.getElementById("btn-save-manual-invoice") || e.target.querySelector('button[type="submit"]');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
    }

    try {
        // Step 1: Ensure client exists or create new one
        let client_id = document.getElementById("manual-invoice-client-select").value;
        if (!client_id) {
            // Create a new client record
            const newClient = await apiFetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: client_name, email: client_email, phone: client_phone, address: client_address })
            });
            client_id = newClient.id;
            await populateClientsDropdown();
        }

        // Step 2: Build notes payload with line items JSON
        const notesPayload = JSON.stringify({
            type: "manual_invoice",
            memo: memoNotes,
            line_items: manualInvoiceItems
        });

        // Step 3: Create the event booking record
        const payload = {
            client_id,
            client_name,
            venue_address,
            start_date,
            end_date,
            items_booked: JSON.stringify({}),
            crew_assignments: JSON.stringify([]),
            max_workforce_capacity: 1,
            notes: notesPayload,
            status,
            discount,
            tax_rate
        };

        const result = await apiFetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Step 4: Record initial payment if provided
        if (amount_paid > 0 && result.event) {
            await apiFetch(`/api/events/${result.event.id}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amount_paid, payment_method: "Cash" })
            });
        }

        showToast("Manual invoice saved successfully!");
        closeModal("modal-manual-invoice");
        loadInvoicesData(currentInvoiceFilter);

        // Step 5: Trigger PDF export for the new invoice
        if (result.event) {
            await exportManualInvoiceToPDF(result.event.id, {
                client_name, client_email, client_phone, client_address,
                venue_address, start_date, end_date,
                line_items: manualInvoiceItems,
                discount, tax_rate, amount_paid
            });
        }
    } catch (err) {
        console.error("Manual invoice save error:", err);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "Save & Export PDF";
        }
    }
}

async function exportManualInvoiceToPDF(eventId, data) {
    const template = document.getElementById("invoice-pdf-template");
    if (!template) return;

    const printArea = template.cloneNode(true);
    printArea.style.display = "block";
    translateDOMNode(printArea);
    
    const compName = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
    const compEmail = localStorage.getItem("settings_company_email") || "hello@bhoomidecoration.com";
    const compPhone = localStorage.getItem("settings_company_phone") || "+91 99999 99999";
    const compWebsite = localStorage.getItem("settings_company_website") || "www.bhoomidecoration.com";
    const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";

    const nameEl = printArea.querySelector("#pdf-invoice-comp-name");
    if (nameEl) nameEl.innerText = compName.toUpperCase();
    
    const detailsEl = printArea.querySelector("#pdf-invoice-comp-details");
    if (detailsEl) {
        detailsEl.innerHTML = `${compAddress}<br>Email: ${compEmail} | Web: ${compWebsite}`;
    }

    printArea.querySelector("#pdf-invoice-id").innerText = `#${eventId}`;
    printArea.querySelector("#pdf-invoice-date").innerText = new Date().toLocaleDateString(currentLanguage === 'gu' ? 'gu-IN' : 'en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    printArea.querySelector("#pdf-client-name").innerText = data.client_name || "N/A";
    printArea.querySelector("#pdf-client-email").innerText = data.client_email || "N/A";
    printArea.querySelector("#pdf-client-phone").innerText = data.client_phone || "N/A";
    printArea.querySelector("#pdf-client-address").innerText = data.client_address || "N/A";
    printArea.querySelector("#pdf-event-venue").innerText = data.venue_address || "N/A";
    printArea.querySelector("#pdf-event-start").innerText = data.start_date || "N/A";
    printArea.querySelector("#pdf-event-end").innerText = data.end_date || "N/A";

    const itemsBody = printArea.querySelector("#pdf-items-body");
    itemsBody.innerHTML = "";

    let subtotal = 0;
    (data.line_items || []).forEach((item, idx) => {
        const cost = item.qty * item.rate;
        subtotal += cost;
        const tr = document.createElement("tr");
        tr.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fdfaf7";
        tr.innerHTML = `
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>${item.desc}</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${t('pdf_custom_category')}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600;">${item.qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; color: #666;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #6b1623;">₹${cost.toFixed(2)}</td>
        `;
        itemsBody.appendChild(tr);
    });

    const discount = data.discount || 0;
    const taxRate = data.tax_rate || 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const balance = Math.max(0, total - (data.amount_paid || 0));

    printArea.querySelector("#pdf-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
    printArea.querySelector("#pdf-discount").innerText = `-₹${discount.toFixed(2)}`;
    printArea.querySelector("#pdf-tax").innerText = `${taxRate.toFixed(1)}%`;
    printArea.querySelector("#pdf-total").innerText = `₹${total.toFixed(2)}`;
    printArea.querySelector("#pdf-paid").innerText = `₹${(data.amount_paid || 0).toFixed(2)}`;
    printArea.querySelector("#pdf-balance").innerText = `₹${balance.toFixed(2)}`;

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Bhoomi_ManualInvoice_${eventId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast("Generating PDF Invoice...");
    html2pdf().from(printArea).set(opt).save().then(() => {
        showToast("PDF invoice exported successfully.");
    }).catch(err => {
        console.error("PDF generation failed:", err);
        showToast("Failed to generate PDF.", "error");
    });
}

// ─── Bind Event Listeners ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();

    // 1. Navigation Button Actions
    document.getElementById("nav-btn-dashboard").addEventListener("click", () => switchView("dashboard-view"));
    document.getElementById("nav-btn-events").addEventListener("click", () => switchView("events-view"));
    document.getElementById("nav-btn-warehouse").addEventListener("click", () => switchView("warehouse-view"));
    document.getElementById("nav-btn-clients").addEventListener("click", () => switchView("clients-view"));
    document.getElementById("nav-btn-gallery").addEventListener("click", () => switchView("gallery-view"));
    document.getElementById("nav-btn-crew").addEventListener("click", () => switchView("crew-view"));
    document.getElementById("nav-btn-finance").addEventListener("click", () => switchView("finance-view"));
    document.getElementById("nav-btn-invoice").addEventListener("click", () => switchView("invoice-view"));
    document.getElementById("nav-btn-settings").addEventListener("click", () => switchView("settings-view"));

    // 2. Form submission bindings
    document.getElementById("inventory-form").addEventListener("submit", handleInventorySubmit);
    document.getElementById("client-form").addEventListener("submit", handleClientSubmit);
    document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);
    document.getElementById("upload-layout-form").addEventListener("submit", handleLayoutUploadSubmit);
    document.getElementById("onboard-crew-form").addEventListener("submit", handleOnboardCrewSubmit);
    document.getElementById("gallery-form").addEventListener("submit", handleGallerySubmit);
    document.getElementById("crew-form").addEventListener("submit", handleCrewSubmit);
    document.getElementById("crew-payment-form").addEventListener("submit", handleCrewPaymentSubmit);
    document.getElementById("manual-invoice-form").addEventListener("submit", handleManualInvoiceSubmit);
    document.getElementById("settings-form").addEventListener("submit", handleSettingsSubmit);

    // PDF Section Exports
    document.getElementById("btn-export-warehouse").addEventListener("click", exportWarehousePDF);
    document.getElementById("btn-export-events").addEventListener("click", exportEventsPDF);
    document.getElementById("btn-export-clients").addEventListener("click", exportClientsPDF);
    document.getElementById("btn-export-crew").addEventListener("click", exportCrewPDF);
    document.getElementById("btn-export-finance").addEventListener("click", exportFinancePDF);
    document.getElementById("btn-export-invoices").addEventListener("click", exportInvoicesPDF);

    // 4. Attendance system listeners
    const btnManageAttendance = document.getElementById("btn-manage-attendance");
    if (btnManageAttendance) {
        btnManageAttendance.addEventListener("click", openAttendanceModal);
    }
    const attendanceDateInput = document.getElementById("attendance-date");
    if (attendanceDateInput) {
        attendanceDateInput.addEventListener("change", (e) => {
            loadAttendanceRegister(e.target.value);
        });
    }
    const attendanceForm = document.getElementById("attendance-form");
    if (attendanceForm) {
        attendanceForm.addEventListener("submit", handleAttendanceSubmit);
    }

    // 3. Modals open triggers
    document.getElementById("btn-add-inventory").addEventListener("click", () => {
        document.getElementById("inventory-modal-title").innerText = "Register Catalog Asset";
        document.getElementById("inventory-id").value = "";
        document.getElementById("inventory-form").reset();
        document.getElementById("inventory-condition").value = "Excellent";
        openModal("modal-inventory");
    });

    document.getElementById("btn-create-booking").addEventListener("click", async () => {
        document.getElementById("booking-modal-title").innerText = "Book New Event Project";
        document.getElementById("booking-id").value = "";
        document.getElementById("booking-form").reset();
        document.getElementById("booking-discount").value = localStorage.getItem("settings_default_discount") || 0;
        document.getElementById("booking-tax-rate").value = localStorage.getItem("settings_default_tax_rate") || 18;
        activeCrewAssignments = [];
        await renderBookingInventoryItems();
        openModal("modal-booking");
    });

    // Events view - create booking button
    const btnEventsCreate = document.getElementById("btn-events-create-booking");
    if (btnEventsCreate) {
        btnEventsCreate.addEventListener("click", async () => {
            document.getElementById("booking-modal-title").innerText = "Book New Event Project";
            document.getElementById("booking-id").value = "";
            document.getElementById("booking-form").reset();
            document.getElementById("booking-discount").value = localStorage.getItem("settings_default_discount") || 0;
            document.getElementById("booking-tax-rate").value = localStorage.getItem("settings_default_tax_rate") || 18;
            activeCrewAssignments = [];
            await renderBookingInventoryItems();
            openModal("modal-booking");
        });
    }

    document.getElementById("btn-quick-client").addEventListener("click", () => {
        editingClientId = null;
        document.getElementById("client-form").reset();
        openModal("modal-client");
    });

    document.getElementById("btn-add-client-tab").addEventListener("click", () => {
        editingClientId = null;
        document.getElementById("client-form").reset();
        openModal("modal-client");
    });

    document.getElementById("btn-add-gallery-item").addEventListener("click", () => {
        document.getElementById("gallery-modal-title").innerText = "Upload Portfolio Photo";
        document.getElementById("gallery-id").value = "";
        document.getElementById("gallery-form").reset();
        document.getElementById("gallery-file-group").style.display = "block";
        document.getElementById("gallery-url-group").style.display = "none";
        openModal("modal-gallery");
    });

    document.getElementById("btn-add-crew-member").addEventListener("click", () => {
        document.getElementById("crew-modal-title").innerText = "Create Team Profile";
        document.getElementById("crew-id").value = "";
        document.getElementById("crew-form").reset();
        openModal("modal-crew");
    });

    document.getElementById("btn-quick-quote").addEventListener("click", openQuoteToolModal);
    document.getElementById("btn-assign-crew").addEventListener("click", openCrewWagesAllocationModal);
    document.getElementById("btn-apply-crew-allocation").addEventListener("click", applyCrewAllocation);

    document.getElementById("btn-onboard-crew-trigger").addEventListener("click", () => {
        document.getElementById("onboard-crew-form").reset();
        openModal("modal-onboard-crew");
    });

    document.getElementById("btn-export-print").addEventListener("click", () => window.print());
    document.getElementById("logout-btn").addEventListener("click", logout);

    // Quote Consultation
    document.getElementById("quote-days").addEventListener("change", recalculateQuoteEstimate);

    // Finance Hub filters
    document.getElementById("filter-btn-all").addEventListener("click", () => { financePage = 1; loadFinanceData("All"); });
    document.getElementById("filter-btn-fully").addEventListener("click", () => { financePage = 1; loadFinanceData("Fully Paid"); });
    document.getElementById("filter-btn-partially").addEventListener("click", () => { financePage = 1; loadFinanceData("Partially Paid"); });
    document.getElementById("filter-btn-unpaid").addEventListener("click", () => { financePage = 1; loadFinanceData("Unpaid"); });

    // Finance Hub search
    const financeSearchInput = document.getElementById("finance-search-input");
    if (financeSearchInput) {
        financeSearchInput.addEventListener("input", (e) => {
            financeSearchQuery = e.target.value;
            financePage = 1;
            loadFinanceData(currentFinanceFilter);
        });
    }

    // Invoices Hub search & filters
    const invoiceSearchInput = document.getElementById("invoice-search-input");
    if (invoiceSearchInput) {
        invoiceSearchInput.addEventListener("input", (e) => {
            invoiceSearchQuery = e.target.value;
            invoicePage = 1;
            loadInvoicesData(currentInvoiceFilter);
        });
    }
    document.getElementById("invoice-filter-btn-all").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("All"); });
    document.getElementById("invoice-filter-btn-paid").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Paid"); });
    document.getElementById("invoice-filter-btn-remaining").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Remaining"); });
    document.getElementById("invoice-filter-btn-unpaid").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Unpaid"); });

    // Manual Invoice modal trigger
    const btnManualInvoice = document.getElementById("btn-create-manual-invoice");
    if (btnManualInvoice) {
        btnManualInvoice.addEventListener("click", openManualInvoiceModal);
    }

    // Manual Invoice - add item button
    const btnAddItem = document.getElementById("btn-add-custom-item");
    if (btnAddItem) {
        btnAddItem.addEventListener("click", () => {
            const desc = document.getElementById("new-item-desc").value.trim();
            const qty = parseInt(document.getElementById("new-item-qty").value) || 1;
            const rate = parseFloat(document.getElementById("new-item-rate").value) || 0;
            if (!desc) { showToast("Please enter an item description.", "warning"); return; }
            manualInvoiceItems.push({ desc, qty, rate });
            document.getElementById("new-item-desc").value = "";
            document.getElementById("new-item-qty").value = 1;
            document.getElementById("new-item-rate").value = 0;
            renderManualInvoiceItemsList();
            recalculateManualInvoiceTotal();
        });
    }

    // Manual invoice live total recalculation
    ["manual-invoice-discount", "manual-invoice-tax-rate"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", recalculateManualInvoiceTotal);
    });

    // Dashboard search
    const dashboardSearchInput = document.getElementById("dashboard-search-input");
    if (dashboardSearchInput) {
        dashboardSearchInput.addEventListener("input", (e) => {
            dashboardSearchQuery = e.target.value;
            dashboardPage = 1;
            loadDashboardData();
        });
    }

    // Warehouse search
    const warehouseSearchInput = document.getElementById("warehouse-search-input");
    if (warehouseSearchInput) {
        warehouseSearchInput.addEventListener("input", (e) => {
            warehouseSearchQuery = e.target.value;
            warehousePage = 1;
            loadWarehouseData();
        });
    }

    // Clients search
    const clientsSearchInput = document.getElementById("clients-search-input");
    if (clientsSearchInput) {
        clientsSearchInput.addEventListener("input", (e) => {
            clientsSearchQuery = e.target.value;
            clientsPage = 1;
            loadClientsData();
        });
    }

    // Gallery search
    const gallerySearchInput = document.getElementById("gallery-search-input");
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener("input", (e) => {
            gallerySearchQuery = e.target.value;
            galleryPage = 1;
            loadGalleryData();
        });
    }

    // Crew search
    const crewSearchInput = document.getElementById("crew-search-input");
    if (crewSearchInput) {
        crewSearchInput.addEventListener("input", (e) => {
            crewSearchQuery = e.target.value;
            crewPage = 1;
            loadCrewData();
        });
    }

    // Events section search
    const eventsSearchInput = document.getElementById("events-search-input");
    if (eventsSearchInput) {
        eventsSearchInput.addEventListener("input", (e) => {
            eventsSearchQuery = e.target.value;
            eventsPage = 1;
            loadEventsData();
        });
    }

    // Events section status filters
    ["all", "draft", "confirmed", "completed"].forEach(key => {
        const btn = document.getElementById(`event-status-filter-btn-${key}`);
        if (btn) {
            btn.addEventListener("click", () => {
                currentEventsStatusFilter = key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1);
                eventsPage = 1;
                loadEventsData();
            });
        }
    });

    // Language Selector change listener
    const langSelector = document.getElementById("lang-selector");
    if (langSelector) {
        langSelector.value = currentLanguage;
        langSelector.addEventListener("change", (e) => {
            currentLanguage = e.target.value;
            localStorage.setItem("admin_lang", currentLanguage);
            translatePage();
            
            // Reload the active subview dynamically
            const activeNav = document.querySelector(".nav-item.active");
            if (activeNav) {
                const target = activeNav.getAttribute("data-target");
                switchView(target);
            }
        });
    }

    // Initialize session
    initializeSession();
});

// ─── Attendance Controller ──────────────────────────────────────────────────
function openAttendanceModal() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById("attendance-date");
    if (dateInput) {
        dateInput.value = today;
    }
    openModal("modal-attendance");
    loadAttendanceRegister(today);
}

async function loadAttendanceRegister(date) {
    const tbody = document.getElementById("attendance-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Loading attendance data...</td></tr>`;
    
    try {
        const data = await apiFetch(`/api/attendance?date=${date}`);
        tbody.innerHTML = "";
        
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No crew members onboarded yet.</td></tr>`;
            return;
        }
        
        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.crew_name}</strong></td>
                <td>₹${item.base_rate.toFixed(2)}</td>
                <td style="text-align: center;">
                    <select class="attendance-status-select form-input" 
                            style="margin-bottom: 0; padding: 0.25rem 0.5rem; height: 32px; width: auto;"
                            data-crew-id="${item.crew_id}" 
                            data-base-rate="${item.base_rate}" 
                            data-half-day-rate="${item.half_day_rate || 0.0}" 
                            data-night-rate="${item.night_rate || 0.0}" 
                            onchange="updateRowCalculatedPay(this)">
                        <option value="Absent" ${item.status === 'Absent' ? 'selected' : ''}>Absent</option>
                        <option value="Half Day" ${item.status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                        <option value="Full Day" ${item.status === 'Full Day' ? 'selected' : ''}>Full Day</option>
                        <option value="Night Work" ${item.status === 'Night Work' ? 'selected' : ''}>Night Work</option>
                    </select>
                </td>
                <td style="text-align: right; font-weight: 600; color: var(--maroon);" class="calculated-pay-cell">
                    ₹${item.calculated_pay.toFixed(2)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--status-danger);">Failed to load attendance data.</td></tr>`;
    }
}

function updateRowCalculatedPay(select) {
    const baseRate = parseFloat(select.getAttribute("data-base-rate")) || 0.0;
    const halfDayRate = parseFloat(select.getAttribute("data-half-day-rate")) || 0.0;
    const nightRate = parseFloat(select.getAttribute("data-night-rate")) || 0.0;
    const status = select.value;
    
    let pay = 0.0;
    if (status === "Full Day") {
        pay = baseRate;
    } else if (status === "Half Day") {
        pay = halfDayRate > 0 ? halfDayRate : baseRate * 0.5;
    } else if (status === "Night Work") {
        pay = nightRate > 0 ? nightRate : baseRate * 1.5;
    }
    
    const payCell = select.closest("tr").querySelector(".calculated-pay-cell");
    if (payCell) {
        payCell.innerText = `₹${pay.toFixed(2)}`;
    }
}

async function handleAttendanceSubmit(e) {
    e.preventDefault();
    const date = document.getElementById("attendance-date").value;
    if (!date) return;
    
    const saveBtn = document.querySelector("#attendance-form button[type='submit']");
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving Register...";
    
    const records = [];
    document.querySelectorAll(".attendance-status-select").forEach(select => {
        records.push({
            crew_id: select.getAttribute("data-crew-id"),
            status: select.value
        });
    });
    
    try {
        await apiFetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, records })
        });
        showToast("Attendance register logged and crew wages updated.");
        closeModal("modal-attendance");
        loadCrewData();
        loadDashboardData();
    } catch (err) {
        console.error("Attendance save error:", err);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Attendance Register";
    }
}

// Settings View Controllers
function loadSettingsData() {
    document.getElementById("settings-default-tax-rate").value = localStorage.getItem("settings_default_tax_rate") || "18";
    document.getElementById("settings-default-discount").value = localStorage.getItem("settings_default_discount") || "0";
    
    document.getElementById("settings-company-name").value = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
    document.getElementById("settings-company-address").value = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";
    document.getElementById("settings-company-email").value = localStorage.getItem("settings_company_email") || "hello@bhoomidecoration.com";
    document.getElementById("settings-company-phone").value = localStorage.getItem("settings_company_phone") || "+91 99999 99999";
    document.getElementById("settings-company-website").value = localStorage.getItem("settings_company_website") || "www.bhoomidecoration.com";
    
    document.getElementById("settings-theme").value = localStorage.getItem("settings_theme") || "crimson_red";
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    
    localStorage.setItem("settings_default_tax_rate", document.getElementById("settings-default-tax-rate").value);
    localStorage.setItem("settings_default_discount", document.getElementById("settings-default-discount").value);
    
    localStorage.setItem("settings_company_name", document.getElementById("settings-company-name").value);
    localStorage.setItem("settings_company_address", document.getElementById("settings-company-address").value);
    localStorage.setItem("settings_company_email", document.getElementById("settings-company-email").value);
    localStorage.setItem("settings_company_phone", document.getElementById("settings-company-phone").value);
    localStorage.setItem("settings_company_website", document.getElementById("settings-company-website").value);
    
    const selectedTheme = document.getElementById("settings-theme").value;
    localStorage.setItem("settings_theme", selectedTheme);
    
    applyTheme();
    showToast("System settings saved successfully.");
}

function applyTheme() {
    const theme = localStorage.getItem("settings_theme") || "crimson_red";
    const root = document.documentElement;
    if (theme === "emerald_green") {
        root.style.setProperty("--maroon", "#1F4B43");
        root.style.setProperty("--maroon-deep", "#0B291E");
        root.style.setProperty("--border-glass", "rgba(31, 75, 67, 0.15)");
    } else if (theme === "midnight_blue") {
        root.style.setProperty("--maroon", "#1b365d");
        root.style.setProperty("--maroon-deep", "#0f2038");
        root.style.setProperty("--border-glass", "rgba(27, 54, 93, 0.15)");
    } else { // crimson_red
        root.style.setProperty("--maroon", "#6B1623");
        root.style.setProperty("--maroon-deep", "#4A0F18");
        root.style.setProperty("--border-glass", "rgba(107, 22, 35, 0.15)");
    }
}

// ─── PDF Section Export Utility ─────────────────────────────────────────────
function exportSectionToPDF(title, subtitle, headers, rows, filename) {
    if (!rows || rows.length === 0) {
        showToast("No data available to export.", "warning");
        return;
    }

    const compName = localStorage.getItem("settings_company_name") || "Bhoomi Decoration";
    const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";
    const compEmail = localStorage.getItem("settings_company_email") || "hello@bhoomidecoration.com";
    const exportDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const rowsHTML = rows.map((row, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#fdfaf7';
        const cells = row.map(val => {
            const display = (val === null || val === undefined) ? '—' : String(val);
            return `<td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:0.8rem;">${display}</td>`;
        }).join('');
        return `<tr style="background:${bg};">${cells}</tr>`;
    }).join('');

    const headersHTML = headers.map(h =>
        `<th style="padding:10px 10px;background:#6b1623;color:#fff;font-size:0.75rem;font-weight:600;text-align:left;letter-spacing:0.05em;">${h}</th>`
    ).join('');

    const pdfHTML = `
        <div style="font-family:'Poppins',sans-serif;color:#333;background:#fff;padding:30px;max-width:800px;margin:0 auto;box-sizing:border-box;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #6b1623;padding-bottom:18px;margin-bottom:24px;">
                <div>
                    <h1 style="font-family:'Marcellus',serif;color:#6b1623;font-size:1.8rem;margin:0 0 4px 0;letter-spacing:1px;">${compName.toUpperCase()}</h1>
                    <p style="margin:0;font-size:0.8rem;color:#666;font-style:italic;">Luxury Event &amp; Wedding Decorators</p>
                    <p style="margin:4px 0 0 0;font-size:0.75rem;color:#888;">${compAddress} · ${compEmail}</p>
                </div>
                <div style="text-align:right;">
                    <h2 style="font-family:'Marcellus',serif;color:#333;font-size:1.4rem;margin:0 0 6px 0;">${title}</h2>
                    <p style="margin:0;font-size:0.8rem;color:#888;">${subtitle}</p>
                    <p style="margin:4px 0 0 0;font-size:0.78rem;color:#aaa;">Exported: ${exportDate}</p>
                    <p style="margin:2px 0 0 0;font-size:0.78rem;color:#aaa;">${rows.length} record${rows.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr>${headersHTML}</tr></thead>
                <tbody>${rowsHTML}</tbody>
            </table>
            <div style="margin-top:30px;border-top:1px solid #eee;padding-top:14px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.7rem;color:#aaa;">Generated by ${compName} Admin Portal · ${exportDate}</span>
                <span style="font-size:0.7rem;color:#aaa;">© ${new Date().getFullYear()} ${compName}</span>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = pdfHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    showToast("Generating PDF export...");
    html2pdf().from(container).set(opt).save().then(() => {
        document.body.removeChild(container);
        showToast(`PDF exported successfully — ${rows.length} records.`);
    }).catch(err => {
        document.body.removeChild(container);
        console.error("PDF export failed:", err);
        showToast("Failed to generate PDF export.", "error");
    });
}

async function exportWarehousePDF() {
    try {
        showToast("Fetching warehouse catalog...");
        const items = await apiFetch(`/api/inventory?search=${encodeURIComponent(warehouseSearchQuery)}`);
        const data = Array.isArray(items) ? items : (items || []);
        const headers = ["Item ID", "Name", "Category", "Qty Owned", "Available", "Rate/Day (₹)", "Condition"];
        const rows = data.map(item => [
            item.id,
            item.name,
            item.category,
            item.quantity_owned,
            item.available_stock !== null ? item.available_stock : item.quantity_owned,
            `₹${(item.rental_price_per_day || 0).toFixed(2)}`,
            item.condition_status
        ]);
        exportSectionToPDF("Warehouse Catalog", "Stock & Catalog Assets Report", headers, rows, `Bhoomi_Warehouse_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export warehouse PDF.", "error");
    }
}

async function exportEventsPDF() {
    try {
        showToast("Fetching events ledger...");
        const res = await apiFetch(`/api/events?search=${encodeURIComponent(eventsSearchQuery)}&status=${encodeURIComponent(currentEventsStatusFilter)}`);
        const data = res.items || res || [];
        const headers = ["Client Name", "Venue", "Start Date", "End Date", "Status", "Invoice Total", "Paid", "Balance"];
        const rows = data.map(item => [
            item.client_name,
            item.venue_address,
            item.start_date,
            item.end_date,
            item.status,
            `₹${(item.total_invoice_amount || 0).toFixed(2)}`,
            `₹${(item.amount_paid || 0).toFixed(2)}`,
            `₹${(item.remaining_balance || 0).toFixed(2)}`
        ]);
        exportSectionToPDF("Event Projects", `Filter: ${currentEventsStatusFilter}`, headers, rows, `Bhoomi_Events_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export events PDF.", "error");
    }
}

async function exportClientsPDF() {
    try {
        showToast("Fetching client directory...");
        const res = await apiFetch(`/api/clients?search=${encodeURIComponent(clientsSearchQuery)}`);
        const data = res.items || res || [];
        const headers = ["Client ID", "Name", "Email", "Phone", "Address"];
        const rows = data.map(item => [
            item.id,
            item.name,
            item.email,
            item.phone,
            item.address
        ]);
        exportSectionToPDF("Clients CRM", "Customer Directory Report", headers, rows, `Bhoomi_Clients_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export clients PDF.", "error");
    }
}

async function exportCrewPDF() {
    try {
        showToast("Fetching crew roster...");
        const res = await apiFetch(`/api/crew?search=${encodeURIComponent(crewSearchQuery)}`);
        const data = res.items || res || [];
        const headers = ["Crew ID", "Name", "Role", "Contact", "Base Rate (₹)", "Amount Owed (₹)", "Days Worked"];
        const rows = data.map(item => [
            item.id,
            item.name,
            item.role,
            item.contact,
            `₹${(item.base_rate || 0).toFixed(2)}`,
            `₹${(item.amount_owed || 0).toFixed(2)}`,
            item.days_worked || 0
        ]);
        exportSectionToPDF("Crew Ledger", "Team Wages & Roster Report", headers, rows, `Bhoomi_Crew_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export crew PDF.", "error");
    }
}

async function exportFinancePDF() {
    try {
        showToast("Fetching financial transactions...");
        let backendPaymentStatus = "All";
        if (currentFinanceFilter === "Fully Paid") backendPaymentStatus = "Fully Paid";
        else if (currentFinanceFilter === "Partially Paid") backendPaymentStatus = "Partially Paid";
        else if (currentFinanceFilter === "Unpaid") backendPaymentStatus = "Unpaid";
        const res = await apiFetch(`/api/events?search=${encodeURIComponent(financeSearchQuery)}&payment_status=${encodeURIComponent(backendPaymentStatus)}`);
        const data = res.items || res || [];
        const headers = ["Client / Venue", "Event Date", "Invoice Total", "Amount Paid", "Balance", "Payment Status"];
        const rows = data.map(item => [
            `${item.client_name} · ${item.venue_address}`,
            item.start_date,
            `₹${(item.total_invoice_amount || 0).toFixed(2)}`,
            `₹${(item.amount_paid || 0).toFixed(2)}`,
            `₹${(item.remaining_balance || 0).toFixed(2)}`,
            item.payment_status || 'Unpaid'
        ]);
        exportSectionToPDF("Finance Hub", `Filter: ${currentFinanceFilter}`, headers, rows, `Bhoomi_Finance_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export finance PDF.", "error");
    }
}

async function exportInvoicesPDF() {
    try {
        showToast("Fetching invoices directory...");
        let backendPaymentStatus = "All";
        if (currentInvoiceFilter === "Paid") backendPaymentStatus = "Fully Paid";
        else if (currentInvoiceFilter === "Remaining") backendPaymentStatus = "Partially Paid";
        else if (currentInvoiceFilter === "Unpaid") backendPaymentStatus = "Unpaid";
        const res = await apiFetch(`/api/events?search=${encodeURIComponent(invoiceSearchQuery)}&payment_status=${encodeURIComponent(backendPaymentStatus)}`);
        const data = res.items || res || [];
        const headers = ["Client Name", "Venue", "Date", "Status", "Invoice Total", "Paid", "Balance"];
        const rows = data.map(item => [
            item.client_name,
            item.venue_address,
            item.start_date,
            item.payment_status || 'Unpaid',
            `₹${(item.total_invoice_amount || 0).toFixed(2)}`,
            `₹${(item.amount_paid || 0).toFixed(2)}`,
            `₹${(item.remaining_balance || 0).toFixed(2)}`
        ]);
        exportSectionToPDF("Invoices Hub", `Filter: ${currentInvoiceFilter}`, headers, rows, `Bhoomi_Invoices_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        showToast("Failed to export invoices PDF.", "error");
    }
}

// Event Details Overview Modal Controller
async function openEventDetailsViewModal(eventId) {
    try {
        let evt = eventsList.find(e => e.id === eventId);
        const freshEvt = await apiFetch(`/api/events/${eventId}`);
        if (freshEvt) evt = freshEvt;
        
        if (!evt) {
            showToast("Failed to fetch event details.", "error");
            return;
        }

        if (clientsList.length === 0) {
            clientsList = await apiFetch("/api/clients") || [];
        }
        if (inventoryList.length === 0) {
            inventoryList = await apiFetch("/api/inventory") || [];
        }

        const client = clientsList.find(c => c.id === evt.client_id) || {};
        
        let booked = {};
        try {
            booked = JSON.parse(evt.items_booked || "{}");
        } catch (e) {}

        const sDate = new Date(evt.start_date);
        const eDate = new Date(evt.end_date);
        const days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

        let itemsHtml = "";
        let itemsCount = 0;
        let subtotal = 0;
        Object.keys(booked).forEach(itemId => {
            const item = inventoryList.find(i => i.id === itemId);
            if (item) {
                const qty = booked[itemId];
                const total = item.rental_price_per_day * qty * days;
                subtotal += total;
                itemsCount += qty;
                itemsHtml += `
                    <tr>
                        <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.category}</small></td>
                        <td>${qty}</td>
                        <td>₹${item.rental_price_per_day.toFixed(2)}</td>
                        <td style="text-align:right;">₹${total.toFixed(2)}</td>
                    </tr>
                `;
            }
        });

        if (itemsHtml === "") {
            itemsHtml = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No catalog items reserved.</td></tr>`;
        }

        let layoutHtml = "";
        if (evt.design_layout_url) {
            layoutHtml = `
                <div style="margin-top:1rem;border:1px solid var(--border-glass);padding:0.5rem;border-radius:4px;background:rgba(255,255,255,0.3);text-align:center;">
                    <img src="${evt.design_layout_url}" alt="Event Layout Design" style="max-width:100%;max-height:350px;object-fit:contain;border-radius:2px;box-shadow:var(--shadow-premium);">
                </div>
            `;
        } else {
            layoutHtml = `
                <div style="margin-top:1rem;border:1px dashed var(--maroon);padding:1.5rem;border-radius:4px;text-align:center;color:var(--text-secondary);">
                    <span>No blueprint or layout design sketch has been uploaded for this event.</span>
                </div>
            `;
        }

        const detailsContent = document.getElementById("event-details-content");
        if (detailsContent) {
            detailsContent.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(107,22,35,0.05);padding:1rem;border-radius:4px;">
                    <div>
                        <span style="font-size:0.75rem;text-transform:uppercase;color:var(--gold);font-weight:600;">Status Timeline</span>
                        <div style="font-size:1.1rem;font-weight:600;color:var(--maroon-deep);">${evt.start_date} to ${evt.end_date}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem;">Duration: ${days} Day${days !== 1 ? 's' : ''} rental</div>
                    </div>
                    <div style="text-align:right;">
                        <span class="badge ${evt.status === 'Completed' ? 'badge-completed' : evt.status === 'Confirmed' ? 'badge-confirmed' : 'badge-draft'}">${evt.status}</span>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1rem;">
                    <div class="glass-panel" style="padding:1rem;">
                        <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.5rem 0;">Client Profile</h4>
                        <p style="margin:0 0 0.25rem 0;font-weight:600;">${client.name || evt.client_name || 'N/A'}</p>
                        <p style="margin:0 0 0.25rem 0;font-size:0.85rem;color:var(--text-secondary);">${client.email || 'N/A'}</p>
                        <p style="margin:0 0 0.25rem 0;font-size:0.85rem;color:var(--text-secondary);">${client.phone || 'N/A'}</p>
                        <p style="margin:0;font-size:0.85rem;color:var(--text-secondary);">${client.address || 'N/A'}</p>
                    </div>
                    <div class="glass-panel" style="padding:1rem;">
                        <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.5rem 0;">Event Setup Address</h4>
                        <p style="margin:0;line-height:1.4;">${evt.venue_address || 'N/A'}</p>
                    </div>
                </div>

                <div class="glass-panel" style="padding:1rem;margin-top:1rem;">
                    <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.75rem 0;">Reserved Decor Assets (${itemsCount} items)</h4>
                    <div class="table-wrapper" style="margin-top:0;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Day Rate</th>
                                    <th style="text-align:right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top:1rem;border-top:1px solid rgba(107,22,35,0.1);padding-top:0.75rem;display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;font-size:0.9rem;">
                        <div>Subtotal: <strong>₹${subtotal.toFixed(2)}</strong></div>
                        ${evt.discount > 0 ? `<div style="color:var(--maroon);">Discount: <strong>-₹${evt.discount.toFixed(2)}</strong></div>` : ''}
                        ${evt.tax_rate > 0 ? `<div>Tax (${evt.tax_rate.toFixed(1)}%): <strong>₹${((subtotal - evt.discount) * (evt.tax_rate/100)).toFixed(2)}</strong></div>` : ''}
                        <div style="font-size:1.05rem;color:var(--maroon-deep);margin-top:0.25rem;">Invoice Total: <strong>₹${evt.total_invoice_amount.toFixed(2)}</strong></div>
                        <div style="color:var(--status-success);">Paid to Date: <strong>₹${evt.amount_paid.toFixed(2)}</strong></div>
                        <div style="color:${evt.remaining_balance > 0 ? 'var(--maroon)' : 'var(--status-success)'};font-weight:600;">Remaining Balance: <strong>₹${evt.remaining_balance.toFixed(2)}</strong></div>
                    </div>
                </div>

                <div class="glass-panel" style="padding:1rem;margin-top:1rem;">
                    <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.5rem 0;">Layout Blueprint Sketch</h4>
                    ${layoutHtml}
                </div>
            `;
        }
        
        openModal("modal-event-details");
    } catch (err) {
        console.error("Failed to load event details popup:", err);
        showToast("Error opening event details.", "error");
    }
}
window.openEventDetailsViewModal = openEventDetailsViewModal;

// ─── Global Window Exports ──────────────────────────────────────────────────
window.editInventoryItem = editInventoryItem;
window.deleteInventoryItem = deleteInventoryItem;
window.editEventBooking = editEventBooking;
window.deleteEventBooking = deleteEventBooking;
window.editClientItem = editClientItem;
window.deleteClientItem = deleteClientItem;
window.editGalleryItem = editGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
window.editCrewMember = editCrewMember;
window.deleteCrewMember = deleteCrewMember;
window.openCrewPaymentModal = openCrewPaymentModal;
window.exportInvoiceToPDF = exportInvoiceToPDF;
window.loadWarehouseData = loadWarehouseData;
window.loadClientsData = loadClientsData;
window.loadGalleryData = loadGalleryData;
window.loadCrewData = loadCrewData;
window.loadFinanceData = loadFinanceData;
window.loadDashboardData = loadDashboardData;
window.loadEventsData = loadEventsData;
window.loadInvoicesData = loadInvoicesData;
window.openAttendanceModal = openAttendanceModal;
window.updateRowCalculatedPay = updateRowCalculatedPay;

