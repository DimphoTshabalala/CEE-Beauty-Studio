
const FROM_EMAIL = "CEE Beauty Studio <orders@mail.shopceebeautycollection.co.za>";
const REPLY_TO = "info@shopceebeautycollection.co.za";

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed." })
        };
    }

    try {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error("Resend API key is not configured.");
        }

        const order = JSON.parse(event.body || "{}");
        const customer = order.customer || {};
        const products = Array.isArray(order.products)
            ? order.products
            : [];

        const email = String(customer.email || "").trim();
        const fullName = String(customer.fullName || "").trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "A valid customer email is required." })
            };
        }

        if (!fullName || products.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Customer and order details are required." })
            };
        }

        const deliveryFee = 150;

        const orderSubtotal = products.reduce((sum, item) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            if (!Number.isFinite(price) || !Number.isFinite(quantity) ||
                price < 0 || quantity < 1) {
                throw new Error("Invalid product details.");
            }

            return sum + price * quantity;
        }, 0);

        const total = orderSubtotal + deliveryFee;
        
const orderReference = order.orderReference;

if (!orderReference) {
    throw new Error("Missing order reference.");
}


        const productRows = products.map((item) => {
            const productName = escapeHTML(
                item.name || item.product || item.title ||
                "CEE Beauty Waterproof Bundle"
            );

            const quantity = Number(item.quantity);
            const price = Number(item.price);

            return `
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">
                        ${productName}
                    </td>
                    <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;">
                        ${quantity}
                    </td>
                    <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">
                        R${(price * quantity).toFixed(2)}
                    </td>
                </tr>
            `;
        }).join("");

        const address = [
            customer.address,
            customer.suburb,
            customer.city,
            customer.province,
            customer.postalCode
        ].filter(Boolean).map(escapeHTML).join(", ");

        const html = `
            <div style="font-family:Arial,sans-serif;background:#f8f5f2;padding:30px;">
                <div style="max-width:600px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;">
                    <h1 style="color:#a77b72;text-align:center;">
                        CEE Beauty Studio
                    </h1>

                    <p style="text-align:center;color:#777;">
                        Luxury Hair. Luxury You.
                    </p>

                    <h2 style="color:#333;">Thank you for your order, ${escapeHTML(fullName)}!</h2>

                    <p>
                        We've successfully received your order.
                        We're delighted that you've chosen CEE Beauty Studio!
                    </p>

                    <div style="background:#fff4e8;padding:18px;border-radius:8px;margin:20px 0;">
                        <strong>Order received – awaiting payment</strong>
                        <p style="margin-bottom:0;">
                            Your order has not yet been confirmed.
                            We will contact you separately with payment instructions.
                            Your order will only be confirmed once your payment has been verified.
                        </p>
                    </div>

                    <p><strong>Order reference:</strong> ${escapeHTML(orderReference)}</p>

                    <h3 style="color:#333;">Order summary</h3>

                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th style="text-align:left;padding:12px;">Product</th>
                                <th style="padding:12px;">Qty</th>
                                <th style="text-align:right;padding:12px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productRows}
                        </tbody>
                    </table>

                    <div style="margin-top:20px;line-height:2;">
                        <div>Subtotal: R${orderSubtotal.toFixed(2)}</div>
                        <div>Delivery: R${deliveryFee.toFixed(2)}</div>
                        <h3 style="color:#a77b72;">
                            Total: R${total.toFixed(2)}
                        </h3>
                    </div>

                    <h3>Delivery details</h3>
                    <p>${address || "Delivery address supplied with your order."}</p>

                    <p>
                        If you have any questions, please contact us at
                        <a href="mailto:${REPLY_TO}">${REPLY_TO}</a>
                        or WhatsApp us on 071 661 8653.
                    </p>

                    <p style="margin-top:30px;">
                        With love,<br>
                        <strong>CEE Beauty Studio</strong>
                    </p>
                </div>
            </div>
        `;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [email],
                reply_to: REPLY_TO,
                subject: `We've received your CEE Beauty Studio order – ${orderReference}`,
                html: html
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Resend error:", result);

            return {
                statusCode: 502,
                body: JSON.stringify({
                    error: "The confirmation email could not be sent."
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Order confirmation email sent successfully.",
                orderReference: orderReference,
                emailId: result.id
            })
        };

    } catch (error) {
        console.error("Order confirmation error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Unable to process the confirmation email."
            })
        };
    }
};
