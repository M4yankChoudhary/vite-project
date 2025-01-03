import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './App.css'; // Importing CSS for styling
import html2pdf from "html2pdf.js";
function App() {
  const [name, setName] = useState('भारतीय सामाजिक पार्टी');
  const [totalValue, setTotalValue] = useState('');
  const [items, setItems] = useState('');
  const [itemBreakdown, setItemBreakdown] = useState([]);

  // Function to generate random breakdown but ensure total is accurate and amounts end in zero, with minimum value of 1/4 of total value
  // Function to generate random breakdown but ensure total is accurate and amounts end in zero
  const generateUnevenBreakdown = () => {
    if (name && totalValue && items) {
      const itemList = items.split(',').map(item => item.trim());
      let totalAmount = parseInt(totalValue); // Convert to integer to avoid decimals
      const numItems = itemList.length;
  
      // Calculate the minimum amount for each item (19% of total value)
      const minAmount = Math.ceil((19 / 100) * totalAmount);
  
      // Ensure there is enough room for randomness
      if (minAmount * numItems > totalAmount) {
        console.error("Total value is too low to satisfy the 19% minimum requirement for all items.");
        return;
      }
  
      let amounts = [];
      let remainingAmount = totalAmount;
  
      // Distribute minimum amounts first
      for (let i = 0; i < numItems; i++) {
        let baseAmount = minAmount;
        remainingAmount -= baseAmount;
        amounts.push(baseAmount);
      }
  
      // Add randomness to the amounts while ensuring the total remains valid
      for (let i = 0; i < numItems - 1; i++) {
        let maxAddable = Math.min(remainingAmount, Math.floor(totalAmount / numItems));
        let randomAddition = Math.floor(Math.random() * maxAddable);
  
        amounts[i] += randomAddition;
        remainingAmount -= randomAddition;
      }
  
      // Add remaining amount to the last item
      amounts[numItems - 1] += remainingAmount;
  
      // Ensure randomness and round amounts to the nearest 100
      amounts = amounts.map(amount => Math.floor(amount / 100) * 100);
  
      // Shuffle amounts to avoid predictable patterns
      amounts = amounts.sort(() => Math.random() - 0.5);
  
      // Create the breakdown array
      const breakdown = itemList.map((item, index) => ({
        name: item,
        value: amounts[index],
      }));
  
      setItemBreakdown(breakdown);
    }
  };
  
  


  const numberToWords = (num) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const c = ['Hundred', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const makeWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + ' ' + c[0] + ' ' + makeWords(n % 100);
      if (n < 100000) return makeWords(Math.floor(n / 1000)) + ' ' + c[1] + ' ' + makeWords(n % 1000);
      if (n < 10000000) return makeWords(Math.floor(n / 100000)) + ' ' + c[2] + ' ' + makeWords(n % 100000);
      return makeWords(Math.floor(n / 10000000)) + ' ' + c[3] + ' ' + makeWords(n % 10000000);
    };

    return makeWords(num).trim() + ' Rupees Only';
  };

  // Function to generate and download the HTML preview as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Select the HTML content of the live preview
    const content = document.querySelector('.pdf-preview');

    // Use the `html()` method of jsPDF to convert the content to a PDF
    doc.html(content, {
      margin: [10, 10, 10, 10],  // Reduced margins to fit content
      callback: function (doc) {
        // Scaling to fit the content in one page
        const pageHeight = doc.internal.pageSize.height;
        const contentHeight = content.scrollHeight;

        // Adjust scaling factor to fit the content into one page
        const scale = contentHeight > pageHeight ? pageHeight / contentHeight : 1;

        doc.setScale(scale);

        // Save the document
        doc.save(`${name}_invoice.pdf`);
      },
      x: 10,  // Left margin
      y: 10,  // Top margin
      width: 180,  // Content width (adjust to fit the page)
    });
  };

  const handleDownload = () => {
    const element = document.getElementById("content-to-pdf");

    // Using html2pdf to download the div as a PDF
    html2pdf(element, {
      filename: "downloaded-content.pdf", // Specify the filename
      html2canvas: { scale: 2 }, // Improve rendering quality
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } // PDF formatting options
    });
  };
  return (
    <div className="App">
      <h1>Invoice Generator</h1>

      {/* Input form for name, total value, and comma-separated items */}
      <div className="form-container">
        <input
          type="text"
          className="input-field"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Enter Total Value"
          value={totalValue}
          onChange={(e) => setTotalValue(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Enter Comma-separated Items (e.g., Mobile, Fridge)"
          value={items}
          onChange={(e) => setItems(e.target.value)}
        />
        <button className="generate-btn" onClick={generateUnevenBreakdown}>
          Generate Breakdown
        </button>
      </div>

      {/* Display the item breakdown */}
      <div className="breakdown-container">
        {itemBreakdown.length > 0 && (
          <>
            <h2>Item Breakdown:</h2>
            <ul>
              {itemBreakdown.map((item, index) => (
                <li key={index}>
                  {item.name}: ₹{item.value}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Live PDF Preview */}
      <div id='content-to-pdf' style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

      }}>
        <div className="pdf-preview" style={{
          marginTop: "100px",
          borderRadius: '0px',
          width: '800px',



        }}>
          <div style={{
            height: '1px',
            width: '100%',
            background: 'black',
            marginBottom: '6px',
          }}></div>
          <div style={{
            height: '16px',
            width: '100%',
            background: 'black',
            marginBottom: '24px',
          }}></div>
          <div style={{
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <span style={{
              width: '100%',

              textAlign: 'center',
              fontSize: '36px',

              fontWeight: 'bolder',
              marginBottom: '22px',
              marginLeft: '12px',
              textTransform: 'uppercase'
            }}>Wave Multitrade</span>
          </div>

          <div className="" style={{
            textAlign: 'end'
          }}>
            <p><strong>Invoice Number:</strong> &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; &nbsp;  &nbsp;  </p>
            <p style={{
              marginTop: '-12px'
            }}><strong>Invoice Date:</strong>  &nbsp;  &nbsp;   &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;   &nbsp;  &nbsp; </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <p style={{
              fontSize: '22px',

            }}><strong>Name:</strong></p>
            <p style={{
              fontSize: '22px',
              width: '100%',
              marginLeft: '12px',
              borderBottom: '1px solid black',
            }}>{name}</p>
          </div>
          <div style={{
            display: 'flex',
            marginTop: '-24px',
            marginBottom: '12px',
            flexDirection: 'row'
          }}>
            <p style={{
              fontSize: '22px',

            }}><strong>Address:</strong></p>
            <p style={{
              fontSize: '22px',
              width: '100%',
              marginLeft: '12px',
              borderBottom: '1px solid black',
            }}></p>
          </div>


          <table className="preview-table">
            <thead>
              <tr>
                <th style={{
                  width: "52px"
                }}>Sr. No.</th>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {itemBreakdown.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>

                  <td>₹{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-amount">
            <strong style={{
              fontSize: '12px'
            }}>Rupees in word: {numberToWords(itemBreakdown.reduce((total, item) => total + item.value, 0))}</strong>
            <strong>Total: ₹{itemBreakdown.reduce((total, item) => total + item.value, 0)}</strong>
          </div>
          <div className="terms">
            <p><strong>Terms and Conditions:</strong></p>

          </div>
          <div className="signature">
            <p><strong>Signature:</strong> ____________________</p>
          </div>

  
          <div style={{
            height: '20px',
            width: '100%',
            background: 'black',

          }}></div>
        </div>

      </div>

      <button style={{
        marginTop: "72px"
      }} className="download-btn" onClick={handleDownload}>
        Download as PDF
      </button>
    </div>
  );
}

export default App;
