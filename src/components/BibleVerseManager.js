import React, { useState, useRef } from 'react';
import { Trash2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const BibleVerseManager = () => {
  const [verses, setVerses] = useState([]);
  const [packageInfo, setPackageInfo] = useState({
    code: '',
    title: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    verse: ''
  });
  const contentRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePackageInfoChange = (e) => {
    const { name, value } = e.target;
    setPackageInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.reference && formData.verse) {
      setVerses(prevVerses => [
        ...prevVerses, 
        { 
          ...formData, 
          id: Date.now(),
          packageCode: packageInfo.code,
          packageTitle: packageInfo.title 
        }
      ]);
      setFormData({ title: '', reference: '', verse: '' });
    }
  };

  const handleDelete = (id) => {
    setVerses(prevVerses => prevVerses.filter(verse => verse.id !== id));
  };

  const handleDoubleClick = (verse) => {
    setFormData({
      title: verse.title,
      reference: verse.reference,
      verse: verse.verse
    });
    setPackageInfo({
      code: verse.packageCode,
      title: verse.packageTitle
    });
  };
const exportToJson = () => {
  const dataStr = JSON.stringify(verses, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'bible-verses.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const importJson = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedVerses = JSON.parse(e.target.result);
        setVerses(importedVerses);
      } catch (error) {
        alert('Error reading JSON file');
      }
    };
    reader.readAsText(file);
  }
};
  const exportToPDF = async () => {
    if (contentRef.current) {
      const deleteButtons = contentRef.current.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => button.style.display = 'none');

      const canvas = await html2canvas(contentRef.current, {
        scale: 3
      });

      deleteButtons.forEach(button => button.style.display = 'block');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'in', 'letter');
      const pdfWidth = 8.5;
      const margin = 0.5;

      pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - 2*margin, (pdfWidth - 2*margin) * canvas.height / canvas.width);
      pdf.save('bible-verses.pdf');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bible Verse Manager</h1>
        {verses.length > 0 && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Download size={16} />
            Export to PDF
          </button>
         <button
        onClick={exportToJson}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        <Download size={16} />
        Export JSON
      </button>
      <label className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer">
        <input
          type="file"
          accept=".json"
          onChange={importJson}
          className="hidden"
        />
        Import JSON
      </label>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Package Code:</label>
          <input
            type="text"
            name="code"
            value={packageInfo.code}
            onChange={handlePackageInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Package Title:</label>
          <input
            type="text"
            name="title"
            value={packageInfo.title}
            onChange={handlePackageInfoChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Reference:</label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Verse:</label>
          <textarea
            name="verse"
            value={formData.verse}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-24"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Verse
        </button>
      </form>

      <div ref={contentRef}>
        <div className="grid gap-4" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 2.55in)',
          justifyContent: 'center'
        }}>
          {verses.map(verse => (
            <div 
              key={verse.id} 
              className="border rounded bg-white cursor-pointer" 
              style={{ 
                width: '2.55in',
                height: '1.75in',
                position: 'relative',
                padding: '0.1in',
                display: 'flex',
                flexDirection: 'column'
              }}
              onDoubleClick={() => handleDoubleClick(verse)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(verse.id);
                }}
                className="delete-button absolute top-1 right-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={12} />
              </button>

              <div style={{
                display: 'block',
                width: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '8pt',
                lineHeight: '10pt',
                fontWeight: 'bold',
                paddingBottom: '0.05in'
              }}>
                {verse.title}
              </div>
              
              <div style={{ 
                fontSize: '8pt',
                lineHeight: '10pt',
                color: '#666',
                marginBottom: '0.05in'
              }}>
                {verse.reference}
              </div>
              
              <div style={{ 
                fontSize: '8pt',
                lineHeight: '10pt',
                flex: '1 1 auto',
                overflow: 'hidden',
                wordWrap: 'break-word',
                marginBottom: '0.2in'
              }}>
                {verse.verse}
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '0.1in',
                left: '0.1in',
                right: '0.1in',
                borderTop: '1px solid #e5e5e5',
                paddingTop: '0.05in',
                fontSize: '8pt',
                lineHeight: '12pt',
                backgroundColor: 'white'
              }}>
                <span style={{ fontWeight: 'bold' }}>{verse.packageCode}</span>
                {verse.packageTitle && (
                  <span style={{ color: '#666', marginLeft: '0.05in' }}>
                    - {verse.packageTitle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BibleVerseManager;
