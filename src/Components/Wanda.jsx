import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Wanda = () => {
  return (
    <div className="bg-[#f7fdfb] text-[#0f172a] min-h-screen flex flex-col" dir="rtl">
      <MainContent />
      <Footer />
    </div>
  );
};

const MainContent = () => {
  return (
    <main className="flex-grow max-w-[1200px] mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-extrabold mb-6">Wandajat Management</h1>
      
      <NavigationButtons />
      <FormSection />
      <OwnershipTable />
      <LossTable />
    </main>
  );
};

const NavigationButtons = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-2 space-x-reverse">
        <button className="text-[10px] text-[#ef4444] font-normal">Back</button>
        <button className="bg-[#15803d] text-white text-[12px] font-normal rounded-md px-3 py-1">
          Forward
        </button>
      </div>
      <div className="text-[12px] font-normal">وندا تخلیق کریں</div>
    </div>
  );
};

const FormSection = () => {
  return (
    <form className="bg-white rounded-lg p-4 md:p-6 mb-8 border border-transparent shadow-sm" autoComplete="off" spellCheck="false">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <FormSelect id="district" label="ضلع منتخب کریں" options={["رحیم یار خان"]} />
        <FormSelect id="education" label="تحصیل منتخب کریں" options={["رحیم یار خان"]} />
        <FormInput id="chakNumber" label="چک نمبر" placeholder="چک نمبر منتخب کریں" />
        <FormInput id="kohatNumber" label="کہوٹہ نمبر" placeholder="کہوٹہ نمبر" />
      </div>
    </form>
  );
};

const FormSelect = ({ id, label, options }) => {
  return (
    <div className="flex flex-col text-[10px] text-[#475569] font-normal">
      <label htmlFor={id} className="mb-1">{label}</label>
      <select
        id={id}
        name={id}
        className="border border-gray-300 rounded-md px-3 py-2 text-[12px] text-[#475569] font-normal"
      >
        {options.map((option, index) => (
          <option key={index}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const FormInput = ({ id, label, placeholder }) => {
  return (
    <div className="flex flex-col text-[10px] text-[#475569] font-normal">
      <label htmlFor={id} className="mb-1">{label}</label>
      <input
        type="text"
        id={id}
        name={id}
        placeholder={placeholder}
        className="border border-gray-300 rounded-md px-3 py-2 text-[12px] text-[#475569] font-normal"
      />
    </div>
  );
};

const OwnershipTable = () => {
  const [rows, setRows] = useState([]);

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');
    if (!pastedData) return;

    const data = parseClipboardData(pastedData);
    setRows(data);
  };

  return (
    <section className="mb-8">
      <h2 className="text-[14px] font-semibold mb-2">ملکیت داخل کریں</h2>
      <div className="border border-dashed border-gray-400 rounded p-4 overflow-x-auto bg-[#f9fdfb]">
        <EditableTable 
          tableId="ownershipTable" 
          ariaLabel="ملکیت داخل کریں جدول" 
          headers={[
            "#", "خاندان نمبر", "مالک", "قوم", "نوعیت حقوق", 
            "پذیرندہ مالک", "حصہ", "رقم", "شناختی کارڈ"
          ]} 
          rows={rows} 
          onPaste={handlePaste} 
        />
        <TablePagination />
      </div>
    </section>
  );
};

const LossTable = () => {
  const [rows, setRows] = useState([]);

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');
    if (!pastedData) return;

    const data = parseClipboardData(pastedData);
    setRows(data);
  };

  return (
    <section>
      <h2 className="text-[14px] font-semibold mb-2">خسرہ جات داخل کریں</h2>
      <div className="border border-dashed border-gray-400 rounded p-4 overflow-x-auto bg-[#f9fdfb]">
        <EditableTable 
          tableId="lossTable" 
          ariaLabel="خسرہ جات داخل کریں جدول" 
          headers={[
            "#", "کہوٹہ نمبر", "مربع نمبر", "خسرہ نمبر", 
            "پرانا خسرہ نمبر", "من", "قصر زمین", "ذریعه لیٹائی", "رقم"
          ]} 
          rows={rows} 
          onPaste={handlePaste} 
        />
        <TablePagination />
      </div>
    </section>
  );
};

const EditableTable = ({ tableId, ariaLabel, headers, rows, onPaste }) => {
  return (
    <table
      id={tableId}
      className="min-w-[900px] w-full text-[10px] text-[#475569] font-normal table-fixed border-collapse"
      tabIndex="0"
      aria-label={ariaLabel}
      onPaste={onPaste}
    >
      <thead>
        <tr className="bg-[#f1f9f4]">
          {headers.map((header, index) => (
            <th key={index} className="py-2 px-3 text-center border-b border-gray-200">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="py-8 text-center text-[12px] text-[#475569]">
              No rows
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="editable-cell">{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="editable-cell"
                  contentEditable
                  suppressContentEditableWarning
                >
                  {cell}
                </td>
              ))}
              {/* Fill remaining cells if row is shorter than headers */}
              {Array.from({ length: headers.length - row.length - 1 }).map((_, i) => (
                <td key={`empty-${i}`} className="editable-cell" contentEditable suppressContentEditableWarning></td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const TablePagination = () => {
  return (
    <div className="flex items-center justify-end space-x-2 space-x-reverse mt-2 text-[10px] text-[#475569]">
      <span>Rows per page:</span>
      <select className="border border-gray-300 rounded px-1 py-0.5 text-[10px] text-[#475569]">
        <option>5</option>
      </select>
      <span>0-0 of 0</span>
      <button disabled aria-label="previous page" className="opacity-50 cursor-not-allowed">
        {/* <FontAwesomeIcon icon={faChevronLeft} /> */}
      </button>
      <button disabled aria-label="next page" className="opacity-50 cursor-not-allowed">
        {/* <FontAwesomeIcon icon={faChevronRight} /> */}
      </button>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="text-center text-[10px] text-[#475569] py-4">
      ©ZEESOL <span className="text-black">❤</span> developed by Zeeshan shabir
    </footer>
  );
};

// Utility function to parse clipboard data
const parseClipboardData = (text) => {
  const rows = text.trim().split(/\r?\n/);
  return rows.map(row => row.split(/\t/));
};

// Add CSS styles (could also be moved to a CSS file)
const styles = `
  .editable-cell {
    min-width: 80px;
    padding: 0.25rem 0.5rem;
    border: 1px solid transparent;
    outline: none;
    text-align: center;
    font-size: 10px;
    color: #475569;
    font-weight: 400;
    background-color: transparent;
  }
  .editable-cell:focus {
    border-color: #15803d;
    background-color: #e6fdfb;
  }
`;

const StyleComponent = () => (
  <style>{styles}</style>
);

export default Wanda;