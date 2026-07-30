/**
 * Backend de Apps Script para kitchen-shower-pablo-camila.
 * Se despliega como Web App y sirve de API para la hoja de cálculo
 * que guarda quién lleva cada artículo.
 *
 * Instrucciones de instalación: ver README.md en la raíz del repo.
 */

var SHEET_NAME = "Claims";

var ITEMS = [
  { id: "1", name: "Olla arrocera" },
  { id: "2", name: "Licuadora" },
  { id: "3", name: "Air fryer" },
  { id: "4", name: "Juego de ollas antiadherente" },
  { id: "5", name: "Juego de sartenes antiadherente" },
  { id: "6", name: "Batidora" },
  { id: "7", name: "Sandwichera" },
  { id: "8", name: "Juego de cubiertos" },
  { id: "9", name: "Juego de vasos de cristal" },
  { id: "10", name: "Picatodo" },
  { id: "11", name: "Juego de vajilla" },
  { id: "12", name: "Juego de cuchillos" },
  { id: "13", name: "Recipientes para alimentos" },
  { id: "14", name: "Exprimidor, colador y tabla de picar" },
  { id: "15", name: "Extractor de jugos" },
  { id: "16", name: "Exprimidor de naranja eléctrico" },
  { id: "17", name: "Tabla de picar y rayador" },
  { id: "18", name: "Organizador de cubiertos, escurridor de cubiertos y papelera de basura" },
  { id: "19", name: "Organizador de especias y soporte para toallas de papel de cocina" },
  { id: "20", name: "Jarra de vidrio para jugos y ensaladera" },
];

/**
 * Ejecutar UNA VEZ desde el editor de Apps Script (menú Ejecutar > initSheet)
 * para crear la hoja "Claims" y precargarla con los 20 artículos.
 * Vuelve a ejecutarse sin duplicar filas si ya existen.
 */
function initSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.clear();
  sheet.appendRow(["itemId", "itemName", "takenBy", "timestamp"]);
  ITEMS.forEach(function (item) {
    sheet.appendRow([item.id, item.name, "", ""]);
  });
  sheet.setFrozenRows(1);
}

function doGet(e) {
  return respond_({ ok: true, claims: getClaims_() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var data = sheet.getDataRange().getValues();
    var itemId = String(body.itemId);
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === itemId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return respond_({ ok: false, error: "Item no encontrado", claims: getClaims_() });
    }

    if (body.action === "claim") {
      var currentTakenBy = data[rowIndex][2];
      if (currentTakenBy) {
        return respond_({ ok: false, takenBy: currentTakenBy, claims: getClaims_() });
      }
      var name = String(body.name || "").trim().slice(0, 40);
      if (!name) {
        return respond_({ ok: false, error: "Nombre vacío", claims: getClaims_() });
      }
      sheet.getRange(rowIndex + 1, 3).setValue(name);
      sheet.getRange(rowIndex + 1, 4).setValue(new Date());
      return respond_({ ok: true, claims: getClaims_() });
    }

    if (body.action === "release") {
      sheet.getRange(rowIndex + 1, 3).setValue("");
      sheet.getRange(rowIndex + 1, 4).setValue("");
      return respond_({ ok: true, claims: getClaims_() });
    }

    return respond_({ ok: false, error: "Acción desconocida", claims: getClaims_() });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No existe la hoja "' + SHEET_NAME + '". Ejecuta initSheet primero.');
  return sheet;
}

function getClaims_() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var claims = {};
  for (var i = 1; i < data.length; i++) {
    var id = data[i][0];
    var takenBy = data[i][2];
    if (id !== "" && takenBy) claims[String(id)] = String(takenBy);
  }
  return claims;
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
