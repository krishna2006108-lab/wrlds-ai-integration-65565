import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscriptionRequest = await req.json();

    console.log("Processing subscription for:", email);

    // Send thank you email to subscriber
    const subscriberEmail = await resend.emails.send({
      from: "Zarvoxa <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for subscribing to Zarvoxa!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000000;">Welcome to Zarvoxa!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            Thank you for subscribing to our newsletter. We're excited to have you join our community!
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            We'll keep you updated with the latest news, product updates, and insights about smart engineering solutions.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            If you have any questions or need assistance, feel free to reach out to us at 
            <a href="mailto:team@zarvoxa.com" style="color: #0066cc;">team@zarvoxa.com</a>
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            <p style="font-size: 14px; color: #666666;">
              Best regards,<br>
              The Zarvoxa Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Subscriber email sent:", subscriberEmail);

    // Send notification to Krishna
    const notificationEmail = await resend.emails.send({
      from: "Zarvoxa Notifications <onboarding@resend.dev>",
      to: ["krishna2006108@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000000;">New Newsletter Subscription</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            Someone just subscribed to the Zarvoxa newsletter!
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="font-size: 14px; color: #666666;">
            This is an automated notification from your website.
          </p>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscriberEmailId: subscriberEmail.data?.id,
        notificationEmailId: notificationEmail.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-subscription-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
