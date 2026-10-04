/**
 * English Time 学習記録の受け口（Google Apps Script）
 *
 * 使い方
 *  1. 記録用スプレッドシートを開き「拡張機能 → Apps Script」
 *  2. このファイルの中身を貼り付けて保存
 *  3. 関数「setup」を一度実行（シートと見出しを作ります）
 *  4. 「デプロイ → 新しいデプロイ → ウェブアプリ」
 *     実行ユーザー：自分 / アクセスできるユーザー：全員
 *  5. 表示された URL（…/exec）をアプリの js/config.js の gasUrl に貼る
 *     （またはアプリの ⚙ せってい → 保護者の方へ に貼る）
 */

const SHEET_LOG = '学習記録';
const SHEET_DAILY = '日べつまとめ';
const HEADERS = ['日時', '日付', '学習者', 'モード', 'フェーズ', '単元', '内容', '結果', '正解数', '問題数', '時間(秒)', '端末'];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_LOG);
  if (!sh) sh = ss.insertSheet(SHEET_LOG, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#F7D3E4');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('yyyy/mm/dd hh:mm');
  sh.getRange('B:B').setNumberFormat('yyyy/mm/dd');
  sh.setColumnWidth(1, 140);
  sh.setColumnWidth(7, 200);

  let daily = ss.getSheetByName(SHEET_DAILY);
  if (!daily) daily = ss.insertSheet(SHEET_DAILY, 1);
  daily.getRange('A1').setFormula(
    "=IFERROR(QUERY('" + SHEET_LOG + "'!A:L," +
    "\"select B, C, E, count(G), sum(K) where C is not null group by B, C, E order by B desc " +
    "label B '日付', C '学習者', E 'フェーズ', count(G) '回数', sum(K) '時間(秒)' format B 'yyyy/mm/dd'\",1),\"まだ記録がありません\")"
  );
  daily.getRange('A:A').setNumberFormat('yyyy/mm/dd');
  daily.setFrozenRows(1);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const rows = (data.rows || [data]).map(function (r) {
      return [
        r.timestamp ? new Date(r.timestamp) : new Date(),
        r.date || '', r.learner || '', r.mode || '', r.phase || '', r.unit || '',
        r.item || '', r.result || '', r.correct === '' ? '' : r.correct, r.total === '' ? '' : r.total,
        r.seconds === '' ? '' : r.seconds, r.device || ''
      ];
    });
    let sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
    if (!sh) { setup(); sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG); }
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, added: rows.length })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('English Time 学習記録の受け口は動いています');
}
