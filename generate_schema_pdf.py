import os
import sys
import subprocess

def prepare_libraries():
    print("[*] Checking and installing fpdf2 for PDF compilation...")
    try:
        from fpdf import FPDF
    except ImportError:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
            print("[+] fpdf2 installed successfully.")
        except Exception as e:
            print(f"[!] Error installing fpdf2: {e}")
            sys.exit(1)

prepare_libraries()
from fpdf import FPDF

class SchemaPDF(FPDF):
    def header(self):
        # Document title styling (Bhoomi Maroon color: RGB 107, 22, 35)
        self.set_font('helvetica', 'B', 16)
        self.set_text_color(107, 22, 35)
        self.cell(0, 10, 'BHOOMI DECORATION - DATABASE SCHEMA GUIDE', ln=True, align='C')
        
        # Subtitle
        self.set_font('helvetica', 'I', 10)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, 'Appwrite Database & Collection Parameters Definition (bhoomi_db)', ln=True, align='C')
        
        # Gold divider line (Bhoomi Gold: RGB 201, 148, 31)
        self.set_draw_color(201, 148, 31)
        self.set_line_width(0.7)
        self.line(10, 26, 200, 26)
        self.ln(12)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

def build_pdf():
    pdf = SchemaPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    
    # Overview Intro
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 5, "This document outlines the database schema specifications for Bhoomi Decoration's FastAPI & Appwrite application. The database contains 5 collections storing inventory assets, client leads, mandap booking parameters, crew logs, and user roles.")
    pdf.ln(5)

    collections = [
        {
            "id": "inventory",
            "name": "1. Inventory Collection (ID: inventory)",
            "purpose": "Stores warehouse catalog assets, quantity stocks, and daily rental pricing details.",
            "cols": [
                ["name", "String", "255", "Yes", "None", "Display title of inventory item"],
                ["category", "String", "100", "Yes", "None", "Floral, Lighting, Furniture, Fabric"],
                ["quantity_owned", "Integer", "N/A", "Yes", "None", "Total inventory physical counts"],
                ["rental_price_per_day", "Float", "N/A", "Yes", "None", "Daily lease rate charged"]
            ],
            "indexes": []
        },
        {
            "id": "clients",
            "name": "2. Clients Collection (ID: clients)",
            "purpose": "Stores clients accounts, phone logistics, and contact address registers.",
            "cols": [
                ["name", "String", "255", "Yes", "None", "Full name of client"],
                ["email", "String", "255", "Yes", "None", "Contact email register"],
                ["phone", "String", "50", "Yes", "None", "Active phone numbers"],
                ["address", "String", "500", "Yes", "None", "Client billing delivery address"]
            ],
            "indexes": []
        },
        {
            "id": "events",
            "name": "3. Events Collection (ID: events)",
            "purpose": "Tracks event setups schedules, booked rental items, invoice balances, and assignments.",
            "cols": [
                ["client_id", "String", "100", "Yes", "None", "Associated Client ID"],
                ["client_name", "String", "255", "Yes", "None", "Cached client display name"],
                ["venue_address", "String", "500", "Yes", "None", "Event venue logistics address"],
                ["start_date", "String", "50", "Yes", "None", "Job setup date (YYYY-MM-DD)"],
                ["end_date", "String", "50", "Yes", "None", "Job teardown date (YYYY-MM-DD)"],
                ["status", "String", "50", "Yes", "Draft", "Status: Draft, Confirmed, Completed, Cancelled"],
                ["design_layout_url", "String", "2048", "No", "Empty", "Layout blueprint object storage link"],
                ["items_booked", "String", "10000", "Yes", "None", "Booked assets mapping JSON string"],
                ["total_invoice_amount", "Float", "N/A", "No", "0.0", "Auto-calculated booking cost total"],
                ["amount_paid", "Float", "N/A", "No", "0.0", "Deposit downpayments collected"],
                ["remaining_balance", "Float", "N/A", "No", "0.0", "Outstanding unpaid invoice balance"],
                ["crew_assignments", "String", "10000", "No", "[]", "Assigned labor roster JSON string"],
                ["payment_history", "String", "10000", "No", "[]", "Received payments timeline JSON string"],
                ["max_workforce_capacity", "Integer", "N/A", "No", "4", "Max workforce recommended threshold"],
                ["notes", "String", "5000", "No", "Empty", "Logistic and setups custom notes"]
            ],
            "indexes": []
        },
        {
            "id": "tasks",
            "name": "4. Tasks Collection (ID: tasks)",
            "purpose": "Field task logs, labor setup checklists, and assignment status tracking.",
            "cols": [
                ["event_id", "String", "100", "Yes", "None", "Associated event reference ID"],
                ["description", "String", "2048", "Yes", "None", "Job checkoff task details"],
                ["status", "String", "50", "Yes", "Pending", "Status: Pending, Completed"],
                ["assigned_to", "String", "255", "No", "Empty", "Assigned worker name or ID"]
            ],
            "indexes": ["event_id_index (Key Index) -> Attribute: event_id (ASC)"]
        },
        {
            "id": "users",
            "name": "5. Users Collection (ID: users)",
            "purpose": "Stores user roles permissions, daily wage parameters, and authorization metadata.",
            "cols": [
                ["email", "String", "255", "Yes", "None", "Primary login user email"],
                ["role", "String", "50", "Yes", "None", "Access role: admin or labor"],
                ["full_name", "String", "255", "Yes", "None", "Full name of staff member"],
                ["base_daily_rate", "Float", "N/A", "No", "0.0", "Assigned shift wage payout rate"],
                ["id", "String", "100", "No", "Empty", "Auth UID link reference"]
            ],
            "indexes": ["email_index (Key Index) -> Attribute: email (ASC)"]
        }
    ]

    for c in collections:
        # Collection Header
        pdf.set_font('helvetica', 'B', 12)
        pdf.set_text_color(107, 22, 35) # Bhoomi Maroon
        pdf.cell(0, 8, c["name"], ln=True)
        
        pdf.set_font('helvetica', 'I', 9)
        pdf.set_text_color(80, 80, 80)
        pdf.multi_cell(0, 4.5, f"Purpose: {c['purpose']}")
        pdf.ln(2)

        # Draw Table
        pdf.set_font('helvetica', '', 8.5)
        pdf.set_text_color(30, 30, 30)
        
        col_widths = (30, 20, 12, 18, 18, 92)
        
        with pdf.table(col_widths=col_widths, align="L", text_align="L", padding=2) as table:
            # Header Row
            header_row = table.row()
            headers = ["Field Key", "Type", "Size", "Required", "Default", "Description"]
            for h in headers:
                pdf.set_font('helvetica', 'B', 8.5)
                pdf.set_text_color(107, 22, 35)
                header_row.cell(h)
                
            # Body Rows
            pdf.set_font('helvetica', '', 8)
            pdf.set_text_color(40, 40, 40)
            for r in c["cols"]:
                data_row = table.row()
                for item in r:
                    data_row.cell(str(item))
                    
        pdf.ln(3)
        if c["indexes"]:
            pdf.set_font('helvetica', 'B', 9)
            pdf.set_text_color(201, 148, 31) # Bhoomi Gold
            pdf.cell(0, 5, f"Indexes:", ln=True)
            pdf.set_font('helvetica', '', 8.5)
            pdf.set_text_color(60, 60, 60)
            for idx in c["indexes"]:
                pdf.cell(0, 4, f"  * {idx}", ln=True)
            pdf.ln(4)
        else:
            pdf.ln(2)

    # Storage Bucket detail
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(107, 22, 35)
    pdf.cell(0, 8, "6. Storage Bucket Configuration (ID: blueprints)", ln=True)
    
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 5, "Bucket Name: Blueprints Layouts\n"
                         "Read Permissions: Role.any() (Everyone)\n"
                         "Write Permissions: Role.any() (Everyone)\n"
                         "Purpose: Holds venue setups mapping and mandap design blueprints uploaded dynamically.")
    
    pdf.output("Bhoomi_Decoration_Database_Schema.pdf")
    print("[+] PDF Generated successfully at Bhoomi_Decoration_Database_Schema.pdf")

if __name__ == "__main__":
    build_pdf()
