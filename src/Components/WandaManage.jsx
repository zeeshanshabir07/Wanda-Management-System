
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const WandaManage = () => {
  const [tableData, setTableData] = useState([]);
  const [khasraTableData, setKhasraTableData] = useState([]);
  const [formSaved, setFormSaved] = useState(false); 

  const [formData, setFormData] = useState({
    district: '',
    tehsil: '',
    chakNumber: '',
    khaataNumber: '',
    milkiyatData: [],
    khasraData: []
  });
  const [wandaform, setWandaform] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [selectedKilla, setSelectedKilla] = useState(null);
  const [selectedAcre, setSelectedAcre] = useState(null);
  const [khsraArea, setKhsraArea] = useState(null);
  const [calculatedArea, setCalculatedArea] = useState(null);
  const [acreNameInput, setAcreNameInput] = useState('');
  const [remainingSqft, setRemainingSqft] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setFormSaved(true);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rows = clipboardData.split('\n').filter(Boolean);

    const newTableData = rows.map((row) => {
      const [serialNo, ownerName, parentName, caste, address, share, registryNo, remarks, cnicRaw] = row.split('\t');
      const cnic = cnicRaw?.replace(/\r/g, '');
      return { serialNo, ownerName, parentName, caste, address, share, registryNo, remarks, cnic };
    });

    const updatedTableData = [...tableData, ...newTableData];
    setTableData(updatedTableData);
    setFormData((prev) => ({ ...prev, milkiyatData: updatedTableData }));
  };

  const handleKhasraPaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rows = clipboardData.split('\n').filter(Boolean);

    const newKhasraData = rows.map((row) => {
      const [serialNo, khatoniNo, squareNo, khasraNo, landType, areaRaw] = row.split('\t');
      const area = areaRaw?.replace(/\r/g, '');
      return { serialNo, khatoniNo, squareNo, khasraNo, landType, area };
    });

    const updatedKhasra = [...khasraTableData, ...newKhasraData];
    setKhasraTableData(updatedKhasra);
    setFormData((prev) => ({ ...prev, khasraData: updatedKhasra }));
  };

  const handleClear = () => {
    setTableData([]);
    setFormData((prev) => ({ ...prev, milkiyatData: [] }));
  };
  
  const handleClear2 = () => {
    setKhasraTableData([]);
    setFormData((prev) => ({ ...prev, khasraData: [] }));
  };
  
  const handleDeleteRow = (indexToDelete) => {
    const updated = tableData.filter((_, idx) => idx !== indexToDelete);
    setTableData(updated);
    setFormData((prev) => ({ ...prev, milkiyatData: updated }));
  };

  // Helper functions for area calculations
  function parseRaqba(str) {
    if (!str) return { kanal: 0, marla: 0, sqft: 0 };

    // Remove extra dashes and sanitize input
    const cleaned = str.replace(/--+/g, '-').replace(/^-|-$/g, '');
    const parts = cleaned.split('-').map(Number);

    return {
      kanal: parts[0] || 0,
      marla: parts[1] || 0,
      sqft: parts[2] || 0
    };
  }

  function subtractRaqba(totalKanal, totalMarla, totalSqft, ownerKanal, ownerMarla, ownerSqft) {
    // Convert everything to square feet for accurate calculation
    const totalSqftOnly = (totalKanal * 5440) + (totalMarla * 272) + totalSqft;
    const ownerSqftOnly = (ownerKanal * 5440) + (ownerMarla * 272) + ownerSqft;

    const remainingSqft = totalSqftOnly - ownerSqftOnly;
    
    // Convert back to kanal-marla-sqft
    const remainingKanal = Math.floor(remainingSqft / 5440);
    const remainingAfterKanal = remainingSqft % 5440;
    const remainingMarla = Math.floor(remainingAfterKanal / 272);
    const remainingSqftFinal = remainingAfterKanal % 272;
    
    return {
      kanal: remainingKanal,
      marla: remainingMarla,
      sqft: remainingSqftFinal,
      totalSqft: remainingSqft
    };
  }

  // Calculate area when owner or khasra changes
  useEffect(() => {
    if (selectedOwner && khsraArea) {
      const ownerRaqba = parseRaqba(selectedOwner.remarks);
      const totalRaqba = parseRaqba(khsraArea);
      
      const result = subtractRaqba(
        totalRaqba.kanal, totalRaqba.marla, totalRaqba.sqft,
        ownerRaqba.kanal, ownerRaqba.marla, ownerRaqba.sqft
      );
      
      setCalculatedArea(`${result.kanal}-${result.marla}-${result.sqft}`);
      setRemainingSqft(result.totalSqft);
    }
  }, [selectedOwner, khsraArea]);

  // Update khasra area when square and killa are selected
  useEffect(() => {
    if (selectedSquare && selectedKilla) {
      const khasra = khasraTableData.find(
        item => item.squareNo === selectedSquare && item.khasraNo === selectedKilla
      );
      setKhsraArea(khasra?.area || "");
    }
  }, [selectedSquare, selectedKilla, khasraTableData]);

  // Auto-fill acre name when killa is selected
  useEffect(() => {
    setSelectedAcre(selectedKilla);
    setAcreNameInput(selectedKilla || '');
  }, [selectedKilla]);

  const uniqueSquares = [...new Set(khasraTableData.map(item => item.squareNo))];
  const filteredKhasras = selectedSquare 
    ? khasraTableData.filter(item => item.squareNo === selectedSquare)
    : [];

  const handleAddWanda = () => {
    if (!selectedOwner || !selectedSquare || !selectedKilla || !khsraArea) return;

    const newEntry = {
      owner: selectedOwner,
      squareNo: selectedSquare,
      khasraNo: selectedKilla,
      acreName: acreNameInput || selectedAcre,
      originalArea: khsraArea,
      ownerArea: selectedOwner.remarks,
      remainingArea: calculatedArea,
      remainingSqft: remainingSqft
    };

    // Update owner's remaining area in the main table
    const updatedMilkiyatData = tableData.map(owner => {
      if (owner.serialNo === selectedOwner.serialNo) {
        return {
          ...owner,
          remarks: calculatedArea
        };
      }
      return owner;
    });

    setTableData(updatedMilkiyatData);
    setFormData(prev => ({ ...prev, milkiyatData: updatedMilkiyatData }));

    // Update khasra area
    const updatedKhasraData = khasraTableData.map(item => {
      if (item.squareNo === selectedSquare && item.khasraNo === selectedKilla) {
        const total = parseRaqba(item.area);
        const subtract = parseRaqba(selectedOwner.remarks);

        const remaining = subtractRaqba(
          total.kanal, total.marla, total.sqft,
          subtract.kanal, subtract.marla, subtract.sqft
        );

        if (remaining.kanal === 0 && remaining.marla === 0 && remaining.sqft === 0) {
          return null;
        }

        return {
          ...item,
          area: `${remaining.kanal}-${remaining.marla}-${remaining.sqft}`
        };
      }
      return item;
    }).filter(Boolean);

    setKhasraTableData(updatedKhasraData);
    setFormData(prev => ({ ...prev, khasraData: updatedKhasraData }));

    // Add to wanda form
    setWandaform([...wandaform, newEntry]);
    resetWandaFields();
  };

  const resetWandaFields = () => {
    setSelectedOwner(null);
    setSelectedSquare("");
    setSelectedKilla("");
    setSelectedAcre("");
    setKhsraArea("");
    setCalculatedArea("");
    setAcreNameInput("");
    setRemainingSqft(0);
  };

  const handleDelete = (idx) => {
    setWandaform(prev => prev.filter((_, index) => index !== idx));
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    if (wandaform.length > 0) {
      const wandaDataWithHeaders = wandaform.map((item, index) => ({
        'نمبر': index + 1,
        'نام مالکان مشترکہ': item.owner?.parentName || '',
        'حصہ نمبر': item.khasraNo || '',
        'رقبہ (پہلے)': item.originalArea || '',
        'نمبر کیفیت مندرجہ شجرہ': item.squareNo || '',
        'نمبر کھیت': item.khasraNo || '',
        'شجرہ و گاؤں': formData.chakNumber || '',
        'رقبہ (بعد)': item.ownerArea || '',
        'نام مالکان بعد از تقسیم': item.owner?.parentName || '',
        'ونڈہ نمبر': item.acreName || '',
        'مربع فٹ': item.remainingSqft || ''
      }));

      const wandaSheet = XLSX.utils.json_to_sheet(wandaDataWithHeaders);
      XLSX.utils.book_append_sheet(workbook, wandaSheet, 'نقشہ 5 ج');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, 'naqsha5j.xlsx');
    }
  };

  return (
    <div className="p-4 w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-gray-800 text-3xl font-bold mb-6 text-center font-urdu">ونڈہ جات مینجمنٹ سسٹم</h1>

        {/* Main Form Section */}
        <div className={`bg-white rounded-xl shadow-lg w-full border border-blue-100 p-6 mb-8 transition-all duration-300 ${formSaved ? 'ring-2 ring-green-200' : ''}`}>
          <form dir="rtl" onSubmit={handleSubmit} className="space-y-8">
            {/* District, Tehsil, Chak, Khaata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">ضلع</label>
                <select 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">منتخب کریں</option>
                  <option value="vehari">وہاڑی</option>
                  <option value="mailsi">میلسی</option>
                  <option value="burewala">بورے والا</option>
                </select>
              </div>
              
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">تحصیل</label>
                <select 
                  name="tehsil" 
                  value={formData.tehsil} 
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">منتخب کریں</option>
                  <option value="vehari">وہاڑی</option>
                  <option value="mailsi">میلسی</option>
                  <option value="burewala">بورے والا</option>
                </select>
              </div>
              
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">چک نمبر</label>
                <input 
                  type="text" 
                  name="chakNumber" 
                  value={formData.chakNumber} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">کھاتہ نمبر</label>
                <input 
                  type="number" 
                  name="khaataNumber" 
                  value={formData.khaataNumber} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Ownership Table Section */}
            <div onPaste={handlePaste} className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 font-urdu">ملکیت داخل کریں</h2>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    صفائی کریں
                  </button>
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                    کل مالکان: {tableData.length}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600">
                    <tr>
                      {["نمبر شمار", "مالک", "ولدیت", "قوم", "پتہ", "حصہ", "رجسٹری نمبر", "ریمارکس", "شناختی کارڈ", "حذف"].map((header, idx) => (
                        <th 
                          key={idx} 
                          className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider font-urdu"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-6 text-center text-gray-500 font-urdu">
                          کوئی ڈیٹا نہیں ملا۔ ایکسل سے ڈیٹا کاپی کر کے یہاں پیسٹ کریں
                        </td>
                      </tr>
                    ) : (
                      tableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.serialNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-urdu">{row.ownerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-urdu">{row.parentName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-urdu">{row.caste}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-urdu">{row.address}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.share}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.registryNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.remarks}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.cnic}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <button 
                              onClick={() => handleDeleteRow(rowIndex)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Khasra Table Section */}
            <div onPaste={handleKhasraPaste} className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 font-urdu">خسرہ جات داخل کریں</h2>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={handleClear2}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    صفائی کریں
                  </button>
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    کل قطعات: {khasraTableData.length}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-600">
                    <tr>
                      {["نمبر شمار", "کھتونی نمبر", "مربع نمبر", "خسرہ نمبر", "نوعیت زمین", "رقبہ"].map((header, idx) => (
                        <th 
                          key={idx} 
                          className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider font-urdu"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {khasraTableData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500 font-urdu">
                          کوئی ڈیٹا نہیں ملا۔ ایکسل سے ڈیٹا کاپی کر کے یہاں پیسٹ کریں
                        </td>
                      </tr>
                    ) : (
                      khasraTableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.serialNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.khatoniNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.squareNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.khasraNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-urdu">{row.landType}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">{row.area}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-left">
              <button 
                type="submit" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                محفوظ کریں
              </button>
            </div>
          </form>
        </div>

        {/* Wanda Form Section (only shown after form is saved) */}
        {formSaved && (
          <div className="bg-white rounded-xl shadow-lg w-full border border-blue-100 p-6 mt-8">
            <form dir="rtl" className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 font-urdu">وانڈا تفصیلات شامل کریں</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Owner Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">مالک منتخب کریں</label>
                  <select
                    name="owner"
                    value={selectedOwner ? JSON.stringify(selectedOwner) : ""}
                    onChange={(e) => setSelectedOwner(e.target.value ? JSON.parse(e.target.value) : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- منتخب کریں --</option>
                    {tableData.map((owner, idx) => (
                      <option key={idx} value={JSON.stringify({
                        serialNo: owner.serialNo,
                        parentName: owner.parentName,
                        remarks: owner.remarks
                      })}>
                        {owner.parentName} ({owner.remarks})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Square Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">مستطیل منتخب کریں</label>
                  <select
                    name="rectangle"
                    value={selectedSquare}
                    onChange={(e) => {
                      setSelectedSquare(e.target.value);
                      setSelectedKilla("");
                      setKhsraArea("");
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- منتخب کریں --</option>
                    {uniqueSquares.map((sq, idx) => (
                      <option key={idx} value={sq}>{sq}</option>
                    ))}
                  </select>
                </div>

                {/* Killa Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">کِلا نمبر منتخب کریں</label>
                  <select
                    name="killa"
                    value={selectedKilla}
                    onChange={(e) => setSelectedKilla(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    disabled={!selectedSquare}
                  >
                    <option value="">-- منتخب کریں --</option>
                    {filteredKhasras.map((killa, idx) => (
                      <option key={idx} value={killa.khasraNo}>{killa.khasraNo}</option>
                    ))}
                  </select>
                </div>

                {/* Acre Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">اکڑ کا نام</label>
                  <input
                    type="text"
                    name="acreName"
                    value={acreNameInput}
                    onChange={(e) => setAcreNameInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نیا نام درج کریں"
                  />
                </div>

                {/* Khasra Area */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">آلات کردہ رقبہ</label>
                  <input
                    type="text"
                    name="khsraArea"
                    value={khsraArea}
                    onChange={(e) => setKhsraArea(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                    readOnly
                  />
                </div>

                {/* Owner's Area */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">مالک کا رقبہ</label>
                  <input
                    type="text"
                    value={selectedOwner?.remarks || ""}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                  />
                </div>

                {/* Calculated Remaining Area */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">بقیہ رقبہ</label>
                  <input
                    type="text"
                    value={calculatedArea || ""}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                  />
                </div>

                {/* Square Feet */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-urdu">مربع فٹ</label>
                  <input
                    type="text"
                    value={remainingSqft || ""}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono"
                  />
                </div>
              </div>

              {/* Add Wanda Button */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleAddWanda}
                  disabled={!selectedOwner || !selectedSquare || !selectedKilla || !khsraArea}
                  className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  وانڈا شامل کریں
                </button>
              </div>
            </form>

            {/* Saved Wanda Entries Table */}
            {wandaform.length > 0 && (
              <div dir="rtl" className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 font-urdu">محفوظ شدہ اندراجات</h3>
                  <button
                    onClick={exportToExcel}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    ایکسپورٹ ایکسل
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                      <tr>
                        {["#", "مالک", "مربع نمبر", "کِلا نمبر", "اکڑ کا نام", "اصل رقبہ", "مالک کا رقبہ", "بقیہ رقبہ", "عمل"].map((header, idx) => (
                          <th 
                            key={idx} 
                            className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider font-urdu"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wandaform.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{idx + 1}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.owner?.parentName}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.squareNo}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.khasraNo}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.acreName}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.originalArea}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.ownerArea}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.remainingArea}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">
                          <button
                            onClick={() => handleDelete(idx)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          >
                            حذف کریں
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
  
};

export default WandaManage;