#!/usr/bin/env node
/**
 * Test Airtable API - POST dengan Fix
 * Verifikasi bahwa date format issue sudah di-fix
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
console.log('AIRTABLE POST TEST - AFTER FIX');
console.log('='.repeat(70));

(async () => {
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

  // Generate ISO datetime correctly
  const now = new Date();
  const isoDateTime = now.toISOString().slice(0, 19);
  
  const testData = {
    fields: {
      'Name': 'RSK-20260421-FIX001',
      'Nama Customer': 'Test After Fix',
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
      'Catatan': 'Test after fixing date format',
      'Dibuat': isoDateTime,
    }
  };

  console.log('\n[1] Date Format Check:');
  console.log(`  ❌ OLD FORMAT: "21/4/2026, 23.33.26" (Indonesian locale)`);
  console.log(`  ✓ NEW FORMAT: "${isoDateTime}" (ISO 8601)`);

  console.log('\n[2] Sending POST request with fixed format...\n');
  
  try {
    const resp = await fetch(BASE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(testData)
    });

    console.log(`HTTP Status: ${resp.status}`);
    
    if (resp.ok) {
      const result = await resp.json();
      console.log('\n✓ SUCCESS! Record created with proper data structure.\n');
      console.log('Record Details:');
      console.log(`  ID: ${result.id}`);
      console.log(`  Name (ID Reservasi): ${result.fields['Name']}`);
      console.log(`  Nama Customer: ${result.fields['Nama Customer']}`);
      console.log(`  Tanggal: ${result.fields['Tanggal']}`);
      console.log(`  Jam: ${result.fields['Jam']}`);
      console.log(`  Area: ${result.fields['Area']}`);
      console.log(`  Jumlah Orang: ${result.fields['Jumlah Orang']}`);
      console.log(`  Dibuat: ${result.fields['Dibuat']}`);
      console.log(`  Status: ${result.fields['Status']}`);
      console.log(`  Total Items: ${result.fields['Total Items']}`);
      console.log(`  Total Harga: Rp ${result.fields['Total Harga']?.toLocaleString('id-ID')}`);
      console.log(`  Orders: ${Array.isArray(JSON.parse(result.fields['Orders'])) ? '✓ Valid JSON array' : '✗ Invalid'}`);
    } else {
      console.log('\n✗ FAILED!\n');
      const errorData = await resp.json();
      console.log('Error Details:');
      console.log(JSON.stringify(errorData, null, 2));
      
      if (errorData.error?.type === 'INVALID_VALUE_FOR_COLUMN') {
        console.log('\n⚠️  Still getting date format error!');
        console.log('  The field "Dibuat" might still expect a different format.');
        console.log('  Please check Airtable field configuration.');
      }
    }
  } catch (e) {
    console.error(`\n✗ Network Error: ${e.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('TEST COMPLETE');
  console.log('='.repeat(70));
})();
