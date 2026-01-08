exports.suggestResponse = async (req, res, next) => {
  try {
    // Stub: integrate with real AI provider later
    const { ticketId, message } = req.body;
    // naive placeholder
    const suggested = `Thank you for your message. We are reviewing your ticket (#${ticketId}) and will get back shortly.`;
    res.json({ suggested });
  } catch (err) {
    next(err);
  }
};
