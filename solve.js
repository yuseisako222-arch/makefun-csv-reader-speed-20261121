const QUOTE = 34;
const LF = 10;
const CR = 13;
const BOM = 0xfeff;

// Use the end of the input as the sentinel for all delimiter searches.
function find(text, char, from) {
  const index = text.indexOf(char, from);
  return index === -1 ? text.length : index;
}

export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const length = text.length;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = 0; // The first record always has at least one field.
  let pos = text.charCodeAt(0) === BOM ? 1 : 0;
  let line = 1;

  // Keep lookahead across fields and records so a rare or absent delimiter
  // never causes repeated searches of the same suffix.
  let nextLF = -1;
  let nextCR = -1;
  let nextQuote = -1;
  let nextComma = -1;
  let failedQuote = false;

  while (pos < length) {
    if (nextLF < pos) nextLF = find(text, '\n', pos);
    if (nextCR < pos) nextCR = find(text, '\r', pos);
    if (nextQuote < pos) nextQuote = find(text, '"', pos);

    const recordLine = line;
    const recordRow = header && width === 0 ? null : rows.length;
    let fields;
    let fieldCount;

    // A physical line with only ordinary fields can go straight to split.
    if (nextQuote >= nextLF &&
        (nextCR >= nextLF || (nextCR === nextLF - 1 && nextLF < length))) {
      const end = nextCR < nextLF ? nextCR : nextLF;
      if (end !== pos) {
        fields = text.slice(pos, end).split(',');
        fieldCount = fields.length;
      }
      pos = nextLF + 1;
      line++;
      if (fields === undefined) continue;
    } else {
      fields = width === 0 ? [] : new Array(width);
      fieldCount = 0;
      let quoted;
      for (;;) {
        quoted = text.charCodeAt(pos) === QUOTE;
        let prefix = '';
        let closed = false;

        if (quoted) {
          const start = pos + 1;
          let close;
          let escaped = false;
          if (failedQuote) {
            // The failed scan proved every later full quote run has even
            // length. Only the rest of this opening run can close the field.
            let end = start;
            while (text.charCodeAt(end) === QUOTE) end++;
            close = (end - start) % 2 === 1 ? end - 1 : length;
            escaped = close < length && close !== start;
          } else {
            close = find(text, '"', start);
            while (close < length && text.charCodeAt(close + 1) === QUOTE) {
              escaped = true;
              close = find(text, '"', close + 2);
            }
          }

          // Keep the opening quote in the unquoted span if no closing quote exists.
          if (close === length) {
            failedQuote = true;
            errors.push({ code: 'unterminated_quote', line: recordLine, row: recordRow });
          } else {
            closed = true;
            const hasCR = nextCR < close;
            prefix = text.slice(start, close);
            if (hasCR) {
              prefix = prefix.replace(/""|\r\n?/g, match => match === '""' ? '"' : '\n');
            } else if (escaped) {
              prefix = prefix.replaceAll('""', '"');
            }
            // Count CRLF via its LF and count lone CR separately.
            while (nextCR < close) {
              if (text.charCodeAt(nextCR + 1) !== LF) line++;
              nextCR = find(text, '\r', nextCR + 1);
            }
            while (nextLF < close) {
              line++;
              nextLF = find(text, '\n', nextLF + 1);
            }
            pos = close + 1;
          }
        }

        if (nextComma < pos) nextComma = find(text, ',', pos);
        let end = nextComma < nextLF ? nextComma : nextLF;
        let start = pos;
        let value = prefix;
        let junk = false;
        while (nextCR < end) {
          if (text.charCodeAt(nextCR + 1) === LF) {
            end = nextCR;
            break;
          }
          errors.push({ code: 'stray_cr', line: recordLine, row: recordRow });
          if (nextCR > start) {
            value += text.slice(start, nextCR);
            junk = true;
          }
          start = nextCR + 1;
          nextCR = find(text, '\r', start);
        }
        if (start < end) {
          value += text.slice(start, end);
          junk = true;
        }
        // Report quote junk after any stray CR errors in its suffix.
        if (closed && junk) errors.push({ code: 'quote_junk', line: recordLine, row: recordRow });
        fields[fieldCount++] = value;

        if (end === length) {
          pos = length;
          break;
        }
        if (end === nextComma) {
          pos = end + 1;
          continue;
        }
        pos = nextLF + 1;
        line++;
        break;
      }

      // A line emptied by stripping stray CRs still keeps its errors.
      if (fieldCount === 1 && fields[0] === '' && !quoted) continue;
    }

    if (width === 0) {
      width = fieldCount;
      if (header) {
        columns = fields;
        continue;
      }
    }
    if (fieldCount < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fieldCount });
      while (fieldCount < width) fields[fieldCount++] = '';
    } else if (fieldCount > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  return { columns: header ? columns ?? [] : null, rows, errors };
}
