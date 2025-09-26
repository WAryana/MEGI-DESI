function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Open the specific spreadsheet using the provided ID
    const spreadsheetId = '1PJ4uPOagxO4wdqVD8Bbr11I1J94QD8_GnUuGw_D_dlc';
    const sheetName = 'Ucapan';
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    // Add headers if first row is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Nama', 'Kehadiran', 'Jumlah Tamu', 'Ucapan']
      ]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Add data to spreadsheet
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.attendance,
      data.guestCount,
      data.message
    ]);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 5);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data berhasil disimpan'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Terjadi kesalahan: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Function to retrieve comments for display
    const spreadsheetId = '1PJ4uPOagxO4wdqVD8Bbr11I1J94QD8_GnUuGw_D_dlc';
    const sheetName = 'Ucapan';
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    // Check if sheet exists
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Sheet "Ucapan" tidak ditemukan'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from sheet
    const lastRow = sheet.getLastRow();
    console.log('Last row:', lastRow);
    
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          data: [],
          message: 'Tidak ada data'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get data starting from row 2 (skip header)
    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    console.log('Raw data:', data);
    
    // Filter and format data for comments display
    const comments = data
      .filter(row => {
        const hasMessage = row[4] && row[4].toString().trim() !== '-' && row[4].toString().trim() !== '';
        console.log('Row filter check:', row, 'Has message:', hasMessage);
        return hasMessage;
      })
      .map(row => ({
        timestamp: row[0],
        name: row[1],
        attendance: row[2],
        guestCount: row[3],
        message: row[4]
      }))
      .reverse(); // Show newest first
    
    console.log('Filtered comments:', comments);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: comments,
        totalRows: lastRow,
        rawDataCount: data.length,
        filteredCount: comments.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Terjadi kesalahan: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}