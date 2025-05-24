import React, { useState,useEffect } from 'react';
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

  const handleDeleteRow = (indexToDelete) => {
    const updated = tableData.filter((_, idx) => idx !== indexToDelete);
    setTableData(updated);
    setFormData((prev) => ({ ...prev, milkiyatData: updated }));
  };

  const [wandaform, setWandaform] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState({ parentName: "", remarks: "" });
  const [selectedSquare, setSelectedSquare] = useState("");
  const [selectedKilla, setSelectedKilla] = useState("");
  const [selectedAcre, setSelectedAcre] = useState("");
  const [area, setArea] = useState("");
  const [cal,setcal]= useState("")
 
  const uniqueSquares = [...new Set(khasraTableData.map(item => item.squareNo))];
  const filteredKhasras = khasraTableData.filter(item => item.squareNo === selectedSquare).map(item => item.khasraNo);

  useEffect(() => {
    setSelectedAcre(selectedKilla);
  }, [selectedKilla]);

  const handleAddWanda = () => {
    if (!selectedOwner || !area) return;

  const newEntry = {
    owner: selectedOwner,
    squareNo: selectedSquare,
    khasraNo: selectedKilla,
    acreName: selectedAcre,
    area: area,
    calarea: cal, // or you might want to use the calculated value directly
  };

  setWandaform([...wandaform, newEntry]);
    setSelectedOwner("");
    setSelectedSquare("");
    setSelectedKilla("");
    setSelectedAcre("");

  setArea("");
  setCal("");
};


  const handleDelete = (idx) => {
    setWandaForm((prevData) => prevData.filter((_, index) => index !== idx));
  };

  const handleOwnerChange = (e) => {
  const selected = JSON.parse(e.target.value);
  setSelectedOwner(selected);
  
  if (selected && area) {
    const remarksValue = parseFloat(selected.remarks);
    const originalArea = parseFloat(area);

    if (!isNaN(originalArea) && !isNaN(remarksValue)) {
      const newArea = originalArea - remarksValue;
      const areaInAKM = convertToAKMString(newArea);
      setCal(areaInAKM);
    }
  }
};
const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Wanda Sheet with Urdu headers
  if (wandaform.length > 0) {
    const wandaDataWithHeaders = wandaform.map((item, index) => ({
      '': index + 1,
      'مالک': item.owner?.parentName,
      'مربع نمبر': item.squareNo,
      'کِلا نمبر': item.khasraNo,
      'اکڑ کا نام': item.acreName,
      'رقبہ': item.area,
    }));

    const wandaSheet = XLSX.utils.json_to_sheet(wandaDataWithHeaders);
    XLSX.utils.book_append_sheet(workbook, wandaSheet, 'Wanda');
  }

  // Save Excel File
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(file, 'wanda_data.xlsx');
};


 return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      <h1 className="text-gray-800 text-2xl font-bold mb-8">Wandajat Management</h1>

      {/* Main Form Section */}
      <div className={`bg-white rounded-lg shadow-md w-full border border-gray-200 p-6 ${formSaved ? 'data-saved' : ''}`}>
        {!formSaved ? (
          <form dir="rtl" onSubmit={handleSubmit} className="space-y-8">
            {/* District, Tehsil, Chak, Khaata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">ضلع</label>
                <select 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange}
                  className="w-full p-1  text-[13px] border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full p-1 text-[13px] border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2 font-urdu">
                <label className="block text-sm font-medium text-gray-700">کھاتہ نمبر</label>
                <input 
                  type="number" 
                  name="khaataNumber" 
                  value={formData.khaataNumber} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Ownership Table Section */}
            <div onPaste={handlePaste} className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">ملکیت داخل کریں</h2>
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  صفائی کریں
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {["نمبر شمار", "مالک", "ولدیت", "قوم", "پتہ", "حصہ", "رجسٹری نمبر", "ریمارکس", "شناختی کارڈ", "حذف"].map((header, idx) => (
                        <th key={idx} className="px-4 py-2 text-right border border-gray-300 text-sm font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-4 text-center text-gray-500 border border-gray-300">
                          کوئی ڈیٹا نہیں ملا
                        </td>
                      </tr>
                    ) : (
                      tableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.serialNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.ownerName}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.parentName}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.caste}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.address}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.share}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.registryNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.remarks}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.cnic}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">
                            <button 
                              onClick={() => handleDeleteRow(rowIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">خسرہ جات داخل کریں</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {["نمبر شمار", "کھتونی نمبر", "مربع نمبر", "خسرہ نمبر", "نوعیت زمین", "رقبہ"].map((header, idx) => (
                        <th key={idx} className="px-4 py-2 text-right border border-gray-300 text-sm font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {khasraTableData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500 border border-gray-300">
                          کوئی ڈیٹا نہیں ملا
                        </td>
                      </tr>
                    ) : (
                      khasraTableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.serialNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.khatoniNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.squareNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.khasraNo}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.landType}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{row.area}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-sm mt-2">کل قطعات: {khasraTableData.length}</p>
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-left">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                محفوظ کریں
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg inline-block">
              <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">فارم کامیابی سے محفوظ ہو گیا!</span>
            </div>
          </div>
        )}
      </div>

      {/* Wanda Form Section (only shown after form is saved) */}
      {formSaved && (
        <div className="bg-white rounded-lg shadow-md w-full border border-gray-200 p-6 mt-8">
          <form dir="rtl" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">وانڈا تفصیلات شامل کریں</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Owner Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">مالک منتخب کریں</label>
                <select
                  name="owner"
                  value={selectedOwner ? JSON.stringify(selectedOwner) : ""}
                  onChange={handleOwnerChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- منتخب کریں --</option>
                  {tableData.map((owner, idx) => {
                    const reversedRemarks = owner.remarks.split('-').reverse().join('-');
                    const optionValue = JSON.stringify({
                      parentName: owner.parentName,
                      remarks: reversedRemarks,
                    });
                    return (
                      <option key={idx} value={optionValue}>
                        {owner.parentName} ({reversedRemarks})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Square Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">مستطیل منتخب کریں</label>
                <select
                  name="rectangle"
                  value={selectedSquare}
                  onChange={(e) => {
                    setSelectedSquare(e.target.value);
                    setSelectedKilla("");
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- منتخب کریں --</option>
                  {uniqueSquares.map((sq, idx) => (
                    <option key={idx} value={sq}>{sq}</option>
                  ))}
                </select>
              </div>

              {/* Killa Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">کِلا نمبر منتخب کریں</label>
                <select
                  name="killa"
                  value={selectedKilla}
                  onChange={(e) => setSelectedKilla(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- منتخب کریں --</option>
                  {filteredKhasras.map((killa, idx) => (
                    <option key={idx} value={killa}>{killa}</option>
                  ))}
                </select>
              </div>

              {/* Acre Name (auto-filled) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">اکڑ کا نام</label>
                <input
                  type="text"
                  name="acreName"
                  value={selectedAcre}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  placeholder="خودکار"
                />
              </div>
            </div>

            {/* Area Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">رقبہ</label>
              <input
                type="text"
                name="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="مثال: 2.5"
              />
            </div>

            {/* Calculated Area (shown when calculated) */}
            {cal && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">بقیہ رقبہ</label>
                <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
                  {cal}
                </div>
              </div>
            )}

            {/* Add Wanda Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddWanda}
                className="px-8 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
              >
                وانڈا شامل کریں
              </button>
            </div>
          </form>

          {/* Saved Wanda Entries Table */}
          {wandaform.length > 0 && (
            <div dir='rtl' className="mt-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">محفوظ شدہ اندراجات</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-green-100">
                    <tr>
                      {["#", "مالک", "مربع نمبر", "کِلا نمبر", "اکڑ کا نام", "رقبہ", "عمل"].map((header, idx) => (
                        <th key={idx} className="px-4 py-2 text-right border border-gray-300 text-sm font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wandaform.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{idx + 1}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.owner?.parentName}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.squareNo}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.khasraNo}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.acreName}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm">{item.area}</td>
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
                  <button
  onClick={exportToExcel}
  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>
  ایکسپورٹ ایکسل
</button>
                </table>
              </div>
            </div>
          )}
          

        </div>
      )}
    </div>
  );
};

export default WandaManage;