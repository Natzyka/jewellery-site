const BREVO_API_URL = "https://api.brevo.com/v3/contacts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const { email, consent } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!consent) {
      return Response.json(
        { error: "Marketing consent is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_LIST_ID;
    const numericListId = Number(listId);

    if (!apiKey || !listId || Number.isNaN(numericListId)) {
      return Response.json(
        { error: "The subscription service is not configured yet." },
        { status: 500 }
      );
    }

    const brevoResponse = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        listIds: [numericListId],
        updateEnabled: true,
      }),
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.json().catch(() => null);
      const message =
        errorBody?.message ||
        "We couldn't save your subscription right now. Please try again.";

      return Response.json({ error: message }, { status: brevoResponse.status });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

