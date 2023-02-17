// Send in a unique identifier for a table, like #mytable
export default function tableToCSV(theTable) {
  const rows = document.querySelectorAll(`${theTable} tr`);
  let csvData = "";

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('th, td');
    const dataArray = [];
    for (let n = 0; n < cells.length; n++) {
      dataArray.push(cells[n].innerText);
    }
    csvData += `${dataArray.map(val => `"${val.replace(/"/g, '')}"`).join(",")}\n`;
  }

  return csvData;
}
