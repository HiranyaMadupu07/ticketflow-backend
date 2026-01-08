// Minimal email service stub — replace with real provider integration
exports.sendEmail = async ({ to, subject, text }) => {
  console.log('sendEmail stub:', { to, subject, text });
  return { ok: true };
};
