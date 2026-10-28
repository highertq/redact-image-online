/**
 * Label-driven detection: when a line reads "Phone: 415 555 0132" or
 * "交易单号 2026...", cover the value even if no number pattern recognises it.
 *
 * This is the rule that makes auto-detect useful on documents the pattern list
 * was never written for — a Chinese utility bill, a German invoice, a hospital
 * statement with a MRN. The label says what the field is; the value is whatever
 * follows it on that line. It is language-independent in the sense that matters:
 * it fires on the words a form uses, and those words are stable even when the
 * document numbers in them are not.
 *
 * Only the value is covered, never the label, so a redacted screenshot still
 * reads as "交易单号 ███████" and the recipient can tell what was hidden.
 */

export type LabelMatch = {
  type: "labelled";
  start: number;
  end: number;
  value: string;
};

/**
 * Field names that introduce something worth hiding. Longer terms are listed
 * before their own prefixes because the alternation is matched left to right, so
 * "手机号" must win over "手机".
 */
const LABEL_TERMS = [
  // Chinese
  "手机号码",
  "手机号",
  "联系电话",
  "联系方式",
  "紧急联系人",
  "联系人",
  "身份证号码",
  "身份证号",
  "证件号",
  "银行卡号",
  "银行卡",
  "卡号",
  "账号",
  "帐号",
  "账户",
  "支付宝账号",
  "订单编号",
  "订单号",
  "交易单号",
  "交易流水号",
  "交易号",
  "商户订单号",
  "商户订单",
  "商户单号",
  "流水号",
  "收款方",
  "收款人",
  "付款方",
  "付款人",
  "对方账号",
  "对方账户",
  "真实姓名",
  "姓名",
  "收件人",
  "寄件人",
  "收货地址",
  "注册地址",
  "家庭住址",
  "住址",
  "地址",
  "邮箱",
  "电子邮箱",
  "实付金额",
  "支付金额",
  "订单金额",
  "退款金额",
  "应付金额",
  "合计金额",
  "小计",
  "合计",
  "总计",
  "金额",
  "尾号",
  "安全码",
  "验证码",
  "密码",
  // English
  "card number",
  "account number",
  "customer id",
  "policy number",
  "transaction id",
  "order number",
  "invoice number",
  "reference number",
  "social security",
  "date of birth",
  "passport number",
  "driver license",
  "drivers license",
  "license number",
  "shipping address",
  "billing address",
  "email address",
  "phone number",
  "mobile number",
  "last four",
  "cvv",
  "cvc",
  "pin",
  "ssn",
  "dob",
  "mrn",
  "iban",
  "swift",
  "total",
  "balance",
  "amount",
  "email",
  "phone",
  "mobile",
  "tel",
  "name",
  "address",
  "account",
  "card",
  "password",
  "signature",
  "recipient",
  "sender",
  "payee",
  "payer",
];

function buildPattern(): RegExp {
  const escaped = LABEL_TERMS.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  // Latin terms need a word boundary; CJK terms are matched as substrings
  // because there is no whitespace between characters.
  const latin = escaped.filter((t) => /^[a-z]/i.test(t));
  const cjk = escaped.filter((t) => !/^[a-z]/i.test(t));
  const parts: string[] = [];
  if (cjk.length > 0) {
    parts.push(cjk.join("|"));
  }
  if (latin.length > 0) {
    parts.push(`\\b(?:${latin.join("|")})\\b`);
  }
  return new RegExp(`(?:${parts.join("|")})`, "gi");
}

const LABEL_PATTERN = buildPattern();

/** Separators that sit between a label and its value. */
const SEPARATOR = /^[\s:：=＝\-–—、,，./]+/;

/**
 * A bare abbreviation standing where the rest of the label's name would be:
 * "Account No. 1234", "Card Nº 5678". Without this the value region starts at
 * "No." and the box swallows a word that is part of the label.
 */
const CONNECTOR = /^(?:no\.?|nr\.?|nº|#)[\s:：]+/i;

/** A value must carry at least one digit, letter, or CJK character. */
const HAS_CONTENT = /[0-9A-Za-z\u3400-\u9fff\uFF00-\uFFEF]/;

/**
 * Where a label's value begins: past the separator, and past a label
 * abbreviation if one follows. A connector is only skipped when something is
 * still left after it, so "Card no" at the end of a line stays a no-op.
 */
function valueStart(line: string, labelEnd: number): number {
  const afterLabel = line.slice(labelEnd);
  const separator = SEPARATOR.exec(afterLabel)?.[0].length ?? 0;
  const connector = CONNECTOR.exec(afterLabel.slice(separator));
  if (connector && afterLabel.slice(separator + connector[0].length).trim() !== "") {
    return labelEnd + separator + connector[0].length;
  }
  return labelEnd + separator;
}

/**
 * Finds every "label followed by a value" region in one line of text and
 * returns the character range of each value.
 *
 * A value ends at the next label on the same line, so
 * "姓名 张三 手机号 13800138000" yields two separate regions instead of one
 * box swallowing the line.
 */
export function detectLabelledFields(line: string): LabelMatch[] {
  const pattern = new RegExp(LABEL_PATTERN.source, LABEL_PATTERN.flags);
  const matches: LabelMatch[] = [];

  const labels: { start: number; end: number }[] = [];
  let hit = pattern.exec(line);
  while (hit !== null) {
    labels.push({ start: hit.index, end: hit.index + hit[0].length });
    if (hit[0].length === 0) {
      pattern.lastIndex += 1;
    }
    hit = pattern.exec(line);
  }

  labels.forEach((label, index) => {
    const next = labels[index + 1];
    const from = valueStart(line, label.end);
    const to = next ? next.start : line.length;
    if (to <= from) {
      return;
    }
    const value = line.slice(from, to).trim();
    if (!HAS_CONTENT.test(value)) {
      return;
    }
    matches.push({ type: "labelled", start: from, end: to, value });
  });

  return matches;
}
