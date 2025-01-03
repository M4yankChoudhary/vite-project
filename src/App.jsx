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

      // Create an array of random amounts that sum up to totalAmount
      let amounts = [];
      let remainingAmount = totalAmount;

      // Function to round to the nearest 10, 100, or 1000
      const roundToNearest = (value, multiple) => {
        return Math.floor(value / multiple) * multiple;
      };

      // Generate random amounts for each item
      itemList.forEach((item, index) => {
        let randomAmount = Math.floor(Math.random() * (remainingAmount / itemList.length)) + 1000; // Reasonable random value
        randomAmount = roundToNearest(randomAmount, 100); // Round to nearest 100

        // Ensure we don't exceed the remaining amount
        randomAmount = Math.min(randomAmount, remainingAmount - (itemList.length - index - 1) * 1000); // Avoid going below 0 for remaining items

        amounts.push(randomAmount);
        remainingAmount -= randomAmount;
      });

      // Ensure the remaining amount is added to the last item
      amounts[amounts.length - 1] += remainingAmount;
      amounts[amounts.length - 1] = roundToNearest(amounts[amounts.length - 1], 100); // Round the final amount

      // Create the breakdown array
      const breakdown = itemList.map((item, index) => ({
        name: item,
        value: amounts[index],
      }));

      setItemBreakdown(breakdown);
    }
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
            height: '4px',
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
             width:'100%',
             textAlign:'center',
             display:'flex',
             justifyContent:'center'
           }}>
           <span style={{
              width:'100%',
            
              textAlign:'center',
              fontSize: '36px',

              fontWeight: 'bolder',
              marginBottom: '22px',
              marginLeft: '12px',
              textTransform: 'uppercase'
            }}>Wave Multitrade</span>
           </div>

           <div  className="" style={{
  textAlign:'end'
}}>
  <p><strong>Invoice Number:</strong> &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; &nbsp;  &nbsp;  </p>
  <p style={{
    marginTop:'-12px'
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
            <strong>Ruppes in word</strong>
            <strong>Total: ₹{itemBreakdown.reduce((total, item) => total + item.value, 0)}</strong>
          </div>
          <div className="terms">
            <p><strong>Terms and Conditions:</strong></p>

          </div>
          <div className="signature">
            <p><strong>Signature:</strong> ____________________</p>
          </div>

          <div style={{
            height: '16px',
            width: '100%',
            marginTop: '24px',
            background: 'black',
            marginBottom: '6px'
          }}></div>
          <div style={{
            height: '4px',
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
