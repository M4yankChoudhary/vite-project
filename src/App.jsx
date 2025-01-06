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
        fontSize: '12px',

      }}>
        <div className="pdf-preview" style={{
          padding:'6px',
          marginTop:'100px',
          borderRadius:'0px',
          border:'1px solid black',
          display:'flex',
        }}>
        <div  style={{
       
          borderRadius: '0px',
          width: '800px',

          border: '1px solid black',
          boxShadow: '0 0 0 1px black',


        }}>
          {/* <div style={{
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
          }}></div> */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            marginBottom: '22px',
          }}>
            <span style={{
              width: '100%',

              textAlign: 'center',
              fontSize: '42px',
              fontFamily: 'ui-sans-serif',
              fontWeight: 'bolder',
              marginTop: '12px',
              marginLeft: '12px',
              textTransform: 'uppercase'
            }}>Wave Multitrade</span>
            <span style={{
              fontWeight: 'bold',
              fontSize: '12px',
            }}>M/28, FIR Mz 10/21, Flox Chamber, Road No.-1, Roxy Cinema,<br />
              Opera House, Girgaon, Mumbai - 400004
              E-mail: wavemultitrade@gmail.com</span>
          </div>

          <div style={{
            height: '1px',
            backgroundColor: 'black',
            width: '100%'
          }}></div>
          <div style={{
            paddingLeft: '6px',
            paddingRight: '6px',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: '100%',
          }}>
            <div style={{
              paddingLeft: '6px',
              paddingRight: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row'
            }}>
              <p><strong>Sr. No.</strong> &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; &nbsp;  &nbsp;  </p>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                paddingRight: '12px',
              }}>
                <p style={{


                }}><strong>Date:</strong></p>
                <p style={{
                  width: '100px',
                  marginLeft: '6px',
                  borderBottom: '1px dotted black',
                }}></p>
              </div>
            </div>

          </div>

          <div style={{
            paddingLeft: '6px',
            paddingRight: '6px',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: '100%',
            marginTop: '-12px',
          }}>
            <div style={{
              paddingLeft: '6px',
              paddingRight: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row'
            }}>

              <div style={{
                display: 'flex',
                width: '100%',
                flexDirection: 'row',
                paddingRight: '12px',
              }}>
                <p style={{


                }}><strong>Name:</strong></p>
                <p style={{
                  width: '100%',
                  marginLeft: '6px',
                  borderBottom: '1px dotted black',
                }}>{name}</p>
              </div>

            </div>

          </div>
          <div style={{
            marginTop: '-4px',
            paddingLeft: '6px',
            paddingRight: '6px',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: '100%',
          }}>
            <div style={{
              paddingLeft: '6px',
              paddingRight: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row'
            }}>

              <div style={{
                display: 'flex',
                width: '100%',
                flexDirection: 'row',
                paddingRight: '12px',
              }}>
                <p style={{


                }}></p>
                <p style={{
                  width: '100%',
                  marginLeft: '6px',
                  borderBottom: '1px dotted black',
                }}></p>
              </div>

            </div>

          </div>
          {/* <div style={{
            height: '1px',
            backgroundColor: 'black',
            width: '100%',
            marginBottom:'12px'
          }}></div> */}

          <div style={{
            // margin:'12px'
          }}>
            <table className="preview-table"
            >
              <thead>
                <tr>
                  <th style={{
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    borderRight: '1px solid black',
                    width: "52px"
                  }}>Sr. No.</th>
                  <th

                    style={{
                      borderTop: '1px solid black',
                      borderBottom: '1px solid black',
                      borderRight: '1px solid black',

                    }}>Description</th>
                  <th

                    style={{
                      borderTop: '1px solid black',
                      borderBottom: '1px solid black',


                    }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody style={{
                fontWeight: 'bold'
              }}>
                {itemBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td style={{
                      borderTop: '1px solid black',
                      borderBottom: '1px solid black',
                      borderRight: '1px solid black',

                    }}>{index + 1}.</td>
                    <td style={{
                      borderTop: '1px solid black',
                      borderBottom: '1px solid black',
                      borderRight: '1px solid black',

                    }}>{item.name}</td>

                    <td style={{
                      borderTop: '1px solid black',
                      borderBottom: '1px solid black',


                    }}>₹{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          <table style={{
            marginTop: '-22px',
          }} className="preview-table"
          >

            <tbody style={{
              fontWeight: 'bold'
            }}>

              <tr >
                <td style={{
                  width: '322px',

                  borderBottom: '1px solid black',
                  borderRight: '1px solid black',

                }}> <strong style={{
                  fontSize: '12px'
                }}>Amount (in words) Rs: <span style={{
                  borderBottom: '1px solid black',
                  width:'100%',
                }}>{numberToWords(itemBreakdown.reduce((total, item) => total + item.value, 0))}</span></strong></td>


                <td style={{

                  borderBottom: '1px solid black',


                }}> <strong>Total: ₹{itemBreakdown.reduce((total, item) => total + item.value, 0)}</strong></td>
              </tr>

            </tbody>
          </table>
          {/* <div className="total-amount" style={{

          }}>
            <strong style={{
              fontSize: '12px'
            }}>Amount (in words) Rs: {numberToWords(itemBreakdown.reduce((total, item) => total + item.value, 0))}</strong>
            <strong>Total: ₹{itemBreakdown.reduce((total, item) => total + item.value, 0)}</strong>
          </div> */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            paddingLeft: '6px',
            paddingRight: '6px'
          }}>
            <div>
              <p><strong>Terms and Conditions:</strong></p>
              <ol style={{
                fontWeight: '500',
                marginTop: '-8px',
              }}>
                <li>Goods once sold will not be taken back.</li>
                <li>No responsibility for breakages during transit.</li>
                <li>All Disputes subject to Mumbai Jurisdiction only.</li>
                <li>E.& O.E.</li>
              </ol>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <p style={{
                fontWeight: 'bolder',
                fontSize: '16px'
              }}><strong>For Wave Multitrade</strong></p>
              <p><strong>Authorised Signatory</strong></p>
            </div>
          </div>


          {/*   
          <div style={{
            height: '20px',
            width: '100%',
            background: 'black',

          }}></div> */}
        </div>
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
