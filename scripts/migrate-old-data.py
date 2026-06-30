#!/usr/bin/env python3
"""
Script to migrate data from old HTML website to new database
"""

import os
import re
import json
import shutil
from pathlib import Path
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

# Paths
OLD_SITE_PATH = Path("../../")  # Parent directory contains old site
NEW_SITE_PATH = Path("../")
CV_SOURCE = OLD_SITE_PATH / "CV"
IMAGES_SOURCE = OLD_SITE_PATH / "images"
FILES_SOURCE = OLD_SITE_PATH / "files"
EVENTS_SOURCE = OLD_SITE_PATH / "events"

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'fa_arch_db',
    'user': 'postgres',
    'password': 'postgres'
}

def connect_db():
    """Connect to PostgreSQL database"""
    return psycopg2.connect(**DB_CONFIG)

def extract_faculty_from_html(html_file):
    """Extract faculty members data from HTML files"""
    print(f"\n📖 Reading {html_file}...")
    
    if not html_file.exists():
        print(f"❌ File not found: {html_file}")
        return []
    
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    faculty_list = []
    
    # Find all tables or divs containing faculty info
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 2:
                # Extract text from cells
                text = ' '.join([cell.get_text(strip=True) for cell in cells])
                
                # Look for patterns like "أ.د.", "د.", "Prof.", "Dr."
                if any(title in text for title in ['أ.د.', 'د.', 'Prof.', 'Dr.', 'أستاذ', 'مدرس']):
                    # Try to find name
                    name_match = re.search(r'(أ\.د\.|د\.|Prof\.|Dr\.)\s*([^\n\r\t]+)', text)
                    if name_match:
                        full_name = name_match.group(0).strip()
                        
                        # Try to find email
                        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
                        email = email_match.group(0) if email_match else None
                        
                        # Try to find CV link
                        cv_link = None
                        links = row.find_all('a')
                        for link in links:
                            href = link.get('href', '')
                            if 'CV/' in href or '.pdf' in href.lower() or '.doc' in href.lower():
                                cv_link = href
                                break
                        
                        faculty_list.append({
                            'name': full_name,
                            'email': email,
                            'cv_file': cv_link,
                            'raw_text': text[:200]  # First 200 chars for reference
                        })
    
    return faculty_list

def copy_faculty_cvs():
    """Copy all CV files to new location"""
    print("\n📁 Copying CV files...")
    
    target_dir = NEW_SITE_PATH / "frontend" / "public" / "uploads" / "faculty" / "cvs"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    if not CV_SOURCE.exists():
        print(f"❌ CV source directory not found: {CV_SOURCE}")
        return
    
    copied = 0
    for cv_file in CV_SOURCE.glob("*"):
        if cv_file.is_file() and cv_file.suffix.lower() in ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']:
            target_file = target_dir / cv_file.name
            try:
                shutil.copy2(cv_file, target_file)
                copied += 1
                if copied % 10 == 0:
                    print(f"   Copied {copied} files...")
            except Exception as e:
                print(f"   ❌ Error copying {cv_file.name}: {e}")
    
    print(f"✅ Copied {copied} CV files")

def copy_images():
    """Copy images to new location"""
    print("\n📁 Copying images...")
    
    target_dir = NEW_SITE_PATH / "frontend" / "public" / "uploads" / "images"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    if not IMAGES_SOURCE.exists():
        print(f"❌ Images source directory not found: {IMAGES_SOURCE}")
        return
    
    copied = 0
    for img_file in IMAGES_SOURCE.rglob("*"):
        if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            # Create subdirectory structure
            rel_path = img_file.relative_to(IMAGES_SOURCE)
            target_file = target_dir / rel_path
            target_file.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                shutil.copy2(img_file, target_file)
                copied += 1
                if copied % 50 == 0:
                    print(f"   Copied {copied} images...")
            except Exception as e:
                print(f"   ❌ Error copying {img_file.name}: {e}")
    
    print(f"✅ Copied {copied} image files")

def copy_documents():
    """Copy PDF and document files"""
    print("\n📁 Copying documents...")
    
    target_dir = NEW_SITE_PATH / "frontend" / "public" / "uploads" / "documents"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    sources = [FILES_SOURCE, EVENTS_SOURCE]
    
    copied = 0
    for source in sources:
        if not source.exists():
            print(f"❌ Source directory not found: {source}")
            continue
            
        for doc_file in source.rglob("*"):
            if doc_file.is_file() and doc_file.suffix.lower() in ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.ppt', '.pptx']:
                # Create subdirectory structure
                rel_path = doc_file.relative_to(source)
                target_file = target_dir / source.name / rel_path
                target_file.parent.mkdir(parents=True, exist_ok=True)
                
                try:
                    shutil.copy2(doc_file, target_file)
                    copied += 1
                    if copied % 50 == 0:
                        print(f"   Copied {copied} documents...")
                except Exception as e:
                    print(f"   ❌ Error copying {doc_file.name}: {e}")
    
    print(f"✅ Copied {copied} document files")

def generate_migration_report():
    """Generate a report of what was found"""
    print("\n" + "="*60)
    print("📊 MIGRATION REPORT")
    print("="*60)
    
    # Count files in old site
    cv_count = len(list(CV_SOURCE.glob("*"))) if CV_SOURCE.exists() else 0
    print(f"\n📂 CV Files: {cv_count}")
    
    if IMAGES_SOURCE.exists():
        img_count = sum(1 for f in IMAGES_SOURCE.rglob("*") if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif'])
        print(f"🖼️  Images: {img_count}")
    
    if FILES_SOURCE.exists():
        doc_count = sum(1 for f in FILES_SOURCE.rglob("*") if f.is_file() and f.suffix.lower() in ['.pdf', '.doc', '.docx'])
        print(f"📄 Documents: {doc_count}")
    
    # Extract faculty from HTML files
    print("\n👨‍🏫 Faculty Members by Department:")
    
    departments = {
        'Egyptology': OLD_SITE_PATH / 'staffEgy.html',
        'Islamic Archaeology': OLD_SITE_PATH / 'staffIslamic.html',
        'Conservation': OLD_SITE_PATH / 'staffCons.html',
        'Greco-Roman': OLD_SITE_PATH / 'staffgrecoRoman.html',
    }
    
    total_faculty = 0
    faculty_by_dept = {}
    
    for dept_name, html_file in departments.items():
        faculty = extract_faculty_from_html(html_file)
        faculty_by_dept[dept_name] = faculty
        total_faculty += len(faculty)
        print(f"   {dept_name}: {len(faculty)} members")
    
    print(f"\n✅ Total Faculty Members Found: {total_faculty}")
    
    # Save faculty data to JSON for review
    output_file = NEW_SITE_PATH / "scripts" / "extracted_faculty.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(faculty_by_dept, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Faculty data saved to: {output_file}")
    print("\n" + "="*60)

def main():
    """Main migration function"""
    print("\n🚀 Starting Data Migration from Old Site")
    print("="*60)
    
    # Step 1: Generate report
    generate_migration_report()
    
    # Step 2: Copy files
    print("\n📦 COPYING FILES...")
    copy_faculty_cvs()
    copy_images()
    copy_documents()
    
    print("\n" + "="*60)
    print("✅ Migration completed!")
    print("="*60)
    print("\n📝 Next steps:")
    print("1. Review extracted_faculty.json")
    print("2. Run database import script")
    print("3. Verify all files in frontend/public/uploads/")
    print()

if __name__ == "__main__":
    main()
