#!/usr/bin/env node
/**
 * Test Airtable API - Diagnostic Script
 * Node.js version untuk check apakah field names dan data structure benar
 */

const BASE_ID = 'appiMTgw4GqPFDttT';
const TOKEN = 'pata0zQxriCYze9P7.709f2b0ff492f8507931615977b4de64a045add4ff157bdfea29195d819898af';
const TABLE_ID = 'tblUV2sdbdY4PM8gS';

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const HEADERS = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

console.log('='.repeat(70));
console.log('RASKOP RESERVASI - AIRTABLE API DIAGNOSTIC');
console.log('='.repeat(70));

// 1. GET recent records to check data structure
(async () => {
  console.log('\n[1] Mengecek recent records dari Airtable...');
  try {
    const params = new URLSearchParams({
      maxRecords: 10,
      'sort[0][field]': 'Dibuat',
      'sort[0][direction]': 'desc'
    });
    
    const resp = await fetch(`${BASE_URL}?${params.toString()}`, { headers: HEADERS });
    console.log(`Status: ${resp.status}`);
    
    if (resp.ok) {
      const data = await resp.json();
      const records = data.records || [];
      console.log(`\nDitemukan ${records.length} recent records:\n`);
      
      records.forEach((record, idx) => {
        console.log(`  Record ${idx + 1}:`);
        console.log(`    ID: ${record.id}`);
        console.log(`    Fields:`);
        
        const fields = record.fields || {};
        Object.entries(fields).forEach(([key, val]) => {
          if (key === 'Orders') {
            try {
              const orders = typeof val === 'string' ? JSON.parse(val) : val;
              const itemCount = Array.isArray(orders) ? orders.length : 'PARSE_ERROR';
              console.log(`      - ${key}: ${itemCount} items`);
              if (Array.isArray(orders) && orders.length > 0) {
                console.log(`        → Sample: ${JSON.stringify(orders[0])}`);
              }
            } catch (e) {
              console.log(`      - ${key}: [JSON PARSE ERROR] ${String(val).substring(0, 50)}...`);
            }
          } else {
            const valStr = String(val).substring(0, 50);
            console.log(`      - ${key}: ${valStr}`);
          }
        });
        console.log();
      });
      
      // ===== ANALYSIS =====
      console.log('\n' + '='.repeat(70));
      console.log('[2] ANALYSIS - Checking for potential issues:');
      
      let issues = [];
      
      records.forEach((r, idx) => {
        const f = r.fields || {};
        
        // Check if Orders field exists and is parseable
        if (f.Orders) {
          try {
            const orders = typeof f.Orders === 'string' ? JSON.parse(f.Orders) : f.Orders;
            if (!Array.isArray(orders)) {
              issues.push(`Record ${idx + 1}: Orders adalah ${typeof orders}, bukan Array`);
            }
          } catch (e) {
            issues.push(`Record ${idx + 1}: Orders tidak bisa di-parse sebagai JSON`);
          }
        } else {
          issues.push(`Record ${idx + 1}: Field 'Orders' tidak ada`);
        }
        
        // Check if WhatsApp Raw field exists
        if (!f['WhatsApp Raw']) {
          console.log(`  ⚠ Record ${idx + 1}: Field 'WhatsApp Raw' tidak ada (mungkin dihapus/tidak dibuat)`);
        }
        
        // Check critical fields
        ['Name', 'Nama Customer', 'WhatsApp', 'Tanggal', 'Jam', 'Area'].forEach(field => {
          if (!f[field]) {
            issues.push(`Record ${idx + 1}: Field '${field}' kosong atau tidak ada`);
          }
        });
      });
      
      if (issues.length > 0) {
        console.log('\n⚠️  ISSUES FOUND:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('\n✓ Semua records tampak OK');
      }
      
    } else {
      console.log(`Error: ${resp.status}`);
      const text = await resp.text();
      console.log(text);
    }
  } catch (e) {
    console.error(`Failed: ${e.message}`);
  }
  
  // 2. Test POST dengan sample data
  console.log('\n' + '='.repeat(70));
  console.log('[3] Test POST dengan sample data...');
  
  const sampleOrders = [
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
  ];
  
  const testData = {
    fields: {
      'Name': 'RSK-20260421-DIAG001',
      'Nama Customer': 'Test Diagnostic',
      'WhatsApp': '082333002084',
      'WhatsApp Raw': '6282333002084',
      'Jumlah Orang': 45,
      'Tanggal': '2026-04-23',
      'Jam': '19:00',
      'Area': 'outdoor',
      'Orders': JSON.stringify(sampleOrders),
      'Total Items': 33,
      'Total Harga': 646000,
      'Metode Bayar': 'QRIS',
      'Status': 'pending',
      'Catatan': 'Diagnostic test',
      'Dibuat': new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    }
  };
  
  console.log('\nPayload (truncated):');
  console.log(JSON.stringify(testData, null, 2).substring(0, 300) + '...\n');
  
  try {
    const resp = await fetch(BASE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(testData)
    });
    
    console.log(`Status: ${resp.status}`);
    
    if (resp.ok) {
      const result = await resp.json();
      console.log('✓ SUCCESS! Record created.');
      console.log(`  Record ID: ${result.id}`);
      console.log(`  Created fields: ${Object.keys(result.fields).join(', ')}`);
    } else {
      console.log('✗ FAILED!');
      const text = await resp.text();
      console.log(`Response: ${text}`);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(70));
})();
