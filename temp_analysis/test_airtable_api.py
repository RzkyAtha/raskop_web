#!/usr/bin/env python3
"""
Test Airtable API - Diagnostic Script
Untuk cek apakah field names dan data structure benar
"""

import json
import requests
from datetime import datetime

# Config dari data.js
BASE_ID = 'appiMTgw4GqPFDttT'
TOKEN = 'pata0zQxriCYze9P7.709f2b0ff492f8507931615977b4de64a045add4ff157bdfea29195d819898af'
TABLE_ID = 'tblUV2sdbdY4PM8gS'

BASE_URL = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

print("=" * 70)
print("RASKOP RESERVASI - AIRTABLE API DIAGNOSTIC")
print("=" * 70)

# 1. GET existing fields info
print("\n[1] Mengambil schema/fields dari Airtable...")
try:
    # Try to fetch existing records to see field structure
    url = f'https://api.airtable.com/meta/v1/bases/{BASE_ID}/tables'
    headers = {'Authorization': f'Bearer {TOKEN}'}
    resp = requests.get(url, headers=headers)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        meta = resp.json()
        for table in meta.get('tables', []):
            if table['id'] == TABLE_ID:
                print(f"\nTabel: {table['name']} (ID: {table['id']})")
                print("\nFields yang ada:")
                for field in table['fields']:
                    print(f"  - {field['name']}: {field['type']}")
    else:
        print(f"Error: {resp.status_code}")
        print(resp.text)
except Exception as e:
    print(f"Gagal: {e}")

# 2. GET recent records to check data structure
print("\n" + "=" * 70)
print("[2] Mengecek recent records...")
try:
    resp = requests.get(BASE_URL, headers=HEADERS, params={'maxRecords': 5, 'sort[0][field]': 'Dibuat', 'sort[0][direction]': 'desc'})
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        records = data.get('records', [])
        print(f"\nDitemukan {len(records)} recent records:")
        
        for idx, record in enumerate(records, 1):
            print(f"\n  Record {idx}:")
            print(f"    ID: {record.get('id')}")
            print(f"    Fields:")
            for key, val in record.get('fields', {}).items():
                if key == 'Orders':
                    # Parse Orders JSON
                    try:
                        orders = json.loads(val) if isinstance(val, str) else val
                        print(f"      - {key}: {len(orders) if isinstance(orders, list) else 'ERROR'} items")
                        if isinstance(orders, list) and len(orders) > 0:
                            print(f"        → First item: {orders[0]}")
                    except:
                        print(f"      - {key}: [JSON PARSE ERROR] {val[:50]}...")
                else:
                    val_str = str(val)[:60]
                    print(f"      - {key}: {val_str}")
    else:
        print(f"Error: {resp.status_code}")
        print(resp.text)
except Exception as e:
    print(f"Gagal: {e}")

# 3. Test POST dengan data sample (sesuai data test pengguna)
print("\n" + "=" * 70)
print("[3] Test POST dengan sample data dari test pengguna...")

sample_orders = [
    {"id": "k3", "name": "Americano Blackcurrent", "qty": 3, "price": 20000},
    {"id": "mc3", "name": "Americano Mocktail", "qty": 1, "price": 22000},
    {"id": "k10", "name": "Butterscotch Coffee", "qty": 2, "price": 22000},
    {"id": "n3", "name": "Cokelat Panas", "qty": 2, "price": 20000},
    {"id": "k8", "name": "Kopi Susu Gula Aren", "qty": 9, "price": 20000},
    {"id": "n4", "name": "Lemon Squash", "qty": 4, "price": 18000},
    {"id": "n7", "name": "Lychee Yakult", "qty": 1, "price": 20000},
    {"id": "n6", "name": "Mango Yakult", "qty": 4, "price": 20000},
    {"id": "n2", "name": "Matcha Latte", "qty": 2, "price": 20000},
    {"id": "k2", "name": "Spanish Latte", "qty": 2, "price": 20000},
    {"id": "n1", "name": "Teh Tarik", "qty": 3, "price": 16000},
]

test_data = {
    "fields": {
        "Name": "RSK-20260421-TEST001",
        "Nama Customer": "Test User",
        "WhatsApp": "082333002084",
        "WhatsApp Raw": "6282333002084",
        "Jumlah Orang": 45,
        "Tanggal": "2026-04-23",
        "Jam": "19:00",
        "Area": "outdoor",
        "Orders": json.dumps(sample_orders),
        "Total Items": 33,
        "Total Harga": 646000,
        "Metode Bayar": "QRIS",
        "Status": "pending",
        "Catatan": "Test dari diagnostic script",
        "Dibuat": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
}

print("\nPayload yang akan dikirim:")
print(json.dumps(test_data, indent=2, ensure_ascii=False)[:500] + "...")

print("\nMengirim POST request...")
try:
    resp = requests.post(BASE_URL, headers=HEADERS, json=test_data)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code in [200, 201]:
        result = resp.json()
        print(f"✓ SUCCESS!")
        print(f"  Record ID: {result.get('id')}")
        print(f"  Created fields: {list(result.get('fields', {}).keys())}")
    else:
        print(f"✗ FAILED!")
        print(f"Response: {resp.text}")
        
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70)
