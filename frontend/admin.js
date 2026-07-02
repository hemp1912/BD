// Admin Dashboard Controller

// State Management
let currentUser = null;
let inventoryList = [];
let clientsList = [];
let eventsList = [];
let galleryList = [];
let crewList = [];
let activeCrewAssignments = []; // Temporary cache during booking editing
let callbacksList = [];

// Search queries
let dashboardSearchQuery = "";
let warehouseSearchQuery = "";
let clientsSearchQuery = "";
let gallerySearchQuery = "";
let crewSearchQuery = "";
let financeSearchQuery = "";
let invoiceSearchQuery = "";
let eventsSearchQuery = "";
let callbacksSearchQuery = "";

// Pagination pages (1-indexed)
let dashboardPage = 1;
let warehousePage = 1;
let clientsPage = 1;
let galleryPage = 1;
let crewPage = 1;
let financePage = 1;
let invoicePage = 1;
let eventsPage = 1;
let callbacksPage = 1;

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
        "nav_kanban": "Booking Pipeline",
        "nav_callbacks": "Callbacks CRM",
        "nav_gallery": "Portfolio Gallery",
        "nav_crew": "Crew Ledger",
        "callbacks_title": "Callbacks CRM",
        "callbacks_subtitle": "Review and manage callback and lead enquiries.",
        "callbacks_table_name": "Name",
        "callbacks_table_phone": "Phone",
        "callbacks_table_date": "Date",
        "callbacks_table_service": "Service Requested",
        "callbacks_table_msg": "Message",
        "callbacks_table_status": "Status",
        "callbacks_action_contacted": "Mark Contacted",
        "status_quote": "Quote",
        "status_draft": "Draft",
        "status_confirmed": "Confirmed",
        "status_completed": "Completed",
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
        "pdf_invoice_title": "INVOICE / ઇન્વોઇસ",
        "pdf_invoice_from": "FROM / તરફથી:",
        "pdf_invoice_to": "BILLED TO / પ્રતિ:",
        "pdf_event_details": "EVENT LOGISTICS / ઇવેન્ટ વિગતો:",
        "pdf_venue": "Venue / સ્થળ:",
        "pdf_start_date": "Setup Start / સેટઅપ શરૂઆત:",
        "pdf_end_date": "Cleanup Deadline / ડેડલાઇન પૂર્ણ:",
        "pdf_decor_item": "Reserved Catalog Item / બુક આઇટમ",
        "pdf_category": "Category / શ્રેણી",
        "pdf_qty": "Qty / જથ્થો",
        "pdf_rate": "Day Rate / દૈનિક દર",
        "pdf_subtotal": "Rental Subtotal / પેટા સરવાળો:",
        "pdf_discount": "Discount / ડિસ્કાઉન્ટ:",
        "pdf_tax": "Tax Rate / ટેક્સ:",
        "pdf_total": "Invoice Total / કુલ રકમ:",
        "pdf_amount_paid": "Amount Paid / ચૂકવેલ રકમ:",
        "pdf_balance_due": "Balance Due / બાકી ચૂકવણી:",
        "pdf_terms_title": "TERMS & CONDITIONS / નિયમો અને શરતો",
        "pdf_terms_text": "1. All reservation items are rental assets of Bhoomi Decoration. / ૧. બધી બુકિંગ આઇટમો ભૂમિ ડેકોરેશનની ભાડાની સંપત્તિ છે.\n2. Payments should be made within milestone dates. / ૨. ચૂકવણી નિર્ધારિત સમય મર્યાદામાં થવી જોઈએ.\n3. Damage to physical property is subject to replacement charges. / ૩. સેટઅપ અથવા ઇવેન્ટ દરમિયાન સંપત્તિને નુકસાન થવાના કિસ્સામાં બદલી ખર્ચ લાગુ થશે.",
        "pdf_invoice_no": "Invoice No / ઇન્વોઇસ નંબર:",
        "pdf_date_label": "Date / તારીખ:",
        "pdf_auth_sign": "Authorized Signatory / અધિકૃત સહી",
        "pdf_client_sign": "Client Signature / ગ્રાહક સહી",
        "pdf_agreement_accept": "Acceptance of Agreement / કરારની સ્વીકૃતિ",
        "pdf_thank_you": "Thank you for choosing Bhoomi Decoration for your celebration! / તમારી ઉજવણી માટે ભૂમિ ડેકોરેશન પસંદ કરવા બદલ આભાર!",
        "pdf_no_items": "No reserved catalog items found. / કોઈ બુક કરેલી આઇટમ્સ મળી નથી.",
        "pdf_custom_category": "Custom / કસ્ટમ",
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
        "receipt_contract_title": "EVENT DECORATION LOGISTICS CONTRACT / ઇવેન્ટ ડેકોરેશન લોજિસ્ટિક્સ કરાર",
        "receipt_admin": "Business Administrator / બિઝનેસ એડમિનિસ્ટ્રેટર",
        "receipt_client": "Customer Client / ગ્રાહકનું નામ:",
        "receipt_address": "Setup Address / સેટઅપ સરનામું:",
        "receipt_dates": "Booked Dates / બુક કરેલી તારીખો:",
        "receipt_ref_code": "Invoice Reference Code / ઇન્વોઇસ સંદર્ભ કોડ:",
        "receipt_item": "Decor Item / વિગત",
        "receipt_qty": "Qty / જથ્થો",
        "receipt_rate": "Day Rate / દૈનિક દર",
        "receipt_subtotal": "Subtotal Amount / પેટા સરવાળો:",
        "receipt_discount": "Deducted Discount / ડિસ્કાઉન્ટ બાદબાકી:",
        "receipt_tax": "Applied Tax / ટેક્સ રકમ:",
        "receipt_invoice_total": "Total Invoice Amount / કુલ ઇન્વોઇસ રકમ:",
        "receipt_total_paid": "Total Paid (Receipts) / ચૂકવેલ રકમ:",
        "receipt_remaining": "Remaining Accounts Balance / બાકી રહેતી રકમ:",
        
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
        "nav_kanban": "બુકિંગ પાઇપલાઇન",
        "nav_callbacks": "કોલબેક્સ CRM",
        "nav_gallery": "પોર્ટફોલિયો ગેલેરી",
        "nav_crew": "ક્રૂ લેજર",
        "callbacks_title": "કોલબેક્સ CRM",
        "callbacks_subtitle": "કોલબેક અને લીડ પૂછપરછની સમીક્ષા અને સંચાલન કરો.",
        "callbacks_table_name": "નામ",
        "callbacks_table_phone": "ફોન",
        "callbacks_table_date": "તારીખ",
        "callbacks_table_service": "વિનંતી કરેલ સેવા",
        "callbacks_table_msg": "સંદેશ",
        "callbacks_table_status": "સ્થિતિ",
        "callbacks_action_contacted": "સંપર્ક કર્યો",
        "status_quote": "ક્વોટ",
        "status_draft": "ડ્રાફ્ટ",
        "status_confirmed": "કન્ફર્મ",
        "status_completed": "પૂર્ણ થયેલ",
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
    },
    hi: {
        // Sidebar & General
        "nav_dashboard": "ऑपरेशन्स डैशबोर्ड",
        "nav_events": "इवेंट प्रोजेक्ट्स",
        "nav_warehouse": "गोदाम सूची",
        "nav_clients": "ग्राहक संबंध प्रबंधन",
        "nav_kanban": "बुकिंग पाइपलाइन",
        "nav_callbacks": "कॉल बैक सीआरएम",
        "nav_gallery": "पोर्टफोलियो गैलरी",
        "nav_crew": "क्रू खाता",
        "callbacks_title": "कॉल बैक सीआरएम",
        "callbacks_subtitle": "कॉल बैक और लीड पूछताछ की समीक्षा और प्रबंधन करें।",
        "callbacks_table_name": "नाम",
        "callbacks_table_phone": "फ़ोन",
        "callbacks_table_date": "तारीख",
        "callbacks_table_service": "अनुरोधित सेवा",
        "callbacks_table_msg": "संदेश",
        "callbacks_table_status": "स्थिति",
        "callbacks_action_contacted": "संपर्क किया गया",
        "status_quote": "कोट",
        "status_draft": "ड्राफ्ट",
        "status_confirmed": "कन्फर्म",
        "status_completed": "पूर्ण किया गया",
        "nav_finance": "वित्त हब",
        "nav_invoices": "इनवॉइस हब",
        "nav_signout": "सुरक्षित लॉग आउट",
        "role_admin": "व्यवसाय व्यवस्थापक",
        "edit": "संपादित करें",
        "delete": "हटाएं",
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "actions": "कार्रवाई",
        "status": "स्थिति",

        // Dashboard
        "dash_title": "ऑपरेशन्स डैशबोर्ड",
        "dash_subtitle": "शेड्यूलिंग स्थिति, भुगतान और नेट इवेंट शेष राशि को ट्रैक करें।",
        "dash_btn_quote": "ऑन-वॉक कोट बिल्डर",
        "dash_btn_onboard": "क्रू शामिल करें",
        "dash_btn_booking": "इवेंट बुकिंग बनाएं",
        "dash_stat_active": "सक्रिय बुकिंग",
        "dash_stat_tasks": "लंबित कार्य",
        "dash_stat_crew": "ड्यूटी पर क्रू",
        "dash_stat_lowstock": "कम स्टॉक वाली वस्तुएं",
        "dash_upcoming_title": "आगामी इवेंट्स",
        "dash_upcoming_sub": "निकटतम तिथि के अनुसार क्रमबद्ध · पूर्ण इवेंट्स इवेंट प्रोजेक्ट्स अनुभाग में दिखाई देते हैं।",
        "dash_search_placeholder": "ग्राहक / स्थान खोजें...",
        "dash_table_client": "ग्राहक / स्थान",
        "dash_table_dates": "तिथियां",
        "dash_table_total": "इनवॉइस कुल",
        "dash_table_paid": "भुगतान किया गया",
        "dash_table_balance": "शेष राशि",

        // Events Projects
        "events_title": "इवेंट प्रोजेक्ट्स",
        "events_subtitle": "सभी बुक किए गए सजावट प्रोजेक्ट्स को ट्रैक, फ़िल्टर, खोजें और प्रबंधित करें।",
        "events_btn_booking": "नया इवेंट प्रोजेक्ट बुक करें",
        "events_stat_total": "कुल बुकिंग",
        "events_stat_confirmed": "पुष्टि की गई बुकिंग",
        "events_stat_draft": "ड्राफ्ट बुकिंग",
        "events_filter_status": "स्थिति फ़िल्टर:",
        "events_filter_all": "सभी",
        "events_filter_draft": "ड्राफ्ट",
        "events_filter_confirmed": "कन्फर्म",
        "events_filter_completed": "पूर्ण किया गया",
        "events_search_placeholder": "ग्राहक / स्थान खोजें...",

        // Warehouse Catalog
        "wh_title": "गोदाम सूची सूची",
        "wh_subtitle": "भौतिक इवेंट संपत्तियों को बनाएं, अपडेट करें और प्रबंधित करें।",
        "wh_btn_register": "कैटलॉग संपत्ति पंजीकृत करें",
        "wh_stat_unique": "कुल अद्वितीय वस्तुएं",
        "wh_stat_stock": "कुल इकाई स्टॉक",
        "wh_stat_low": "कम स्टॉक अलर्ट",
        "wh_search_placeholder": "कैटलॉग वस्तुएं खोजें...",
        "wh_table_id": "आईडी",
        "wh_table_name": "नाम",
        "wh_table_category": "श्रेणी",
        "wh_table_stock": "स्टॉक स्तर",
        "wh_table_rate": "दैनिक दर",

        // Clients CRM
        "cli_title": "ग्राहक डेटाबेस",
        "cli_subtitle": "ग्राहक प्रोफाइल प्रबंधित करें और नए खाते पंजीकृत करें।",
        "cli_btn_intake": "नया ग्राहक शामिल करें",
        "cli_stat_total": "कुल ग्राहक",
        "cli_stat_active": "सक्रिय ग्राहक",
        "cli_stat_new": "नए लीड (YTD)",
        "cli_search_placeholder": "ग्राहक खोजें...",
        "cli_table_id": "आईडी",
        "cli_table_name": "नाम",
        "cli_table_email": "ईमेल",
        "cli_table_phone": "फ़ोन",
        "cli_table_address": "पता",

        // Portfolio Gallery
        "gal_title": "पोर्टफोलियो गैलरी",
        "gal_subtitle": "वेबसाइट पर प्रदर्शित होने वाली तस्वीरों को अपलोड और प्रबंधित करें।",
        "gal_btn_upload": "तस्वीर प्रविष्टि अपलोड करें",
        "gal_search_placeholder": "गैलरी प्रविष्टियां खोजें...",
        "gal_table_photo": "फोटो",
        "gal_table_title": "शीर्षक",
        "gal_table_category": "श्रेणी",
        "gal_table_desc": "विवरण",

        // Crew Ledger
        "crew_title": "क्रू वेतन और बहीखाता",
        "crew_subtitle": "आंतरिक क्रू प्रोफाइल, दैनिक दर, भुगतान लॉग और बकाया राशि ट्रैक करें।",
        "crew_btn_attendance": "दैनिक उपस्थिति रजिस्टर",
        "crew_btn_add": "टीम प्रोफाइल जोड़ें",
        "crew_stat_strength": "रोस्टर ताकत",
        "crew_stat_owed": "देय वेतन",
        "crew_stat_active": "सक्रिय असाइनमेंट",
        "crew_search_placeholder": "टीम के सदस्यों को खोजें...",
        "crew_table_id": "आईडी",
        "crew_table_name": "नाम",
        "crew_table_role": "भूमिका",
        "crew_table_contact": "संपर्क",
        "crew_table_rate": "मूल दर (₹)",
        "crew_table_days": "कार्य दिवस",
        "crew_table_owed": "देय वेतन (₹)",

        // Finance Hub
        "fin_title": "वित्त हब",
        "fin_subtitle": "बिक्री फ़िल्टर करें, प्राप्य राशि की गणना करें, और भुगतान लेनदेन लॉग देखें।",
        "fin_stat_sales": "कुल बिक्री",
        "fin_stat_receivables": "प्राप्य शेष राशि",
        "fin_stat_wages": "कुल क्रू वेतन",
        "fin_stat_profit": "शुद्ध लाभ मार्जिन",
        "fin_filter_payment": "भुगतान स्थिति फ़िल्टर करें:",
        "fin_filter_all": "सभी",
        "fin_filter_fully": "पूर्ण भुगतान",
        "fin_filter_partially": "आंशिक भुगतान",
        "fin_filter_unpaid": "अवैतनिक",
        "fin_search_placeholder": "ग्राहक / स्थान खोजें...",
        "fin_table_client": "ग्राहक / स्थान",
        "fin_table_date": "इवेंट तिथि",
        "fin_table_total": "इनवॉइस कुल",
        "fin_table_paid": "भुगतान किया गया",
        "fin_table_balance": "शेष राशि",
        "fin_table_status": "भुगतान स्थिति",
        "fin_table_action": "कार्रवाई",

        // Invoices Hub
        "inv_title": "इनवॉइस हब",
        "inv_subtitle": "बिलिंग प्रबंधित करें, भुगतान संग्रह ट्रैक करें और उच्च-गुणवत्ता वाले पीडीएफ इनवॉइस निर्यात करें।",
        "inv_btn_manual": "मैन्युअल इनवॉइस बनाएं",
        "inv_stat_total": "कुल इनवॉइस राशि",
        "inv_stat_collected": "कुल संग्रहीत",
        "inv_stat_remaining": "कुल शेष",
        "inv_filter_status": "स्थिति फ़िल्टर करें:",
        "inv_filter_all": "सभी",
        "inv_filter_paid": "भुगतान किया गया",
        "inv_filter_remaining": "शेष",
        "inv_filter_unpaid": "अवैतनिक",
        "inv_search_placeholder": "ग्राहक / स्थान खोजें...",
        "inv_table_client": "ग्राहक / स्थान",
        "inv_table_date": "इनवॉइस तिथि",
        "inv_table_status": "स्थिति",
        "inv_table_total": "इनवॉइस कुल",
        "inv_table_paid": "भुगतान किया गया",
        "inv_table_balance": "शेष",
        
        // System Settings
        "settings_title": "सिस्टम सेटिंग्स",
        "settings_subtitle": "बुकिंग डिफ़ॉल्ट, कंपनी प्रोफाइल विवरण और थीम रंग कॉन्फ़िगर करें।",
        "settings_sec_defaults": "बुकिंग डिफ़ॉल्ट",
        "settings_tax_rate": "डिफ़ॉल्ट टैक्स दर (%)",
        "settings_discount": "डिफ़ॉल्ट छूट (₹)",
        "settings_sec_profile": "कंपनी व्यवसाय प्रोफ़ाइल",
        "settings_company_name": "कंपनी का नाम",
        "settings_company_address": "व्यावसायिक पता",
        "settings_company_email": "व्यावसायिक ईमेल",
        "settings_company_phone": "संपर्क फ़ोन",
        "settings_company_website": "कंपनी की वेबसाइट",
        "settings_sec_appearance": "थीम रंग योजना",
        "settings_theme_label": "थीम पैलेट",
        "settings_theme_crimson": "क्रिमसन रेड (डिफ़ॉल्ट)",
        "settings_theme_emerald": "पन्ना हरा (Emerald Green)",
        "settings_theme_midnight": "आधी रात का नीला (Midnight Blue)",
        "settings_btn_save": "सेटिंग्स सहेजें",
        "export_pdf": "पीडीएफ निर्यात",
        "details_btn": "विवरण"
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
    
    if (!token || role !== "admin") {
        logout();
        return;
    }
    
    try {
        const res = await apiFetch("/api/me");
        const userData = res.user || res;
        currentUser = { token, role, name: userData.name || "Admin" };
        
        // Bind Profile Display Details
        document.getElementById("user-display-name").innerText = userData.name || "Admin";
    } catch (err) {
        logout();
        return;
    }
    
    translatePage();
    
    // Set view structure via Hash Router
    handleHashChange();
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
    } else if (targetViewId === "kanban-view") {
        document.getElementById("kanban-subview").style.display = "block";
        loadKanbanData();
    } else if (targetViewId === "callbacks-view") {
        document.getElementById("callbacks-subview").style.display = "block";
        loadCallbacksData();
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
    } else if (targetViewId === "testimonials-subview") {
        document.getElementById("testimonials-subview").style.display = "block";
        loadTestimonialsData();
    } else if (targetViewId === "analytics-subview") {
        document.getElementById("analytics-subview").style.display = "block";
        loadAnalyticsData();
    } else if (targetViewId === "calendar-subview") {
        document.getElementById("calendar-subview").style.display = "block";
        loadCalendarData();
    } else if (targetViewId === "expenses-subview") {
        document.getElementById("expenses-subview").style.display = "block";
        populateExpenseEventSelector();
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

async function refreshActiveView() {
    const subviews = [
        { id: "dashboard-subview", load: () => loadDashboardData() },
        { id: "events-subview", load: () => loadEventsData() },
        { id: "kanban-subview", load: () => loadKanbanData() },
        { id: "callbacks-subview", load: () => loadCallbacksData() },
        { id: "warehouse-subview", load: () => loadWarehouseData() },
        { id: "clients-subview", load: () => loadClientsData() },
        { id: "gallery-subview", load: () => loadGalleryData() },
        { id: "crew-subview", load: () => loadCrewData() },
        { id: "finance-subview", load: () => loadFinanceData() },
        { id: "invoice-subview", load: () => loadInvoicesData() },
        { id: "testimonials-subview", load: () => loadTestimonialsData() },
        { id: "settings-subview", load: () => loadSettingsData() }
    ];
    
    for (const view of subviews) {
        const el = document.getElementById(view.id);
        if (el && el.style.display !== "none") {
            await view.load();
            break;
        }
    }
}
window.refreshActiveView = refreshActiveView;

// ─── Pagination Helper ─────────────────────────────────────────────────────
function renderPaginationControls(containerId, totalItems, currentPage, onPageChange, maxPages = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) { container.innerHTML = ""; return; }
    
    let html = `<div class="pagination-container">`;
    html += `<div class="pagination-info">Page ${currentPage} of ${totalPages}</div>`;
    html += `<div class="pagination-buttons">`;
    html += `<button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} onclick="${onPageChange}(${currentPage - 1})">← Prev</button>`;
    
    let startPage = 1;
    let endPage = totalPages;
    
    if (totalPages > maxPages) {
        startPage = currentPage - Math.floor((maxPages - 1) / 2);
        endPage = currentPage + Math.floor(maxPages / 2);
        
        if (startPage < 1) {
            endPage = endPage + (1 - startPage);
            startPage = 1;
        }
        if (endPage > totalPages) {
            startPage = startPage - (endPage - totalPages);
            endPage = totalPages;
        }
        startPage = Math.max(1, startPage);
    }
    
    for (let p = startPage; p <= endPage; p++) {
        html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="${onPageChange}(${p})">${p}</button>`;
    }
    
    html += `<button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="${onPageChange}(${currentPage + 1})">Next →</button>`;
    html += `</div>`;
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
            renderPaginationControls("warehouse-pagination", 0, warehousePage, "loadWarehouseData", 3);
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
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border: 1px solid var(--gold);" onclick="openItemAvailabilityCalendar('${item.id}')">Availability</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editInventoryItem('${item.id}')">${t('edit')}</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteInventoryItem('${item.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("warehouse-pagination", total, warehousePage, "loadWarehouseData", 3);
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
        allInventoryItemsList = [];
        showToast(id ? "Inventory asset updated." : "Catalog asset registered.");
        closeModal("modal-inventory");
        refreshActiveView();
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
                allInventoryItemsList = [];
                showToast("Asset deleted from catalog.");
                refreshActiveView();
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
        renderPaginationControls("dashboard-pagination", 0, dashboardPage, "loadDashboardData", 3);
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

        const showRemind = (evt.remaining_balance > 0 && evt.status !== "Cancelled" && evt.status !== "Completed");
        const remindBtn = showRemind ? `
            <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; color: var(--maroon); border-color: var(--maroon);" onclick="sendPaymentReminder('${evt.id}')">✉ Remind</button>
        ` : '';

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
                    ${remindBtn}
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="fetchAndCopyPortalLink('${evt.id}')">🔗 Portal</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderPaginationControls("dashboard-pagination", filtered.length, dashboardPage, "loadDashboardData", 3);
}

async function renderBookingInventoryItems() {
    // Lazy-load inventory only when needed
    const fullInv = await getFullInventoryList();
    // Lazy-load clients dropdown only when the booking modal opens
    await populateClientsDropdown();

    const container = document.getElementById("booking-items-selector");
    container.innerHTML = "";
    
    fullInv.forEach(item => {
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
    const progress_stage = parseInt(document.getElementById("booking-progress-stage").value) || 0;
    
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
        status: document.getElementById("booking-status").value,
        discount,
        tax_rate,
        progress_stage
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
        await refreshActiveView();
        
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
    document.getElementById("booking-status").value = evt.status || "Confirmed";
    document.getElementById("booking-progress-stage").value = evt.progress_stage || 0;
    
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
    
    // Show and load Event Photo Album section
    const photosSection = document.getElementById("booking-event-photos-section");
    if (photosSection) {
        photosSection.style.display = "block";
        document.getElementById("booking-photo-file").value = "";
        loadBookingEventPhotos(evt.id);
    }
    
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
                refreshActiveView();
            } catch (err) {}
        }
    );
}

// 4. On-Walk Consultation Quote Checklist Builder
async function openQuoteToolModal() {
    const fullInv = await getFullInventoryList();
    const container = document.getElementById("quote-items-calculator");
    container.innerHTML = "";
    
    fullInv.forEach(item => {
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
    
    // Resolve item names and rates
    let itemsHtml = "";
    
    // Calculate rental span
    const sDate = new Date(evt.start_date);
    const eDate = new Date(evt.end_date);
    const days = evt.rental_days || Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
    
    let itemsListTextForPrint = "";
    let subtotal = 0.0;
    const resolvedItems = evt.resolved_items || [];
    resolvedItems.forEach(item => {
        const cost = item.cost;
        subtotal += cost;
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-glass); padding: 0.25rem 0;">
                <span>${item.name} (${t('pdf_qty')}: ${item.quantity})</span>
                <span>₹${cost.toFixed(2)}</span>
            </div>
        `;
        itemsListTextForPrint += `<tr><td style="border: 1px solid #e5e7eb; padding: 8px;">${item.name}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">${item.quantity}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${item.rate.toFixed(2)}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${cost.toFixed(2)}</td></tr>`;
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
            refreshActiveView();
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
        refreshActiveView();
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
        refreshActiveView();
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
        const successMsg = role === "admin" ? "Manager onboarded successfully!" : "Crew member onboarded successfully!";
        showToast(successMsg);
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
            renderPaginationControls("events-pagination", 0, eventsPage, "loadEventsData", 4);
            return;
        }

        eventsList.forEach(evt => {
            const tr = document.createElement("tr");
            const badgeClass = evt.status === "Completed" ? "badge-completed" :
                               evt.status === "Confirmed" ? "badge-confirmed" :
                               evt.status === "Quote" ? "badge-confirmed" : "badge-draft";
            
            const showRemind = (evt.remaining_balance > 0 && evt.status !== "Cancelled" && evt.status !== "Completed");
            const remindBtn = showRemind ? `
                <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; color: var(--maroon); border-color: var(--maroon);" onclick="sendPaymentReminder('${evt.id}')">✉ Remind</button>
            ` : '';

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
                        ${evt.status === "Quote" ? `
                            <button class="btn-primary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; background: var(--maroon); color: white;" onclick="convertQuoteToInvoice('${evt.id}')">Convert to Invoice</button>
                        ` : `
                            <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Pay</button>
                        `}
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">${t('edit')}</button>
                        ${remindBtn}
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="fetchAndCopyPortalLink('${evt.id}')">🔗 Portal</button>
                        <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("events-pagination", total, eventsPage, "loadEventsData", 4);
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
            renderPaginationControls("clients-pagination", 0, clientsPage, "loadClientsData", 3);
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
        renderPaginationControls("clients-pagination", total, clientsPage, "loadClientsData", 3);
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
                refreshActiveView();
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
            renderPaginationControls("gallery-pagination", 0, galleryPage, "loadGalleryData", 3);
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
        renderPaginationControls("gallery-pagination", total, galleryPage, "loadGalleryData", 3);
    } catch (err) {}
}

async function handleGallerySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("gallery-id").value;
    const title = document.getElementById("gallery-title").value;
    const category = document.getElementById("gallery-category").value;
    const description = document.getElementById("gallery-desc").value;
    const event_id = document.getElementById("gallery-event-id").value;
    
    const saveBtn = document.getElementById("btn-gallery-save") || e.target.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.disabled = true;
    
    if (id) {
        const image_url = document.getElementById("gallery-url").value;
        try {
            await apiFetch(`/api/gallery/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, image_url, event_id })
            });
            showToast("Gallery item details updated.");
            closeModal("modal-gallery");
            refreshActiveView();
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
            formData.append("event_id", event_id);
            formData.append("file", compressedFile, file.name);
            
            await apiFetch("/api/gallery", {
                method: "POST",
                body: formData
            });
            showToast("Portfolio image uploaded successfully.");
            closeModal("modal-gallery");
            refreshActiveView();
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
    populateGalleryEventSelector(photo.event_id || "");
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
                refreshActiveView();
            } catch (err) {}
        }
    );
}

async function populateGalleryEventSelector(selectedEventId = "") {
    const sel = document.getElementById("gallery-event-id");
    if (!sel) return;
    try {
        const data = await apiFetch("/api/events?limit=1000");
        const events = data.items || data || [];
        sel.innerHTML = `<option value="">— Not associated with any event —</option>` + 
            events.map(ev => `<option value="${ev.id}">${ev.client_name || "Unknown"} — ${ev.start_date || ""}</option>`).join("");
        sel.value = selectedEventId;
    } catch (err) {
        console.warn("Could not load events for gallery selector:", err);
    }
}
window.populateGalleryEventSelector = populateGalleryEventSelector;

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
            renderPaginationControls("crew-pagination", 0, crewPage, "loadCrewData", 3);
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
        renderPaginationControls("crew-pagination", total, crewPage, "loadCrewData", 3);
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
        refreshActiveView();
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
                refreshActiveView();
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
        
        refreshActiveView();
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
    
    // Remove duplicate ID on the clone
    printArea.removeAttribute("id");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        showToast("Popup blocked! Please allow popups to view/print.", "error");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Payout Receipt - ${member.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  body { font-family: 'Poppins', Arial, sans-serif; color: #333; background: #fff; padding: 40px; }
  h1,h2,h3,h4 { font-family: 'Marcellus', Georgia, serif; font-weight: 400; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  ${printArea.outerHTML}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => { window.close(); }, 500);
    };
  <\/script>
</body>
</html>
    `);
    printWindow.document.close();
    showToast("Payout receipt printed/exported.", "success");
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

            // Update SVG Bar charts dynamically
            const salesVal = stats.total_sales || 0.0;
            const wagesVal = stats.total_wages || 0.0;
            const netProfitVal = stats.net_profit || 0.0;
            const marginPercentage = stats.net_margin_percentage || 0.0;

            const maxVal = Math.max(salesVal, wagesVal, Math.abs(netProfitVal), 1.0);
            
            const setBarHeight = (id, val) => {
                const bar = document.getElementById(id);
                if (bar) {
                    const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
                    bar.style.height = `${pct}%`;
                    bar.innerText = val > 0 ? `₹${Math.round(val / 1000)}k` : `₹0`;
                }
            };
            setBarHeight("chart-bar-sales", salesVal);
            setBarHeight("chart-bar-wages", wagesVal);
            setBarHeight("chart-bar-profit", Math.max(0, netProfitVal));

            // Update Margin Radial Gauge Chart
            const gaugeCircle = document.getElementById("margin-gauge-circle");
            const gaugeText = document.getElementById("margin-gauge-text");
            if (gaugeCircle && gaugeText) {
                const roundedMargin = Math.round(marginPercentage);
                gaugeText.innerText = `${roundedMargin}%`;
                const dashPct = Math.min(100, Math.max(0, roundedMargin));
                gaugeCircle.setAttribute("stroke-dasharray", `${dashPct}, 100`);
                if (roundedMargin < 0) {
                    gaugeCircle.setAttribute("stroke", "#e53e3e");
                } else if (roundedMargin < 20) {
                    gaugeCircle.setAttribute("stroke", "#dd6b20");
                } else {
                    gaugeCircle.setAttribute("stroke", "#10b981");
                }
            }
        }

        const tbody = document.getElementById("finance-table-body");
        tbody.innerHTML = "";

        if (eventsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No transactions found.</td></tr>`;
            renderPaginationControls("finance-pagination", 0, financePage, "loadFinanceData", 3);
            return;
        }

        eventsList.forEach(evt => {
            const tr = document.createElement("tr");
            const pStatus = evt.payment_status || "Unpaid";
            const badgeClass = pStatus === "Fully Paid" ? "badge-completed" :
                               pStatus === "Partially Paid" ? "badge-confirmed" : "badge-draft";
            
            const showRemind = (evt.remaining_balance > 0 && evt.status !== "Cancelled" && evt.status !== "Completed");
            const remindBtn = showRemind ? `
                <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; color: var(--maroon); border-color: var(--maroon);" onclick="sendPaymentReminder('${evt.id}')">✉ Remind</button>
            ` : '';

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
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Payout</button>
                        ${remindBtn}
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="fetchAndCopyPortalLink('${evt.id}')">🔗 Portal</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("finance-pagination", total, financePage, "loadFinanceData", 3);
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
            renderPaginationControls("invoice-pagination", 0, invoicePage, "loadInvoicesData", 4);
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
            
            const showRemind = (balance > 0 && evt.status !== "Cancelled" && evt.status !== "Completed");
            const remindBtn = showRemind ? `
                <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; color: var(--maroon); border-color: var(--maroon);" onclick="sendPaymentReminder('${evt.id}')">✉ Remind</button>
            ` : '';

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
                        ${remindBtn}
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="fetchAndCopyPortalLink('${evt.id}')">🔗 Portal</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("invoice-pagination", total, invoicePage, "loadInvoicesData", 4);
    } catch (err) {
        console.error("Failed to load invoices data:", err);
    }
}

async function exportInvoiceToPDF(eventId) {
    try {
        showToast("Fetching invoice data...");

        const evt = await apiFetch(`/api/events/${eventId}`);
        if (!evt) { showToast("Failed to fetch event invoice details", "error"); return; }

        if (clientsList.length === 0) {
            clientsList = await apiFetch("/api/clients");
        }
        const client = clientsList.find(c => c.id === evt.client_id) || {};

        const compName    = localStorage.getItem("settings_company_name")    || "Bhoomi Decoration";
        const compEmail   = localStorage.getItem("settings_company_email")   || "hello@bhoomidecoration.com";
        const compPhone   = localStorage.getItem("settings_company_phone")   || "+91 99999 99999";
        const compWebsite = localStorage.getItem("settings_company_website") || "www.bhoomidecoration.com";
        const compAddress = localStorage.getItem("settings_company_address") || "Mumbai, Maharashtra, India";

        const days = evt.rental_days || Math.max(1, Math.round((new Date(evt.end_date) - new Date(evt.start_date)) / (1000 * 60 * 60 * 24)) + 1);

        // Use server-resolved items (backend pre-joins inventory names & costs)
        const resolvedItems = evt.resolved_items || [];

        // Build items rows HTML
        let itemRowsHTML = "";
        let subtotal = 0.0;

        resolvedItems.forEach((item, idx) => {
            subtotal += item.cost;
            const bg = idx % 2 === 0 ? "#ffffff" : "#fdfaf7";
            itemRowsHTML += `
                <tr style="background:${bg};">
                    <td style="padding:9px 12px;border-bottom:1px solid #eee;"><strong>${item.name}</strong></td>
                    <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:center;color:#666;">${item.category}</td>
                    <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:600;">${item.quantity}</td>
                    <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right;color:#666;">₹${item.rate.toFixed(2)}/day</td>
                    <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#6b1623;">₹${item.cost.toFixed(2)}</td>
                </tr>`;
        });

        if (resolvedItems.length === 0) {
            itemRowsHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No reserved catalog items found.</td></tr>`;
        }


        const discount     = evt.discount || 0.0;
        const taxRate      = evt.tax_rate  || 0.0;
        const invoiceTotal = evt.total_invoice_amount || 0.0;
        const amtPaid      = evt.amount_paid          || 0.0;
        const balance      = evt.remaining_balance    || 0.0;

        const invoiceDate  = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

        // ── Build complete self-contained HTML string ──────────────────────────
        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', Arial, sans-serif; color: #333; background: #fff; padding: 30px; }
  h1,h2,h3,h4 { font-family: 'Marcellus', Georgia, serif; font-weight: 400; }
</style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #6b1623;padding-bottom:18px;margin-bottom:24px;">
    <div>
      <h1 style="color:#6b1623;margin:0 0 4px;font-size:1.9rem;letter-spacing:2px;">${compName.toUpperCase()}</h1>
      <p style="font-style:italic;font-size:0.95rem;color:#c9941f;margin:0 0 6px;">Luxury Event &amp; Wedding Decorators</p>
      <p style="margin:0;font-size:0.75rem;color:#666;line-height:1.5;">${compAddress}<br>${compEmail} &nbsp;|&nbsp; ${compPhone} &nbsp;|&nbsp; ${compWebsite}</p>
    </div>
    <div style="text-align:right;">
      <h2 style="color:#333;margin:0 0 8px;font-size:1.5rem;letter-spacing:1px;">INVOICE</h2>
      <p style="margin:0 0 4px;font-size:0.85rem;font-weight:600;">Invoice No: <span style="color:#6b1623;">#${evt.id.slice(-8).toUpperCase()}</span></p>
      <p style="margin:0;font-size:0.8rem;color:#666;">Date: ${invoiceDate}</p>
    </div>
  </div>

  <!-- Client & Event Grid -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:26px;">
    <div style="background:#fdfaf7;border-left:3px solid #c9941f;padding:13px 15px;border-radius:4px;">
      <h3 style="color:#6b1623;font-size:0.85rem;margin:0 0 8px;letter-spacing:0.5px;">BILLED TO:</h3>
      <p style="margin:0 0 3px;font-size:0.88rem;font-weight:600;">${client.name || evt.client_name || "N/A"}</p>
      <p style="margin:0 0 3px;font-size:0.78rem;color:#555;">${client.email || "—"}</p>
      <p style="margin:0 0 3px;font-size:0.78rem;color:#555;">${client.phone || "—"}</p>
      <p style="margin:0;font-size:0.78rem;color:#555;line-height:1.4;">${client.address || evt.venue_address || "—"}</p>
    </div>
    <div style="background:#fdfaf7;border-left:3px solid #6b1623;padding:13px 15px;border-radius:4px;">
      <h3 style="color:#6b1623;font-size:0.85rem;margin:0 0 8px;letter-spacing:0.5px;">EVENT DETAILS:</h3>
      <p style="margin:0 0 3px;font-size:0.82rem;"><strong>Venue:</strong> ${evt.venue_address || "—"}</p>
      <p style="margin:0 0 3px;font-size:0.82rem;"><strong>Setup Start:</strong> ${evt.start_date || "—"}</p>
      <p style="margin:0;font-size:0.82rem;"><strong>Cleanup By:</strong> ${evt.end_date || "—"}</p>
      <p style="margin:0;font-size:0.82rem;"><strong>Rental Days:</strong> ${days}</p>
    </div>
  </div>

  <!-- Items Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:26px;font-size:0.82rem;text-align:left;">
    <thead>
      <tr style="background:#6b1623;color:#fff;">
        <th style="padding:10px 12px;font-family:'Marcellus',serif;font-weight:500;">Reserved Item</th>
        <th style="padding:10px 12px;font-family:'Marcellus',serif;font-weight:500;text-align:center;">Category</th>
        <th style="padding:10px 12px;font-family:'Marcellus',serif;font-weight:500;text-align:center;">Qty</th>
        <th style="padding:10px 12px;font-family:'Marcellus',serif;font-weight:500;text-align:right;">Day Rate</th>
        <th style="padding:10px 12px;font-family:'Marcellus',serif;font-weight:500;text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRowsHTML}</tbody>
  </table>

  <!-- Summary -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
    <div style="flex:1;max-width:52%;">
      <h4 style="color:#6b1623;font-size:0.82rem;margin:0 0 8px;">TERMS &amp; CONDITIONS</h4>
      <p style="margin:0;font-size:0.7rem;color:#777;line-height:1.5;">
        1. All reservation items are rental assets of Bhoomi Decoration.<br>
        2. Payments should be made within agreed milestone dates.<br>
        3. Any damage to physical property is subject to replacement charges.
      </p>
    </div>
    <div style="width:240px;">
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;color:#555;">
        <span>Rental Subtotal:</span><span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;color:#c00;">
        <span>Discount:</span><span>-₹${discount.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;color:#555;border-bottom:1px solid #ddd;padding-bottom:5px;">
        <span>Tax (${taxRate.toFixed(1)}%):</span><span>₹${(invoiceTotal - (invoiceTotal / (1 + taxRate / 100)) || 0).toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.95rem;font-weight:700;margin-bottom:5px;color:#6b1623;">
        <span>Invoice Total:</span><span>₹${invoiceTotal.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;color:#059669;">
        <span>Amount Paid:</span><span>₹${amtPaid.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.95rem;font-weight:700;border-top:2px double #6b1623;padding-top:5px;color:#c62828;">
        <span>Balance Due:</span><span>₹${balance.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- Signature Lines -->
  <div style="margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end;padding-top:14px;border-top:1px dashed #ddd;">
    <div style="text-align:center;">
      <div style="width:180px;border-bottom:1px solid #888;margin-bottom:4px;"></div>
      <p style="margin:0;font-size:0.72rem;color:#666;font-weight:600;">Authorized Signatory</p>
    </div>
    <div style="text-align:center;">
      <div style="width:180px;border-bottom:1px solid #888;margin-bottom:4px;"></div>
      <p style="margin:0;font-size:0.72rem;color:#666;font-weight:600;">Client Signature</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top:24px;text-align:center;padding-top:12px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:0.7rem;color:#aaa;">Thank you for choosing ${compName} for your celebration!</p>
  </div>
</body>
</html>`;

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            showToast("Popup blocked! Please allow popups to view/print.", "error");
            return;
        }

        const printHtmlWithScript = invoiceHTML.replace("</style>", `
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  @media print {
    body { padding: 0; }
  }
</style>`).replace("</body>", `
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => { window.close(); }, 500);
    };
  <\/script>
</body>`);

        printWindow.document.write(printHtmlWithScript);
        printWindow.document.close();
        showToast("Invoice printed/exported.", "success");

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
        refreshActiveView();

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

    // Remove duplicate ID on the clone
    printArea.removeAttribute("id");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        showToast("Popup blocked! Please allow popups to view/print.", "error");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice - ${eventId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  body { font-family: 'Poppins', Arial, sans-serif; color: #333; background: #fff; padding: 40px; }
  h1,h2,h3,h4 { font-family: 'Marcellus', Georgia, serif; font-weight: 400; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  ${printArea.outerHTML}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => { window.close(); }, 500);
    };
  <\/script>
</body>
</html>
    `);
    printWindow.document.close();
    showToast("PDF invoice printed/exported.", "success");
}

// ─── Bind Event Listeners ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Load theme from Appwrite DB settings on startup
    apiFetch("/api/admin/settings").then(s => applyTheme(s && s.theme ? s.theme : "crimson_red")).catch(() => applyTheme("crimson_red"));

    // 1. Navigation Button Actions (Hash SPA Router)
    document.getElementById("nav-btn-dashboard").addEventListener("click", () => window.location.hash = "dashboard");
    document.getElementById("nav-btn-events").addEventListener("click", () => window.location.hash = "events");
    document.getElementById("nav-btn-warehouse").addEventListener("click", () => window.location.hash = "warehouse");
    document.getElementById("nav-btn-clients").addEventListener("click", () => window.location.hash = "clients");
    document.getElementById("nav-btn-kanban").addEventListener("click", () => window.location.hash = "kanban");
    document.getElementById("nav-btn-callbacks").addEventListener("click", () => window.location.hash = "callbacks");
    document.getElementById("nav-btn-gallery").addEventListener("click", () => window.location.hash = "gallery");
    document.getElementById("nav-btn-crew").addEventListener("click", () => window.location.hash = "crew");
    document.getElementById("nav-btn-finance").addEventListener("click", () => window.location.hash = "finance");
    document.getElementById("nav-btn-invoice").addEventListener("click", () => window.location.hash = "invoice");
    document.getElementById("nav-btn-testimonials").addEventListener("click", () => window.location.hash = "testimonials");
    document.getElementById("nav-btn-analytics")?.addEventListener("click", () => window.location.hash = "analytics");
    document.getElementById("nav-btn-calendar")?.addEventListener("click", () => window.location.hash = "calendar");
    document.getElementById("nav-btn-expenses")?.addEventListener("click", () => window.location.hash = "expenses");
    document.getElementById("nav-btn-settings").addEventListener("click", () => window.location.hash = "settings");
    
    // Hash routing listeners
    window.addEventListener("hashchange", handleHashChange);

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
        document.getElementById("booking-progress-stage").value = "0";
        const photosSection = document.getElementById("booking-event-photos-section");
        if (photosSection) photosSection.style.display = "none";
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
            document.getElementById("booking-progress-stage").value = "0";
            const photosSection = document.getElementById("booking-event-photos-section");
            if (photosSection) photosSection.style.display = "none";
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
        populateGalleryEventSelector("");
        openModal("modal-gallery");
    });

    document.getElementById("btn-add-crew-member").addEventListener("click", () => {
        document.getElementById("crew-modal-title").innerText = "Create Team Profile";
        document.getElementById("crew-id").value = "";
        document.getElementById("crew-form").reset();
        openModal("modal-crew");
    });

    document.getElementById("btn-review-payroll").addEventListener("click", openPayrollReleaseModal);
    document.getElementById("btn-export-payroll-pdf").addEventListener("click", exportPayrollPDF);

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
    ["all", "draft", "quote", "confirmed", "completed"].forEach(key => {
        const btn = document.getElementById(`event-status-filter-btn-${key}`);
        if (btn) {
            btn.addEventListener("click", () => {
                currentEventsStatusFilter = key === "all" ? "All" : (key === "quote" ? "Quote" : key.charAt(0).toUpperCase() + key.slice(1));
                eventsPage = 1;
                loadEventsData();
            });
        }
    });

    // Callbacks search bindings
    const callbacksSearchInput = document.getElementById("callbacks-search-input");
    if (callbacksSearchInput) {
        callbacksSearchInput.addEventListener("input", (e) => {
            callbacksSearchQuery = e.target.value;
            callbacksPage = 1;
            loadCallbacksData();
        });
    }

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
async function loadSettingsData() {
    try {
        const s = await apiFetch("/api/admin/settings");
        document.getElementById("settings-default-tax-rate").value = s.default_tax_rate ?? 18;
        document.getElementById("settings-default-discount").value = s.default_discount ?? 0;
        document.getElementById("settings-company-name").value = s.company_name || "Bhoomi Decoration";
        document.getElementById("settings-company-address").value = s.company_address || "Mumbai, Maharashtra, India";
        document.getElementById("settings-company-email").value = s.company_email || "hello@bhoomidecoration.com";
        document.getElementById("settings-company-phone").value = s.company_phone || "+91 99999 99999";
        document.getElementById("settings-company-website").value = s.company_website || "www.bhoomidecoration.com";
        document.getElementById("settings-smtp-host").value = s.smtp_host || "smtp.gmail.com";
        document.getElementById("settings-smtp-port").value = s.smtp_port || 587;
        document.getElementById("settings-smtp-user").value = s.smtp_user || "";
        document.getElementById("settings-smtp-pass").value = s.smtp_pass || "";
        document.getElementById("settings-email-subject").value = s.email_subject || "Bhoomi Decoration Event Portal & Invoice — {client_name}";
        document.getElementById("settings-email-body").value = s.email_body || "";
        const confirmSubj = document.getElementById("settings-confirm-email-subject");
        const confirmBody = document.getElementById("settings-confirm-email-body");
        const completedSubj = document.getElementById("settings-completed-email-subject");
        const completedBody = document.getElementById("settings-completed-email-body");
        if (confirmSubj) confirmSubj.value = s.confirm_email_subject || "Event Booking Confirmed — Bhoomi Decoration";
        if (confirmBody) confirmBody.value = s.confirm_email_body || "";
        if (completedSubj) completedSubj.value = s.completed_email_subject || "Thank You from Bhoomi Decoration!";
        if (completedBody) completedBody.value = s.completed_email_body || "";
        document.getElementById("settings-theme").value = s.theme || "crimson_red";
        const enableAutoEmailsInput = document.getElementById("settings-enable-auto-emails");
        if (enableAutoEmailsInput) {
            enableAutoEmailsInput.checked = s.enable_auto_emails !== false;
        }
        applyTheme(s.theme || "crimson_red");
    } catch (err) {
        console.error("Failed to load settings from DB:", err);
        showToast("Could not load settings from database.", "error");
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();

    const payload = {
        default_tax_rate: parseFloat(document.getElementById("settings-default-tax-rate").value) || 18,
        default_discount: parseFloat(document.getElementById("settings-default-discount").value) || 0,

        company_name: document.getElementById("settings-company-name").value,
        company_address: document.getElementById("settings-company-address").value,
        company_email: document.getElementById("settings-company-email").value,
        company_phone: document.getElementById("settings-company-phone").value,
        company_website: document.getElementById("settings-company-website").value,

        smtp_host: document.getElementById("settings-smtp-host").value,
        smtp_port: parseInt(document.getElementById("settings-smtp-port").value) || 587,
        smtp_user: document.getElementById("settings-smtp-user").value,
        smtp_pass: document.getElementById("settings-smtp-pass").value,

        email_subject: document.getElementById("settings-email-subject").value,
        email_body: document.getElementById("settings-email-body").value,

        confirm_email_subject: document.getElementById("settings-confirm-email-subject").value,
        confirm_email_body: document.getElementById("settings-confirm-email-body").value,

        completed_email_subject: document.getElementById("settings-completed-email-subject").value,
        completed_email_body: document.getElementById("settings-completed-email-body").value,

        theme: document.getElementById("settings-theme").value,
        enable_auto_emails: document.getElementById("settings-enable-auto-emails") ? document.getElementById("settings-enable-auto-emails").checked : true
    };

    try {
        await apiFetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        applyTheme(payload.theme);
        showToast("\u2705 Settings saved to database successfully.");
    } catch (err) {
        console.error("Failed to save settings:", err);
        showToast("Failed to save settings. Please try again.", "error");
    }
}

function applyTheme(theme) {
    theme = theme || "crimson_red";
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

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        showToast("Popup blocked! Please allow popups to view/print.", "error");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  body { font-family: 'Poppins', Arial, sans-serif; color: #333; background: #fff; padding: 20px; }
  h1,h2,h3,h4 { font-family: 'Marcellus', Georgia, serif; font-weight: 400; }
  @page {
    size: landscape;
  }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  ${pdfHTML}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => { window.close(); }, 500);
    };
  <\/script>
</body>
</html>
    `);
    printWindow.document.close();
    showToast(`Data printed/exported successfully — ${rows.length} records.`, "success");
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

        let client = {};
        if (evt.client_id) {
            try {
                client = await apiFetch(`/api/clients/${evt.client_id}`) || {};
            } catch (err) {
                console.error("Failed to fetch client details:", err);
            }
        }
        const resolvedEmail = client.email || evt.client_email || "";
        const resolvedPhone = client.phone || evt.client_phone || "";

        const sDate = new Date(evt.start_date);
        const eDate = new Date(evt.end_date);
        const days = evt.rental_days || Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

        let itemsHtml = "";
        let itemsCount = 0;
        let subtotal = 0;
        const resolvedItems = evt.resolved_items || [];
        resolvedItems.forEach(item => {
            const total = item.cost;
            subtotal += total;
            itemsCount += item.quantity;
            itemsHtml += `
                <tr>
                    <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.category}</small></td>
                    <td>${item.quantity}</td>
                    <td>₹${item.rate.toFixed(2)}</td>
                    <td style="text-align:right;">₹${total.toFixed(2)}</td>
                </tr>
            `;
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

        const showRemindInModal = (evt.remaining_balance > 0 && evt.status !== "Cancelled" && evt.status !== "Completed");
        const remindBtnInModal = showRemindInModal ? `
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;border-color:var(--maroon);color:var(--maroon);background:transparent;cursor:pointer;" onclick="sendPaymentReminder('${evt.id}')">✉️ Send Payment Reminder</button>
        ` : '';

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

                <div class="glass-panel" style="padding:1rem;margin-top:1rem;display:flex;justify-content:space-between;align-items:center;background:rgba(201,148,31,0.05);border:1px solid rgba(201,148,31,0.2);">
                    <div style="flex:1;min-width:0;margin-right:1rem;">
                        <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.25rem 0;">Client Self-Service Portal</h4>
                        <p style="margin:0;font-size:0.8rem;color:var(--text-secondary);word-break:break-all;font-family:monospace;">${window.location.origin}/portal/${evt.portal_token || ''}</p>
                    </div>
                    <button class="btn-primary" style="padding:0.4rem 0.8rem;font-size:0.8rem;background:var(--maroon);color:white;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;" onclick="copyPortalLink('${evt.portal_token || ''}')">📋 Copy Link</button>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1rem;">
                    <div class="glass-panel" style="padding:1rem;">
                        <h4 style="font-family:'Marcellus',serif;color:var(--maroon);margin:0 0 0.5rem 0;">Client Profile</h4>
                        <p style="margin:0 0 0.25rem 0;font-weight:600;">${client.name || evt.client_name || 'N/A'}</p>
                        <p style="margin:0 0 0.25rem 0;font-size:0.85rem;color:var(--text-secondary);">${resolvedEmail || 'N/A'}</p>
                        <p style="margin:0 0 0.25rem 0;font-size:0.85rem;color:var(--text-secondary);">${resolvedPhone || 'N/A'}</p>
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

                <div class="glass-panel" style="padding:1rem;margin-top:1rem;display:flex;gap:1rem;justify-content:center;align-items:center;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);flex-wrap:wrap;">
                    <h5 style="margin:0;font-family:'Marcellus',serif;color:var(--maroon);font-size:0.9rem;">Dispatch Invoice:</h5>
                    <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;border-color:#25d366;color:#25d366;background:transparent;cursor:pointer;" onclick="dispatchWhatsAppInvoice('${evt.client_name || ''}', '${evt.start_date || ''}', '${evt.remaining_balance || 0}', '${evt.portal_token || ''}', '${resolvedPhone}')">💬 Send to WhatsApp</button>
                    <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.8rem;border-color:var(--maroon);color:var(--maroon);background:transparent;cursor:pointer;" onclick="dispatchEmailInvoice('${evt.client_name || ''}', '${evt.portal_token || ''}', '${evt.total_invoice_amount || 0}', '${evt.amount_paid || 0}', '${evt.remaining_balance || 0}', '${resolvedEmail}')">✉️ Send to Email</button>
                    ${remindBtnInModal}
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

function dispatchWhatsAppInvoice(clientName, startDate, remainingBalance, portalToken, phone) {
    const portalUrl = `${window.location.origin}/portal/${portalToken}`;
    const message = `Hi ${clientName}, here is the link to your Bhoomi Decoration Event Portal for your wedding starting on ${startDate}: ${portalUrl}\n\nOutstanding balance: ₹${remainingBalance}.\n\nBest regards,\nBhoomi Decoration Team`;
    const encodedMsg = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, "");
    const waPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const url = `https://wa.me/${waPhone || '919876543210'}?text=${encodedMsg}`;
    window.open(url, "_blank");
}
window.dispatchWhatsAppInvoice = dispatchWhatsAppInvoice;

async function dispatchEmailInvoice(clientName, portalToken, total, paid, remaining, email) {
    if (!email || !email.trim()) {
        showToast("Client email address is missing. Please add an email to the client record first.", "error");
        return;
    }
    let settings;
    try {
        settings = await apiFetch("/api/admin/settings") || {};
    } catch (err) {
        console.error("Error fetching settings:", err);
        showToast("Error retrieving settings from server.", "error");
        return;
    }

    const smtpHost = settings.smtp_host || "smtp.gmail.com";
    const smtpPort = parseInt(settings.smtp_port || "587");
    const smtpUser = settings.smtp_user || "";
    const smtpPass = settings.smtp_pass || "";

    const portalUrl = `${window.location.origin}/portal/${portalToken}`;
    const subjectTemplate = settings.email_subject || "Bhoomi Decoration Event Portal & Invoice — {client_name}";
    const bodyTemplate = settings.email_body || "Hi {client_name},\n\nThank you for choosing Bhoomi Decoration.\n\nHere is your Bhoomi Decoration Event Portal link to track payments, designs and invoices:\n{portal_url}\n\nInvoice Details:\n- Invoice Total: ₹{total}\n- Amount Paid: ₹{paid}\n- Remaining Balance: ₹{remaining}\n\nBest regards,\nBhoomi Decoration Team";

    function fillTemplate(text) {
        return text
            .replaceAll("{client_name}", clientName)
            .replaceAll("{portal_url}", portalUrl)
            .replaceAll("{total}", total)
            .replaceAll("{paid}", paid)
            .replaceAll("{remaining}", remaining);
    }

    const subject = fillTemplate(subjectTemplate);
    const body = fillTemplate(bodyTemplate);

    if (!smtpUser || !smtpPass) {
        showToast("SMTP credentials not configured in settings. Falling back to local mail client...", "warning");
        const mailtoUrl = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        return;
    }

    showToast("Sending dispatch email via SMTP server...", "info");
    try {
        const res = await apiFetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to_email: email,
                subject: subject,
                body: body
            })
        });
        showToast("Invoice email successfully dispatched via SMTP!", "success");
    } catch (err) {
        console.error(err);
        showToast("Error dispatching email: " + err.message, "error");
    }
}
window.dispatchEmailInvoice = dispatchEmailInvoice;

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
window.loadKanbanData = loadKanbanData;
window.allowDrop = allowDrop;
window.handleDrop = handleDrop;
window.loadCallbacksData = loadCallbacksData;
window.markCallbackContacted = markCallbackContacted;
window.convertQuoteToInvoice = convertQuoteToInvoice;
window.openItemAvailabilityCalendar = openItemAvailabilityCalendar;
window.renderItemCalendar = renderItemCalendar;
window.changeCalendarMonth = changeCalendarMonth;
window.handleHashChange = handleHashChange;
window.openPayrollReleaseModal = openPayrollReleaseModal;
window.exportPayrollPDF = exportPayrollPDF;

// ─── Hash Router ────────────────────────────────────────────────────────────
const HASH_VIEW_MAP = {
    "#dashboard": "dashboard-view",
    "#events": "events-view",
    "#warehouse": "warehouse-view",
    "#clients": "clients-view",
    "#kanban": "kanban-view",
    "#callbacks": "callbacks-view",
    "#gallery": "gallery-view",
    "#crew": "crew-view",
    "#finance": "finance-view",
    "#invoice": "invoice-view",
    "#testimonials": "testimonials-subview",
    "#analytics": "analytics-subview",
    "#calendar": "calendar-subview",
    "#expenses": "expenses-subview",
    "#settings": "settings-view"
};

function handleHashChange() {
    const hash = window.location.hash || "#dashboard";
    const targetViewId = HASH_VIEW_MAP[hash];
    if (targetViewId) {
        switchView(targetViewId);
    }
}

// ─── Kanban Drag & Drop ──────────────────────────────────────────────────────
async function loadKanbanData() {
    try {
        const res = await apiFetch("/api/events?limit=1000");
        const events = res.items || res || [];
        
        const cols = ["Quote", "Draft", "Confirmed", "Completed"];
        cols.forEach(col => {
            const container = document.getElementById(`cards-kanban-${col}`);
            const countEl = document.getElementById(`count-kanban-${col}`);
            if (container) container.innerHTML = "";
            if (countEl) countEl.innerText = "0";
        });
        
        const counts = { Quote: 0, Draft: 0, Confirmed: 0, Completed: 0 };
        
        events.forEach(evt => {
            const col = evt.status || "Draft";
            if (!cols.includes(col)) return;
            
            counts[col]++;
            const container = document.getElementById(`cards-kanban-${col}`);
            if (container) {
                const card = document.createElement("div");
                card.className = "kanban-card";
                card.draggable = true;
                card.id = `kanban-evt-${evt.id}`;
                card.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", evt.id);
                });
                
                card.innerHTML = `
                    <div class="kanban-card-title">${evt.client_name}</div>
                    <div class="kanban-card-meta">
                        <strong>Venue:</strong> ${evt.venue_address}<br>
                        <strong>Dates:</strong> ${evt.start_date} to ${evt.end_date}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                        <span style="font-size:0.75rem; font-weight:600; color:var(--maroon);">₹${evt.total_invoice_amount.toFixed(0)}</span>
                        <button class="btn-ghost" style="padding:2px 6px; font-size:0.7rem; border:1px solid var(--border-glass);" onclick="openEventDetailsViewModal('${evt.id}')">Details</button>
                    </div>
                `;
                container.appendChild(card);
            }
        });
        
        cols.forEach(col => {
            const countEl = document.getElementById(`count-kanban-${col}`);
            if (countEl) countEl.innerText = counts[col];
        });
    } catch (err) {
        console.error("Failed to load Kanban data:", err);
    }
}

function allowDrop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    column.classList.add("drag-over");
}

async function handleDrop(e, newStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const eventId = e.dataTransfer.getData("text/plain");
    if (!eventId) return;
    
    try {
        const evt = await apiFetch(`/api/events/${eventId}`);
        if (!evt) return;
        
        if (evt.status === newStatus) return;
        
        evt.status = newStatus;
        
        await apiFetch(`/api/events/${eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evt)
        });
        
        showToast(`Event status updated to ${newStatus}`);
        loadKanbanData();
    } catch (err) {
        console.error("Failed to update status on drop:", err);
    }
}

// ─── Callbacks CRM ───────────────────────────────────────────────────────────
async function loadCallbacksData(page) {
    if (page !== undefined) callbacksPage = page;
    try {
        const data = await apiFetch("/api/callbacks");
        callbacksList = data || [];
        
        let filtered = callbacksList;
        if (callbacksSearchQuery.trim() !== "") {
            const sq = callbacksSearchQuery.toLowerCase();
            filtered = callbacksList.filter(cb => 
                (cb.name && cb.name.toLowerCase().includes(sq)) ||
                (cb.phone && cb.phone.includes(sq)) ||
                (cb.venue && cb.venue.toLowerCase().includes(sq)) ||
                (cb.service && cb.service.toLowerCase().includes(sq)) ||
                (cb.message && cb.message.toLowerCase().includes(sq))
            );
        }
        
        const total = filtered.length;
        const startIndex = (callbacksPage - 1) * PAGE_SIZE;
        const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);
        
        const tbody = document.getElementById("callbacks-table-body");
        if (tbody) {
            tbody.innerHTML = "";
            if (paginated.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No callback enquiries found.</td></tr>`;
                renderPaginationControls("callbacks-pagination", 0, callbacksPage, "loadCallbacksData", 3);
                return;
            }
            
            paginated.forEach(cb => {
                const tr = document.createElement("tr");
                const dateStr = cb.date || "N/A";
                const venueStr = cb.venue || "N/A";
                const serviceStr = cb.service || "N/A";
                const messageStr = cb.message || "None";
                const statusStr = cb.status || "Pending";
                
                let badgeClass = "badge-draft";
                if (statusStr === "Contacted") badgeClass = "badge-completed";
                
                let actionBtn = "";
                if (statusStr !== "Contacted") {
                    actionBtn = `<button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="markCallbackContacted('${cb.id}')">${t('callbacks_action_contacted')}</button>`;
                }
                
                tr.innerHTML = `
                    <td><strong>${cb.name}</strong></td>
                    <td><a href="tel:${cb.phone}" style="color: var(--maroon); text-decoration: none;">${cb.phone}</a></td>
                    <td>${dateStr}</td>
                    <td>${venueStr}</td>
                    <td><span class="badge" style="background: rgba(107,22,35,0.05); color: var(--maroon);">${serviceStr}</span></td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${messageStr}">${messageStr}</td>
                    <td><span class="badge ${badgeClass}">${statusStr}</span></td>
                    <td>${actionBtn}</td>
                `;
                tbody.appendChild(tr);
            });
            renderPaginationControls("callbacks-pagination", total, callbacksPage, "loadCallbacksData", 3);
        }
    } catch (err) {
        console.error("Failed to load callbacks:", err);
    }
}

async function markCallbackContacted(cbId) {
    try {
        await apiFetch(`/api/callbacks/${cbId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Contacted" })
        });
        showToast("Callback marked as contacted.");
        loadCallbacksData();
    } catch (err) {
        console.error("Failed to mark callback contacted:", err);
    }
}

// ─── Quote to Invoice Converter ──────────────────────────────────────────────
async function convertQuoteToInvoice(eventId) {
    showConfirmation(
        "Convert Quote to Invoice",
        "Are you sure you want to convert this Quote into a Confirmed Event Booking Invoice?",
        async () => {
            try {
                const quote = await apiFetch(`/api/events/${eventId}`);
                if (!quote) {
                    showToast("Failed to fetch quote details.", "error");
                    return;
                }
                quote.status = "Confirmed";
                await apiFetch(`/api/events/${eventId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(quote)
                });
                showToast("Quote successfully converted to Confirmed Event Invoice!");
                loadEventsData();
                loadDashboardData();
            } catch (err) {
                console.error("Failed to convert quote:", err);
            }
        }
    );
}

// ─── Calendar Availability Widget ───────────────────────────────────────────
let currentCalendarItemId = null;
let currentCalendarDate = new Date();

async function openItemAvailabilityCalendar(itemId) {
    const item = inventoryList.find(i => i.id === itemId);
    if (!item) return;
    
    currentCalendarItemId = itemId;
    document.getElementById("availability-item-name").innerText = item.name;
    
    openModal("modal-item-availability");
    renderItemCalendar();
}

async function renderItemCalendar() {
    const grid = document.getElementById("availability-calendar-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach(day => {
        const h = document.createElement("div");
        h.className = "calendar-day-header";
        h.innerText = day;
        grid.appendChild(h);
    });
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("calendar-month-year").innerText = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        grid.appendChild(emptyCell);
    }
    
    let allEvts = [];
    try {
        const res = await apiFetch("/api/events?limit=1000");
        allEvts = res.items || res || [];
    } catch (e) {
        console.error("Failed to fetch events for calendar:", e);
    }
    
    const bookedDates = new Set();
    
    allEvts.forEach(evt => {
        if (evt.status === "Cancelled" || evt.status === "Quote") return;
        
        let booked = {};
        try {
            booked = JSON.parse(evt.items_booked || "{}");
        } catch (e) {}
        
        if (booked[currentCalendarItemId]) {
            const start = new Date(evt.start_date);
            const end = new Date(evt.end_date);
            let current = new Date(start);
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                bookedDates.add(dateStr);
                current.setDate(current.getDate() + 1);
            }
        }
    });
    
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.innerText = day;
        
        const currentMonthStr = String(month + 1).padStart(2, "0");
        const currentDayStr = String(day).padStart(2, "0");
        const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;
        
        if (bookedDates.has(dateStr)) {
            cell.classList.add("booked");
            cell.title = "Reserved/Booked";
        } else {
            cell.classList.add("available");
            cell.title = "Available";
        }
        
        grid.appendChild(cell);
    }
}

function changeCalendarMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderItemCalendar();
}

// ─── Payroll Calculator & Release ───────────────────────────────────────────
async function openPayrollReleaseModal() {
    const tbody = document.getElementById("payroll-release-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading payroll data...</td></tr>`;
    openModal("modal-payroll-release");
    
    try {
        const res = await apiFetch("/api/crew");
        const crew = res.items || res || [];
        tbody.innerHTML = "";
        
        if (crew.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No crew profiles registered.</td></tr>`;
            return;
        }
        
        let totalWages = 0;
        let printHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="background: #6b1623; color: #fff;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Name</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Role</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Days Worked</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Base Rate</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Wages Due</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        crew.forEach(item => {
            const tr = document.createElement("tr");
            const wages = (item.base_rate || 0) * (item.days_worked || 0);
            totalWages += wages;
            
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.role || 'Specialist'}</td>
                <td style="text-align: center;">${item.days_worked || 0}</td>
                <td>₹${(item.base_rate || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 600; color: var(--maroon);">₹${wages.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
            
            printHtml += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.role || 'Specialist'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.days_worked || 0}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(item.base_rate || 0).toFixed(2)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: 600;">₹${wages.toFixed(2)}</td>
                </tr>
            `;
        });
        
        printHtml += `
                    <tr style="font-weight: 700; background: #fafafa;">
                        <td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total Payroll:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #6b1623;">₹${totalWages.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        document.getElementById("print-payroll-body").innerHTML = printHtml;
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--status-danger);">Failed to calculate payroll.</td></tr>`;
    }
}

function exportPayrollPDF() {
    const element = document.getElementById("print-payroll-section");
    if (!element) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        showToast("Popup blocked! Please allow popups to view/print.", "error");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Payroll Export</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }
  body { font-family: 'Poppins', Arial, sans-serif; color: #333; background: #fff; padding: 30px; }
  h1,h2,h3,h4 { font-family: 'Marcellus', Georgia, serif; font-weight: 400; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div style="font-family:'Poppins',sans-serif;color:#333;background:#fff;padding:20px;max-width:800px;margin:0 auto;box-sizing:border-box;">
    ${element.innerHTML}
  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => { window.close(); }, 500);
    };
  <\/script>
</body>
</html>
    `);
    printWindow.document.close();
    showToast("Payroll printed/exported.", "success");
}

function copyPortalLink(token) {
    // Guard against null, undefined, 'null', 'undefined', or empty string
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        showToast("Portal link not ready yet — please refresh the page and try again.", "error");
        return;
    }
    const link = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(link)
        .then(() => { showToast("Portal link copied! Share it with your client.", "success"); })
        .catch(() => showToast("Failed to copy portal link.", "error"));
}
window.copyPortalLink = copyPortalLink;

async function fetchAndCopyPortalLink(eventId) {
    try {
        showToast("Fetching portal link...", "info");
        const res = await apiFetch(`/api/events/${eventId}/portal-link`);
        if (!res || !res.portal_token) {
            showToast("Could not generate portal link.", "error");
            return;
        }
        const link = `${window.location.origin}/portal/${res.portal_token}`;
        await navigator.clipboard.writeText(link);
        showToast("🔗 Portal link copied! Share it with your client.", "success");
    } catch (err) {
        console.error("fetchAndCopyPortalLink error:", err);
        showToast("Failed to get portal link.", "error");
    }
}
window.fetchAndCopyPortalLink = fetchAndCopyPortalLink;

let allInventoryItemsList = [];
async function getFullInventoryList() {
    if (allInventoryItemsList.length === 0) {
        allInventoryItemsList = await apiFetch("/api/inventory");
    }
    return allInventoryItemsList;
}
window.getFullInventoryList = getFullInventoryList;

async function loadTestimonialsData() {
    const tbody = document.getElementById("testimonials-table-body");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:1.2rem;color:var(--text-muted);">Fetching reviews...</td></tr>`;

    try {
        const testimonials = await apiFetch("/api/admin/testimonials");
        tbody.innerHTML = "";
        
        if (!testimonials || testimonials.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No customer reviews submitted yet.</td></tr>`;
            return;
        }

        testimonials.forEach(item => {
            const tr = document.createElement("tr");
            
            const ratingStars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
            const statusBadge = item.approved 
                ? `<span class="badge badge-confirmed" style="background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2);">✓ Approved</span>` 
                : `<span class="badge badge-draft" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);">Pending</span>`;

            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td style="color:#ff9f43;font-size:1.1rem;font-weight:600;">${ratingStars}</td>
                <td><p style="margin:0;max-width:350px;white-space:normal;word-break:break-word;">${item.review}</p></td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="btn btn-ghost" style="padding:4px 8px;font-size:0.75rem;cursor:pointer;" onclick="toggleTestimonialApproval('${item.id}')">
                            ${item.approved ? 'Hide' : 'Approve'}
                        </button>
                        <button class="btn btn-ghost" style="padding:4px 8px;font-size:0.75rem;color:var(--maroon);border-color:var(--maroon);cursor:pointer;" onclick="deleteTestimonial('${item.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Testimonials fetch error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--maroon);">⚠️ Failed to load feedback datasets.</td></tr>`;
    }
}
window.loadTestimonialsData = loadTestimonialsData;

async function toggleTestimonialApproval(id) {
    try {
        await apiFetch(`/api/admin/testimonials/${id}/approve`, { method: "PUT" });
        showToast("Testimonial display status updated!");
        loadTestimonialsData();
    } catch (err) {
        showToast("Error updating testimonial: " + err.message, "error");
    }
}
window.toggleTestimonialApproval = toggleTestimonialApproval;

async function deleteTestimonial(id) {
    if (!confirm("Are you sure you want to permanently delete this feedback review?")) return;
    try {
        await apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
        showToast("Testimonial deleted successfully.");
        loadTestimonialsData();
    } catch (err) {
        showToast("Error deleting feedback: " + err.message, "error");
    }
}
window.deleteTestimonial = deleteTestimonial;


// ═══════════════════════════════════════════════════════════════════════════
// 📊 ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

let revenueChartInstance = null;
let statusChartInstance = null;

async function loadAnalyticsData() {
    try {
        const data = await apiFetch("/api/admin/analytics");
        document.getElementById("kpi-total-revenue").textContent = "₹" + Number(data.total_revenue).toLocaleString("en-IN");
        document.getElementById("kpi-total-events").textContent = data.total_events;
        document.getElementById("kpi-completed").textContent = data.completed_events;
        document.getElementById("kpi-avg-event").textContent = "₹" + Number(data.avg_per_event).toLocaleString("en-IN");

        const revenueCtx = document.getElementById("chart-revenue");
        if (revenueCtx) {
            if (revenueChartInstance) revenueChartInstance.destroy();
            revenueChartInstance = new Chart(revenueCtx, {
                type: "bar",
                data: {
                    labels: Object.keys(data.monthly_revenue),
                    datasets: [{ label: "Revenue (₹)", data: Object.values(data.monthly_revenue), backgroundColor: "rgba(107,22,35,0.7)", borderColor: "#6B1623", borderWidth: 1, borderRadius: 6 }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => "₹" + Number(v).toLocaleString("en-IN") } } } }
            });
        }

        const statusCtx = document.getElementById("chart-status");
        if (statusCtx) {
            if (statusChartInstance) statusChartInstance.destroy();
            const sc = data.status_counts;
            statusChartInstance = new Chart(statusCtx, {
                type: "doughnut",
                data: { labels: Object.keys(sc), datasets: [{ data: Object.values(sc), backgroundColor: ["#94a3b8","#f59e0b","#059669","#6B1623"], borderWidth: 2, borderColor: "#fff" }] },
                options: { responsive: true, plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } } }
            });
        }

        const clientsEl = document.getElementById("analytics-top-clients");
        if (data.top_clients && data.top_clients.length > 0) {
            const maxRev = data.top_clients[0].revenue || 1;
            clientsEl.innerHTML = data.top_clients.map((c, i) => `<div style="margin-bottom:.75rem;"><div style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:3px;"><span style="font-weight:600;">${i+1}. ${c.name}</span><span style="color:var(--maroon);font-weight:600;">₹${Number(c.revenue).toLocaleString("en-IN")}</span></div><div style="background:rgba(107,22,35,.1);border-radius:4px;height:6px;overflow:hidden;"><div style="background:var(--maroon);height:100%;width:${Math.round((c.revenue/maxRev)*100)}%;border-radius:4px;"></div></div></div>`).join("");
        } else { clientsEl.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No event data yet.</p>`; }

        const itemsEl = document.getElementById("analytics-top-items");
        if (data.top_items && data.top_items.length > 0) {
            const maxU = data.top_items[0].usage || 1;
            itemsEl.innerHTML = data.top_items.map((item, i) => `<div style="margin-bottom:.75rem;"><div style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:3px;"><span style="font-weight:600;">${i+1}. ${item.name}</span><span style="color:var(--gold);font-weight:600;">${item.usage}×</span></div><div style="background:rgba(201,148,31,.15);border-radius:4px;height:6px;overflow:hidden;"><div style="background:var(--gold);height:100%;width:${Math.round((item.usage/maxU)*100)}%;border-radius:4px;"></div></div></div>`).join("");
        } else { itemsEl.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No item data yet.</p>`; }

    } catch (err) { showToast("Error loading analytics: " + err.message, "error"); }
}
window.loadAnalyticsData = loadAnalyticsData;


// ═══════════════════════════════════════════════════════════════════════════
// 🗓️ MASTER CALENDAR
// ═══════════════════════════════════════════════════════════════════════════

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let calendarEvents = [];
let calendarOverrides = [];

async function loadCalendarData() {
    try {
        const [evts, overrides] = await Promise.all([apiFetch("/api/events"), apiFetch("/api/admin/availability-overrides")]);
        calendarEvents = evts.items || evts || [];
        calendarOverrides = overrides || [];
        renderCalendar();
        renderBlockedDatesList();
    } catch (err) { showToast("Error loading calendar: " + err.message, "error"); }
}
window.loadCalendarData = loadCalendarData;

function calendarNavMonth(dir) {
    calendarMonth += dir;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
}
window.calendarNavMonth = calendarNavMonth;

function renderCalendar() {
    const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const grid = document.getElementById("calendar-grid");
    const label = document.getElementById("calendar-month-label");
    if (!grid || !label) return;
    label.textContent = `${MONTHS[calendarMonth]} ${calendarYear}`;

    const dateEventMap = {};
    calendarEvents.forEach(ev => {
        if (!ev.start_date) return;
        const start = new Date(ev.start_date), end = ev.end_date ? new Date(ev.end_date) : new Date(ev.start_date);
        let cur = new Date(start);
        while (cur <= end) {
            const key = cur.toISOString().split("T")[0];
            if (!dateEventMap[key]) dateEventMap[key] = [];
            dateEventMap[key].push(ev);
            cur.setDate(cur.getDate() + 1);
        }
    });

    const overrideMap = {};
    calendarOverrides.forEach(ov => { overrideMap[ov.date] = ov; });

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    let html = DAYS.map(d => `<div style="text-align:center;font-size:.72rem;font-weight:600;text-transform:uppercase;color:var(--text-muted);padding:6px 0;">${d}</div>`).join("");
    for (let i = 0; i < firstDay; i++) html += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const eventsOnDay = dateEventMap[dateStr] || [];
        const override = overrideMap[dateStr];
        const isToday = dateStr === today;
        const isBlocked = override && override.blocked;
        let borderColor = isToday ? "var(--gold)" : "rgba(107,22,35,0.12)";
        let bg = "#fff";
        let pillHtml = "", lockHtml = "";

        if (isBlocked) { bg = "rgba(239,68,68,0.08)"; borderColor = "#ef4444"; lockHtml = `<div style="font-size:.65rem;color:#ef4444;">🔒 Blocked</div>`; }
        else if (eventsOnDay.length > 0) {
            const hasConfirmed = eventsOnDay.some(e => e.status === "Confirmed" || e.status === "Completed");
            borderColor = hasConfirmed ? "#059669" : "#f59e0b";
            bg = hasConfirmed ? "rgba(5,150,105,0.08)" : "rgba(245,158,11,0.08)";
            const pillBg = hasConfirmed ? "#059669" : "#f59e0b";
            const pillTxt = hasConfirmed ? "#fff" : "#92400e";
            pillHtml = `<div style="font-size:.65rem;background:${pillBg};color:${pillTxt};border-radius:10px;padding:1px 5px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${eventsOnDay[0].client_name||"Event"}${eventsOnDay.length>1?` +${eventsOnDay.length-1}`:""}</div>`;
        }

        html += `<div onclick="adminToggleDate('${dateStr}')" title="Click to toggle block" style="min-height:72px;border-radius:6px;border:1.5px solid ${borderColor};background:${bg};padding:6px 6px 4px;cursor:pointer;transition:transform .15s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'"><div style="font-size:.82rem;font-weight:${isToday?"700":"500"};color:${isToday?"var(--gold)":"var(--ink)"};">${d}</div>${pillHtml}${lockHtml}</div>`;
    }
    grid.innerHTML = html;
}

async function adminToggleDate(dateStr) {
    const existing = calendarOverrides.find(ov => ov.date === dateStr && ov.blocked);
    try {
        if (existing) {
            await apiFetch(`/api/admin/availability-overrides/${existing.id}`, { method: "DELETE" });
            calendarOverrides = calendarOverrides.filter(ov => ov.id !== existing.id);
            showToast(`${dateStr} unblocked.`);
        } else {
            const hasEvent = calendarEvents.some(ev => { if (!ev.start_date) return false; const s = new Date(ev.start_date), e = ev.end_date ? new Date(ev.end_date) : s, d = new Date(dateStr); return d >= s && d <= e; });
            if (hasEvent) { showToast("This date has a real event — edit the event to change it.", "info"); return; }
            const reason = prompt(`Block ${dateStr}? Enter a reason (optional):`);
            if (reason === null) return;
            const result = await apiFetch("/api/admin/availability-overrides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dateStr, reason: reason || "", blocked: true }) });
            calendarOverrides.push(result.override);
            showToast(`${dateStr} blocked.`);
        }
        renderCalendar();
        renderBlockedDatesList();
    } catch (err) { showToast("Error toggling date: " + err.message, "error"); }
}
window.adminToggleDate = adminToggleDate;

function renderBlockedDatesList() {
    const el = document.getElementById("admin-blocked-dates-list");
    if (!el) return;
    const blocked = calendarOverrides.filter(ov => ov.blocked);
    if (!blocked.length) { el.innerHTML = `<p style="color:var(--text-muted);font-size:.9rem;">No manual blocks set.</p>`; return; }
    el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:.75rem;">` + blocked.sort((a,b) => a.date.localeCompare(b.date)).map(ov => `<div style="display:flex;align-items:center;gap:.5rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:20px;padding:4px 12px;font-size:.82rem;"><span style="color:#ef4444;font-weight:600;">🔒 ${ov.date}</span>${ov.reason?`<span style="color:var(--text-muted);">— ${ov.reason}</span>`:""}<button onclick="adminUnblockDate('${ov.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:.9rem;padding:0 2px;">✕</button></div>`).join("") + `</div>`;
}

async function adminUnblockDate(overrideId) {
    try {
        await apiFetch(`/api/admin/availability-overrides/${overrideId}`, { method: "DELETE" });
        calendarOverrides = calendarOverrides.filter(ov => ov.id !== overrideId);
        showToast("Date unblocked.");
        renderCalendar();
        renderBlockedDatesList();
    } catch (err) { showToast("Error: " + err.message, "error"); }
}
window.adminUnblockDate = adminUnblockDate;


// ═══════════════════════════════════════════════════════════════════════════
// 💸 EXPENSE TRACKER
// ═══════════════════════════════════════════════════════════════════════════

let currentExpenseEventId = null;
let currentExpenseEventInvoice = 0;

async function populateExpenseEventSelector() {
    const sel = document.getElementById("expense-event-selector");
    if (!sel) return;
    try {
        const data = await apiFetch("/api/events");
        const events = data.items || data || [];
        sel.innerHTML = `<option value="">— Choose an event —</option>` + events.map(ev => `<option value="${ev.id}" data-invoice="${ev.total_invoice_amount || 0}">${ev.client_name || "Unknown"} — ${ev.start_date || ""} (${ev.status || ""})</option>`).join("");
    } catch (err) { console.warn("Could not load events:", err); }
}

async function loadExpensesForEvent() {
    const sel = document.getElementById("expense-event-selector");
    if (!sel || !sel.value) {
        currentExpenseEventId = null;
        document.getElementById("expenses-table-body").innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Select an event above.</td></tr>`;
        return;
    }
    const selectedOpt = sel.options[sel.selectedIndex];
    currentExpenseEventId = sel.value;
    currentExpenseEventInvoice = parseFloat(selectedOpt.dataset.invoice || 0);
    try {
        const expenses = await apiFetch(`/api/admin/expenses?event_id=${currentExpenseEventId}`);
        renderExpensesTable(expenses);
        updateProfitSummary(expenses);
        document.getElementById("add-expense-panel").style.display = "";
    } catch (err) { showToast("Error loading expenses: " + err.message, "error"); }
}
window.loadExpensesForEvent = loadExpensesForEvent;

function renderExpensesTable(expenses) {
    const tbody = document.getElementById("expenses-table-body");
    if (!expenses || !expenses.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No expenses logged yet. Add one above.</td></tr>`; return; }
    const ICONS = { Flowers:"🌸", Transport:"🚛", Labor:"👷", Materials:"🪵", Other:"📦" };
    tbody.innerHTML = expenses.map(exp => `<tr><td style="color:var(--text-muted);font-size:.85rem;">${exp.date||"—"}</td><td>${ICONS[exp.category]||"📦"} ${exp.category}</td><td>${exp.description}</td><td style="text-align:right;font-weight:600;color:var(--maroon);">₹${Number(exp.amount).toLocaleString("en-IN")}</td><td><button onclick="deleteExpense('${exp.id}')" class="btn btn-secondary" style="padding:2px 8px;font-size:.78rem;color:#ef4444;border-color:#ef4444;">Delete</button></td></tr>`).join("");
}

function updateProfitSummary(expenses) {
    const totalExp = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const netProfit = currentExpenseEventInvoice - totalExp;
    const margin = currentExpenseEventInvoice > 0 ? ((netProfit / currentExpenseEventInvoice) * 100).toFixed(1) + "%" : "—";
    document.getElementById("ps-invoice").textContent = "₹" + Number(currentExpenseEventInvoice).toLocaleString("en-IN");
    document.getElementById("ps-expenses").textContent = "₹" + Number(totalExp).toLocaleString("en-IN");
    const profEl = document.getElementById("ps-profit");
    profEl.textContent = "₹" + Number(netProfit).toLocaleString("en-IN");
    profEl.style.color = netProfit >= 0 ? "#059669" : "#ef4444";
    document.getElementById("ps-margin").textContent = margin;
    document.getElementById("ps-margin").style.color = netProfit >= 0 ? "#059669" : "#ef4444";
    document.getElementById("profit-summary").style.display = "";
}

async function submitAddExpense(e) {
    e.preventDefault();
    if (!currentExpenseEventId) { showToast("Please select an event first.", "error"); return; }
    const desc = document.getElementById("exp-description").value.trim();
    const category = document.getElementById("exp-category").value;
    const amount = parseFloat(document.getElementById("exp-amount").value);
    if (!desc || isNaN(amount) || amount <= 0) { showToast("Please fill in all fields correctly.", "error"); return; }
    const sel = document.getElementById("expense-event-selector");
    const eventName = sel.options[sel.selectedIndex]?.textContent?.split("—")[0]?.trim() || "";
    try {
        await apiFetch("/api/admin/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: currentExpenseEventId, event_name: eventName, description: desc, category, amount }) });
        document.getElementById("add-expense-form").reset();
        showToast("Expense added.");
        loadExpensesForEvent();
    } catch (err) { showToast("Error adding expense: " + err.message, "error"); }
}
window.submitAddExpense = submitAddExpense;

async function deleteExpense(expId) {
    if (!confirm("Delete this expense?")) return;
    try {
        await apiFetch(`/api/admin/expenses/${expId}`, { method: "DELETE" });
        showToast("Expense deleted.");
        loadExpensesForEvent();
    } catch (err) { showToast("Error: " + err.message, "error"); }
}
window.deleteExpense = deleteExpense;

async function loadBookingEventPhotos(eventId) {
    const grid = document.getElementById("booking-photos-preview-grid");
    if (!grid) return;
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem;">Loading photos...</div>`;
    
    try {
        const photos = await apiFetch(`/api/gallery?event_id=${eventId}`);
        if (photos && photos.length > 0) {
            grid.innerHTML = photos.map(ph => `
                <div style="position: relative; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-glass); height: 60px;">
                    <img src="${ph.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${ph.title}">
                    <button type="button" onclick="deleteBookingEventPhoto('${ph.id}', '${eventId}')" style="position: absolute; top: 2px; right: 2px; background: rgba(220,38,38,0.85); color: white; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">✕</button>
                </div>
            `).join("");
        } else {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem; font-style: italic;">No photos in album.</div>`;
        }
    } catch (err) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--status-danger); font-size: 0.8rem; padding: 0.5rem;">Error loading photos.</div>`;
    }
}
window.loadBookingEventPhotos = loadBookingEventPhotos;

async function uploadBookingEventPhoto() {
    const eventId = document.getElementById("booking-id").value;
    if (!eventId) {
        showToast("Please save the event booking first before uploading photos.", "warning");
        return;
    }
    const fileInput = document.getElementById("booking-photo-file");
    const file = fileInput.files[0];
    if (!file) {
        showToast("Please choose an image file to upload.", "warning");
        return;
    }
    
    const uploadBtn = document.querySelector("#booking-event-photos-section button");
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerText = "Uploading...";
    }
    
    try {
        const compressedFile = await compressImageLocally(file);
        const formData = new FormData();
        formData.append("title", `Photo for Event ${eventId}`);
        formData.append("category", "Custom");
        formData.append("description", `Event photo album upload.`);
        formData.append("event_id", eventId);
        formData.append("file", compressedFile, file.name);
        
        await apiFetch("/api/gallery", {
            method: "POST",
            body: formData
        });
        showToast("Event photo uploaded successfully.", "success");
        fileInput.value = ""; // clear input
        await loadBookingEventPhotos(eventId);
    } catch (err) {
        console.error(err);
        showToast("Failed to upload photo: " + err.message, "error");
    } finally {
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerText = "Upload Photo";
        }
    }
}
window.uploadBookingEventPhoto = uploadBookingEventPhoto;

async function deleteBookingEventPhoto(photoId, eventId) {
    showConfirmation(
        "Delete Photo",
        "Are you sure you want to remove this photo from the event album?",
        async () => {
            try {
                await apiFetch(`/api/gallery/${photoId}`, { method: "DELETE" });
                showToast("Photo removed from event album.");
                await loadBookingEventPhotos(eventId);
            } catch (err) {
                showToast("Failed to delete photo.", "error");
            }
        }
    );
}
window.deleteBookingEventPhoto = deleteBookingEventPhoto;


async function sendPaymentReminder(eventId) {
    if (!confirm("Send a payment reminder email to the client for this booking?")) return;
    try {
        showToast("Fetching booking details...", "info");
        const evt = await apiFetch(`/api/events/${eventId}`);
        if (!evt) {
            showToast("Failed to fetch event details.", "error");
            return;
        }

        let client = {};
        if (evt.client_id) {
            try {
                client = await apiFetch(`/api/clients/${evt.client_id}`) || {};
            } catch (err) {
                console.error("Failed to fetch client details:", err);
            }
        }

        const email = client.email || evt.client_email || "";
        if (!email) {
            showToast("Client email address is missing. Please add an email to the client record first.", "error");
            return;
        }

        let settings = {};
        try {
            settings = await apiFetch("/api/admin/settings") || {};
        } catch (err) {
            console.error("Error fetching settings:", err);
        }

        const smtpUser = settings.smtp_user || "";
        const smtpPass = settings.smtp_pass || "";

        const portalUrl = `${window.location.origin}/portal/${evt.portal_token || ''}`;
        const subjectTemplate = settings.reminder_email_subject || "Payment Reminder — Outstanding Balance for Event at {venue_address}";
        const bodyTemplate = settings.reminder_email_body || "Dear {client_name},\n\nThis is a friendly reminder that there is an outstanding balance of ₹{remaining} due for your upcoming event booking with Bhoomi Decoration.\n\nEvent Details:\n- Event ID: {event_id}\n- Venue: {venue_address}\n- Dates: {start_date} to {end_date}\n\nYou can review your invoice and make payments through your portal link here:\n{portal_url}\n\nThank you,\nBhoomi Decoration Team";

        const clientName = client.name || evt.client_name || "Valued Client";
        const remainingStr = (evt.remaining_balance || 0.0).toFixed(2);
        const venueAddress = evt.venue_address || "N/A";
        const eventIdStr = evt.id || "";
        const startDate = evt.start_date || "";
        const endDate = evt.end_date || "";

        function fillTemplate(text) {
            return text
                .replaceAll("{client_name}", clientName)
                .replaceAll("{portal_url}", portalUrl)
                .replaceAll("{remaining}", remainingStr)
                .replaceAll("{venue_address}", venueAddress)
                .replaceAll("{event_id}", eventIdStr)
                .replaceAll("{start_date}", startDate)
                .replaceAll("{end_date}", endDate);
        }

        const subject = fillTemplate(subjectTemplate);
        const body = fillTemplate(bodyTemplate);

        const openMailtoFallback = () => {
            showToast("Falling back to local mail client...", "warning");
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
        };

        if (!smtpUser || !smtpPass) {
            showToast("SMTP credentials not configured in settings.", "warning");
            openMailtoFallback();
            return;
        }

        showToast("Sending reminder email via SMTP server...", "info");
        try {
            const res = await apiFetch(`/api/events/${eventId}/send-reminder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to_email: email })
            });
            showToast(res.message || "Payment reminder sent successfully.");
        } catch (err) {
            console.error("SMTP sending failed, opening mailto fallback:", err);
            openMailtoFallback();
        }
    } catch (err) {
        console.error("sendPaymentReminder error:", err);
        showToast("Error preparing reminder email: " + err.message, "error");
    }
}
window.sendPaymentReminder = sendPaymentReminder;


async function sendAllPaymentReminders() {
    if (!confirm("Are you sure you want to send payment reminder emails to ALL clients with an outstanding balance?")) return;
    try {
        showToast("Sending reminders in bulk...");
        const res = await apiFetch("/api/finance/send-bulk-reminders", {
            method: "POST"
        });
        showToast(`Reminders sent successfully! Sent: ${res.sent_count}, Skipped: ${res.skipped_count}`);
        loadFinanceData();
        loadInvoicesData();
    } catch (err) {
        showToast("Error: " + err.message, "error");
    }
}
window.sendAllPaymentReminders = sendAllPaymentReminders;

// Nav hooks for the 3 new admin sections
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nav-btn-analytics")?.addEventListener("click", loadAnalyticsData);
    document.getElementById("nav-btn-calendar")?.addEventListener("click", loadCalendarData);
    document.getElementById("nav-btn-expenses")?.addEventListener("click", populateExpenseEventSelector);
});
